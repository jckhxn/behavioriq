import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { stripe, PRICING_PLANS, SUBSCRIPTION_PLANS } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planType, plan, childName, isSubscription } = body;

    if (!planType || !plan) {
      return NextResponse.json(
        { error: "Plan type and plan are required" },
        { status: 400 }
      );
    }

    // Determine if this is a subscription based on planType or isSubscription flag
    const isSubscriptionCheckout = isSubscription !== undefined 
      ? isSubscription 
      : planType === "subscription";

    let priceId: string | undefined;
    let planDetails: any;

    if (isSubscriptionCheckout) {
      planDetails = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
      priceId = planDetails?.priceId;
    } else {
      planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
      priceId = planDetails?.priceId;
    }

    if (!priceId) {
      console.error("Missing price ID for plan:", {
        plan,
        planDetails,
        isSubscriptionCheckout,
        planType,
      });
      return NextResponse.json(
        {
          error: `Price ID not configured for plan ${plan}. Please check Stripe environment variables.`,
        },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      client_reference_id: session.user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscriptionCheckout ? "subscription" : "payment",
      // For subscription upgrades, redirect to dashboard; for one-time payments, go to payment-success
      success_url: isSubscriptionCheckout
        ? `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`
        : `${process.env.NEXTAUTH_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}${childName ? `&childName=${encodeURIComponent(childName)}` : ""}`,
      cancel_url: isSubscriptionCheckout
        ? `${process.env.NEXTAUTH_URL}/payment-success?upgrade_cancelled=true`
        : `${process.env.NEXTAUTH_URL}/payment?cancelled=true`,
      metadata: {
        userId: session.user.id,
        planType,
        plan,
        childName: childName || "",
        isSubscription: isSubscriptionCheckout.toString(),
      },
      // Apply discount coupon for subscription upgrades from payment success page
      ...(isSubscriptionCheckout &&
        plan === "MONTHLY" &&
        process.env.STRIPE_FIRST_3_MONTHS_50_COUPON && {
          discounts: [
            {
              coupon: process.env.STRIPE_FIRST_3_MONTHS_50_COUPON, // Apply 50% off first 3 months
            },
          ],
        }),
      // For subscriptions, include trial if needed
      ...(isSubscriptionCheckout && {
        subscription_data: {
          metadata: {
            userId: session.user.id,
            planType,
            plan,
          },
        },
      }),
      // For one-time payments
      ...(!isSubscriptionCheckout && {
        payment_intent_data: {
          metadata: {
            userId: session.user.id,
            planType,
            plan,
            childName: childName || "",
          },
        },
      }),
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
