"use client";

import { useUserData } from "@/lib/hooks/use-supabase-user";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { useState, useEffect } from "react";
import {
  ClipboardList,
  FileStack,
  CheckCircle,
  Users,
} from "lucide-react";

const C = {
  surface: "#FFFFFF",
  ink900: "#1C1917",
  ink700: "#44403C",
  ink500: "#78716C",
  ink100: "#E7E5E4",
  indigo50: "#EEF0FF",
  indigo600: "#4F46E5",
  mint50: "#EBF7EF",
  mint700: "#2C7A4F",
  peach50: "#FFF4EC",
  peach500: "#F97C4E",
};

function StatCard({
  label,
  value,
  icon: Icon,
  toneBg,
  toneText,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  toneBg: string;
  toneText: string;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.ink100}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.ink500 }}>{label}</span>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: toneBg,
            color: toneText,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} strokeWidth={1.6} />
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: C.ink900,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, activeAssessments: 0, completions: 0, domainTemplates: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/assessment-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/domain-templates").then((r) => r.json()).catch(() => []),
    ]).then(([s, templates, domains]) => {
      setStats({
        totalUsers: s?.users?.total ?? 0,
        activeAssessments: Array.isArray(templates) ? templates.filter((t: any) => t.isActive).length : 0,
        completions: s?.assessments?.completed ?? 0,
        domainTemplates: Array.isArray(domains) ? domains.length : 0,
      });
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Platform
        </div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>
          Overview
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Platform health and key metrics at a glance.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} toneBg={C.indigo50} toneText={C.indigo600} />
        <StatCard label="Active assessments" value={stats.activeAssessments} icon={ClipboardList} toneBg={C.mint50} toneText={C.mint700} />
        <StatCard label="Completions" value={stats.completions} icon={CheckCircle} toneBg={C.mint50} toneText={C.mint700} />
        <StatCard label="Domain templates" value={stats.domainTemplates} icon={FileStack} toneBg={C.peach50} toneText={C.peach500} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.ink100}`, borderRadius: 16, padding: "24px 28px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink900, marginBottom: 20 }}>Platform analytics</div>
        <AdminAnalytics />
      </div>
    </div>
  );
}

function UserOverview() {
  const { userData } = useUserData();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          My dashboard
        </div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>
          Welcome back{userData?.name ? `, ${userData.name.split(" ")[0]}` : ""}
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Here are your assessments and activity.
        </p>
      </div>
      <DashboardShell />
    </div>
  );
}

export default function OverviewPage() {
  const { userData, isLoading } = useUserData();

  if (isLoading || !userData) return null;

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(userData.role);
  return isAdmin ? <AdminOverview /> : <UserOverview />;
}
