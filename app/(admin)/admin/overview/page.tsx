"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Activity,
  FileStack,
  BarChart3,
  Mail,
} from "lucide-react";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { C } from "@/lib/dashboard/colors";


function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  toneBg,
  toneText,
}: {
  label: string;
  value: string | number;
  delta: string;
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
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
      <div style={{ fontSize: 12, color: toneText, marginTop: 6, fontWeight: 500 }}>{delta}</div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAssessments: 0,
    completions30d: 0,
    domainTemplates: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/assessment-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/domain-templates").then((r) => r.json()).catch(() => []),
    ]).then(([statsData, templates, domains]) => {
      setStats({
        totalUsers: statsData?.users?.total ?? 0,
        activeAssessments: Array.isArray(templates) ? templates.filter((t: any) => t.isActive).length : 0,
        completions30d: statsData?.assessments?.completed ?? 0,
        domainTemplates: Array.isArray(domains) ? domains.length : 0,
      });
    });
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.ink500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Platform
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: C.ink900,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Platform health and key metrics at a glance.
        </p>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Total users"
          value={stats.totalUsers}
          delta="registered accounts"
          icon={Users}
          toneBg={C.indigo50}
          toneText={C.indigo600}
        />
        <StatCard
          label="Active assessments"
          value={stats.activeAssessments}
          delta="published templates"
          icon={ClipboardList}
          toneBg={C.mint50}
          toneText={C.mint700}
        />
        <StatCard
          label="Completions (30d)"
          value={stats.completions30d}
          delta="last 30 days"
          icon={CheckCircle}
          toneBg={C.mint50}
          toneText={C.mint700}
        />
        <StatCard
          label="Domain templates"
          value={stats.domainTemplates}
          delta="available domains"
          icon={FileStack}
          toneBg={C.peach50}
          toneText={C.peach500}
        />
      </div>

      {/* Analytics section */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.ink100}`,
          borderRadius: 16,
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: C.ink900,
            marginBottom: 20,
          }}
        >
          Platform analytics
        </div>
        <AdminAnalytics />
      </div>
    </div>
  );
}
