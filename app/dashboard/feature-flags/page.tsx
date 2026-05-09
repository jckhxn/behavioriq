"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { FeatureFlagsManager } from "@/components/admin/FeatureFlagsManager";

const C = { ink900: "#1C1917", ink700: "#44403C", ink500: "#78716C" };

export default function FeatureFlagsPage() {
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
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>System</div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>Feature flags</h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>Enable or disable platform features without a deployment.</p>
      </div>
      <FeatureFlagsManager />
    </div>
  );
}
