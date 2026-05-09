"use client";

import { AdminAnalytics } from "@/components/admin/AdminAnalytics";


export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">Platform</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Analytics
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Usage trends, completion rates, and domain-level insights.
        </p>
      </div>
      <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-[24px_28px]">
        <AdminAnalytics />
      </div>
    </div>
  );
}
