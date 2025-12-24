import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { getFeatureFlags } from "@/lib/district/get-feature-flags";
import { FeatureFlags } from "@/lib/district/feature-flags";
import { TeacherNavbar } from "@/components/district/TeacherNavbar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has teacher role
  const allowedRoles = ["TEACHER", "DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  // Check feature flag for teacher dashboard
  const flags = await getFeatureFlags(
    user.role,
    user.organizationId || undefined
  );

  if (
    !flags[FeatureFlags.TEACHER_DASHBOARD] &&
    !flags[FeatureFlags.DISTRICT_ROUTES]
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <TeacherNavbar user={user} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
