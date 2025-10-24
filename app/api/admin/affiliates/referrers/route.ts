/**
 * GET/POST /api/admin/affiliates/referrers
 * Manage affiliate referrers (list, suspend, unsuspend)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = req.nextUrl.searchParams.get("status") || "all";
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const pageSize = 20;

    const where: any = {};
    if (status !== "all") {
      where.status = status;
    }

    const referrers = await prisma.affiliateReferrer.findMany({
      where,
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.affiliateReferrer.count({ where });

    // Enhance with balances
    const enhanced = await Promise.all(
      referrers.map(async (ref) => {
        const payableBalance = await prisma.affiliateCommission.aggregate({
          where: { referrerId: ref.id, status: "payable" },
          _sum: { amountCents: true },
        });

        const totalEarned = await prisma.affiliateCommission.aggregate({
          where: {
            referrerId: ref.id,
            status: { notIn: ["void", "clawed_back"] },
          },
          _sum: { amountCents: true },
        });

        return {
          ...ref,
          balances: {
            payableCents: payableBalance._sum.amountCents || 0,
            totalEarnedCents: totalEarned._sum.amountCents || 0,
          },
        };
      })
    );

    return NextResponse.json({
      referrers: enhanced,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[AdminReferrers] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch referrers" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/affiliates/referrers
 * Suspend or unsuspend a referrer
 */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { referrerId, status } = await req.json();

    if (!referrerId || !["active", "suspended"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid referrerId or status" },
        { status: 400 }
      );
    }

    const updated = await prisma.affiliateReferrer.update({
      where: { id: referrerId },
      data: { status },
    });

    console.log(
      `[AdminReferrers] ✅ Updated referrer ${referrerId} status: ${status}`
    );

    return NextResponse.json({
      success: true,
      referrer: updated,
      message: `Referrer ${status === "suspended" ? "suspended" : "activated"}`,
    });
  } catch (error) {
    console.error("[AdminReferrers] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to update referrer" },
      { status: 500 }
    );
  }
}
