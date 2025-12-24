import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { prisma } from "@/lib/db/prisma";
import { AssignAssessmentForm } from "@/components/district/AssignAssessmentForm";
import { checkFeature } from "@/lib/district/get-feature-flags";
import { FeatureFlags } from "@/lib/district/feature-flags";

export const metadata = {
  title: "Assign Assessment - Teacher Dashboard",
  description: "Assign a behavioral wellness check to a student",
};

export default async function AssignAssessmentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  // Check feature flag
  const canAssignAssessments = await checkFeature(
    FeatureFlags.ASSESSMENT_ASSIGNMENT,
    user.role,
    user.organizationId || undefined
  );

  if (!canAssignAssessments) {
    redirect("/teacher");
  }

  // Verify teacher has access to this student
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      classrooms: {
        some: {
          classroom: {
            teachers: {
              some: {
                teacher: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    },
    include: {
      classrooms: {
        include: {
          classroom: {
            include: {
              school: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!student) {
    redirect("/teacher");
  }

  // Get available assessments
  const assessments = await prisma.assessment.findMany({
    where: {
      status: "COMPLETED",
    },
    select: {
      id: true,
      subjectName: true,
      mode: true,
    },
    orderBy: {
      startedAt: "desc",
    },
    take: 10,
  });

  const classroom = student.classrooms[0]?.classroom;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assign Assessment</h1>
        <p className="text-muted-foreground">
          Assign a behavioral wellness check to Student {student.anonymousId}
        </p>
        {classroom && (
          <p className="text-sm text-muted-foreground">
            {classroom.name} • {classroom.school.name}
          </p>
        )}
      </div>

      <AssignAssessmentForm student={student} assessments={assessments} />
    </div>
  );
}
