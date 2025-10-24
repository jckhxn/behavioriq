/**
 * AffiliateService - Core business logic for referral program
 * Handles commission creation, fraud detection, state transitions, and payouts
 */

import { prisma } from "@/lib/db/prisma";
import { AFFILIATE_SETTINGS } from "@/lib/config/affiliate";
import type Stripe from "stripe";

export class AffiliateService {
  /**
   * Create a paid_report commission on payment_intent.succeeded
   * Idempotent by orderId
   */
  async createPaidReportCommission(
    orderId: string,
    referredUserId: string,
    amountCents: number,
    stripePaymentIntentId: string
  ) {
    // Guard: validate input
    if (!orderId || !referredUserId || amountCents <= 0) {
      console.log(
        `[AffiliateService] Invalid paid report commission params: orderId=${orderId}, amountCents=${amountCents}`
      );
      return null;
    }

    // Guard: first-purchase only (check if user has other paid orders)
    const existingPayments = await prisma.payment.count({
      where: {
        userId: referredUserId,
        status: "SUCCEEDED",
      },
    });

    if (existingPayments > 1) {
      console.log(
        `[AffiliateService] User ${referredUserId} has multiple payments, skipping commission`
      );
      return null;
    }

    // Idempotent: check if commission already exists for this order
    const existing = await prisma.affiliateCommission.findFirst({
      where: { orderId },
    });

    if (existing) {
      console.log(
        `[AffiliateService] Commission already exists for order ${orderId}`
      );
      return existing;
    }

    // Find attribution
    const attribution = await prisma.affiliateAttribution.findUnique({
      where: { prospectUserId: referredUserId },
    });

    if (!attribution) {
      console.log(
        `[AffiliateService] No attribution found for user ${referredUserId}`
      );
      return null;
    }

    // Create commission in pending state
    const holdUntil = new Date(Date.now() + AFFILIATE_SETTINGS.holdDays * 24 * 60 * 60 * 1000);

    const commission = await prisma.affiliateCommission.create({
      data: {
        refCode: attribution.refCode,
        referrerId: attribution.prospectUserId
          ? (await prisma.affiliateReferrer.findFirst({
              where: { refCode: attribution.refCode },
            }))?.id || ""
          : "",
        referredUserId,
        event: "paid_report",
        amountCents,
        status: "pending",
        holdUntil,
        orderId,
      },
    });

    // Set firstPaidReportAt on referred user if not set
    await prisma.user.update({
      where: { id: referredUserId },
      data: {
        firstPaidReportAt: new Date(),
      },
    });

    console.log(
      `[AffiliateService] ✅ Created paid_report commission: ${commission.id} for order ${orderId}`
    );

    return commission;
  }

  /**
   * Create subscription bonus commission on invoice.paid
   * Only if invoice is first paid invoice and within 14 days of first paid report
   * Implements de-duplication: keep only highest tier, void lower tiers
   */
  async createSubscriptionBonusCommission(
    invoiceId: string,
    referredUserId: string,
    tier: "core" | "family" | "annual"
  ) {
    // Guard: validate input
    if (!invoiceId || !referredUserId || !tier) {
      console.log(
        `[AffiliateService] Invalid subscription bonus params: invoiceId=${invoiceId}, tier=${tier}`
      );
      return null;
    }

    // Get user's first paid report date
    const user = await prisma.user.findUnique({
      where: { id: referredUserId },
    });

    if (!user?.firstPaidReportAt) {
      console.log(
        `[AffiliateService] User ${referredUserId} has no firstPaidReportAt, skipping bonus`
      );
      return null;
    }

    // Check if within 14-day window
    const daysSincePaidReport = Math.floor(
      (Date.now() - user.firstPaidReportAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysSincePaidReport > 14) {
      console.log(
        `[AffiliateService] Subscription for user ${referredUserId} is outside 14-day bonus window (${daysSincePaidReport} days)`
      );
      return null;
    }

    // Find attribution
    const attribution = await prisma.affiliateAttribution.findUnique({
      where: { prospectUserId: referredUserId },
    });

    if (!attribution) {
      console.log(
        `[AffiliateService] No attribution found for user ${referredUserId}`
      );
      return null;
    }

    // Get amount for tier
    const tierAmounts: Record<string, number> = {
      core: AFFILIATE_SETTINGS.payoutAmounts.coreBonus,
      family: AFFILIATE_SETTINGS.payoutAmounts.familyBonus,
      annual: AFFILIATE_SETTINGS.payoutAmounts.annualBonus,
    };

    const desiredAmountCents = tierAmounts[tier] || 0;

    if (desiredAmountCents <= 0) {
      console.log(`[AffiliateService] Invalid tier: ${tier}`);
      return null;
    }

    // Check for existing bonus in window
    const windowStart = user.firstPaidReportAt;
    const windowEnd = new Date(windowStart.getTime() + 14 * 24 * 60 * 60 * 1000);

    const existing = await prisma.affiliateCommission.findFirst({
      where: {
        referredUserId,
        event: { in: ["core_sub", "family_sub", "annual_sub"] },
        createdAt: { gte: windowStart, lte: windowEnd },
      },
    });

    // De-duplication logic: keep only highest tier
    if (existing) {
      const tierRank: Record<string, number> = {
        core: 1,
        family: 2,
        annual: 3,
      };

      const existingTier = existing.event.replace("_sub", "") as string;
      const existingAmount = existing.amountCents;

      if (desiredAmountCents <= existingAmount) {
        console.log(
          `[AffiliateService] Existing ${existingTier} bonus (${existingAmount}) >= new ${tier} (${desiredAmountCents}), skipping`
        );
        return existing;
      }

      // Void the lower tier, create new higher tier
      await prisma.affiliateCommission.update({
        where: { id: existing.id },
        data: { status: "void", voidReason: "upgraded_to_higher_tier" },
      });

      console.log(
        `[AffiliateService] Voided lower tier commission ${existing.id}, creating ${tier} bonus`
      );
    }

    // Create new commission
    const holdUntil = new Date(Date.now() + AFFILIATE_SETTINGS.holdDays * 24 * 60 * 60 * 1000);

    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { refCode: attribution.refCode },
    });

