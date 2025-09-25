import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { client_reference_id: userId, metadata } = session;

  if (!userId || !metadata) {
    console.error("Missing userId or metadata in checkout session");
    return;
  }

  const { planType, plan, childName } = metadata;

  try {
    // Handle one-time payment
    await prisma.payment.create({
      data: {
        userId,
        stripePaymentIntentId: session.payment_intent as string,
        amount: session.amount_total || 0,
        currency: session.currency || "usd",
        status: "SUCCEEDED",
        planType,
        plan,
        childName,
        metadata: { sessionId: session.id },
      },
    });

    // Create a license for the user based on the purchased plan
    const licenseType = plan === "BASIC" ? "BASIC" : "PROFESSIONAL";
    const maxAssessments = plan === "BASIC" ? 1 : plan === "PREMIUM" ? 5 : null;

    const license = await prisma.license.create({
      data: {
        licenseKey: `PAY-${session.id}`,
        type: licenseType,
        status: "ACTIVE",
        maxUsers: 1,
        maxAssessments,
        features: { planType, plan },
      },
    });

    // Assign license to user
    await prisma.userLicense.create({
      data: {
        userId,
        licenseId: license.id,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Error handling checkout completion:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;

  if (!metadata?.userId) {
    console.error("Missing userId in payment intent metadata");
    return;
  }

  try {
    await prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      data: {
        status: "SUCCEEDED",
      },
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
  }
}
