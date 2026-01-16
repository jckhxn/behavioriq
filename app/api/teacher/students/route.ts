import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getDistrictUser } from "@/lib/district/access-control";
import { withFeatureFlag } from "@/lib/district/feature-flag-middleware";
import { FeatureFlags } from "@/lib/district/feature-flags";

/**
 * GET /api/teacher/students
 * List students assigned to the current teacher
 */
export async function GET(request: NextRequest) {
  const user = await getDistrictUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    ![
      "TEACHER",
      "COUNSELOR",
      "PRINCIPAL",
      "DISTRICT_ADMIN",
      "ADMIN",
      "SUPER_ADMIN",
    ].includes(user.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const gradeLevel = searchParams.get("gradeLevel");
    const status = searchParams.get("status"); // not_started, in_progress, completed

    // Get teacher's classrooms
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: {
        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    });

    if (!teacher && user.role === "TEACHER") {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Build student filter
    const classroomIds = teacher?.classrooms.map((tc) => tc.classroomId) || [];

    // For non-teachers (admins), get students from their district
    const whereClause: any =
      user.role === "TEACHER"
        ? {
            classrooms: {
              some: {
                classroomId: classroomId || { in: classroomIds },
              },
            },
            isActive: true,
          }
        : {
            districtId: user.districtId,
            isActive: true,
          };

    // Add grade filter
    if (gradeLevel) {
      whereClause.gradeLevel = gradeLevel;
    }

    // Fetch students with assessment data
    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        classrooms: {
          include: {
            classroom: {
              select: {
                id: true,
                name: true,
                gradeLevel: true,
              },
            },
          },
        },
        assessments: {
          include: {
            assessment: {
              select: {
                id: true,
                status: true,
                mode: true,
                completedAt: true,
                domainIndicators: {
                  select: {
                    domainName: true,
                    flagged: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform for frontend
    const transformedStudents = students.map((student) => {
      const latestAssessment = student.assessments[0]?.assessment;
      const assessmentStatus: string =
        latestAssessment?.status || "NOT_STARTED";
      const flaggedDomains =
        latestAssessment?.domainIndicators
          .filter((di) => di.flagged)
          .map((di) => di.domainName) || [];

      return {
        id: student.id,
        anonymousId: student.anonymousId,
        firstName: student.consentGiven ? student.firstName : null,
        lastName: student.consentGiven ? student.lastName : null,
        gradeLevel: student.gradeLevel,
        isAnonymous: student.isAnonymous,
        consentGiven: student.consentGiven,
        createdAt: student.createdAt,
        classrooms: student.classrooms.map((sc) => sc.classroom),
        assessmentStatus,
        latestAssessmentId: latestAssessment?.id || null,
        completedAt: latestAssessment?.completedAt || null,
        flaggedDomains,
        hasFlaggedDomains: flaggedDomains.length > 0,
      };
    });

    // Filter by status if requested
    let filteredStudents = transformedStudents;
    if (status === "not_started") {
      filteredStudents = transformedStudents.filter(
        (s) => s.assessmentStatus === "NOT_STARTED"
      );
    } else if (status === "in_progress") {
      filteredStudents = transformedStudents.filter(
        (s) => s.assessmentStatus === "IN_PROGRESS"
      );
    } else if (status === "completed") {
      filteredStudents = transformedStudents.filter(
        (s) => s.assessmentStatus === "COMPLETED"
      );
    }

    return NextResponse.json({
      students: filteredStudents,
      total: filteredStudents.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

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
