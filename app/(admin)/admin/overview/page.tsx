"use client";

import { useState, useEffect } from "react";
import { Users, ClipboardList, CheckCircle, FileStack } from "lucide-react";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { cn } from "@/lib/utils";


function StatCard({ label, value, delta, icon: Icon, iconClass }: {
  label: string;
  value: string | number;
  delta: string;
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
      <div className={cn("text-xs mt-1.5 font-medium", iconClass.split(" ")[1])}>{delta}</div>
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0, activeAssessments: 0, completions30d: 0, domainTemplates: 0,
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
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">Platform</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Overview
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Platform health and key metrics at a glance.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        <StatCard label="Total users" value={stats.totalUsers} delta="registered accounts" icon={Users} iconClass="bg-dash-indigo-50 text-dash-indigo-600" />
        <StatCard label="Active assessments" value={stats.activeAssessments} delta="published templates" icon={ClipboardList} iconClass="bg-dash-mint-50 text-dash-mint-700" />
        <StatCard label="Completions (30d)" value={stats.completions30d} delta="last 30 days" icon={CheckCircle} iconClass="bg-dash-mint-50 text-dash-mint-700" />
        <StatCard label="Domain templates" value={stats.domainTemplates} delta="available domains" icon={FileStack} iconClass="bg-dash-peach-50 text-dash-peach-500" />
      </div>

      <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-[24px_28px]">
        <div className="text-base font-semibold text-dash-ink-900 mb-5">Platform analytics</div>
        <AdminAnalytics />
      </div>
    </div>
  );
}
