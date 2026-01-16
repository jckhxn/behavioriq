import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher has access to this student
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
    }

    // Get student with assessments, verifying teacher has access
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        classrooms: {
          some: {
            classroom: {
              teachers: {
                some: {
                  teacherId: teacher.id,
                },
              },
            },
          },
        },
      },
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
                startedAt: true,
                completedAt: true,
                mode: true,
                domainIndicators: {
                  select: {
                    id: true,
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
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      student: {
        id: student.id,
        anonymousId: student.anonymousId,
        firstName: student.firstName,
        lastName: student.lastName,
        gradeLevel: student.gradeLevel,
        school: student.classrooms[0]?.classroom.school.name,
        assessments: student.assessments.map((sa) => ({
          id: sa.assessment.id,
          status: sa.assessment.status,
          startedAt: sa.assessment.startedAt,
          completedAt: sa.assessment.completedAt,
          mode: sa.assessment.mode,
          createdAt: sa.createdAt,
          hasFlaggedDomains: sa.assessment.domainIndicators.some(
            (d) => d.flagged
          ),
          flaggedDomainCount: sa.assessment.domainIndicators.filter(
            (d) => d.flagged
          ).length,
        })),
      },
    });
  } catch (error) {
    console.error("Student detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
