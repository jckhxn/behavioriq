"use client";

import { useState, useEffect } from "react";
import { ClipboardList, FileStack, CheckCircle, Clock, Plus, Upload, Layers } from "lucide-react";
import AssessmentTemplateManager from "@/components/admin/AssessmentTemplateManager";
import DomainTemplateManager from "@/components/admin/DomainTemplateManager";

const C = {
  surface: "#FFFFFF",
  sunk: "#F4EFE6",
  ink900: "#1C1917",
  ink700: "#44403C",
  ink500: "#78716C",
  ink200: "#D6D3D1",
  ink100: "#E7E5E4",
  indigo50: "#EEF0FF",
  indigo500: "#6366F1",
  indigo600: "#4F46E5",
  mint50: "#EBF7EF",
  mint700: "#2C7A4F",
  amber50: "#FDF5E2",
  amber700: "#A06E16",
  peach50: "#FFF4EC",
  peach500: "#F97C4E",
};

interface Stats {
  activeAssessments: number;
  domainTemplates: number;
  completions30d: number;
  pendingReview: number;
}

const STAT_CONFIGS = [
  { key: "activeAssessments", label: "Active assessments", icon: ClipboardList, tone: "mint", delta: "assessment templates" },
  { key: "domainTemplates", label: "Domain templates", icon: FileStack, tone: "indigo", delta: "available domains" },
  { key: "completions30d", label: "Completions (30d)", icon: CheckCircle, tone: "mint", delta: "last 30 days" },
  { key: "pendingReview", label: "Pending review", icon: Clock, tone: "amber", delta: "need attention" },
] as const;

const TONE_COLORS = {
  mint: { bg: C.mint50, text: C.mint700 },
  indigo: { bg: C.indigo50, text: C.indigo600 },
  amber: { bg: C.amber50, text: C.amber700 },
};

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  delta: string;
  icon: React.ComponentType<any>;
  tone: keyof typeof TONE_COLORS;
}) {
  const { bg, text } = TONE_COLORS[tone];
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
            background: bg,
            color: text,
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
      <div style={{ fontSize: 12, color: text, marginTop: 6, fontWeight: 500 }}>{delta}</div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [tab, setTab] = useState<"templates" | "domains">("templates");
  const [stats, setStats] = useState<Stats>({
    activeAssessments: 0,
    domainTemplates: 0,
    completions30d: 0,
    pendingReview: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/assessment-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/domain-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
    ]).then(([templates, domains, statsData]) => {
      const activeCount = Array.isArray(templates) ? templates.filter((t: any) => t.isActive).length : 0;
      const domainCount = Array.isArray(domains) ? domains.length : 0;
      const completions = statsData?.assessments?.completed ?? 0;
      setStats({
        activeAssessments: activeCount,
        domainTemplates: domainCount,
        completions30d: completions,
        pendingReview: 0,
      });
    });
  }, []);

  const pillFilter: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 36,
    padding: "0 16px",
    borderRadius: 8,
    background: C.surface,
    color: C.ink900,
    border: `1px solid ${C.ink200}`,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  };

  const primaryBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 36,
    padding: "0 16px",
    borderRadius: 8,
    background: C.indigo500,
    color: "#fff",
    border: "none",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(28,25,23,0.08)",
  };

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 680 }}>
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
            Assessment management
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
            Assessments &amp; domain libraries
          </h1>
          <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
            Build full assessments by combining domains, or upload complete JSON. All assessments
            are database-driven and fully customizable.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Active assessments"
          value={stats.activeAssessments}
          delta="assessment templates"
          icon={ClipboardList}
          tone="mint"
        />
        <StatCard
          label="Domain templates"
          value={stats.domainTemplates}
          delta="available domains"
          icon={FileStack}
          tone="indigo"
        />
        <StatCard
          label="Completions (30d)"
          value={stats.completions30d}
          delta="last 30 days"
          icon={CheckCircle}
          tone="mint"
        />
        <StatCard
          label="Pending review"
          value={stats.pendingReview}
          delta="need attention"
          icon={Clock}
          tone="amber"
        />
      </div>

      {/* Segmented tabs */}
      <div
        style={{
          display: "inline-flex",
          padding: 4,
          background: C.sunk,
          borderRadius: 10,
          border: `1px solid ${C.ink100}`,
          marginBottom: 20,
        }}
      >
        {(
          [
            { id: "templates", label: "Assessment templates", icon: ClipboardList },
            { id: "domains", label: "Domain library", icon: FileStack },
          ] as const
        ).map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                background: isActive ? C.surface : "transparent",
                color: isActive ? C.ink900 : C.ink500,
                boxShadow: isActive ? "0 1px 2px rgba(28,25,23,0.06)" : "none",
                transition: "background 120ms, color 120ms",
              }}
            >
              <Icon size={14} strokeWidth={1.6} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "templates" ? <AssessmentTemplateManager /> : <DomainTemplateManager />}
    </div>
  );
}
