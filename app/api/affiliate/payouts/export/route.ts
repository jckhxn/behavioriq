import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { exportPayoutsToCSV, generateCSVFilename } from "@/lib/affiliate/csv-export";

/**
 * GET /api/affiliate/payouts/export
 * Exports payouts as CSV
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

    // Get all payouts (no pagination for export)
    const payouts = await prisma.affiliatePayout.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const csv = exportPayoutsToCSV(payouts);
    const filename = generateCSVFilename("payouts", startDate || undefined, endDate || undefined);

    // Return CSV with appropriate headers
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[AffiliatePayoutsExport] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to export payouts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
