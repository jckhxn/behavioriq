import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{
    studentId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { studentId } = await params;
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile to verify teacher role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Verify teacher has access to this student
    const studentClassroom = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroom: {
          teachers: {
            some: {
              teacherId: teacher.id,
            },
          },
        },
      },
      include: {
        classroom: {
          include: {
            school: true,
          },
        },
        student: true,
      },
    });

    if (!studentClassroom) {
      return NextResponse.json(
        { error: "You do not have access to this student" },
        { status: 403 }
      );
    }

    // Check if student has any assessments
    const assessmentCount = await prisma.assessment.count({
      where: { studentId },
    });

    if (assessmentCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete student with existing assessments. Please archive instead.",
        },
        { status: 400 }
      );
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id: studentId },
    });

    // Log audit event
    if (studentClassroom.classroom.school?.districtId) {
      await prisma.districtAuditLog.create({
        data: {
          districtId: studentClassroom.classroom.school.districtId,
          userId: user.id,
          action: "DELETE_STUDENT",
          resourceType: "STUDENT",
          resourceId: studentId,
          details: {
            anonymousId: studentClassroom.student.anonymousId,
            assessmentCount: 0,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
