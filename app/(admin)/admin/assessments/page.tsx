"use client";

import { useState, useEffect } from "react";
import { ClipboardList, FileStack, CheckCircle, Clock, FlaskConical } from "lucide-react";
import AssessmentTemplateManager from "@/components/admin/AssessmentTemplateManager";
import DomainTemplateManager from "@/components/admin/DomainTemplateManager";
import TrialAssessmentConfig from "@/components/admin/TrialAssessmentConfig";
import { cn } from "@/lib/utils";


const TONE_CLASSES = {
  mint:   { icon: "bg-dash-mint-50 text-dash-mint-700",   delta: "text-dash-mint-700" },
  indigo: { icon: "bg-dash-indigo-50 text-dash-indigo-600", delta: "text-dash-indigo-600" },
  amber:  { icon: "bg-dash-amber-50 text-dash-amber-700", delta: "text-dash-amber-700" },
} as const;

function StatCard({ label, value, delta, icon: Icon, tone }: {
  label: string;
  value: string | number;
  delta: string;
  icon: React.ComponentType<any>;
  tone: keyof typeof TONE_CLASSES;
}) {
  const { icon: iconClass, delta: deltaClass } = TONE_CLASSES[tone];
  return (
    <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-[16px_18px]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-dash-ink-500">{label}</span>
        <span className={cn("w-[26px] h-[26px] rounded-[7px] inline-flex items-center justify-center", iconClass)}>
          <Icon size={14} strokeWidth={1.6} />
        </span>
      </div>
      <div className="[font-family:var(--font-display,Georgia,serif)] text-[30px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-none">
        {value}
      </div>
      <div className={cn("text-xs mt-1.5 font-medium", deltaClass)}>{delta}</div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [tab, setTab] = useState<"templates" | "domains" | "trial">("templates");
  const [stats, setStats] = useState({ activeAssessments: 0, domainTemplates: 0, completions30d: 0, pendingReview: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/assessment-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/domain-templates").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
    ]).then(([templates, domains, statsData]) => {
      setStats({
        activeAssessments: Array.isArray(templates) ? templates.filter((t: any) => t.isActive).length : 0,
        domainTemplates: Array.isArray(domains) ? domains.length : 0,
        completions30d: statsData?.assessments?.completed ?? 0,
        pendingReview: 0,
      });
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">
          Assessment management
        </div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Assessments &amp; domain libraries
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Build full assessments by combining domains, or upload complete JSON. All assessments are database-driven and fully customizable.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-7">
        <StatCard label="Active assessments" value={stats.activeAssessments} delta="assessment templates" icon={ClipboardList} tone="mint" />
        <StatCard label="Domain templates" value={stats.domainTemplates} delta="available domains" icon={FileStack} tone="indigo" />
        <StatCard label="Completions (30d)" value={stats.completions30d} delta="last 30 days" icon={CheckCircle} tone="mint" />
        <StatCard label="Pending review" value={stats.pendingReview} delta="need attention" icon={Clock} tone="amber" />
      </div>

      <div className="inline-flex p-1 bg-dash-sunk rounded-[10px] border border-dash-ink-100 mb-5">
        {([
          { id: "templates", label: "Assessment templates", icon: ClipboardList },
          { id: "domains", label: "Domain library", icon: FileStack },
          { id: "trial", label: "Trial configuration", icon: FlaskConical },
        ] as const).map((t) => {
          const isActive = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-[7px] rounded-[7px] border-none cursor-pointer font-[inherit] text-[13px] font-semibold transition-[background,color] duration-[120ms]",
                isActive
                  ? "bg-dash-surface text-dash-ink-900 shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                  : "bg-transparent text-dash-ink-500",
              )}
            >
              <Icon size={14} strokeWidth={1.6} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "templates" && <AssessmentTemplateManager />}
      {tab === "domains" && <DomainTemplateManager />}
      {tab === "trial" && <TrialAssessmentConfig />}
    </div>
  );
}
