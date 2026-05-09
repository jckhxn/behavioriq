"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { LeadsManagementTab } from "@/components/admin/LeadsManagementTab";


export default function LeadsPage() {
  const { userData, isLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && userData && !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) {
      router.replace("/dashboard/overview");
    }
  }, [userData, isLoading, router]);

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) return null;

  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">People</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Leads
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Track and manage inbound leads and trial users.
        </p>
      </div>
      <LeadsManagementTab />
    </div>
  );
}
