import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
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
      include: {
        classrooms: {
          include: {
            classroom: {
              include: {
                school: true,
              },
            },
          },
        },
      },
    });

    if (!teacher || !teacher.districtId) {
      return NextResponse.json(
        {
          error: "Teacher profile not found or not associated with a district",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { classroomId, firstName, lastName, gradeLevel } = body;

    // Validate required fields
    if (!classroomId || !gradeLevel) {
      return NextResponse.json(
        { error: "Classroom ID and grade level are required" },
        { status: 400 }
      );
    }

    // Verify teacher has access to this classroom and get school info
    const teacherClassroom = await prisma.teacherClassroom.findFirst({
      where: {
        teacherId: teacher.id,
        classroomId: classroomId,
      },
      include: {
        classroom: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!teacherClassroom) {
      return NextResponse.json(
        { error: "You do not have access to this classroom" },
        { status: 403 }
      );
    }

    // Generate anonymous student ID
    const anonymousId = `STU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create student
    const student = await prisma.student.create({
      data: {
        districtId: teacher.districtId,
        schoolId: teacherClassroom.classroom.schoolId,
        anonymousId,
        firstName: firstName || null,
        lastName: lastName || null,
        gradeLevel,
        classrooms: {
          create: {
            classroomId,
          },
        },
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
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { school: true },
    });

    if (classroom?.school?.districtId) {
      await prisma.districtAuditLog.create({
        data: {
          districtId: classroom.school.districtId,
          userId: user.id,
          action: "CREATE_STUDENT",
          resourceId: student.id,
          metadata: {
            anonymousId: student.anonymousId,
            classroomId,
            gradeLevel,
          },
        },
      });
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
