import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { StudentDetailsView } from "@/components/district/StudentDetailsView";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (
    !["DISTRICT_ADMIN", "TEACHER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <div className="container mx-auto py-8 px-4">
      <StudentDetailsView studentId={id} user={user} />
    </div>
  );
}
