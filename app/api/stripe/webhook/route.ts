// app/api/stripe/webhook/route.ts
// ✅ REFACTORED: Clean webhook handler that delegates to service layer

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { paymentService } from "@/lib/services/payment-service";
import { subscriptionService } from "@/lib/services/subscription-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "❌ STRIPE_WEBHOOK_SECRET is not configured in environment variables"
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!signature) {
    console.error("❌ Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Webhook] ✅ Event received: ${event.type}`);

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] ❌ Error processing ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * ✅ Clean webhook handler - delegates to service layer
 * All business logic is in service files for easy testing and maintenance
 */
async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await paymentService.processCheckout(
        event.data.object as Stripe.Checkout.Session
      );
      break;

    case "invoice.payment_succeeded":
      await subscriptionService.handleInvoicePayment(
        event.data.object as Stripe.Invoice
      );
      break;

    case "customer.subscription.deleted":
      await subscriptionService.handleSubscriptionCancelled(
        event.data.object as Stripe.Subscription
      );
      break;

    case "customer.subscription.updated":
      await subscriptionService.handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      );
      break;

    default:
      console.log(`[Webhook] ℹ️ Unhandled event type: ${event.type}`);
  }
}
