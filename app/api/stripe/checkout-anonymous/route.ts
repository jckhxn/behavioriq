import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { PRICING_PLANS } from "@/lib/stripe/config";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { userData, plan, childName } = await request.json();

    if (!userData || !plan) {
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

    // Get plan details
    const planDetails = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
    if (!planDetails || !planDetails.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for plan ${plan}` },
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
      cancel_url: `${request.nextUrl.origin}/register?source=trial&childName=${encodeURIComponent(childName || "")}&redirect=checkout`,
      metadata: {
        planType: "oneTime",
        plan: plan,
        childName: childName || "",
        // Store user registration data to create account after payment
        userEmail: email,
        userName: name,
        userPasswordHash: hashedPassword,
        userSource: "trial",
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
