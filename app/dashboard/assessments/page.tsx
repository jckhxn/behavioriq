"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { ClipboardList, FileStack, CheckCircle, FlaskConical } from "lucide-react";
import AssessmentTemplateManager from "@/components/admin/AssessmentTemplateManager";
import DomainTemplateManager from "@/components/admin/DomainTemplateManager";
import TrialAssessmentConfig from "@/components/admin/TrialAssessmentConfig";
import { cn } from "@/lib/utils";


function StatCard({ label, value, icon: Icon, iconClass }: {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  iconClass: string;
}) {
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
    </div>
  );
}

export default function AssessmentsPage() {
  const { userData, isLoading } = useUserData();
  const router = useRouter();
  const [tab, setTab] = useState<"templates" | "domains" | "trial">("templates");
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
      <div className="mb-6">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">Content</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Assessments &amp; domain libraries
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Build full assessments by combining domains, or upload complete JSON.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-7">
        <StatCard label="Active assessments" value={stats.activeAssessments} icon={ClipboardList} iconClass="bg-dash-mint-50 text-dash-mint-700" />
        <StatCard label="Domain templates" value={stats.domainTemplates} icon={FileStack} iconClass="bg-dash-indigo-50 text-dash-indigo-600" />
        <StatCard label="Total completions" value={stats.completions} icon={CheckCircle} iconClass="bg-dash-mint-50 text-dash-mint-700" />
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
