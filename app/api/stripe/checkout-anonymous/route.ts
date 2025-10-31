import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { PRICING_PLANS } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { userData, plan, planId, childName, refCode = null } = await request.json();
    const planKey = (plan ?? planId)?.toString();

    // Get refCode from request body first, then fall back to biq_ref cookie
    const cookieStore = await cookies();
    const refCodeFromCookie = cookieStore.get("biq_ref")?.value;
    const finalRefCode = refCode || refCodeFromCookie;

    if (!userData || !planKey) {
      return NextResponse.json(
        { error: "User data and plan are required" },
        { status: 400 }
      );
    }

    // Parse user data
    const { email, name, password } = userData;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in instead.",
        },
        { status: 400 }
      );
    }

    // Get plan details
    const planDetails =
      PRICING_PLANS[planKey as keyof typeof PRICING_PLANS];
    if (!planDetails || !planDetails.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan ${planKey}` },
        { status: 400 }
      );
    }

    // Hash password to store in metadata (will be used when creating account)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Stripe checkout session with user data in metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/trial-checkout${childName ? `?childName=${encodeURIComponent(childName)}` : ""}`,
      metadata: {
        planType: "oneTime",
        plan: planKey,
        childName: childName || "",
        // Store user registration data to create account after payment
        userEmail: email,
        userName: name,
        userPasswordHash: hashedPassword,
        userSource: "trial",
        refCode: finalRefCode || "", // Include referral code if present
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
