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

    // Get district admin data
    const districtAdmin = await prisma.districtUser.findUnique({
      where: { userId: user.id },
      include: {
        district: {
          include: {
            schools: {
              include: {
                classrooms: {
                  include: {
                    students: {
                      include: {
                        student: {
                          include: {
                            assessments: true,
                          },
                        },
                      },
                    },
                    teachers: {
                      include: {
                        teacher: true,
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

    if (!districtAdmin) {
      return NextResponse.json(
        { error: "District admin not found" },
        { status: 404 }
      );
    }

    const schools = districtAdmin.district.schools.map((school) => ({
      id: school.id,
      name: school.name,
      _count: {
        classrooms: school.classrooms.length,
      },
    }));

    // Calculate totals
    let totalTeachers = 0;
    let totalStudents = 0;
    let totalAssessments = 0;
    const uniqueTeacherIds = new Set<string>();

    districtAdmin.district.schools.forEach((school) => {
      school.classrooms.forEach((classroom) => {
        totalStudents += classroom.students.length;
        classroom.students.forEach((sc) => {
          totalAssessments += sc.student.assessments.length;
        });
        classroom.teachers.forEach((tc) => {
          uniqueTeacherIds.add(tc.teacher.id);
        });
      });
    });

    totalTeachers = uniqueTeacherIds.size;

    return NextResponse.json({
      totalSchools: schools.length,
      totalTeachers,
      totalStudents,
      totalAssessments,
      schools,
    });
  } catch (error) {
    console.error("District dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
