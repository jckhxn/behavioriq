import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db/prisma";
import { v4 as uuidv4 } from "uuid";
import { createErrorResponse } from "@/lib/api/chatgpt/middleware";

/**
 * GET /api/chatgpt/checkout/success
 * Handle post-payment redirect from Stripe for ChatGPT users
 * Verifies payment is complete and waits for webhook processing
 *
 * Query Parameters:
 *   session_id (required): Stripe checkout session ID
 *
 * Returns:
 *   - 200: Payment successful, credits added
 *   - 202: Payment successful but webhook still processing (user should retry)
 *   - 400: Payment not completed or invalid session
 *   - 404: Session not found
 *   - 500: Internal error
 */
export async function GET(request: NextRequest) {
  const requestId = uuidv4();
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return createErrorResponse(
      "Missing session_id parameter",
      "MISSING_PARAMETER",
      requestId,
      400
    );
  }

  try {
    // 1. Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return createErrorResponse(
        "Session not found",
        "SESSION_NOT_FOUND",
        requestId,
        404
      );
    }

    // 2. Check payment status
    if (session.payment_status !== "paid") {
      return createErrorResponse(
        "Payment not completed",
        "PAYMENT_NOT_COMPLETED",
        requestId,
        400
      );
    }

    // 3. Get metadata
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;
    const creditsExpected = parseInt(session.metadata?.credits || "0");

    if (!userId) {
      return createErrorResponse(
        "User ID not found in session metadata",
        "USER_NOT_FOUND",
        requestId,
        400
      );
    }

    if (!planType) {
      return createErrorResponse(
        "Plan type not found in session metadata",
        "PLAN_NOT_FOUND",
        requestId,
        400
      );
    }

    // 4. Wait for webhook processing (retry up to 30 seconds)
    let attempts = 0;
    const maxAttempts = 10; // 10 attempts * 3 seconds = 30 seconds
    let user;
    let webhookProcessed = false;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(
        `[Checkout Success] Checking webhook processing - attempt ${attempts}/${maxAttempts}`
      );

      // Fetch user to check if webhook processed
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          credits: true,
        },
      });

      if (!user) {
        // User doesn't exist yet - webhook hasn't processed
        console.log("[Checkout Success] User not found yet, webhook processing...");
      } else {
        // Check if payment record exists (confirms webhook processed)
        const payment = await prisma.payment.findFirst({
          where: {
            stripePaymentIntentId: (session.payment_intent as string) || "",
          },
        });

        if (payment) {
          webhookProcessed = true;
          console.log("[Checkout Success] Webhook processing confirmed");
          break;
        }
      }

      // Wait 3 seconds before retry
      if (attempts < maxAttempts) {
        console.log("[Checkout Success] Waiting 3 seconds before retry...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // 5. Return status based on webhook processing
    if (!webhookProcessed) {
      // Webhook still processing after 30 seconds
      // Return 202 (Accepted) with message to retry
      console.log(
        "[Checkout Success] Webhook timeout - payment still processing"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment is still being processed. Please check back in a moment or contact support if you have issues.",
          code: "WEBHOOK_TIMEOUT",
          requestId,
          retryAfter: 5, // Suggest retry after 5 seconds
          message:
            "Your payment was successful, but we're still setting up your account. This usually takes a few seconds.",
        },
        {
          status: 202,
          headers: {
            "Content-Type": "application/json",
            "X-Request-Id": requestId,
            "Retry-After": "5",
          },
        }
      );
    }

    // 6. Return success with credits info
    console.log(
      `[Checkout Success] Payment successful for user ${userId} - plan: ${planType}, credits: ${creditsExpected}`
    );

    return NextResponse.json(
      {
        success: true,
        userId: user?.id,
        email: user?.email,
        creditsAdded: creditsExpected,
        creditsAvailable: user?.credits || 0,
        planType,
        message:
          "Payment successful! Your credits have been added to your account. Return to ChatGPT to continue.",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[Checkout Success] Error:", errorMessage, { stack: error instanceof Error ? error.stack : undefined });

    return createErrorResponse(
      "Failed to process checkout success",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
