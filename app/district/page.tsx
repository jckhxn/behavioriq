import { redirect } from "next/navigation";
import { getDistrictUser } from "@/lib/district/access-control";
import { DistrictDashboard } from "@/components/district/DistrictDashboard";

export const metadata = {
  title: "District Dashboard | BehaviorIQ",
  description: "Population-level mental health insights for K-12 districts",
};

export default async function DistrictPage() {
  const user = await getDistrictUser();

  if (!user) {
    redirect("/login");
  }

  if (
    !["DISTRICT_ADMIN", "TEACHER", "ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DistrictDashboard user={user} />
    </div>
  );
}
