import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";
import { randomUUID } from "crypto";

/**
 * POST /api/stripe/webhooks/chatgpt
 * Stripe webhook handler for ChatGPT checkout events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET_CHATGPT || ""
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        return handleCheckoutSessionCompleted(event.data.object as any);

      case "invoice.payment_succeeded":
        return handleInvoicePaymentSucceeded(event.data.object as any);

      case "customer.subscription.created":
        return handleSubscriptionCreated(event.data.object as any);

      case "customer.subscription.updated":
        return handleSubscriptionUpdated(event.data.object as any);

      case "customer.subscription.deleted":
        return handleSubscriptionDeleted(event.data.object as any);

      case "payment_intent.succeeded":
        return handlePaymentIntentSucceeded(event.data.object as any);

      case "payment_intent.payment_failed":
        return handlePaymentIntentFailed(event.data.object as any);

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Stripe ChatGPT Webhook] Error:", errorMessage);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout session completed
 * Add credits to user account
 */
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { customer, metadata, payment_status } = session;

    if (payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const { userId, planId, sessionId } = metadata || {};

    if (!userId || userId === "anonymous") {
      // Anonymous checkout - store for later processing
      console.log("Anonymous checkout completed:", sessionId);
      return NextResponse.json({ received: true });
    }

    // Get plan credits
    const planCredits: Record<string, number> = {
      single: 1,
      monthly_core: 2,
      monthly_family: 5,
      annual_core: 24,
      annual_family: 60,
    };

    const credits = planCredits[planId] || 0;

    if (credits === 0) {
      console.warn("Unknown plan:", planId);
      return NextResponse.json({ received: true });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn("User not found:", userId);
      return NextResponse.json({ received: true });
    }

    // Add credits
    const newBalance = (user.credits || 0) + credits;

    await prisma.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    // Log transaction
    await prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId,
        amount: credits,
        type: "PURCHASE",
        reference: session.id,
        balanceAfter: newBalance,
      },
    });

    console.log(`Added ${credits} credits to user ${userId}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing checkout completion:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle invoice payment succeeded
 * Renew subscription credits
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const { customer, subscription, metadata } = invoice;

    const sub = await stripe.subscriptions.retrieve(subscription as string);
    const { metadata: subMetadata } = sub;
    const userId = subMetadata?.userId;

    if (!userId) {
      return NextResponse.json({ received: true });
    }

    // Determine credits based on subscription items
    let credits = 0;
    if (sub.items.data.length > 0) {
      const item = sub.items.data[0];
      // Get price details to determine credits
      // For now, use a simple mapping
      const amount = (item.price.unit_amount || 0) / 100;

      if (amount === 5.99) credits = 2;
      else if (amount === 9.99) credits = 5;
      else if (amount === 659) credits = 24;
      else if (amount === 1099) credits = 60;
    }

    if (credits === 0) {
      return NextResponse.json({ received: true });
    }

    // Add credits for renewal
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ received: true });
    }

    const newBalance = (user.credits || 0) + credits;

    await prisma.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    // Log transaction
    await prisma.creditTransaction.create({
      data: {
        id: randomUUID(),
        userId,
        amount: credits,
        type: "RENEWAL",
        reference: invoice.id,
        balanceAfter: newBalance,
      },
    });

    console.log(`Renewed ${credits} credits for user ${userId}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing invoice payment:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log("Subscription created:", subscription.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling subscription creation:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log("Subscription updated:", subscription.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling subscription update:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log("Subscription deleted:", subscription.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log("Payment intent succeeded:", paymentIntent.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling payment intent success:", error);
    return NextResponse.json({ received: true });
  }
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    console.log("Payment intent failed:", paymentIntent.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling payment intent failure:", error);
    return NextResponse.json({ received: true });
  }
}
