import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripeConnectService } from "@/lib/stripe/connect";

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
