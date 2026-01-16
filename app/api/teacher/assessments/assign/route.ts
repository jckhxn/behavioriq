import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDistrictUser } from "@/lib/district/access-control";
import { withFeatureFlag } from "@/lib/district/feature-flag-middleware";
import { FeatureFlags } from "@/lib/district/feature-flags";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/teacher/assessments/assign
 * Create and assign a new assessment to a student
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
        const { studentId, assessmentTemplateId } = body;

        if (!studentId) {
          return NextResponse.json(
            { error: "Missing required field: studentId" },
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
                      teacher: {
                        userId: user.id,
                      },
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

        // Get assessment template (use global or provided)
        let templateId = assessmentTemplateId;
        if (!templateId) {
          // Get global assessment template
          const platformSettings = await prisma.platformSettings.findFirst();
          templateId = platformSettings?.globalRegularAssessmentId;
        }

        const template = templateId
          ? await prisma.assessmentTemplate.findUnique({
              where: { id: templateId },
            })
          : null;

        // Generate unique short ID
        const shortId = `A${uuidv4().split("-")[0].toUpperCase()}`;

        // Create new assessment for this student
        const assessment = await prisma.assessment.create({
          data: {
            subjectName: student.firstName
              ? `${student.firstName} ${student.lastName || ""}`.trim()
              : student.anonymousId,
            status: "IN_PROGRESS",
            mode: "FULL",
            startedAt: new Date(),
            shortId,
            assessmentTemplateId: templateId || null,
          },
        });

        // Create student-assessment link
        const studentAssessment = await prisma.studentAssessment.create({
          data: {
            studentId,
            assessmentId: assessment.id,
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
              assessmentId: assessment.id,
              templateId: templateId || null,
              templateName: template?.name || "Default",
            },
          },
        });

        return NextResponse.json({
          success: true,
          assignment: {
            id: studentAssessment.id,
            studentId: studentAssessment.studentId,
            assessmentId: assessment.id,
            shortId: assessment.shortId,
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
