import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripeConnectService } from "@/lib/stripe/connect";
import { calculateNextPayout } from "@/lib/affiliate/payout-calculator";
import { calculateDailyAverageEarnings } from "@/lib/affiliate/analytics";
import { getDefaultPayoutPreferences } from "@/lib/affiliate/preferences-validator";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate profile" },
        { status: 404 }
      );
    }

    // Stats
    const stats = {
      clicks: await prisma.affiliateClick.count({
        where: { refCode: referrer.refCode },
      }),
      signups: await prisma.affiliateAttribution.count({
        where: { refCode: referrer.refCode },
      }),
      paid: await prisma.affiliateCommission.count({
        where: { referrerId: referrer.id, status: "paid" },
      }),
      pending: await prisma.affiliateCommission.count({
        where: { referrerId: referrer.id, status: "pending" },
      }),
      payable: await prisma.affiliateCommission.count({
        where: { referrerId: referrer.id, status: "payable" },
      }),
      paidOut: await prisma.affiliatePayout.count({
        where: { referrerId: referrer.id },
      }),
    };

    // Balances
    const payableBalance = await prisma.affiliateCommission.aggregate({
      where: { referrerId: referrer.id, status: "payable" },
      _sum: { amountCents: true },
    });

    const totalEarned = await prisma.affiliateCommission.aggregate({
      where: {
        referrerId: referrer.id,
        status: { notIn: ["void", "clawed_back"] },
      },
      _sum: { amountCents: true },
    });

    const totalPaidOut = await prisma.affiliatePayout.aggregate({
      where: { referrerId: referrer.id, status: "sent" },
      _sum: { amountCents: true },
    });

    // Stripe Connect status
    let stripeStatus = {
      isOnboarded: false,
      isReady: false,
      transfersEnabled: false,
      chargesEnabled: false,
      pendingRequirements: [] as string[],
    };

    if (referrer.stripeConnectAccountId) {
      stripeStatus.isOnboarded = true;
      const accountStatus = await stripeConnectService.checkAccountStatus(
        referrer.stripeConnectAccountId
      );

      stripeStatus.isReady = accountStatus.isReady;
      stripeStatus.transfersEnabled = accountStatus.transfersEnabled;
      stripeStatus.chargesEnabled = accountStatus.chargesEnabled;
      stripeStatus.pendingRequirements = accountStatus.requirements;
    }

    // Get payout preferences
    let preferences = await prisma.affiliatePayoutPreferences.findUnique({
      where: { referrerId: referrer.id },
    });

    if (!preferences) {
      preferences = getDefaultPayoutPreferences() as any;
    }

    // Get all commissions for daily average calculation
    const allCommissions = await prisma.affiliateCommission.findMany({
      where: {
        referrerId: referrer.id,
        status: { notIn: ["void", "clawed_back"] },
      },
      select: {
        createdAt: true,
        amountCents: true,
      },
    });

    // Calculate daily average
    const dailyAverage = calculateDailyAverageEarnings(
      allCommissions.map((c) => ({
        ...c,
        id: "",
        event: "",
        status: "paid",
      })),
      30
    );

    // Calculate next payout estimate
    const defaultPreferences = {
      minPayoutThresholdCents: 5000,
      payoutFrequency: "auto" as const,
      autoPayoutEnabled: true,
    };
    const nextPayoutEstimate = calculateNextPayout(
      payableBalance._sum.amountCents || 0,
      (preferences || defaultPreferences) as any,
      dailyAverage
    );

    return NextResponse.json({
      refCode: referrer.refCode,
      status: referrer.status,
      stats,
      balances: {
        payableCents: payableBalance._sum.amountCents || 0,
        totalEarnedCents: totalEarned._sum.amountCents || 0,
        totalPaidOutCents: totalPaidOut._sum.amountCents || 0,
      },
      stripe: stripeStatus,
      nextPayoutEligibleDate:
        (payableBalance._sum.amountCents || 0) >= 5000
          ? "Now"
          : "When balance reaches $50",
      nextPayoutEstimate,
    });
  } catch (error) {
    console.error("[AffiliateMe] ❌ Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch affiliate data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
