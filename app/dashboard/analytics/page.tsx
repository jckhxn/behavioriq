"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { C } from "@/lib/dashboard/colors";


export default function AnalyticsPage() {
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
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Platform</div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>Usage trends, completion rates, and domain-level insights.</p>
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.ink100}`, borderRadius: 16, padding: "24px 28px" }}>
        <AdminAnalytics />
      </div>
    </div>
  );
}
