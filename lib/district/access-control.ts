/**
 * District Access Control Middleware
 * Enforces role-based permissions for district routes
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export interface DistrictUser {
  id: string;
  email: string;
  name: string | null;
  role: "DISTRICT_ADMIN" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
  districtId?: string;
  teacherId?: string;
  organizationId?: string;
}

/**
 * Get current user with district context
 */
export async function getDistrictUser(): Promise<DistrictUser | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser?.email) return null;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        teacherProfile: {
          include: {
            district: true,
          },
        },
      },
    });

    if (!user) return null;

    // Only allow district-related roles
    if (
      !["DISTRICT_ADMIN", "TEACHER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
    ) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      districtId: user.teacherProfile?.districtId,
      teacherId: user.teacherProfile?.id,
      organizationId: user.organizationId || undefined,
    };
  } catch (error: any) {
    console.error("[getDistrictUser] Error:", error.message);
    return null;
  }
}

/**
 * Require district admin or higher
 */
export async function requireDistrictAdmin(): Promise<DistrictUser> {
  const user = await getDistrictUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!["DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new Error("Forbidden: District Admin access required");
  }

  return user;
}

/**
 * Require teacher or higher
 */
export async function requireTeacher(): Promise<DistrictUser> {
  const user = await getDistrictUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (
    !["TEACHER", "DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    throw new Error("Forbidden: Teacher access required");
  }

  return user;
}

/**
 * Check if user can access student
 */
export async function canAccessStudent(
  userId: string,
  studentId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teacherProfile: {
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
      },
    },
  });

  if (!user) return false;

  // Admins can access all students
  if (["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)) {
    return true;
  }

  // Teachers can only access students in their classrooms
  if (user.role === "TEACHER" && user.teacherProfile) {
    return user.teacherProfile.classrooms.some((tc) =>
      tc.classroom.students.some((sc) => sc.studentId === studentId)
    );
  }

  return false;
}

/**
 * Middleware wrapper for API routes
 */
export function withDistrictAuth(
  handler: (req: NextRequest, user: DistrictUser) => Promise<Response>,
  requiredRole?: "DISTRICT_ADMIN" | "TEACHER"
) {
  return async (req: NextRequest) => {
    try {
      const user = await getDistrictUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (requiredRole === "DISTRICT_ADMIN") {
        if (!["DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          return NextResponse.json(
            { error: "Forbidden: District Admin required" },
            { status: 403 }
          );
        }
      } else if (requiredRole === "TEACHER") {
        if (
          !["TEACHER", "DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(
            user.role
          )
        ) {
          return NextResponse.json(
            { error: "Forbidden: Teacher access required" },
            { status: 403 }
          );
        }
      }

      return handler(req, user);
    } catch (error: any) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: error.message || "Authentication failed" },
        { status: error.message === "Unauthorized" ? 401 : 500 }
      );
    }
  };
}
