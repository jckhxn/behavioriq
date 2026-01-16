import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { StudentProfilePage } from "@/components/district/StudentProfilePage";

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
    ![
      "DISTRICT_ADMIN",
      "PRINCIPAL",
      "COUNSELOR",
      "TEACHER",
      "ADMIN",
      "SUPER_ADMIN",
    ].includes(user.role)
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Determine back URL based on role
  const backUrl =
    user.role === "TEACHER"
      ? "/teacher"
      : user.role === "COUNSELOR"
        ? "/counselor"
        : user.role === "PRINCIPAL"
          ? "/principal"
          : "/district";

  return (
    <div className="container mx-auto py-8 px-4">
      <StudentProfilePage studentId={id} user={user} backUrl={backUrl} />
    </div>
  );
}
