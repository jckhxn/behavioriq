import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, templateId, guardianName, relationship } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    if (!guardianName || !relationship) {
      return NextResponse.json(
        { error: "Guardian name and relationship are required" },
        { status: 400 }
      );
    }

    // Verify the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classrooms: {
          include: {
            classroom: {
              include: {
                teachers: {
                  include: {
                    teacher: true,
                  },
                  take: 1,
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
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Get the teacher's user ID for the assessment (if available)
    const teacherUserId =
      student.classrooms[0]?.classroom?.teachers[0]?.teacher?.userId;

    if (!teacherUserId) {
      return NextResponse.json(
        { error: "Unable to create assessment - no teacher assigned" },
        { status: 400 }
      );
    }

    // Create a home assessment for this student
    // Include guardian info in the subject name for tracking
    const assessment = await prisma.assessment.create({
      data: {
        subjectName: `Student ${student.anonymousId} (Home: ${guardianName})`,
        status: "IN_PROGRESS",
        mode: "FULL", // Home assessments are full assessments
        userId: teacherUserId,
        assessmentTemplateId: templateId || undefined,
      },
    });

    // Link the assessment to the student
    await prisma.studentAssessment.create({
      data: {
        studentId: student.id,
        assessmentId: assessment.id,
        isTrial: false,
      },
    });

    // Log the home assessment start
    console.log(
      `Home assessment started for student ${student.anonymousId} by ${guardianName} (${relationship})`
    );

    return NextResponse.json({
      assessmentId: assessment.id,
      message: "Assessment started successfully",
    });
  } catch (error) {
    console.error("Error starting home assessment:", error);
    return NextResponse.json(
      { error: "Failed to start assessment" },
      { status: 500 }
    );
  }
}
