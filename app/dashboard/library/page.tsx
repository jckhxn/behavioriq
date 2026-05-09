"use client";

import UserResourceLibrary from "@/components/resources/UserResourceLibrary";
import ResourceLibraryManager from "@/components/admin/ResourceLibraryManager";
import { useUserData } from "@/lib/hooks/use-supabase-user";

const C = { ink900: "#1C1917", ink700: "#44403C", ink500: "#78716C" };

export default function LibraryPage() {
  const { userData } = useUserData();
  const isAdmin = userData && ["SUPER_ADMIN", "ADMIN"].includes(userData.role);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          {isAdmin ? "Content" : "My dashboard"}
        </div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>
          {isAdmin ? "Resource library" : "Library"}
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          {isAdmin ? "Manage supplementary resources attached to assessments and domains." : "Resources available for your assessments."}
        </p>
      </div>
      {isAdmin ? <ResourceLibraryManager /> : <UserResourceLibrary />}
    </div>
  );
}
