import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";

interface CheckoutCreatePayload {
  product: "full_assessment";
  trialId: string;
  sessionId: string;
  couponCode?: string;
}

/**
 * POST /api/checkout/create
 *
 * Creates a Stripe checkout session for trial conversion to full assessment.
 * No authentication required (anonymous trial users can upgrade).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutCreatePayload;
    const { product, trialId, sessionId, couponCode } = body;

    // Validate required fields
    if (!product || !trialId || !sessionId) {
      return NextResponse.json(
        {
          error:
            "product, trialId, and sessionId are required",
        },
        { status: 400 }
      );
    }

    if (product !== "full_assessment") {
      return NextResponse.json(
        { error: "Invalid product type" },
        { status: 400 }
      );
    }

    // Verify trial exists
    const trial = await prisma.assessmentTrial.findUnique({
      where: { id: trialId },
      include: { session: true },
    });

    if (!trial) {
      return NextResponse.json(
        { error: "Trial not found" },
        { status: 404 }
      );
    }

    // Get price ID from environment
    const priceId = process.env.STRIPE_SINGLE_ASSESSMENT_PRICE_ID;
    if (!priceId) {
      console.error("STRIPE_SINGLE_ASSESSMENT_PRICE_ID not configured");
      return NextResponse.json(
        { error: "Checkout not available. Please try again later." },
        { status: 500 }
      );
    }

    // Build line items
    const lineItems: any[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Apply coupon if provided
    const discounts: any[] = [];
    if (couponCode) {
      try {
        // Verify coupon exists in Stripe
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon) {
          discounts.push({ coupon: couponCode });
        }
      } catch (error) {
        console.warn(`Invalid coupon code: ${couponCode}`, error);
        // Don't fail checkout, just ignore invalid coupon
      }
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      // No customer email for anonymous trials
      ...(trial.session.anonymous ? {} : { customer_email: trial.session.id }),
      line_items: lineItems,
      ...(discounts.length > 0 && { discounts }),
      mode: "payment",
      success_url: `${baseUrl}/payment-success?trialId=${encodeURIComponent(trialId)}&sessionId=${encodeURIComponent(sessionId)}`,
      cancel_url: `${baseUrl}/results/${trialId}?checkout=cancelled`,
      metadata: {
        trialId,
        sessionId,
        source: "trial_conversion",
        anonymous: trial.session.anonymous.toString(),
      },
    });

    if (!checkoutSession.url) {
      console.error("Stripe checkout URL not generated", checkoutSession);
      return NextResponse.json(
        { error: "Unable to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("[checkout/create] failed", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
