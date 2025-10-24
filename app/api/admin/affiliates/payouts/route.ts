/**
 * GET/POST /api/admin/affiliates/payouts
 * View payout history and trigger manual payouts
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripeConnectService } from "@/lib/stripe/connect";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const pageSize = 20;

    const payouts = await prisma.affiliatePayout.findMany({
      include: {
        referrer: { include: { user: { select: { email: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.affiliatePayout.count();

    return NextResponse.json({
      payouts: payouts.map((p: any) => ({
        id: p.id,
        referrer: p.referrer.user,
        amountCents: p.amountCents,
        amountUSD: (p.amountCents / 100).toFixed(2),
        status: p.status,
        provider: p.provider,
        transferId: p.transferId,
        failureReason: p.failureReason || null,
        createdAt: p.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[AdminPayouts] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/affiliates/payouts
 * Trigger manual payout for a referrer
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { referrerId, amountCents } = await req.json();

    if (!referrerId) {
      return NextResponse.json(
        { error: "referrerId is required" },
        { status: 400 }
      );
    }

    // Get referrer
    const referrer = await prisma.affiliateReferrer.findUnique({
      where: { id: referrerId },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    if (!(referrer as any).stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Referrer has no Stripe Connect account" },
        { status: 400 }
      );
    }

    // Calculate payable balance if amount not specified
    let payoutAmountCents = amountCents;

    if (!payoutAmountCents) {
      const balance = await prisma.affiliateCommission.aggregate({
        where: { referrerId, status: "payable" },
        _sum: { amountCents: true },
      });

      payoutAmountCents = balance._sum.amountCents || 0;
    }

    if (payoutAmountCents < 5000) {
      return NextResponse.json(
        {
          error: "Payout amount below minimum ($50)",
          minimum: 5000,
          current: payoutAmountCents,
        },
        { status: 400 }
      );
    }

    // Create transfer
    const payoutResult = await stripeConnectService.createPayout(
      (referrer as any).stripeConnectAccountId,
      payoutAmountCents,
      `Admin-triggered payout - ${new Date().toISOString().split("T")[0]}`
    );

    if (!payoutResult.success) {
      return NextResponse.json(
        {
          error: "Payout failed",
          details: payoutResult.error,
        },
        { status: 500 }
      );
    }

    // Create payout record
    const payout = await prisma.affiliatePayout.create({
      data: {
        referrerId,
        amountCents: payoutAmountCents,
        status: "sent",
        provider: "stripe_connect",
        transferId: payoutResult.transferId,
      },
    });

    // Mark commissions as paid
    if (!amountCents) {
      await prisma.affiliateCommission.updateMany({
        where: { referrerId, status: "payable" },
        data: { status: "paid" },
      });
    }

    console.log(
      `[AdminPayouts] ✅ Admin payout created: ${payout.id} (${payoutAmountCents} cents)`
    );

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amountUSD: (payoutAmountCents / 100).toFixed(2),
        transferId: payoutResult.transferId,
        status: "sent",
      },
      message: "Payout triggered successfully",
    });
  } catch (error) {
    console.error("[AdminPayouts] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to create payout" },
      { status: 500 }
    );
  }
}
