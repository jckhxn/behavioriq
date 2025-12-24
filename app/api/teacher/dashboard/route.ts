import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher data with classrooms
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: {
        classrooms: {
          include: {
            classroom: {
              include: {
                school: {
                  select: {
                    name: true,
                  },
                },
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
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Calculate metrics across all classrooms
    const allStudents = teacher.classrooms.flatMap((tc: any) =>
      tc.classroom.students.map((sc: any) => ({
        ...sc.student,
        assessments: sc.student.assessments.map((sa: any) => sa.assessment),
      }))
    );

    const totalStudents = allStudents.length;

    const studentsWithCompletedAssessments = allStudents.filter(
      (student: any) =>
        student.assessments.some((a: any) => a.status === "COMPLETED")
    ).length;

    // Get students with flagged domain indicators
    const studentsWithFlaggedDomains = allStudents.filter((student: any) =>
      student.assessments.some(
        (a: any) =>
          a.status === "COMPLETED" &&
          a.domainIndicators.some((di: any) => di.status === "FLAGGED")
      )
    ).length;

    // Count in-progress assessments
    const assessmentsInProgress = allStudents.reduce(
      (sum: number, student: any) =>
        sum +
        student.assessments.filter((a: any) => a.status === "IN_PROGRESS")
          .length,
      0
    );

    // Count recently completed assessments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyCompleted = allStudents.reduce(
      (sum: number, student: any) =>
        sum +
        student.assessments.filter(
          (a: any) =>
            a.status === "COMPLETED" &&
            a.completedAt &&
            a.completedAt >= thirtyDaysAgo
        ).length,
      0
    );

    // Transform classroom data with enhanced metrics
    const classrooms = teacher.classrooms.map((tc: any) => {
      const classroomStudents = tc.classroom.students.map((sc: any) => ({
        ...sc.student,
        assessments: sc.student.assessments.map((sa: any) => sa.assessment),
      }));

      const studentsScreened = classroomStudents.filter((student: any) =>
        student.assessments.some((a: any) => a.status === "COMPLETED")
      ).length;

      const flaggedCount = classroomStudents.filter((student: any) =>
        student.assessments.some(
          (a: any) =>
            a.status === "COMPLETED" &&
            a.domainIndicators.some((di: any) => di.status === "FLAGGED")
        )
      ).length;

      return {
        id: tc.classroom.id,
        name: tc.classroom.name,
        schoolId: tc.classroom.schoolId,
        school: {
          name: tc.classroom.school.name,
        },
        _count: {
          students: classroomStudents.length,
        },
        studentsScreened,
        flaggedCount,
        completionPercentage:
          classroomStudents.length > 0
            ? Math.round((studentsScreened / classroomStudents.length) * 100)
            : 0,
      };
    });

    const totalAssessments = allStudents.reduce(
      (sum: number, student: any) => sum + student.assessments.length,
      0
    );

    return NextResponse.json({
      classrooms,
      totalStudents,
      totalAssessments,
      studentsScreened: studentsWithCompletedAssessments,
      studentsNeedingFollowUp: studentsWithFlaggedDomains,
      assessmentsInProgress,
      recentlyCompleted,
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
