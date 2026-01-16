import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const studentId = searchParams.get("student");
  const linkCode = searchParams.get("code");

  // Handle link code verification (teacher-created links)
  if (linkCode) {
    try {
      const assessment = await prisma.assessment.findUnique({
        where: { shortId: linkCode },
        include: {
          studentAssessment: {
            include: {
              student: {
                include: {
                  classrooms: {
                    include: {
                      classroom: {
                        include: {
                          school: {
                            select: { name: true },
                          },
                        },
                      },
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          assessmentTemplate: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!assessment) {
        return NextResponse.json(
          { error: "Invalid link. Please contact your teacher for a valid link." },
          { status: 404 }
        );
      }

      if (assessment.status === "COMPLETED" || assessment.status === "ABANDONED") {
        return NextResponse.json(
          { error: "This assessment has already been completed." },
          { status: 400 }
        );
      }

      const student = assessment.studentAssessment?.student;
      const classroom = student?.classrooms[0]?.classroom;

      return NextResponse.json({
        assessmentId: assessment.id,
        student: student ? {
          anonymousId: student.anonymousId,
          gradeLevel: student.gradeLevel,
          schoolName: classroom?.school?.name || "School",
          classroomName: classroom?.name || "Class",
        } : null,
        assessmentTemplates: assessment.assessmentTemplate ? [{
          id: assessment.assessmentTemplate.id,
          name: assessment.assessmentTemplate.name,
          description: assessment.assessmentTemplate.description || "Behavioral wellness assessment",
          estimatedTime: 15,
        }] : [],
      });
    } catch (error) {
      console.error("Error verifying link code:", error);
      return NextResponse.json(
        { error: "Unable to verify link" },
        { status: 500 }
      );
    }
  }

  // Handle student ID verification (legacy method)
  if (!studentId) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  try {
    // Verify the student exists and get basic info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
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
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found. This link may be invalid." },
        { status: 404 }
      );
    }

    const classroom = student.classrooms[0]?.classroom;

    // Get available assessment templates
    const assessmentTemplates = await prisma.assessmentTemplate.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: 5,
    });

    return NextResponse.json({
      student: {
        anonymousId: student.anonymousId,
        gradeLevel: student.gradeLevel,
        schoolName: classroom?.school?.name || "Unknown School",
        classroomName: classroom?.name || "Unknown Class",
      },
      assessmentTemplates: assessmentTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description || "Behavioral wellness assessment",
        estimatedTime: 15, // Default estimate
      })),
    });
  } catch (error) {
    console.error("Error verifying student:", error);
    return NextResponse.json(
      { error: "Unable to verify student" },
      { status: 500 }
    );
  }
}
