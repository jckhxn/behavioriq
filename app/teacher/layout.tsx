import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { getFeatureFlags } from "@/lib/district/get-feature-flags";
import { FeatureFlags } from "@/lib/district/feature-flags";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has teacher/staff role (includes COUNSELOR and PRINCIPAL)
  const allowedRoles = [
    "TEACHER",
    "COUNSELOR",
    "PRINCIPAL",
    "DISTRICT_ADMIN",
    "ADMIN",
    "SUPER_ADMIN",
  ];
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

  // Just render children - TeacherDashboardView handles its own layout with DashboardLayout
  return <>{children}</>;
}
