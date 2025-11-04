import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import {
  AssessmentStartRequestSchema,
  AssessmentStartResponseSchema,
  InsufficientCreditsResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import {
  authenticatedEndpointMiddleware,
  createErrorResponse,
} from "@/lib/api/chatgpt/middleware";
import questions from "@/lib/api/chatgpt/questions.json";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/assessment/start
 * Start a full 75-question assessment (requires X-API-Key authentication)
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4();

  try {
    // Apply authentication middleware
    const { context, error } = await authenticatedEndpointMiddleware(request);

    if (error) {
      return error;
    }

    if (!context.userId) {
      return createErrorResponse(
        "User context missing",
        "AUTH_ERROR",
        requestId,
        401
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return createErrorResponse(
        "Invalid JSON in request body",
        "INVALID_REQUEST",
        requestId,
        400
      );
    }

    // Validate request against schema
    const validationResult = AssessmentStartRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");

      return createErrorResponse(
        `Validation failed: ${errors}`,
        "VALIDATION_ERROR",
        requestId,
        400
      );
    }

    const { userId, childName, childAge, relationshipType } =
      validationResult.data;

    // Verify userId matches authenticated user
    if (userId !== context.userId) {
      return createErrorResponse(
        "User ID does not match authenticated user",
        "AUTH_MISMATCH",
        requestId,
        403
      );
    }

    // Fetch user and check credits
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          credits: true,
          email: true,
          stripeCustomerId: true,
        },
      });
    } catch (error) {
      console.error("[Assessment Start] User fetch error:", error);
      return createErrorResponse(
        "Failed to fetch user",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    if (!user) {
      return createErrorResponse("User not found", "USER_NOT_FOUND", requestId, 404);
    }

    const creditsAvailable = user.credits || 0;

    // Check if user has sufficient credits
    if (creditsAvailable < 1) {
      // Create Stripe customer if needed for checkout
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id },
          });
          stripeCustomerId = customer.id;
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId },
          });
        } catch (error) {
          console.error("[Assessment Start] Stripe customer error:", error);
        }
      }

      // Create a checkout session for credit purchase
      let checkoutUrl = "";
      try {
        if (stripeCustomerId) {
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: stripeCustomerId,
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "Single Assessment",
                    description: "1 credit for behavioral assessment",
                  },
                  unit_amount: 9700,
                },
                quantity: 1,
              },
            ],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/api/chatgpt/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com"}/pricing`,
            metadata: {
              planType: "single_assessment",
              userId: user.id,
              credits: "1",
            },
          });
          checkoutUrl = session.url || "";
        }
      } catch (error) {
        console.error("[Assessment Start] Checkout session error:", error);
      }

      const insufficientCreditsResponse =
        InsufficientCreditsResponseSchema.parse({
          error: "insufficient_credits",
          message: "You do not have enough credits for this assessment",
          creditsRequired: 1,
          creditsAvailable,
          checkoutUrl,
        });

      return NextResponse.json(insufficientCreditsResponse, {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
      });
    }

    // Generate assessment ID
    const assessmentId = `assess_${uuidv4()}`;

    // Get full questions (75 total)
    const fullQuestions = questions.full;

    if (!fullQuestions || fullQuestions.length !== 75) {
      console.error(
        "Full assessment questions configuration error: expected 75 questions"
      );
      return createErrorResponse(
        "Internal server error",
        "INTERNAL_ERROR",
        requestId,
        500
      );
    }

    // Create Assessment in database
    try {
      await prisma.assessment.create({
        data: {
          id: assessmentId,
          userId: context.userId,
          subjectName: childName,
          status: "IN_PROGRESS",
          mode: "FULL",
          startedAt: new Date(),
          currentDomain: "ATTENTION", // Start with attention domain
          currentQuestionOrder: 1,
        },
      });

      // Deduct credit and log transaction
      const newBalance = creditsAvailable - 1;
      await prisma.user.update({
        where: { id: context.userId },
        data: { credits: newBalance },
      });

      await prisma.creditTransaction.create({
        data: {
          id: uuidv4(),
          userId: context.userId,
          amount: -1,
          type: "ASSESSMENT_STARTED",
          reference: assessmentId,
          balanceAfter: newBalance,
        },
      });
    } catch (error) {
      console.error("[Assessment Start] Database error:", error);
      return createErrorResponse(
        "Failed to create assessment",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    // Format response
    const responseBody = AssessmentStartResponseSchema.parse({
      assessmentId,
      questions: fullQuestions.map((q) => ({
        questionId: q.id,
        text: q.text,
        domain: q.domain,
      })),
      totalQuestions: 75,
      creditsRemaining: creditsAvailable - 1,
    });

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[Assessment Start] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
