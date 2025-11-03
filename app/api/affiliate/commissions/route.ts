import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/affiliate/commissions
 * Query params: ?status=payable&eventType=paid_report&startDate=...&endDate=...&page=1&limit=20
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // Build where clause
    const where: any = {
      referrerId: referrer.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (eventType && eventType !== "all") {
      where.event = eventType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const total = await prisma.affiliateCommission.count({ where });

    // Get paginated results
    const commissions = await prisma.affiliateCommission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate days remaining for pending commissions
    const commissionsWithDetails = commissions.map((commission) => {
      let daysRemaining: number | null = null;
      let holdProgress: number | null = null;

      if (commission.status === "pending" && commission.holdUntil) {
        const now = new Date();
        const holdEnd = new Date(commission.holdUntil);
        daysRemaining = Math.max(
          0,
          Math.ceil((holdEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Calculate progress (assuming 14-day hold)
        const totalDays = 14;
        const daysElapsed = totalDays - daysRemaining;
        holdProgress = Math.min(100, (daysElapsed / totalDays) * 100);
      }

      return {
        ...commission,
        daysRemaining,
        holdProgress,
        // Anonymize user ID
        referredUserIdAnonymized: commission.referredUserId.substring(0, 8) + "***",
      };
    });

    return NextResponse.json({
      commissions: commissionsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AffiliateCommissions] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch commissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
