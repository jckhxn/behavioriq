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
      <div className="flex h-screen items-center justify-center bg-dash-canvas">
        <div className="w-2 h-2 rounded-full bg-dash-indigo-500 opacity-60" />
      </div>
    );
  }

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) return null;

  return (
    <div
      className="flex h-screen bg-dash-canvas overflow-hidden text-dash-ink-900"
      style={{ fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)" }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-auto px-10 py-8">
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
