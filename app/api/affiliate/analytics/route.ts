import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  aggregateCommissionsByPeriod,
  breakdownByCommissionType,
  calculatePerformanceMetrics,
  compareMonthlyPerformance,
} from "@/lib/affiliate/analytics";
import { subDays } from "date-fns";

/**
 * GET /api/affiliate/analytics
 * Query params: ?startDate=...&endDate=...&groupBy=day|week|month
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
    const groupBy = (searchParams.get("groupBy") || "day") as "day" | "week" | "month";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const daysParam = searchParams.get("days");

    // Default to last 30 days if no date range specified
    let startDate: Date;
    let endDate: Date = new Date();

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else if (daysParam) {
      startDate = subDays(endDate, parseInt(daysParam));
    } else {
      startDate = subDays(endDate, 30);
    }

    // Fetch commissions in date range
    const commissions = await prisma.affiliateCommission.findMany({
      where: {
        referrerId: referrer.id,
        status: { notIn: ["void", "clawed_back"] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Generate analytics
    const timeSeries = aggregateCommissionsByPeriod(commissions, groupBy);
    const breakdown = breakdownByCommissionType(commissions);
    const metrics = calculatePerformanceMetrics(commissions);
    const monthlyComparison = compareMonthlyPerformance(commissions, 6);

    return NextResponse.json({
      timeSeries,
      breakdown,
      metrics,
      monthlyComparison,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("[AffiliateAnalytics] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
