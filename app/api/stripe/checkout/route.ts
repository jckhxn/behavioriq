import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripe, PRICING_PLANS, SUBSCRIPTION_PLANS } from "@/lib/stripe/config";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      planType,
      plan,
      planId,
      childName,
      isSubscription,
      topUp = false,
      fromPaymentSuccess = false,
      fromDashboard = false,
      isUpgrade = false,
      upgradeFrom = null,
    } = body;

    const planKey = (plan ?? planId)?.toString();

    if (!planType || !planKey) {
      return NextResponse.json(
        { error: "Plan type and plan are required" },
        { status: 400 }
      );
    }

    // Determine if this is a subscription based on planType or isSubscription flag
    const isSubscriptionCheckout =
      isSubscription !== undefined
        ? isSubscription
        : planType === "subscription";

    let priceId: string | undefined;
    let planDetails: any;

    if (isSubscriptionCheckout) {
      planDetails =
        SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
      priceId = planDetails?.priceId;
    } else {
      planDetails = PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
      priceId = planDetails?.priceId;
    }

    if (!priceId) {
      console.error("Missing price ID for plan:", {
        plan: planKey,
        planDetails,
        isSubscriptionCheckout,
        planType,
      });
      return NextResponse.json(
        {
          error: `Price ID not configured for plan ${planKey}. Please check Stripe environment variables.`,
        },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscriptionCheckout ? "subscription" : "payment",
      // For subscription upgrades, redirect to dashboard; for one-time payments from dashboard, also redirect to dashboard
      // For trial users, redirect to payment-success page
      success_url: isSubscriptionCheckout
        ? `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`
        : fromDashboard
          ? `${process.env.NEXTAUTH_URL}/dashboard?purchase=success`
          : `${process.env.NEXTAUTH_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}${childName ? `&childName=${encodeURIComponent(childName)}` : ""}`,
      cancel_url: isSubscriptionCheckout
        ? `${process.env.NEXTAUTH_URL}/payment-success?upgrade_cancelled=true`
        : fromDashboard
          ? `${process.env.NEXTAUTH_URL}/dashboard?purchase=cancelled`
          : `${process.env.NEXTAUTH_URL}/payment?cancelled=true`,
      metadata: {
        userId: user.id,
        planType,
        plan: planKey,
        childName: childName || "",
        isSubscription: isSubscriptionCheckout.toString(),
        topUp: topUp ? "true" : "false",
        isUpgrade: isUpgrade ? "true" : "false",
        upgradeFrom: upgradeFrom || "",
      },
      // Apply discount coupon ONLY for subscription upgrades from payment success page (post-checkout upsell)
      // Do NOT apply discount for upgrades from dashboard/settings
      ...(isSubscriptionCheckout &&
        planKey === "CORE_MONTHLY" &&
        fromPaymentSuccess &&
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
            userId: user.id,
            planType,
            plan: planKey,
            topUp: topUp ? "true" : "false",
            isUpgrade: isUpgrade ? "true" : "false",
            upgradeFrom: upgradeFrom || "",
          },
        },
      }),
      // For one-time payments
      ...(!isSubscriptionCheckout && {
        payment_intent_data: {
          metadata: {
            userId: user.id,
            planType,
            plan: planKey,
            childName: childName || "",
            topUp: topUp ? "true" : "false",
            isUpgrade: isUpgrade ? "true" : "false",
            upgradeFrom: upgradeFrom || "",
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
