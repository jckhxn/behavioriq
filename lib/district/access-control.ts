/**
 * District Access Control Middleware
 * Enforces role-based permissions for district routes
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

// District roles that are allowed to access district features
export type DistrictRole = Extract<
  Role,
  | "DISTRICT_ADMIN"
  | "TEACHER"
  | "COUNSELOR"
  | "PRINCIPAL"
  | "ADMIN"
  | "SUPER_ADMIN"
>;

export interface DistrictUser {
  id: string;
  email: string;
  name: string | null;
  role: DistrictRole;
  districtId?: string;
  teacherId?: string;
  schoolId?: string;
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
      ![
        "DISTRICT_ADMIN",
        "TEACHER",
        "COUNSELOR",
        "PRINCIPAL",
        "ADMIN",
        "SUPER_ADMIN",
      ].includes(user.role)
    ) {
      return null;
    }

    // Get school ID for principals
    let schoolId: string | undefined;
    if (user.role === "PRINCIPAL" && user.teacherProfile?.schoolId) {
      schoolId = user.teacherProfile.schoolId;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      districtId: user.teacherProfile?.districtId,
      teacherId: user.teacherProfile?.id,
      schoolId,
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
 * Require teacher or higher (includes COUNSELOR and PRINCIPAL)
 */
export async function requireTeacher(): Promise<DistrictUser> {
  const user = await getDistrictUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (
    ![
      "TEACHER",
      "COUNSELOR",
      "PRINCIPAL",
      "DISTRICT_ADMIN",
      "ADMIN",
      "SUPER_ADMIN",
    ].includes(user.role)
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

  // Principals can access all students in their school
  if (user.role === "PRINCIPAL" && user.teacherProfile?.schoolId) {
    const studentInSchool = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.teacherProfile.schoolId,
      },
    });
    return !!studentInSchool;
  }

  // Counselors can access students in their caseload
  if (user.role === "COUNSELOR") {
    const counselor = await prisma.counselor.findFirst({
      where: { userId: user.id },
      include: {
        caseload: {
          where: { studentId },
        },
      },
    });
    return (counselor?.caseload?.length ?? 0) > 0;
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
 * Route context for dynamic routes
 */
interface RouteContext {
  params: Promise<Record<string, string>>;
}

/**
 * Middleware wrapper for API routes
 * Supports both static routes (no params) and dynamic routes (with params)
 */
export function withDistrictAuth(
  handler: (
    req: NextRequest,
    user: DistrictUser,
    context?: RouteContext
  ) => Promise<Response>,
  requiredRole?: "DISTRICT_ADMIN" | "PRINCIPAL" | "COUNSELOR" | "TEACHER"
) {
  return async (req: NextRequest, context?: RouteContext) => {
    try {
      const user = await getDistrictUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Role hierarchy: SUPER_ADMIN > ADMIN > DISTRICT_ADMIN > PRINCIPAL > COUNSELOR > TEACHER
      const roleHierarchy: Record<string, number> = {
        SUPER_ADMIN: 100,
        ADMIN: 90,
        DISTRICT_ADMIN: 80,
        PRINCIPAL: 70,
        COUNSELOR: 60,
        TEACHER: 50,
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = requiredRole ? roleHierarchy[requiredRole] || 0 : 0;

      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `Forbidden: ${requiredRole} access required` },
          { status: 403 }
        );
      }

      return handler(req, user, context);
    } catch (error: any) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: error.message || "Authentication failed" },
        { status: error.message === "Unauthorized" ? 401 : 500 }
      );
    }
  };
}
