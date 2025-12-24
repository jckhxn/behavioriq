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

    // Verify teacher access
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
    }

    // Get observations
    const observations = await prisma.teacherObservation.findMany({
      where: {
        studentId,
        student: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ observations });
  } catch (error) {
    console.error("Observations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch observations" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify teacher access
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
    }

    const body = await request.json();
    const { content, structured } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Verify student access
    const hasAccess = await prisma.student.findFirst({
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
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Student not found or access denied" },
        { status: 404 }
      );
    }

    // Create observation
    const observation = await prisma.teacherObservation.create({
      data: {
        teacherId: teacher.id,
        studentId,
        content,
        structured: structured || undefined,
      },
    });

    // Log in audit trail
    await prisma.districtAuditLog.create({
      data: {
        userId: user.id,
        studentId,
        action: "CREATE_OBSERVATION",
        resourceId: observation.id,
        metadata: {
          observationId: observation.id,
        },
      },
    });

    return NextResponse.json({ observation });
  } catch (error) {
    console.error("Create observation error:", error);
    return NextResponse.json(
      { error: "Failed to create observation" },
      { status: 500 }
    );
  }
}
