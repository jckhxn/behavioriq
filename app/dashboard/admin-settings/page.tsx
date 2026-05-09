"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SuperAdminPlatformSettings } from "@/components/admin/SuperAdminPlatformSettings";

const C = { surface: "#FFFFFF", sunk: "#F4EFE6", ink900: "#1C1917", ink700: "#44403C", ink500: "#78716C", ink100: "#E7E5E4" };
const TABS = [{ id: "system", label: "System settings" }, { id: "platform", label: "Platform settings" }] as const;

export default function AdminSettingsPage() {
  const { userData, isLoading } = useUserData();
  const router = useRouter();
  const [tab, setTab] = useState<"system" | "platform">("system");

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
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>Global platform configuration and admin preferences.</p>
      </div>
      <div style={{ display: "inline-flex", padding: 4, background: C.sunk, borderRadius: 10, border: `1px solid ${C.ink100}`, marginBottom: 24 }}>
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: isActive ? C.surface : "transparent", color: isActive ? C.ink900 : C.ink500, boxShadow: isActive ? "0 1px 2px rgba(28,25,23,0.06)" : "none", transition: "background 120ms, color 120ms" }}>
              {t.label}
            </button>
          );
        })}
      </div>
      {tab === "system" ? <SystemSettings /> : <SuperAdminPlatformSettings />}
    </div>
  );
}
