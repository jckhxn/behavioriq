import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { paymentService } from "@/lib/services/payment-service";

/**
 * Process a checkout session immediately on payment success page load
 * This is a fallback for when webhooks haven't processed yet (especially in dev/test)
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

    console.log(`[ProcessCheckout] Processing session: ${sessionId}`);

    // Get the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Check if already processed
    const userEmail = session.metadata?.userEmail || session.customer_email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "No user email in session" },
        { status: 400 }
      );
    }

    // Check if user already exists (webhook already processed)
    const { prisma } = await import("@/lib/db/prisma");
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      console.log(
        `[ProcessCheckout] User already exists, webhook already processed`
      );

      // Generate login token
      const { loginTokenService } = await import(
        "@/lib/auth/login-token-service"
      );
      const loginToken = await loginTokenService.generateToken(existingUser.id);

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        loginToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        },
      });
    }

    console.log(
      `[ProcessCheckout] User doesn't exist yet, processing checkout now...`
    );

    // Process the checkout (create user, payment record, license)
    const result: any = await paymentService.processCheckout(session);

    console.log(`[ProcessCheckout] ✅ Checkout processed successfully`);
    console.log(`[ProcessCheckout] Result:`, {
      hasUser: !!result.user,
      hasLoginToken: !!result.loginToken,
      hasPayment: !!result.payment,
      hasLicense: !!result.license,
    });

    // Return the result with login token if available
    return NextResponse.json({
      success: true,
      alreadyProcessed: false,
      loginToken: result.loginToken || null,
      user: result.user
        ? {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          }
        : null,
    });
  } catch (error) {
    console.error("[ProcessCheckout] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
