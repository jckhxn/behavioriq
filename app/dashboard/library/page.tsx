"use client";

import UserResourceLibrary from "@/components/resources/UserResourceLibrary";
import ResourceLibraryManager from "@/components/admin/ResourceLibraryManager";
import { useUserData } from "@/lib/hooks/use-supabase-user";


export default function LibraryPage() {
  const { userData } = useUserData();
  const isAdmin = userData && ["SUPER_ADMIN", "ADMIN"].includes(userData.role);

  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">
          {isAdmin ? "Content" : "My dashboard"}
        </div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          {isAdmin ? "Resource library" : "Library"}
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          {isAdmin ? "Manage supplementary resources attached to assessments and domains." : "Resources available for your assessments."}
        </p>
      </div>
      {isAdmin ? <ResourceLibraryManager /> : <UserResourceLibrary />}
    </div>
  );
}
