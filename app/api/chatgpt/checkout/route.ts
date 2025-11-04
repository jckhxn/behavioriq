import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import {
  CheckoutResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import {
  authenticatedEndpointMiddleware,
  createErrorResponse,
} from "@/lib/api/chatgpt/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Plan configuration for Stripe checkout
 */
const PLAN_CONFIG: Record<
  string,
  {
    credits: number;
    priceInCents: number;
    name: string;
    interval?: "month" | "year";
  }
> = {
  single_assessment: {
    credits: 1,
    priceInCents: 9700,
    name: "Single Assessment",
  },
  core_monthly: {
    credits: 2,
    priceInCents: 5900,
    name: "Core Plan (Monthly)",
    interval: "month",
  },
  family_monthly: {
    credits: 5,
    priceInCents: 9900,
    name: "Family Plan (Monthly)",
    interval: "month",
  },
  core_annual: {
    credits: 24,
    priceInCents: 65900,
    name: "Core Plan (Annual)",
    interval: "year",
  },
  family_annual: {
    credits: 60,
    priceInCents: 109900,
    name: "Family Plan (Annual)",
    interval: "year",
  },
};

/**
 * POST /api/chatgpt/checkout
 * Create Stripe checkout session (requires X-API-Key authentication)
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

    const { userId, planType } = body;

    if (!planType) {
      return createErrorResponse(
        "planType is required",
        "MISSING_PARAMETER",
        requestId,
        400
      );
    }

    const plan = PLAN_CONFIG[planType];
    if (!plan) {
      return createErrorResponse(
        `Invalid planType: ${planType}. Must be one of: ${Object.keys(PLAN_CONFIG).join(", ")}`,
        "INVALID_PLAN",
        requestId,
        400
      );
    }

    // Fetch user to get/create Stripe customer
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          email: true,
          name: true,
          stripeCustomerId: true,
        },
      });
    } catch (error) {
      console.error("[Checkout] User fetch error:", error);
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

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
          },
        });
        stripeCustomerId = customer.id;

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId },
        });
      } catch (error) {
        console.error("[Checkout] Stripe customer creation error:", error);
        return createErrorResponse(
          "Failed to create Stripe customer",
          "STRIPE_ERROR",
          requestId,
          500
        );
      }
    }

    // Create checkout session
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com";
      const successUrl = `${baseUrl}/api/chatgpt/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/pricing`;

      let session;

      if (plan.interval) {
        // Create subscription checkout
        session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: stripeCustomerId,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: plan.name,
                  description: `${plan.credits} credits/${plan.interval} for behavioral assessments`,
                  metadata: {
                    planType,
                    credits: plan.credits.toString(),
                  },
                },
                unit_amount: plan.priceInCents,
                recurring: {
                  interval: plan.interval,
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            planType,
            userId: user.id,
            credits: plan.credits.toString(),
          },
        });
      } else {
        // Create one-time payment checkout
        session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer: stripeCustomerId,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: plan.name,
                  description: `${plan.credits} credits for behavioral assessments`,
                  metadata: {
                    planType,
                    credits: plan.credits.toString(),
                  },
                },
                unit_amount: plan.priceInCents,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            planType,
            userId: user.id,
            credits: plan.credits.toString(),
          },
        });
      }

      // Format response
      const responseBody = CheckoutResponseSchema.parse({
        sessionId: session.id,
        url: session.url || "",
        planType,
        amount: plan.priceInCents / 100,
        currency: "USD",
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
      console.error("[Checkout] Stripe session creation error:", errorMessage);

      return createErrorResponse(
        "Failed to create checkout session",
        "STRIPE_ERROR",
        requestId,
        500
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[Checkout] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
