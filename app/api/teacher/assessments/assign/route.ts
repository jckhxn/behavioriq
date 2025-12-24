import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDistrictUser } from "@/lib/district/access-control";
import { withFeatureFlag } from "@/lib/district/feature-flag-middleware";
import { FeatureFlags } from "@/lib/district/feature-flags";

/**
 * POST /api/teacher/assessments/assign
 * Assign an assessment to a student
 */
export async function POST(request: NextRequest) {
  const user = await getDistrictUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Feature flag check
  return withFeatureFlag(
    FeatureFlags.ASSESSMENT_ASSIGNMENT,
    request,
    async () => {
      try {
        const body = await request.json();
        const { studentId, assessmentId } = body;

        if (!studentId || !assessmentId) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        // Verify teacher has access to this student
        const student = await prisma.student.findFirst({
          where: {
            id: studentId,
            classrooms: {
              some: {
                classroom: {
                  teachers: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            },
          },
          include: {
            district: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!student) {
          return NextResponse.json(
            { error: "Student not found or access denied" },
            { status: 403 }
          );
        }

        // Verify assessment exists and is published
        const assessment = await prisma.assessment.findUnique({
          where: { id: assessmentId },
        });

        if (!assessment) {
          return NextResponse.json(
            { error: "Assessment not found" },
            { status: 404 }
          );
        }

        // Check if assessment already assigned
        const existing = await prisma.studentAssessment.findUnique({
          where: {
            studentId_assessmentId: {
              studentId,
              assessmentId,
            },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Assessment already assigned to this student" },
            { status: 400 }
          );
        }

        // Create assignment
        const studentAssessment = await prisma.studentAssessment.create({
          data: {
            studentId,
            assessmentId,
            isTrial: false,
          },
        });

        // Log audit trail
        await prisma.districtAuditLog.create({
          data: {
            districtId: student.district.id,
            studentId: student.id,
            userId: user.id,
            action: "ASSIGN_ASSESSMENT",
            resourceId: studentAssessment.id,
            metadata: {
              assessmentId,
              assessmentSubject: assessment.subjectName,
            },
          },
        });

        return NextResponse.json({
          success: true,
          assignment: {
            id: studentAssessment.id,
            studentId: studentAssessment.studentId,
            assessmentId: studentAssessment.assessmentId,
          },
        });
      } catch (error) {
        console.error("Error assigning assessment:", error);
        return NextResponse.json(
          { error: "Failed to assign assessment" },
          { status: 500 }
        );
      }
    },
    { userRole: user.role, organizationId: user.organizationId || undefined }
  );
}
