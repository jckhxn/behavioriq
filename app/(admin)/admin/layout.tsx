"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

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
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF8F3",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#6366F1",
            opacity: 0.6,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    );
  }

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#FBF8F3",
        fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)",
        color: "#1C1917",
        overflow: "hidden",
      }}
    >
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
