import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { LicensingService } from "@/lib/licensing/licensing-service";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

/**
 * Checkout for conversational assessment trial upgrade
 * This is for users who completed the free trial and want to purchase
 * the full conversational assessment for $9
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    // Check if user has conversational AI included in their subscription
    const userLicense = await LicensingService.getUserLicense(user.id);
    const hasConversationalAI = userLicense?.features.conversationalAI === true;

    // If user has conversational AI included, redirect to dashboard
    if (hasConversationalAI) {
      return NextResponse.json({
        message: "Conversational assessments are included in your subscription",
        redirectUrl: `${process.env.NEXTAUTH_URL}/dashboard?conversational_included=true`,
      });
    }

    // Create Stripe checkout session for $9 conversational assessment addon
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Conversational Assessment Addon",
              description: "Full conversational assessment with AI-powered insights and professional report",
              images: [],
            },
            unit_amount: 900, // $9.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?conversational_purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?conversational_cancelled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        productType: "conversational_addon",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Conversational Trial Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
