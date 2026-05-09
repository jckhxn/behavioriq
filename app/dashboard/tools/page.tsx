"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { SystemStats } from "@/components/admin/SystemStats";
import { PushNotificationsTab } from "@/components/admin/PushNotificationsTab";
import { cn } from "@/lib/utils";

const TABS = [{ id: "stats", label: "System stats" }, { id: "push", label: "Push notifications" }] as const;

export default function ToolsPage() {
  const { userData, isLoading } = useUserData();
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "push">("stats");

  useEffect(() => {
    if (!isLoading && userData && !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) {
      router.replace("/dashboard/overview");
    }
  }, [userData, isLoading, router]);

  if (!userData || !["SUPER_ADMIN", "ADMIN"].includes(userData.role)) return null;

  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">System</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Tools
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          System diagnostics, push notifications, and platform utilities.
        </p>
      </div>

      <div className="inline-flex p-1 bg-dash-sunk rounded-[10px] border border-dash-ink-100 mb-6">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center px-4 py-[7px] rounded-[7px] border-none cursor-pointer font-[inherit] text-[13px] font-semibold transition-[background,color] duration-[120ms]",
                isActive
                  ? "bg-dash-surface text-dash-ink-900 shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                  : "bg-transparent text-dash-ink-500",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "stats" ? <SystemStats /> : <PushNotificationsTab />}
    </div>
  );
}
