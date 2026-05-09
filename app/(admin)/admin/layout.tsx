"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { C } from "@/lib/dashboard/colors";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userData, isLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role))) {
      router.replace("/dashboard");
    }
  }, [userData, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: C.canvas }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.indigo500, opacity: 0.6 }} />
      </div>
    );
  }

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) return null;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.canvas, fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)", color: C.ink900, overflow: "hidden" }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <AdminTopBar />
        <main style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
