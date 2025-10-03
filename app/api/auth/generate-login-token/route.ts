import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

/**
 * Generate a login token for a user based on their Stripe session
 * This is used for auto-login after payment
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Invalid or unpaid session" },
        { status: 400 }
      );
    }

    // Find the user by email
    const userEmail = session.metadata?.userEmail || session.customer_email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "No user email found in session" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. The webhook may still be processing." },
        { status: 404 }
      );
    }

    // Generate login token
    const { loginTokenService } = await import(
      "@/lib/auth/login-token-service"
    );
    const loginToken = await loginTokenService.generateToken(user.id);

    return NextResponse.json({
      success: true,
      loginToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Generate login token error:", error);
    return NextResponse.json(
      { error: "Failed to generate login token" },
      { status: 500 }
    );
  }
}
