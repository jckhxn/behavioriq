/**
 * GET /api/district/metrics
 * Get district-wide metrics with optional filters
 */

import { NextRequest, NextResponse } from "next/server";
import { withDistrictAuth } from "@/lib/district/access-control";
import { DistrictService } from "@/lib/district/district-service";

export const GET = withDistrictAuth(async (req: NextRequest, user) => {
  try {
    // Get query params
    const { searchParams } = new URL(req.url);
    const filters = {
      gradeLevel: searchParams.get("gradeLevel") || undefined,
      classroomId: searchParams.get("classroomId") || undefined,
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo")
        ? new Date(searchParams.get("dateTo")!)
        : undefined,
      flaggedOnly: searchParams.get("flaggedOnly") === "true",
    };

    // Get district ID
    // For now, we'll use a placeholder since the schema needs to be migrated
    // In production, this would come from user.districtId or organization mapping
    const districtId = user.districtId || "default";

    const metrics = await DistrictService.getDistrictMetrics(
      districtId,
      filters
    );

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("Error fetching district metrics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}, "TEACHER");
