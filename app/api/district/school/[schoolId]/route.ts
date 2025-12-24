import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify district admin role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== "DISTRICT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get district admin to verify access
    const districtAdmin = await prisma.districtUser.findUnique({
      where: { userId: user.id },
    });

    if (!districtAdmin) {
      return NextResponse.json(
        { error: "Not a district admin" },
        { status: 403 }
      );
    }

    // Get school data with aggregates
    const school = await prisma.school.findFirst({
      where: {
        id: schoolId,
        districtId: districtAdmin.districtId,
      },
      include: {
        classrooms: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    assessments: {
                      include: {
                        assessment: {
                          include: {
                            domainIndicators: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            teachers: true,
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Calculate aggregates
    let totalStudents = 0;
    let totalTeachers = 0;
    let totalAssessments = 0;
    let studentsWithFlaggedDomains = 0;
    const gradeLevelBreakdown: Record<string, number> = {};
    const domainCounts: Record<string, { total: number; flagged: number }> = {};

    const uniqueTeacherIds = new Set<string>();

    school.classrooms.forEach((classroom) => {
      classroom.teachers.forEach((tc) => {
        uniqueTeacherIds.add(tc.teacherId);
      });

      classroom.students.forEach((sc) => {
        totalStudents++;

        const gradeLevel = sc.student.gradeLevel || "Unknown";
        gradeLevelBreakdown[gradeLevel] =
          (gradeLevelBreakdown[gradeLevel] || 0) + 1;

        let studentHasFlaggedDomain = false;

        sc.student.assessments.forEach((sa) => {
          totalAssessments++;

          sa.assessment.domainIndicators.forEach((domain) => {
            if (!domainCounts[domain.domainName]) {
              domainCounts[domain.domainName] = { total: 0, flagged: 0 };
            }
            domainCounts[domain.domainName].total++;
            if (domain.flagged) {
              domainCounts[domain.domainName].flagged++;
              studentHasFlaggedDomain = true;
            }
          });
        });

        if (studentHasFlaggedDomain) {
          studentsWithFlaggedDomains++;
        }
      });
    });

    totalTeachers = uniqueTeacherIds.size;

    return NextResponse.json({
      school: {
        id: school.id,
        name: school.name,
        address: school.address,
      },
      metrics: {
        totalStudents,
        totalTeachers,
        totalAssessments,
        studentsWithFlaggedDomains,
        percentWithFlags:
          totalStudents > 0
            ? Math.round((studentsWithFlaggedDomains / totalStudents) * 100)
            : 0,
      },
      gradeLevelBreakdown,
      domainCounts,
    });
  } catch (error) {
    console.error("School detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school details" },
      { status: 500 }
    );
  }
}
