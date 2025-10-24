import { prismaService as prisma } from "@/lib/db/prisma-service";
import type { Stripe } from "stripe";

import { type SubscriptionPlanDefinition } from "@/lib/config/pricing";
import { getPlanForStripePrice } from "@/lib/config/stripe-price-ids";
import { applySubscriptionPlanToUser } from "@/lib/services/subscription-plan-updater";

// Import stripe client - we'll need to create this
let stripe: Stripe | null = null;

// Lazy load stripe
function getStripe(): Stripe {
  if (!stripe) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil" as any,
    });
  }
  return stripe!;
}

export class SubscriptionService {
  /**
   * Handle successful invoice payment (subscription renewal)
   */
  async handleInvoicePayment(invoice: Stripe.Invoice) {
    console.log(`[SubscriptionService] Processing invoice: ${invoice.id}`);

    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) {
      console.log(`[SubscriptionService] Not a subscription invoice, skipping`);
      return;
    }

    const subscription = await getStripe().subscriptions.retrieve(
      subscriptionId,
      { expand: ["items"] }
    );
    const userId = subscription.metadata?.userId;

    if (!userId) {
      throw new Error(`No userId in subscription metadata: ${subscriptionId}`);
    }

    const priceId = subscription.items.data[0]?.price?.id;
    const planDefinition: SubscriptionPlanDefinition | undefined = priceId
      ? getPlanForStripePrice(priceId)
      : undefined;

    if (!planDefinition) {
      console.warn(
        `[SubscriptionService] Unknown plan for price ${priceId} – skipping license sync`
      );
    }

    return prisma.$transaction(
      async (tx: import("@prisma/client").Prisma.TransactionClient) => {
        // Create payment record
        const rawPaymentIntent = (invoice as any).payment_intent;
        const paymentIntentId =
          typeof rawPaymentIntent === "string"
            ? rawPaymentIntent
            : (rawPaymentIntent?.id ?? null);

        if (
          paymentIntentId &&
          !(await tx.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            select: { id: true },
          }))
        ) {
          await tx.payment.create({
            data: {
              userId,
              stripePaymentIntentId: paymentIntentId,
              stripeCustomerId: invoice.customer as string,
              amount: invoice.amount_paid,
              currency: invoice.currency || "usd",
              status: "SUCCEEDED",
              planType: planDefinition?.id ?? "subscription",
              plan: planDefinition?.label ?? "Subscription Renewal",
              metadata: {
                invoiceId: invoice.id,
                subscriptionId: subscription.id,
                billingReason: (invoice as any).billing_reason,
              } as any,
            },
          });
        }

        if (planDefinition) {
          await applySubscriptionPlanToUser(tx, userId, planDefinition, {
            topUp: false,
          });
        }
      }
    );
  }

  /**
   * Handle subscription cancellation
   * Downgrade user to FREE license to maintain view-only access
   */
  async handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    console.log(
      `[SubscriptionService] Processing cancellation: ${subscription.id}`
    );

    const userId = subscription.metadata?.userId;
    if (!userId) {
      throw new Error(`No userId in subscription metadata: ${subscription.id}`);
    }

    return await prisma.$transaction(
      async (tx: import("@prisma/client").Prisma.TransactionClient) => {
        // Find user's current licenses
        const userLicenses = await tx.userLicense.findMany({
          where: { userId },
          include: { license: true },
        });

        const cancellableTypes: string[] = [
          "CORE",
          "ANNUAL_CORE",
          "FAMILY",
          "ANNUAL_FAMILY",
          "PROFESSIONAL",
          "ENTERPRISE",
          "DISTRICT_STANDARD",
          "DISTRICT_PROFESSIONAL",
          "DISTRICT_ENTERPRISE",
        ];

        for (const userLicense of userLicenses) {
          if (cancellableTypes.includes(userLicense.license.type)) {
            await tx.license.update({
              where: { id: userLicense.license.id },
              data: { status: "CANCELLED" },
            });
            await tx.userLicense.update({
              where: { id: userLicense.id },
              data: {
                isActive: false,
                assessmentsAllowed: userLicense.assessmentsUsed,
              },
            });
            console.log(
              `[SubscriptionService] Cancelled license: ${userLicense.license.id}`
            );
          }
        }

        const existingFree = userLicenses.find(
          (license: any) => license.license.type === "FREE"
        );

        if (existingFree) {
          await tx.license.update({
            where: { id: existingFree.license.id },
            data: { status: "ACTIVE" },
          });
          await tx.userLicense.update({
            where: { id: existingFree.id },
            data: {
              isActive: true,
              assessmentsAllowed: 0,
              conversationalReportsAllowed: 0,
            },
          });
        } else {
          const freeLicense = await tx.license.create({
            data: {
              licenseKey: `FREE_${userId}_${Date.now()}`,
              type: "FREE",
              status: "ACTIVE",
            },
          });

          await tx.userLicense.create({
            data: {
              userId,
              licenseId: freeLicense.id,
              assessmentsAllowed: 0,
              assessmentsUsed: 0,
              conversationalReportsAllowed: 0,
              conversationalReportsUsed: 0,
              lastCreditsRefreshedAt: new Date(),
            },
          });
        }

        console.log(
          `[SubscriptionService] ✅ Subscription cancelled, downgraded to FREE license for user: ${userId}`
        );
      }
    );
  }

  /**
   * Handle subscription status updates
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log(`[SubscriptionService] Processing update: ${subscription.id}`);
    console.log(`[SubscriptionService] Status: ${subscription.status}`);

    const userId = subscription.metadata?.userId;
    if (!userId) {
      throw new Error(`No userId in subscription metadata: ${subscription.id}`);
    }

    const priceId = subscription.items.data[0]?.price?.id;
    const planDefinition = priceId ? getPlanForStripePrice(priceId) : undefined;

    if (planDefinition) {
      await prisma.$transaction(
        (tx: import("@prisma/client").Prisma.TransactionClient) =>
          applySubscriptionPlanToUser(tx, userId, planDefinition, {
            topUp: false,
          })
      );
    }

    // Determine new status
    const newStatus = this.mapSubscriptionStatus(subscription.status);

    // Update all active subscription licenses for the user
    const userLicenses = await prisma.userLicense.findMany({
      where: { userId },
      include: { license: true },
    });

    const managedTypes: string[] = [
      "CORE",
      "ANNUAL_CORE",
      "FAMILY",
      "ANNUAL_FAMILY",
      "PROFESSIONAL",
      "ENTERPRISE",
      "DISTRICT_STANDARD",
      "DISTRICT_PROFESSIONAL",
      "DISTRICT_ENTERPRISE",
    ];

    for (const userLicense of userLicenses) {
      if (managedTypes.includes(userLicense.license.type)) {
        await prisma.license.update({
          where: { id: userLicense.license.id },
          data: { status: newStatus },
        });
        console.log(
          `[SubscriptionService] Updated license status: ${newStatus}`
        );
      }
    }

    console.log(
      `[SubscriptionService] ✅ Subscription updated for user: ${userId}`
    );
  }

  /**
   * Map Stripe subscription status to license status
   */
  private mapSubscriptionStatus(
    stripeStatus: Stripe.Subscription.Status
  ): "ACTIVE" | "SUSPENDED" | "CANCELLED" {
    switch (stripeStatus) {
      case "active":
      case "trialing":
        return "ACTIVE";
      case "past_due":
      case "unpaid":
        return "SUSPENDED";
      case "canceled":
      case "incomplete":
      case "incomplete_expired":
        return "CANCELLED";
      default:
        return "SUSPENDED";
    }
  }
}

export const subscriptionService = new SubscriptionService();
