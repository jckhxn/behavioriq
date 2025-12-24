/**
 * GET /api/district/students
 * Get list of students with assessment status and flags
 */

import { NextRequest, NextResponse } from "next/server";
import { withDistrictAuth } from "@/lib/district/access-control";
import { DistrictService } from "@/lib/district/district-service";
import { AuditLogService } from "@/lib/district/audit-log-service";

export const GET = withDistrictAuth(async (req: NextRequest, user) => {
  try {
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

    const districtId = user.districtId || "default";
    const teacherId = user.role === "TEACHER" ? user.teacherId : undefined;

    const students = await DistrictService.getStudentList(
      districtId,
      filters,
      teacherId
    );

    // Log access
    await AuditLogService.log({
      districtId,
      userId: user.id,
      action: "VIEW_STUDENT_LIST",
      metadata: { filters, resultCount: students.length },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}, "TEACHER");
