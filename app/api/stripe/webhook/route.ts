// app/api/stripe/webhook/route.ts
// ✅ REFACTORED: Clean webhook handler that delegates to service layer

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { paymentService } from "@/lib/services/payment-service";
import { subscriptionService } from "@/lib/services/subscription-service";
import { affiliateService } from "@/lib/services/affiliate-service";
import { prisma } from "@/lib/db/prisma";

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
      const result = await paymentService.processCheckout(
        event.data.object as Stripe.Checkout.Session
      );

      // Store login token in session metadata for retrieval on success page
      if (result && "loginToken" in result && result.loginToken) {
        const session = event.data.object as Stripe.Checkout.Session;
        try {
          await stripe.checkout.sessions.update(session.id, {
            metadata: {
              ...session.metadata,
              loginToken: result.loginToken,
            },
          });
          console.log(`[Webhook] Login token stored in session metadata`);
        } catch (error) {
          console.error(
            `[Webhook] Failed to update session with login token:`,
            error
          );
        }
      }
      break;

    case "payment_intent.succeeded":
      // Create paid_report affiliate commission
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent
      );
      break;

    case "invoice.payment_succeeded":
      await subscriptionService.handleInvoicePayment(
        event.data.object as Stripe.Invoice
      );
      // Create subscription bonus affiliate commission
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case "charge.refunded":
      // Handle refund clawback
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    case "charge.dispute.created":
      // Handle dispute (void commission pending resolution)
      await handleChargeDispute(event.data.object as Stripe.Dispute);
      break;

    case "customer.subscription.deleted":
      await subscriptionService.handleSubscriptionCancelled(
        event.data.object as Stripe.Subscription
      );
      // Void bonus commission if within 14-day window
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
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

/**
 * Handle payment_intent.succeeded - create paid_report commission
 */
async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  try {
    // Find the order/payment for this payment intent
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: pi.id },
    });

    if (!payment) {
      console.log(
        `[Webhook] No payment record found for payment intent ${pi.id}`
      );
      return;
    }

    // Create affiliate commission if attributed
    await affiliateService.createPaidReportCommission(
      payment.id,
      payment.userId,
      payment.amount,
      pi.id
    );
  } catch (error) {
    console.error(`[Webhook] Error handling payment_intent.succeeded:`, error);
  }
}

/**
 * Handle invoice.payment_succeeded - create subscription bonus commission
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string | undefined;
    if (!invoice.customer || !subscriptionId) {
      return;
    }

    // Find the user by stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (!user) {
      console.log(`[Webhook] No user found for customer ${invoice.customer}`);
      return;
    }

    // Determine tier from invoice metadata or subscription
    // This is a simplified approach - adjust based on your subscription logic
    const sub = await stripe.subscriptions.retrieve(subscriptionId);

    let tier: "core" | "family" | "annual" = "core";

    // Parse tier from product/price ID metadata
    if (sub.items.data.length > 0) {
      const priceId = sub.items.data[0].price.id;

      // You'll need to map your price IDs to tiers
      // For now, this is a placeholder
      if (priceId.includes("family")) tier = "family";
      else if (priceId.includes("annual")) tier = "annual";
    }

    // Create bonus commission
    await affiliateService.createSubscriptionBonusCommission(
      invoice.id ?? "",
      user.id,
      tier
    );
  } catch (error) {
    console.error(`[Webhook] Error handling invoice.payment_succeeded:`, error);
  }
}

/**
 * Handle charge.refunded - clawback or void commission
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    if (!charge.payment_intent) {
      return;
    }

    // Find payment by payment intent
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });

    if (!payment) {
      return;
    }

    // Clawback or void commission
    await affiliateService.handleCommissionRefund(payment.id, "refund");
  } catch (error) {
    console.error(`[Webhook] Error handling charge.refunded:`, error);
  }
}

/**
 * Handle charge.dispute.created - void commission pending resolution
 */
async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    if (!dispute.charge) {
      return;
    }

    // Find payment by charge ID
    const charge = await stripe.charges.retrieve(dispute.charge as string);

    if (!charge.payment_intent) {
      return;
    }

    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });

    if (!payment) {
      return;
    }

    // Void commission pending dispute resolution
    await affiliateService.handleCommissionRefund(payment.id, "dispute");
  } catch (error) {
    console.error(`[Webhook] Error handling charge.dispute.created:`, error);
  }
}

/**
 * Handle customer.subscription.deleted - void bonus if within 14 days of first purchase
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    if (!subscription.customer) {
      return;
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user || !user.firstPaidReportAt) {
      return;
    }

    // Check if subscription deleted within 14 days of first purchase
    const daysSincePaidReport = Math.floor(
      (Date.now() - user.firstPaidReportAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysSincePaidReport > 14) {
      return;
    }

    // Find subscription bonus commission and void it
    const bonus = await prisma.affiliateCommission.findFirst({
      where: {
        referredUserId: user.id,
        event: { in: ["core_sub", "family_sub", "annual_sub"] },
      },
    });

    if (bonus) {
      await affiliateService.voidCommission(bonus.id, "subscription_cancelled");
    }
  } catch (error) {
    console.error(
      `[Webhook] Error handling customer.subscription.deleted:`,
      error
    );
  }
}
