import { prisma } from "@/lib/db/prisma";
import type { Stripe } from "stripe";
import type { Prisma, LicenseType } from "@prisma/client";

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

    const subscription =
      await getStripe().subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) {
      throw new Error(`No userId in subscription metadata: ${subscriptionId}`);
    }

    return prisma.$transaction(async (tx) => {
      // Find user
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          userId: user.id,
          stripePaymentIntentId: (invoice as any).payment_intent as string,
          stripeCustomerId: invoice.customer as string,
          amount: invoice.amount_paid,
          currency: invoice.currency || "usd",
          status: "SUCCEEDED",
          planType: "monthly",
          plan: "Monthly Subscription",
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: subscription.id,
            billingReason: (invoice as any).billing_reason,
          } as any,
        },
      });

      // Update or create Professional license
      const existingLicense = await tx.userLicense.findFirst({
        where: { userId },
        include: { license: true },
      });

      if (existingLicense) {
        // Update existing license
        return tx.license.update({
          where: { id: existingLicense.license.id },
          data: {
            status: "ACTIVE",
            type: "PROFESSIONAL",
            maxAssessments: null, // Unlimited
          },
        });
      }

      // Create new Professional license
      const licenseKey = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLicense = await tx.license.create({
        data: {
          licenseKey,
          type: "PROFESSIONAL",
          status: "ACTIVE",
          maxAssessments: null, // Unlimited
          maxUsers: 1,
          validUntil: null, // Subscription-based
        },
      });

      await tx.userLicense.create({
        data: {
          userId,
          licenseId: newLicense.id,
          isActive: true,
        },
      });

      console.log(`[SubscriptionService] ✅ Professional license activated`);
      return newLicense;
    });
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

    return await prisma.$transaction(async (tx) => {
      // Find user's current licenses
      const userLicenses = await tx.userLicense.findMany({
        where: { userId },
        include: { license: true },
      });

      // Cancel all PROFESSIONAL licenses
      for (const userLicense of userLicenses) {
        if (userLicense.license.type === "PROFESSIONAL") {
          await tx.license.update({
            where: { id: userLicense.license.id },
            data: {
              status: "CANCELLED",
            },
          });
          console.log(
            `[SubscriptionService] Cancelled license: ${userLicense.license.id}`
          );
        }
      }

      // Create a FREE license for view-only access
      const freeLicense = await tx.license.create({
        data: {
          licenseKey: `FREE_${userId}_${Date.now()}`,
          type: "FREE" as LicenseType,
          status: "ACTIVE",
        },
      });

      // Assign FREE license to user
      await tx.userLicense.create({
        data: {
          userId,
          licenseId: freeLicense.id,
        },
      });

      console.log(
        `[SubscriptionService] ✅ Subscription cancelled, downgraded to FREE license for user: ${userId}`
      );
    });
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

    // Determine new status
    const newStatus = this.mapSubscriptionStatus(subscription.status);

    // Update all Professional licenses
    const userLicenses = await prisma.userLicense.findMany({
      where: { userId },
      include: { license: true },
    });

    for (const userLicense of userLicenses) {
      if (userLicense.license.type === "PROFESSIONAL") {
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
