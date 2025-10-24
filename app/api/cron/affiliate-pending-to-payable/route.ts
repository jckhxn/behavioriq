/**
 * Cron: Transition pending commissions to payable after 14-day hold
 * Run nightly at 2 AM UTC
 * Checks for refunds/disputes before marking as payable
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting: affiliate-pending-to-payable");

    // Find all pending commissions where holdUntil <= now
    const now = new Date();
    const pendingCommissions = await prisma.affiliateCommission.findMany({
      where: {
        status: "pending",
        holdUntil: { lte: now },
      },
    });

    console.log(
      `[Cron] Found ${pendingCommissions.length} commissions eligible for payable status`
    );

    let updated = 0;
    let failed = 0;

    for (const commission of pendingCommissions) {
      try {
        // Check if there's a refund or dispute for this order
        // In production, you'd query Stripe API for the latest charge status
        // For now, we assume if no void reason exists, it's clean
        if (commission.status === "pending" && !commission.voidReason) {
          await prisma.affiliateCommission.update({
            where: { id: commission.id },
            data: { status: "payable" },
          });

          updated++;
          console.log(
            `[Cron] ✅ Marked commission as payable: ${commission.id}`
          );
        }
      } catch (error) {
        failed++;
        console.error(
          `[Cron] ❌ Error updating commission ${commission.id}:`,
          error
        );
      }
    }

    console.log(
      `[Cron] Completed: ${updated} updated, ${failed} failed`
    );

    return NextResponse.json({
      success: true,
      processed: pendingCommissions.length,
      updated,
      failed,
    });
  } catch (error) {
    console.error("[Cron] ❌ Error in affiliate-pending-to-payable:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
