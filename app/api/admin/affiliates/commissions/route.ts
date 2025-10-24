/**
 * GET/PATCH /api/admin/affiliates/commissions
 * View and manage commissions (void, mark payable)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { affiliateService } from "@/lib/services/affiliate-service";

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

    const commissions = await prisma.affiliateCommission.findMany({
      where,
      include: {
        referrer: { include: { user: { select: { email: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.affiliateCommission.count({ where });

    return NextResponse.json({
      commissions: commissions.map((c: any) => ({
        id: c.id,
        refCode: c.refCode,
        referrer: c.referrer.user,
        event: c.event,
        amountCents: c.amountCents,
        amountUSD: (c.amountCents / 100).toFixed(2),
        status: c.status,
        voidReason: c.voidReason || null,
        holdUntil: c.holdUntil,
        orderId: c.orderId,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[AdminCommissions] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/affiliates/commissions
 * Void or mark commission as payable
 */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commissionId, action, reason } = await req.json();

    if (!commissionId || !["void", "payable"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid commissionId or action" },
        { status: 400 }
      );
    }

    if (action === "void") {
      const updated = await affiliateService.voidCommission(
        commissionId,
        reason || "admin_action"
      );

      return NextResponse.json({
        success: true,
        commission: updated,
        message: "Commission voided",
      });
    } else if (action === "payable") {
      const updated = await affiliateService.markAsPayable(commissionId);

      return NextResponse.json({
        success: true,
        commission: updated,
        message: "Commission marked as payable",
      });
    }
  } catch (error) {
    console.error("[AdminCommissions] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to update commission" },
      { status: 500 }
    );
  }
}
