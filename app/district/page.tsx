import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { DistrictAdminDashboard } from "@/components/district/DistrictAdminDashboard";

export const metadata = {
  title: "District Dashboard | BehaviorIQ",
  description: "Population-level mental health insights for K-12 districts",
};

export default async function DistrictPage() {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  if (!["DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    // Redirect non-district-admin roles to their proper dashboards
    if (user.role === "TEACHER") redirect("/teacher");
    if (user.role === "COUNSELOR") redirect("/counselor");
    if (user.role === "PRINCIPAL") redirect("/principal");
    redirect("/dashboard");
  }

  return <DistrictAdminDashboard user={user} />;
}
