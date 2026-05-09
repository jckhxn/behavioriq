"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { ClipboardList, FileStack, CheckCircle, Clock } from "lucide-react";
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

function StatCard({ label, value, icon: Icon, toneBg, toneText }: { label: string; value: number; icon: React.ComponentType<any>; toneBg: string; toneText: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.ink100}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.ink500 }}>{label}</span>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: toneBg, color: toneText, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} strokeWidth={1.6} />
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function AssessmentsPage() {
  const { userData, isLoading } = useUserData();
  const router = useRouter();
  const [tab, setTab] = useState<"templates" | "domains">("templates");
  const [stats, setStats] = useState({ activeAssessments: 0, domainTemplates: 0, completions: 0 });

  useEffect(() => {
    if (!isLoading && userData && !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) {
      router.replace("/dashboard/overview");
    }
  }, [userData, isLoading, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/assessment-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/domain-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
    ]).then(([templates, domains, s]) => {
      setStats({
        activeAssessments: Array.isArray(templates) ? templates.filter((t: any) => t.isActive).length : 0,
        domainTemplates: Array.isArray(domains) ? domains.length : 0,
        completions: s?.assessments?.completed ?? 0,
      });
    });
  }, []);

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) return null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Content</div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>
          Assessments &amp; domain libraries
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Build full assessments by combining domains, or upload complete JSON.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Active assessments" value={stats.activeAssessments} icon={ClipboardList} toneBg={C.mint50} toneText={C.mint700} />
        <StatCard label="Domain templates" value={stats.domainTemplates} icon={FileStack} toneBg={C.indigo50} toneText={C.indigo600} />
        <StatCard label="Total completions" value={stats.completions} icon={CheckCircle} toneBg={C.mint50} toneText={C.mint700} />
      </div>

      <div style={{ display: "inline-flex", padding: 4, background: C.sunk, borderRadius: 10, border: `1px solid ${C.ink100}`, marginBottom: 20 }}>
        {([
          { id: "templates", label: "Assessment templates", icon: ClipboardList },
          { id: "domains", label: "Domain library", icon: FileStack },
        ] as const).map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, background: isActive ? C.surface : "transparent", color: isActive ? C.ink900 : C.ink500, boxShadow: isActive ? "0 1px 2px rgba(28,25,23,0.06)" : "none", transition: "background 120ms, color 120ms" }}>
              <Icon size={14} strokeWidth={1.6} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "templates" ? <AssessmentTemplateManager /> : <DomainTemplateManager />}
    </div>
  );
}
