import { getDistrictUser } from "@/lib/district/access-control";
import { prisma } from "@/lib/db/prisma";
import { TeacherDashboardView } from "@/components/district/TeacherDashboardView";
import { getFeatureFlags } from "@/lib/district/get-feature-flags";

export const metadata = {
  title: "Teacher Dashboard - Classroom Management",
  description: "Manage your students and view classroom insights",
};

export default async function TeacherDashboardPage() {
  const user = await getDistrictUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  // Get teacher's classrooms and students
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: {
      classrooms: {
        include: {
          classroom: {
            include: {
              students: {
                include: {
                  student: {
                    include: {
                      assessments: {
                        include: {
                          assessment: {
                            select: {
                              id: true,
                              status: true,
                              subjectName: true,
                            },
                          },
                        },
                        orderBy: {
                          createdAt: "desc",
                        },
                        take: 1,
                      },
                    },
                  },
                },
              },
              school: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Get feature flags
  const flags = await getFeatureFlags(
    user.role,
    user.organizationId || undefined
  );

  return (
    <TeacherDashboardView teacher={teacher} user={user} featureFlags={flags} />
  );
}
