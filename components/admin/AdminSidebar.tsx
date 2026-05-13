"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUserData, useSignOut } from "@/lib/hooks/use-supabase-user";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, BarChart3, ClipboardList, Library, Users,
  Mail, Wrench, Flag, Sliders, LogOut, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { kind: "group" as const, label: "Platform" },
  { id: "overview",      icon: LayoutDashboard, label: "Overview",      href: "/admin/overview" },
  { id: "analytics",     icon: BarChart3,        label: "Analytics",     href: "/admin/analytics" },
  { kind: "group" as const, label: "Content" },
  { id: "assessments",   icon: ClipboardList,    label: "Assessments",   href: "/admin/assessments" },
  { id: "resources",     icon: Library,          label: "Resources",     href: "/admin/resources" },
  { kind: "group" as const, label: "People" },
  { id: "users",         icon: Users,            label: "Users",         href: "/admin/users" },
  { id: "leads",         icon: Mail,             label: "Leads",         href: "/admin/leads" },
  { kind: "group" as const, label: "System" },
  { id: "tools",         icon: Wrench,           label: "Tools",         href: "/admin/tools" },
  { id: "feature-flags", icon: Flag,             label: "Feature flags", href: "/admin/feature-flags" },
  { id: "settings",      icon: Sliders,          label: "Settings",      href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useUserData();
  const { signOut } = useSignOut();
  const { resolvedTheme, setTheme } = useTheme();

  const displayName = userData?.name || userData?.email || "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = userData?.role?.toLowerCase().replace("_", " ") ?? "admin";

  return (
    <aside className="w-60 bg-dash-surface border-r border-dash-ink-100 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-dash-ink-100">
        <div
          className="w-7 h-7 rounded-lg bg-dash-ink-900 text-white flex items-center justify-center font-bold text-[15px] shrink-0"
          style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
        >
          B
        </div>
        <div className="flex flex-col leading-[1.1]">
          <span className="text-sm font-semibold text-dash-ink-900">BehaviorIQ</span>
          <span className="text-[11px] text-dash-ink-500 tracking-[0.04em]">Super admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2.5 py-3 flex-1 overflow-y-auto">
        {NAV.map((item, i) => {
          if (item.kind === "group") {
            return (
              <div
                key={i}
                className="px-2.5 pt-3.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-ink-500"
              >
                {item.label}
              </div>
            );
          }
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-none cursor-pointer text-left font-[inherit] text-sm mb-0.5 transition-colors duration-[120ms]",
                isActive
                  ? "font-semibold text-dash-indigo-600 bg-dash-indigo-50"
                  : "font-medium text-dash-ink-700 bg-transparent hover:bg-dash-sunk",
              )}
            >
              <Icon size={16} strokeWidth={1.6} />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="mx-2.5 mb-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-dash-ink-700 hover:bg-dash-sunk transition-colors border-none cursor-pointer text-left font-[inherit] w-[calc(100%-20px)]"
      >
        {resolvedTheme === "dark"
          ? <Sun size={16} strokeWidth={1.6} className="shrink-0" />
          : <Moon size={16} strokeWidth={1.6} className="shrink-0" />}
        <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>

      {/* User footer */}
      <div className="border-t border-dash-ink-100 p-3.5 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-dash-peach-50 text-dash-peach-500 flex items-center justify-center font-bold text-[13px] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[13px] font-semibold text-dash-ink-900 truncate">{displayName}</div>
          <div className="text-[11px] text-dash-ink-500">{roleLabel}</div>
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          className="w-7 h-7 rounded-[7px] border border-dash-ink-100 bg-transparent flex items-center justify-center cursor-pointer shrink-0 hover:bg-dash-sunk"
        >
          <LogOut size={14} className="text-dash-ink-500" strokeWidth={1.6} />
        </button>
      </div>
    </aside>
  );
}
