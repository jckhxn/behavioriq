import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{
    studentId: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      },
    });

    if (!studentClassroom) {
      return NextResponse.json(
        { error: "You do not have access to this student" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, gradeLevel } = body;

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(firstName !== undefined && { firstName: firstName || null }),
        ...(lastName !== undefined && { lastName: lastName || null }),
        ...(gradeLevel && { gradeLevel }),
      },
      include: {
        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    });

    // Log audit event
    if (studentClassroom.classroom.school?.districtId) {
      await prisma.districtAuditLog.create({
        data: {
          districtId: studentClassroom.classroom.school.districtId,
          userId: user.id,
          action: "UPDATE_STUDENT",
          resourceType: "STUDENT",
          resourceId: studentId,
          details: {
            anonymousId: updatedStudent.anonymousId,
            updates: { firstName, lastName, gradeLevel },
          },
        },
      });
    }

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
