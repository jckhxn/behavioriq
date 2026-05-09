"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, LifeBuoy, Search, ChevronRight, ChevronDown } from "lucide-react";
import { useUserData } from "@/lib/hooks/use-supabase-user";

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview", analytics: "Analytics", assessments: "Assessments",
  resources: "Resources", users: "Users", leads: "Leads",
  tools: "Tools", "feature-flags": "Feature flags", settings: "Settings",
};

const ROUTE_SECTIONS: Record<string, string> = {
  overview: "Platform", analytics: "Platform", assessments: "Content",
  resources: "Content", users: "People", leads: "People",
  tools: "System", "feature-flags": "System", settings: "System",
};

export function AdminTopBar() {
  const pathname = usePathname();
  const { userData } = useUserData();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const segment = pathname.split("/")[2] ?? "overview";
  const section = ROUTE_SECTIONS[segment] ?? "Platform";
  const pageLabel = ROUTE_LABELS[segment] ?? segment;

  const displayName = userData?.name || userData?.email || "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="h-[60px] border-b border-dash-ink-100 bg-dash-surface flex items-center px-7 gap-4 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-dash-ink-500 shrink-0">
        <span>{section}</span>
        <ChevronRight size={14} strokeWidth={1.6} />
        <span className="text-dash-ink-900 font-semibold">{pageLabel}</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[400px] ml-4">
        <Search size={14} className="text-dash-ink-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.6} />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments, users…"
          className="w-full h-9 pl-8 pr-14 rounded-lg border border-dash-ink-200 bg-dash-canvas text-[13px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500"
        />
        <kbd
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-1.5 py-0.5 rounded border border-dash-ink-200 text-dash-ink-500 bg-dash-surface pointer-events-none"
          style={{ fontFamily: "var(--font-mono-admin, monospace)" }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <button className="w-9 h-9 rounded-lg border border-dash-ink-100 bg-transparent flex items-center justify-center cursor-pointer hover:bg-dash-sunk" title="Notifications">
        <Bell size={16} className="text-dash-ink-700" strokeWidth={1.6} />
      </button>
      <button className="w-9 h-9 rounded-lg border border-dash-ink-100 bg-transparent flex items-center justify-center cursor-pointer hover:bg-dash-sunk" title="Help">
        <LifeBuoy size={16} className="text-dash-ink-700" strokeWidth={1.6} />
      </button>

      <span className="w-px h-6 bg-dash-ink-100 shrink-0" />

      {/* User chip */}
      <button className="flex items-center gap-2 h-9 px-2 rounded-lg border border-dash-ink-100 bg-transparent cursor-pointer shrink-0 hover:bg-dash-sunk font-[inherit]">
        <span className="w-6 h-6 rounded-full bg-dash-peach-50 text-dash-peach-500 flex items-center justify-center font-bold text-[11px]">
          {initials}
        </span>
        <span className="text-[13px] font-semibold text-dash-ink-900">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown size={14} className="text-dash-ink-500" strokeWidth={1.6} />
      </button>
    </header>
  );
}
