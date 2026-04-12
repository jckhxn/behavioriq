import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, templateId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Verify teacher has access to this student
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: {
        classrooms: {
          include: {
            classroom: {
              include: {
                students: {
                  where: { studentId },
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

    const hasAccess = teacher.classrooms.some((tc) =>
      tc.classroom.students.some((s) => s.studentId === studentId)
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this student" },
        { status: 403 }
      );
    }

    // Generate a unique link code
    const linkCode = nanoid(12);

    // Create an assessment for this student
    const assessment = await prisma.assessment.create({
      data: {
        subjectName: `Home Assessment`,
        status: "IN_PROGRESS",
        mode: "FULL",
        userId: user.id,
        assessmentTemplateId: templateId || undefined,
        shortId: linkCode,
      },
    });

    // Link the assessment to the student
    await prisma.studentAssessment.create({
      data: {
        studentId,
        assessmentId: assessment.id,
        isTrial: false,
      },
    });

    return NextResponse.json({
      linkCode,
      assessmentId: assessment.id,
    });
  } catch (error) {
    console.error("Error creating home assessment link:", error);
    return NextResponse.json(
      { error: "Failed to create assessment link" },
      { status: 500 }
    );
  }
}
