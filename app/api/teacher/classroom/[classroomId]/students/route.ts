import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const { classroomId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher has access to this classroom
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: {
        classrooms: {
          where: {
            classroomId,
          },
        },
      },
    });

    if (!teacher || teacher.classrooms.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get students in this classroom with enhanced assessment data
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          include: {
            student: {
              include: {
                assessments: {
                  orderBy: {
                    createdAt: "desc",
                  },
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
    });

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    // Transform student data with screening snapshot
    const students = classroom.students.map((sc: any) => {
      const student = sc.student;
      const latestStudentAssessment = student.assessments[0];
      const latestAssessment = latestStudentAssessment?.assessment;

      let assessmentStatus = "NOT_STARTED";
      let screeningSnapshot = "NEUTRAL";
      let lastActivityDate = null;
      let flaggedDomainsCount = 0;

      if (latestAssessment) {
        assessmentStatus = latestAssessment.status;
        lastActivityDate =
          latestAssessment.completedAt || latestAssessment.startedAt;

        // Calculate screening snapshot based on flagged domains
        if (latestAssessment.status === "COMPLETED") {
          flaggedDomainsCount = latestAssessment.domainIndicators.filter(
            (di: any) => di.status === "FLAGGED"
          ).length;

          if (flaggedDomainsCount === 0) {
            screeningSnapshot = "NEUTRAL";
          } else if (flaggedDomainsCount <= 2) {
            screeningSnapshot = "MONITOR";
          } else {
            screeningSnapshot = "ELEVATED";
          }
        }
      }

      return {
        id: student.id,
        anonymousId: student.anonymousId,
        firstName: student.firstName,
        lastName: student.lastName,
        gradeLevel: student.gradeLevel,
        dateOfBirth: student.dateOfBirth,
        _count: {
          assessments: student.assessments.length,
        },
        assessmentStatus,
        screeningSnapshot,
        lastActivityDate,
        flaggedDomainsCount,
        latestAssessmentMode: latestAssessment?.mode || null,
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Classroom students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
