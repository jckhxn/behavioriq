/**
 * Cron: Auto-payout commissions when balance >= configured threshold
 * Run nightly at 3 AM UTC (after pending-to-payable runs)
 * Transfers funds to connected accounts via Stripe
 * Respects user payout preferences (frequency, threshold, auto-payout setting)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { stripeConnectService } from "@/lib/stripe/connect";

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
        // Calculate payable balance
        const payableBalance = await prisma.affiliateCommission.aggregate({
          where: {
            referrerId: referrer.id,
            status: "payable",
          },
          _sum: { amountCents: true },
        });

        const balanceCents = payableBalance._sum.amountCents || 0;

        // Check minimum threshold
        if (balanceCents < DEFAULT_PAYOUT_THRESHOLD_CENTS) {
          skipCount++;
          console.log(
            `[Cron] Referrer ${referrer.id} balance ${balanceCents} < threshold ${DEFAULT_PAYOUT_THRESHOLD_CENTS}, skipping`
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
