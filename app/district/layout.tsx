import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getDistrictUser } from "@/lib/district/access-control";
import { getFeatureFlags } from "@/lib/district/get-feature-flags";
import { FeatureFlags } from "@/lib/district/feature-flags";

export default async function DistrictLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  // Only district admins and higher can access /district routes
  const allowedRoles = ["DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(user.role)) {
    // Principals and below should use /teacher routes
    if (["PRINCIPAL", "COUNSELOR", "TEACHER"].includes(user.role)) {
      redirect("/teacher");
    }
    redirect("/dashboard");
  }

  // Check feature flag for district routes
  const flags = await getFeatureFlags(
    user.role,
    user.organizationId || undefined
  );

  if (!flags[FeatureFlags.DISTRICT_ROUTES]) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
