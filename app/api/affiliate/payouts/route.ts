import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { calculateArrivalDate } from "@/lib/affiliate/payout-calculator";

/**
 * GET /api/affiliate/payouts
 * Query params: ?status=sent&startDate=...&endDate=...&page=1&limit=20
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
    const total = await prisma.affiliatePayout.count({ where });

    // Get paginated results
    const payouts = await prisma.affiliatePayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add calculated fields
    const payoutsWithDetails = payouts.map((payout) => {
      const netAmount = payout.netAmountCents || (payout.amountCents - (payout.feesCents || 0));

      // If estimatedArrivalDate is not set, calculate it
      let estimatedArrival = payout.estimatedArrivalDate;
      if (!estimatedArrival && payout.status === "sent") {
        estimatedArrival = calculateArrivalDate(payout.createdAt, 2);
      }

      return {
        ...payout,
        netAmountCents: netAmount,
        estimatedArrivalDate: estimatedArrival,
        // Mask transfer ID for security (show last 8 chars)
        transferIdMasked: payout.transferId
          ? `***${payout.transferId.slice(-8)}`
          : null,
      };
    });

    return NextResponse.json({
      payouts: payoutsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AffiliatePayouts] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch payouts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
