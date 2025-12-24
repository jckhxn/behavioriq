import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDistrictUser } from "@/lib/district/access-control";
import { withFeatureFlag } from "@/lib/district/feature-flag-middleware";
import { FeatureFlags } from "@/lib/district/feature-flags";

/**
 * POST /api/teacher/students
 * Create a new student with anonymous ID
 */
export async function POST(request: NextRequest) {
  const user = await getDistrictUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Feature flag check
  return withFeatureFlag(
    FeatureFlags.STUDENT_CREATION,
    request,
    async () => {
      try {
        const body = await request.json();
        const {
          classroomId,
          districtId,
          gradeLevel,
          firstName,
          lastName,
          consentGiven,
        } = body;

        if (!classroomId || !gradeLevel) {
          return NextResponse.json(
            { error: "Missing required fields: classroomId, gradeLevel" },
            { status: 400 }
          );
        }

        // Verify teacher owns this classroom
        const classroom = await prisma.classroom.findFirst({
          where: {
            id: classroomId,
            teachers: {
              some: {
                teacher: {
                  userId: user.id,
                },
              },
            },
          },
          include: {
            school: {
              select: {
                districtId: true,
              },
            },
          },
        });

        if (!classroom) {
          return NextResponse.json(
            { error: "Classroom not found or access denied" },
            { status: 403 }
          );
        }

        // Use classroom's districtId
        const actualDistrictId = districtId || classroom.school.districtId;

        // Generate anonymous ID
        const anonymousId = `STU-${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}`;

        // Create student
        const student = await prisma.student.create({
          data: {
            anonymousId,
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            gradeLevel,
            districtId: actualDistrictId,
            consentGiven: consentGiven ?? true,
            classrooms: {
              create: {
                classroomId,
                enrolledAt: new Date(),
              },
            },
          },
        });

        // Log audit trail
        await prisma.districtAuditLog.create({
          data: {
            districtId: actualDistrictId,
            studentId: student.id,
            userId: user.id,
            action: "CREATE_STUDENT",
            resourceId: student.id,
            metadata: {
              anonymousId: student.anonymousId,
              gradeLevel,
              classroomId,
              // Do NOT log firstName/lastName for privacy
            },
          },
        });

        return NextResponse.json({
          success: true,
          student: {
            id: student.id,
            anonymousId: student.anonymousId,
            firstName: student.firstName,
            lastName: student.lastName,
            gradeLevel: student.gradeLevel,
          },
        });
      } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json(
          { error: "Failed to create student" },
          { status: 500 }
        );
      }
    },
    { userRole: user.role, organizationId: user.organizationId || undefined }
  );
}
