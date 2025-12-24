/**
 * GET /api/district/students/[id]
 * Get detailed student assessment results
 */

import { NextRequest, NextResponse } from "next/server";
import { withDistrictAuth } from "@/lib/district/access-control";
import { DistrictService } from "@/lib/district/district-service";
import { AuditLogService } from "@/lib/district/audit-log-service";
import { getRecommendations } from "@/lib/district/ai-recommendations";

export const GET = withDistrictAuth(
  async (req: NextRequest, user, { params }: any) => {
    try {
      const { id: studentId } = await params;

      const student = await DistrictService.getStudentDetails(
        studentId,
        user.id
      );

      // Get AI recommendations if available
      let recommendations = null;
      const latestAssessment = student.assessments[0];
      if (latestAssessment && !latestAssessment.isTrial) {
        recommendations = await getRecommendations(
          studentId,
          latestAssessment.assessmentId
        );
      }

      // Log access
      await AuditLogService.log({
        districtId: student.districtId,
        studentId: student.id,
        userId: user.id,
        action: "VIEW_STUDENT_DETAILS",
        resourceId: latestAssessment?.assessmentId,
      });

      return NextResponse.json({
        student,
        recommendations,
      });
    } catch (error: any) {
      console.error("Error fetching student details:", error);

      if (error.message.includes("Access denied")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }

      return NextResponse.json(
        { error: error.message || "Failed to fetch student details" },
        { status: 500 }
      );
    }
  },
  "TEACHER"
);

/**
 * POST /api/district/students/[id]/review
 * Mark student report as reviewed
 */
export const POST = withDistrictAuth(
  async (req: NextRequest, user, { params }: any) => {
    try {
      const { id: studentId } = await params;
      const body = await req.json();
      const { assessmentId } = body;

      if (!assessmentId) {
        return NextResponse.json(
          { error: "assessmentId is required" },
          { status: 400 }
        );
      }

      await DistrictService.markAsReviewed(studentId, assessmentId, user.id);

      // Log review action
      await AuditLogService.log({
        studentId,
        userId: user.id,
        action: "MARK_REVIEWED",
        resourceId: assessmentId,
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("Error marking as reviewed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to mark as reviewed" },
        { status: 500 }
      );
    }
  },
  "TEACHER"
);
