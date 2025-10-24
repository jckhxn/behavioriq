/**
 * GET /api/admin/affiliates/stats
 * Analytics for affiliate dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  // Check admin role
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const days = Number(req.nextUrl.searchParams.get("days")) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total referred revenue
    const referredRevenue = await prisma.affiliateCommission.aggregate({
      where: {
        status: { in: ["pending", "payable", "paid"] },
        createdAt: { gte: since },
      },
      _sum: { amountCents: true },
    });

    // Total payable balance
    const payableBalance = await prisma.affiliateCommission.aggregate({
      where: { status: "payable" },
      _sum: { amountCents: true },
    });

    // Total paid out
    const totalPaidOut = await prisma.affiliatePayout.aggregate({
      where: { status: "sent" },
      _sum: { amountCents: true },
    });

    // Affiliate statistics
    const activeReferrers = await prisma.affiliateReferrer.count({
      where: { status: "active" },
    });

    const suspendedReferrers = await prisma.affiliateReferrer.count({
      where: { status: "suspended" },
    });

    const totalClicks = await prisma.affiliateClick.count({
      where: { createdAt: { gte: since } },
    });

    const totalAttributions = await prisma.affiliateAttribution.count({
      where: { createdAt: { gte: since } },
    });

    // Calculate blended CAC (Referred Cost of Acquisition)
    // CAC = Total commissions paid / Total referred revenue
    const allReferredRevenue = await prisma.affiliateCommission.aggregate({
      where: { status: { in: ["pending", "payable", "paid"] } },
      _sum: { amountCents: true },
    });

    const totalCommissions = allReferredRevenue._sum.amountCents || 0;

    // Estimate referred purchases (roughly 1 purchase per attribution with payment)
    const paidCommissions = await prisma.affiliateCommission.count({
      where: { status: { in: ["payable", "paid"] } },
    });

    // Fraud metrics
    const voidedCommissions = await prisma.affiliateCommission.count({
      where: { status: "void" },
    });

    const clawedBackCommissions = await prisma.affiliateCommission.count({
      where: { status: "clawed_back" },
    });

    const fraudRate =
      paidCommissions > 0
        ? (((voidedCommissions + clawedBackCommissions) / paidCommissions) * 100).toFixed(2)
        : "0";

    return NextResponse.json({
      period: `last_${days}_days`,
      revenue: {
        referredCents: referredRevenue._sum.amountCents || 0,
        referredUSD: ((referredRevenue._sum.amountCents || 0) / 100).toFixed(2),
      },
      balance: {
        payableCents: payableBalance._sum.amountCents || 0,
        payableUSD: ((payableBalance._sum.amountCents || 0) / 100).toFixed(2),
      },
      payouts: {
        totalCents: totalPaidOut._sum.amountCents || 0,
        totalUSD: ((totalPaidOut._sum.amountCents || 0) / 100).toFixed(2),
      },
      referrers: {
        active: activeReferrers,
        suspended: suspendedReferrers,
        total: activeReferrers + suspendedReferrers,
      },
      attribution: {
        clicks: totalClicks,
        signups: totalAttributions,
        conversionRate: totalClicks > 0 ? ((totalAttributions / totalClicks) * 100).toFixed(2) : "0",
      },
      fraud: {
        voidedCommissions,
        clawedBackCommissions,
        fraudRatePercent: fraudRate,
      },
      cac: {
        blendedCACCents: paidCommissions > 0 ? Math.round(totalCommissions / paidCommissions) : 0,
        blendedCACUSD: (
          paidCommissions > 0
            ? (totalCommissions / paidCommissions / 100).toFixed(2)
            : "0"
        ),
      },
    });
  } catch (error) {
    console.error("[AdminAffiliateStats] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
