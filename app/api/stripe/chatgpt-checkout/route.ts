import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/stripe/chatgpt-checkout
 * Create a Stripe checkout session for ChatGPT widget purchases
 */
export async function POST(request: NextRequest) {
  try {
    const { planId, sessionId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Define available plans
    const plans: Record<
      string,
      { credits: number; priceInCents: number; name: string; interval?: string }
    > = {
      single: {
        credits: 1,
        priceInCents: 9700,
        name: "Single Assessment",
      },
      monthly_core: {
        credits: 2,
        priceInCents: 5900,
        name: "Core Plan",
        interval: "month",
      },
      monthly_family: {
        credits: 5,
        priceInCents: 9900,
        name: "Family Plan",
        interval: "month",
      },
      annual_core: {
        credits: 24,
        priceInCents: 65900,
        name: "Core Annual",
        interval: "year",
      },
      annual_family: {
        credits: 60,
        priceInCents: 109900,
        name: "Family Annual",
        interval: "year",
      },
    };

    const plan = plans[planId];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan ID" },
        { status: 400 }
      );
    }

    // Get current user (optional - if not authenticated, use session ID)
    let user = null;
    try {
      user = await getCurrentUserWithRole();
    } catch {
      // User not authenticated - use session ID instead
    }

    // Get or create customer
    let customer = null;
    if (user) {
      // Look up customer by user email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
            sessionId: sessionId || "",
          },
        });
      }
    } else {
      // Create anonymous customer
      customer = await stripe.customers.create({
        metadata: {
          sessionId: sessionId || "",
          anonymous: "true",
        },
      });
    }

    // Determine checkout type
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com";
    const successUrl = `${baseUrl}/api/stripe/chatgpt-checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/api/stripe/chatgpt-checkout/cancel`;

    if (plan.interval) {
      // Create subscription checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                description: `${plan.credits} credits/month for behavioral assessments`,
                metadata: {
                  planId,
                  credits: plan.credits.toString(),
                },
              },
              unit_amount: plan.priceInCents,
              recurring: {
                interval: plan.interval as "month" | "year",
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          sessionId: sessionId || "",
          planId,
          userId: user?.id || "anonymous",
        },
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    } else {
      // Create one-time payment checkout
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                description: `${plan.credits} credits for behavioral assessments`,
                metadata: {
                  planId,
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
          sessionId: sessionId || "",
          planId,
          userId: user?.id || "anonymous",
        },
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Stripe ChatGPT Checkout API] Error:", errorMessage);

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/chatgpt-checkout/success
 * Handle successful checkout
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      sessionId,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Stripe Success Handler] Error:", errorMessage);

    return NextResponse.json(
      { error: "Failed to process success" },
      { status: 500 }
    );
  }
}
