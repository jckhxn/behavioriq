import { NextRequest, NextResponse } from "next/server";
import { getDistrictUser, DistrictUser } from "@/lib/district/access-control";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/district/dashboard
 * Returns aggregated dashboard metrics for district admin view
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getDistrictUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only district admin and higher can access
    if (
      !["DISTRICT_ADMIN", "PRINCIPAL", "ADMIN", "SUPER_ADMIN"].includes(
        user.role
      )
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const gradeLevel = searchParams.get("gradeLevel");

    // Get district ID from user's teacher profile or organization
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        teacherProfile: {
          select: { districtId: true },
        },
      },
    });

    const districtId =
      user.districtId || userWithProfile?.teacherProfile?.districtId;

    if (!districtId) {
      return NextResponse.json({ error: "No district found" }, { status: 404 });
    }

    // Build filters
    const studentWhere: any = {
      districtId,
      isActive: true,
    };

    if (schoolId) {
      studentWhere.schoolId = schoolId;
    }

    if (gradeLevel) {
      studentWhere.gradeLevel = gradeLevel;
    }

    // Get all students with assessment data
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        assessments: {
          include: {
            assessment: {
              include: {
                scores: true,
                domainIndicators: true,
              },
            },
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate aggregate metrics
    const totalStudents = students.length;
    let studentsScreened = 0;
    let studentsNotStarted = 0;
    let studentsInProgress = 0;
    let studentsCompleted = 0;
    let studentsFlagged = 0;

    const domainCounts: Record<string, { flagged: number; total: number }> = {
      Anxiety: { flagged: 0, total: 0 },
      Mood: { flagged: 0, total: 0 },
      Attention: { flagged: 0, total: 0 },
      Conduct: { flagged: 0, total: 0 },
      Social: { flagged: 0, total: 0 },
    };

    const schoolStats: Record<
      string,
      { name: string; total: number; screened: number; flagged: number }
    > = {};
    const gradeStats: Record<
      string,
      { total: number; screened: number; flagged: number }
    > = {};

    for (const student of students) {
      const latestAssessment = student.assessments[0]?.assessment;
      const status = latestAssessment?.status;

      // School stats
      if (student.school) {
        if (!schoolStats[student.school.id]) {
          schoolStats[student.school.id] = {
            name: student.school.name,
            total: 0,
            screened: 0,
            flagged: 0,
          };
        }
        schoolStats[student.school.id].total++;
      }

      // Grade stats
      const grade = student.gradeLevel || "Unknown";
      if (!gradeStats[grade]) {
        gradeStats[grade] = { total: 0, screened: 0, flagged: 0 };
      }
      gradeStats[grade].total++;

      if (!latestAssessment) {
        studentsNotStarted++;
        continue;
      }

      if (status === "IN_PROGRESS") {
        studentsInProgress++;
        continue;
      }

      if (status === "COMPLETED") {
        studentsCompleted++;
        studentsScreened++;

        if (student.school) {
          schoolStats[student.school.id].screened++;
        }
        gradeStats[grade].screened++;

        // Check for flagged domains
        let isFlagged = false;
        for (const indicator of latestAssessment.domainIndicators) {
          const domain = indicator.domainName;
          if (domainCounts[domain]) {
            domainCounts[domain].total++;
            if (indicator.flagged) {
              domainCounts[domain].flagged++;
              isFlagged = true;
            }
          }
        }

        if (isFlagged) {
          studentsFlagged++;
          if (student.school) {
            schoolStats[student.school.id].flagged++;
          }
          gradeStats[grade].flagged++;
        }
      }
    }

    // Get schools for filter dropdown
    const schools = await prisma.school.findMany({
      where: { districtId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    // Get unique grade levels
    const gradeLevels = [
      ...new Set(students.map((s) => s.gradeLevel).filter(Boolean)),
    ].sort();

    // Calculate percentages
    const flaggedPercentage =
      studentsScreened > 0
        ? Math.round((studentsFlagged / studentsScreened) * 100)
        : 0;

    const completionRate =
      totalStudents > 0
        ? Math.round((studentsCompleted / totalStudents) * 100)
        : 0;

    return NextResponse.json({
      summary: {
        totalStudents,
        studentsNotStarted,
        studentsInProgress,
        studentsCompleted,
        studentsScreened,
        studentsFlagged,
        flaggedPercentage,
        completionRate,
      },
      domainBreakdown: Object.entries(domainCounts).map(([domain, data]) => ({
        domain,
        flagged: data.flagged,
        total: data.total,
        percentage:
          data.total > 0 ? Math.round((data.flagged / data.total) * 100) : 0,
      })),
      schoolBreakdown: Object.entries(schoolStats).map(([id, data]) => ({
        id,
        name: data.name,
        total: data.total,
        screened: data.screened,
        flagged: data.flagged,
        flaggedPercentage:
          data.screened > 0
            ? Math.round((data.flagged / data.screened) * 100)
            : 0,
      })),
      gradeBreakdown: Object.entries(gradeStats)
        .map(([grade, data]) => ({
          grade,
          total: data.total,
          screened: data.screened,
          flagged: data.flagged,
          flaggedPercentage:
            data.screened > 0
              ? Math.round((data.flagged / data.screened) * 100)
              : 0,
        }))
        .sort((a, b) => a.grade.localeCompare(b.grade)),
      filters: {
        schools,
        gradeLevels,
      },
    });
  } catch (error) {
    console.error("District dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
