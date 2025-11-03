/**
 * Cron: Auto-payout commissions when balance >= configured threshold
 * Run nightly at 3 AM UTC (after pending-to-payable runs)
 * Transfers funds to connected accounts via Stripe
 * Respects user payout preferences (frequency, threshold, auto-payout setting)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripeConnectService } from "@/lib/stripe/connect";
import { calculateNextPayout } from "@/lib/affiliate/payout-calculator";
import { getDefaultPayoutPreferences } from "@/lib/affiliate/preferences-validator";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const DEFAULT_PAYOUT_THRESHOLD_CENTS = 5000; // $50

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting: affiliate-auto-payout");

    // Get all active referrers with Stripe Connect accounts
    const referrers = await prisma.affiliateReferrer.findMany({
      where: {
        status: "active",
        stripeConnectAccountId: { not: null },
      },
      include: {
        user: true,
        payoutPreferences: true,
      },
    });

    console.log(
      `[Cron] Found ${referrers.length} referrers with Stripe Connect`
    );

    let payoutCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const referrer of referrers) {
      try {
        // Get or use default preferences
        const preferences = referrer.payoutPreferences || getDefaultPayoutPreferences();

        // Skip if auto-payout is disabled
        if (!preferences.autoPayoutEnabled) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} has auto-payout disabled, skipping`
          );
          continue;
        }

        // Calculate payable balance
        const payableBalance = await prisma.affiliateCommission.aggregate({
          where: {
            referrerId: referrer.id,
            status: "payable",
          },
          _sum: { amountCents: true },
        });

        const balanceCents = payableBalance._sum.amountCents || 0;

        // Check minimum threshold from preferences
        const thresholdCents = preferences.minPayoutThresholdCents || DEFAULT_PAYOUT_THRESHOLD_CENTS;

        if (balanceCents < thresholdCents) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} balance ${balanceCents} < threshold ${thresholdCents}, skipping`
          );
          continue;
        }

        // Check payout frequency and schedule
        const nextPayout = calculateNextPayout(balanceCents, preferences);

        if (!nextPayout.eligible) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} not eligible for payout yet: ${nextPayout.reason}`
          );
          continue;
        }

        // If estimatedDate is in the future, skip for now
        if (nextPayout.estimatedDate && nextPayout.estimatedDate > new Date()) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} payout scheduled for ${nextPayout.estimatedDate.toISOString()}, skipping`
          );
          continue;
        }

        // Check if Connect account is ready (KYC complete)
        const accountStatus = await stripeConnectService.checkAccountStatus(
          referrer.stripeConnectAccountId!
        );

        if (!accountStatus.isReady) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} Connect account not ready, pending: ${accountStatus.requirements.join(", ")}`
          );
          continue;
        }

        if (!accountStatus.transfersEnabled) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} transfers not enabled on Connect account`
          );
          continue;
        }

        // Create payout (transfer to connected account)
        const payoutResult = await stripeConnectService.createPayout(
          referrer.stripeConnectAccountId!,
          balanceCents,
          `BehaviorIQ referral earnings (${new Date().toISOString().split("T")[0]})`
        );

        if (!payoutResult.success) {
          failCount++;
          console.error(
            `[Cron] ❌ Payout failed for referrer ${referrer.id}: ${payoutResult.error}`
          );

          // Create failed payout record
          await prisma.affiliatePayout.create({
            data: {
              referrerId: referrer.id,
              amountCents: balanceCents,
              status: "failed",
              provider: "stripe_connect",
              failureReason: payoutResult.error,
            },
          });

          continue;
        }

        // Create successful payout record
        const payout = await prisma.affiliatePayout.create({
          data: {
            referrerId: referrer.id,
            amountCents: balanceCents,
            status: "sent",
            provider: "stripe_connect",
            transferId: payoutResult.transferId,
          },
        });

        // Mark commissions as paid
        await prisma.affiliateCommission.updateMany({
          where: {
            referrerId: referrer.id,
            status: "payable",
          },
          data: { status: "paid" },
        });

        payoutCount++;
        console.log(
          `[Cron] ✅ Payout created for referrer ${referrer.id}: ${payout.id} (${balanceCents} cents, transfer: ${payoutResult.transferId})`
        );

        // TODO: Send email notification to referrer
        // await sendAffiliatePayoutEmail(referrer.user.email, balanceCents);
      } catch (error) {
        failCount++;
        console.error(`[Cron] ❌ Error processing referrer ${referrer.id}:`, error);
      }
    }

    console.log(
      `[Cron] Completed: ${payoutCount} payouts, ${skipCount} skipped, ${failCount} failed`
    );

    return NextResponse.json({
      success: true,
      referrersProcessed: referrers.length,
      payoutsCreated: payoutCount,
      skipped: skipCount,
      failed: failCount,
    });
  } catch (error) {
    console.error("[Cron] ❌ Error in affiliate-auto-payout:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