    if (!referrer) {
      console.log(
        `[AffiliateService] Referrer not found for refCode ${attribution.refCode}`
      );
      return null;
    }

    const commission = await prisma.affiliateCommission.create({
      data: {
        refCode: attribution.refCode,
        referrerId: referrer.id,
        referredUserId,
        event: `${tier}_sub`,
        amountCents: desiredAmountCents,
        status: "pending",
        holdUntil,
        orderId: invoiceId,
      },
    });

    console.log(
      `[AffiliateService] ✅ Created ${tier}_sub commission: ${commission.id} (${desiredAmountCents} cents)`
    );

    return commission;
  }

  /**
   * Void or clawback commission on refund/dispute/chargeback
   * If status='paid', create negative adjustment (clawback)
   * If status='pending'|'payable', mark as void
   */
  async handleCommissionRefund(orderId: string, reason: "refund" | "dispute" | "chargeback") {
    const commission = await prisma.affiliateCommission.findFirst({
      where: { orderId },
    });

    if (!commission) {
      console.log(`[AffiliateService] No commission found for order ${orderId}`);
      return null;
    }

    if (commission.status === "paid") {
      // Create clawback (negative commission)
      const clawback = await prisma.affiliateCommission.create({
        data: {
          refCode: commission.refCode,
          referrerId: commission.referrerId,
          referredUserId: commission.referredUserId,
          event: commission.event,
          amountCents: -commission.amountCents,
          status: "clawed_back",
          voidReason: reason,
          orderId: `${orderId}-clawback`,
        },
      });

      console.log(
        `[AffiliateService] ✅ Created clawback commission: ${clawback.id} for order ${orderId}`
      );

      return clawback;
    } else {
      // Mark original as void
      const updated = await prisma.affiliateCommission.update({
        where: { id: commission.id },
        data: { status: "void", voidReason: reason },
      });

      console.log(
        `[AffiliateService] ✅ Voided commission: ${commission.id} (${reason})`
      );

      return updated;
    }
  }

  /**
   * Check if referral is eligible based on household rule
   * Mark as void if 2+ of 5 signals match:
   * 1. Payment method fingerprint
   * 2. Device fingerprint
   * 3. IP /24 subnet within 24h
   * 4. Exact phone match
   * 5. Billing name + last4
   */
  async checkHouseholdEligibility(
    referrerId: string,
    referredUserId: string,
    commission: any
  ): Promise<{ eligible: boolean; reason?: string }> {
    // Fetch both users
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
    });

    const referred = await prisma.user.findUnique({
      where: { id: referredUserId },
    });

    if (!referrer || !referred) {
      return { eligible: true }; // Can't check, assume eligible
    }

    // TODO: Integrate with Stripe fraud tools and FingerprintJS
    // For now, this is a placeholder
    // In production, you'd:
    // 1. Fetch Stripe charge for payment method fingerprint
    // 2. Call FingerprintJS API for device ID matching
    // 3. Check IP geolocation for /24 subnet
    // 4. Compare billing names and card last4s

    console.log(
      `[AffiliateService] Household check placeholder for ${referrerId} → ${referredUserId}`
    );

    return { eligible: true };
  }

  /**
   * Get referrer's payable balance
   */
  async getPayableBalance(referrerId: string): Promise<number> {
    const result = await prisma.affiliateCommission.aggregate({
      where: { referrerId, status: "payable" },
      _sum: { amountCents: true },
    });

    return result._sum.amountCents || 0;
  }

  /**
   * Get referrer's total earned (all statuses except void/clawed_back)
   */
  async getTotalEarned(referrerId: string): Promise<number> {
    const result = await prisma.affiliateCommission.aggregate({
      where: {
        referrerId,
        status: { notIn: ["void", "clawed_back"] },
      },
      _sum: { amountCents: true },
    });

    return result._sum.amountCents || 0;
  }

  /**
   * Void a commission (admin action)
   */
  async voidCommission(commissionId: string, reason: string) {
    const commission = await prisma.affiliateCommission.update({
      where: { id: commissionId },
      data: { status: "void", voidReason: reason },
    });

    console.log(
      `[AffiliateService] ✅ Admin voided commission: ${commissionId} (${reason})`
    );

    return commission;
  }

  /**
   * Mark commission as payable (admin override)
   */
  async markAsPayable(commissionId: string) {
    const commission = await prisma.affiliateCommission.update({
      where: { id: commissionId },
      data: { status: "payable", holdUntil: new Date() },
    });

    console.log(`[AffiliateService] ✅ Admin marked as payable: ${commissionId}`);

    return commission;
  }
}

export const affiliateService = new AffiliateService();
