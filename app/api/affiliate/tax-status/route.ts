import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripeConnectService } from "@/lib/stripe/connect";

const TAX_THRESHOLD_CENTS = 60000; // $600

/**
 * GET /api/affiliate/tax-status
 * Get tax status and $600 threshold tracking
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get referrer account
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate profile" },
        { status: 404 }
      );
    }

    // Calculate current year earnings
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const yearlyEarnings = await prisma.affiliateCommission.aggregate({
      where: {
        referrerId: referrer.id,
        status: { in: ["paid", "payable"] }, // Count only paid and payable commissions
        createdAt: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      _sum: { amountCents: true },
    });

    const yearlyEarningsCents = yearlyEarnings._sum.amountCents || 0;
    const yearlyEarningsUSD = yearlyEarningsCents / 100;

    // Calculate progress toward $600 threshold
    const thresholdProgress = Math.min(100, (yearlyEarningsCents / TAX_THRESHOLD_CENTS) * 100);
    const requiresForm1099 = yearlyEarningsCents >= TAX_THRESHOLD_CENTS;

    // Get tax status from Stripe Connect if available
    let stripeTaxStatus = null;
    if (referrer.stripeConnectAccountId) {
      stripeTaxStatus = await stripeConnectService.getTaxStatus(referrer.stripeConnectAccountId);
    }

    return NextResponse.json({
      currentYear,
      yearlyEarnings: {
        cents: yearlyEarningsCents,
        usd: yearlyEarningsUSD,
      },
      threshold: {
        cents: TAX_THRESHOLD_CENTS,
        usd: TAX_THRESHOLD_CENTS / 100,
      },
      progress: thresholdProgress,
      requiresForm1099,
      remainingToThreshold: Math.max(0, TAX_THRESHOLD_CENTS - yearlyEarningsCents),
      stripeTaxStatus: stripeTaxStatus || {
        taxIdProvided: false,
        w9Submitted: false,
        requirements: [],
      },
    });
  } catch (error) {
    console.error("[AffiliateTaxStatus] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tax status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
