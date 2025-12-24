import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { prisma } from "@/lib/db/prisma";
import { AddStudentForm } from "@/components/district/AddStudentForm";
import {
  getFeatureFlags,
  checkFeature,
} from "@/lib/district/get-feature-flags";
import { FeatureFlags } from "@/lib/district/feature-flags";

export const metadata = {
  title: "Add Student - Teacher Dashboard",
  description: "Add a new student to your classroom",
};

export default async function AddStudentPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  // Check feature flag
  const canCreateStudents = await checkFeature(
    FeatureFlags.STUDENT_CREATION,
    user.role,
    user.organizationId || undefined
  );

  if (!canCreateStudents) {
    redirect("/teacher");
  }

  // Verify teacher owns this classroom
  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classroomId,
      teachers: {
        some: {
          teacher: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      school: {
        select: {
          name: true,
          districtId: true,
        },
      },
    },
  });

  if (!classroom) {
    redirect("/teacher");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Student</h1>
        <p className="text-muted-foreground">
          Add a student to {classroom.name} at {classroom.school.name}
        </p>
      </div>

      <AddStudentForm
        classroomId={classroom.id}
        districtId={classroom.school.districtId}
      />
    </div>
  );
}
