"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserData, useSignOut } from "@/lib/hooks/use-supabase-user";
import { cn } from "@/lib/utils";
import { OnboardingProvider } from "@/lib/contexts/OnboardingContext";
import { DebugModeProvider, useDebugMode } from "@/lib/contexts/DebugModeContext";
import {
  LayoutDashboard, BarChart3, ClipboardList, Library, Users, Mail,
  Wrench, Flag, Sliders, LogOut, X, Menu, Bell, ChevronRight,
  ChevronDown, Search, Gift, FlaskConical, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

// ── Nav definitions ───────────────────────────────────────────────────────────
const USER_NAV = [
  { kind: "group" as const, label: "My dashboard" },
  { id: "overview",      icon: LayoutDashboard, label: "Overview",     href: "/dashboard/overview" },
  { id: "library",       icon: Library,         label: "Library",      href: "/dashboard/library" },
  { kind: "group" as const, label: "Account" },
  { id: "settings",      icon: Sliders,         label: "Settings",     href: "/dashboard/settings" },
  { id: "earn-rewards",  icon: Gift,             label: "Earn rewards", href: "/earn-rewards" },
];

const ADMIN_NAV = [
  { kind: "group" as const, label: "Platform" },
  { id: "overview",       icon: LayoutDashboard, label: "Overview",      href: "/dashboard/overview" },
  { id: "analytics",      icon: BarChart3,        label: "Analytics",     href: "/dashboard/analytics" },
  { kind: "group" as const, label: "Content" },
  { id: "assessments",    icon: ClipboardList,    label: "Assessments",   href: "/dashboard/assessments" },
  { id: "library",        icon: Library,          label: "Resources",     href: "/dashboard/library" },
  { kind: "group" as const, label: "People" },
  { id: "users",          icon: Users,            label: "Users",         href: "/dashboard/users" },
  { id: "leads",          icon: Mail,             label: "Leads",         href: "/dashboard/leads" },
  { kind: "group" as const, label: "System" },
  { id: "tools",          icon: Wrench,           label: "Tools",         href: "/dashboard/tools" },
  { id: "feature-flags",  icon: Flag,             label: "Feature flags", href: "/dashboard/feature-flags" },
  { id: "admin-settings", icon: Sliders,          label: "Settings",      href: "/dashboard/admin-settings" },
  { kind: "group" as const, label: "Account" },
  { id: "settings",       icon: Sliders,          label: "My account",    href: "/dashboard/settings" },
];

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview", library: "Library", settings: "My account",
  "earn-rewards": "Earn rewards", analytics: "Analytics",
  assessments: "Assessments", users: "Users", leads: "Leads",
  tools: "Tools", "feature-flags": "Feature flags", "admin-settings": "Settings",
  "enhanced-report": "Enhanced report",
};

const ROUTE_SECTIONS: Record<string, string> = {
  overview: "My dashboard", library: "My dashboard", settings: "Account",
  "earn-rewards": "Account", analytics: "Platform", assessments: "Content",
  users: "People", leads: "People", tools: "System",
  "feature-flags": "System", "admin-settings": "System",
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, isMobile, role, actualRole }: {
  open: boolean; onClose: () => void; isMobile: boolean; role: string; actualRole: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useUserData();
  const { signOut } = useSignOut();
  const { debugRole, setDebugRole } = useDebugMode();

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(role);
  const isActualAdmin = ["SUPER_ADMIN", "ADMIN"].includes(actualRole);
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;
  const { resolvedTheme, setTheme } = useTheme();

  const displayName = userData?.name || userData?.email || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = debugRole
    ? "debug: user view"
    : userData?.role?.toLowerCase().replace("_", " ") ?? "";

  return (
    <aside
      className={cn(
        "w-60 bg-dash-surface border-r border-dash-ink-100 flex flex-col shrink-0 h-full",
        isMobile && "fixed top-0 bottom-0 z-50 transition-[left] duration-200 ease-out shadow-lg",
        isMobile && (open ? "left-0" : "-left-60"),
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dash-ink-100 shrink-0">
        <div
          className="w-7 h-7 rounded-lg bg-dash-ink-900 text-white flex items-center justify-center font-bold text-[15px] shrink-0"
          style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
        >
          B
        </div>
        <div className="flex flex-col leading-none flex-1 min-w-0">
          <span className="text-sm font-semibold text-dash-ink-900">BehaviorIQ</span>
          {(isAdmin || debugRole) && (
            <span className={cn("text-[11px] tracking-[0.04em]", debugRole ? "text-dash-amber-700" : "text-dash-ink-500")}>
              {roleLabel}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-dash-sunk border-none bg-transparent cursor-pointer"
          >
            <X size={16} className="text-dash-ink-500" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="px-2.5 py-3 flex-1 overflow-y-auto">
        {nav.map((item, i) => {
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { router.push(item.href); if (isMobile) onClose(); }}
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

      {/* Debug mode toggle — only for real admins */}
      {isActualAdmin && (
        <div className="px-2.5 pb-2">
          {debugRole ? (
            <button
              onClick={() => { setDebugRole(null); router.push("/dashboard/overview"); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dash-amber-700/30 bg-dash-amber-50 text-dash-amber-700 text-[12px] font-semibold cursor-pointer hover:bg-dash-amber-50/80 transition-colors duration-[120ms]"
            >
              <FlaskConical size={13} strokeWidth={1.6} />
              Exit user view
            </button>
          ) : (
            <button
              onClick={() => { setDebugRole("USER"); router.push("/dashboard/overview"); }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-dash-ink-200 bg-transparent text-dash-ink-500 text-[12px] font-medium cursor-pointer hover:bg-dash-sunk transition-colors duration-[120ms]"
            >
              <FlaskConical size={13} strokeWidth={1.6} />
              Preview as user
            </button>
          )}
        </div>
      )}

      {/* Theme toggle */}
      <div className="px-2.5 pb-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border-none cursor-pointer text-left font-[inherit] text-sm text-dash-ink-700 bg-transparent hover:bg-dash-sunk transition-colors duration-[120ms]"
        >
          {resolvedTheme === "dark"
            ? <Sun size={16} strokeWidth={1.6} className="shrink-0" />
            : <Moon size={16} strokeWidth={1.6} className="shrink-0" />}
          <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      {/* User footer */}
      <div className="border-t border-dash-ink-100 p-3.5 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-dash-peach-50 text-dash-peach-500 flex items-center justify-center font-bold text-[13px] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[13px] font-semibold text-dash-ink-900 truncate">{displayName}</div>
          {roleLabel && <div className={cn("text-[11px]", debugRole ? "text-dash-amber-700" : "text-dash-ink-500")}>{roleLabel}</div>}
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

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({ onMenuClick, isMobile }: { onMenuClick: () => void; isMobile: boolean }) {
  const pathname = usePathname();
  const { userData } = useUserData();
  const [search, setSearch] = useState("");

  const segment = pathname.split("/")[2] ?? "overview";
  const section = ROUTE_SECTIONS[segment] ?? "Dashboard";
  const pageLabel = ROUTE_LABELS[segment] ?? segment;

  const displayName = userData?.name || userData?.email || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        (document.getElementById("dash-search") as HTMLInputElement)?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="h-[60px] border-b border-dash-ink-100 bg-dash-surface flex items-center px-5 gap-3 shrink-0">
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="w-9 h-9 rounded-lg border border-dash-ink-100 bg-transparent flex items-center justify-center cursor-pointer shrink-0 hover:bg-dash-sunk"
        >
          <Menu size={18} className="text-dash-ink-700" strokeWidth={1.6} />
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-dash-ink-500 shrink-0">
        {!isMobile && <span>{section}</span>}
        {!isMobile && <ChevronRight size={14} strokeWidth={1.6} />}
        <span className="text-dash-ink-900 font-semibold">{pageLabel}</span>
      </div>

      {/* Search */}
      {!isMobile && (
        <div className="relative flex-1 max-w-sm ml-4">
          <Search size={14} className="text-dash-ink-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.6} />
          <input
            id="dash-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full h-9 pl-8 pr-12 rounded-lg border border-dash-ink-200 bg-dash-canvas text-[13px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500"
          />
          <kbd
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-1.5 py-0.5 rounded border border-dash-ink-200 text-dash-ink-500 bg-dash-surface pointer-events-none"
            style={{ fontFamily: "var(--font-mono-admin, monospace)" }}
          >
            ⌘K
          </kbd>
        </div>
      )}

      <div className="flex-1" />

      {/* Notifications */}
      <button className="w-9 h-9 rounded-lg border border-dash-ink-100 bg-transparent flex items-center justify-center cursor-pointer hover:bg-dash-sunk">
        <Bell size={16} className="text-dash-ink-700" strokeWidth={1.6} />
      </button>

      <span className="w-px h-6 bg-dash-ink-100 shrink-0" />

      {/* User chip */}
      <button className="flex items-center gap-2 h-9 px-2 rounded-lg border border-dash-ink-100 bg-transparent cursor-pointer shrink-0 hover:bg-dash-sunk">
        <span className="w-6 h-6 rounded-full bg-dash-peach-50 text-dash-peach-500 flex items-center justify-center font-bold text-[11px]">
          {initials}
        </span>
        {!isMobile && (
          <span className="text-[13px] font-semibold text-dash-ink-900">
            {displayName.split("@")[0].split(" ")[0]}
          </span>
        )}
        <ChevronDown size={14} className="text-dash-ink-500" strokeWidth={1.6} />
      </button>
    </header>
  );
}

// ── Debug banner ──────────────────────────────────────────────────────────────
function DebugBanner() {
  const { debugRole, setDebugRole } = useDebugMode();
  const router = useRouter();
  if (!debugRole) return null;
  return (
    <div className="bg-dash-amber-50 border-b border-dash-amber-700/20 px-5 py-2 flex items-center gap-2.5 shrink-0">
      <FlaskConical size={13} className="text-dash-amber-700 shrink-0" strokeWidth={1.6} />
      <span className="text-[12px] font-medium text-dash-amber-700 flex-1">
        Debug mode — previewing as a standard user. Admin data is hidden.
      </span>
      <button
        onClick={() => { setDebugRole(null); router.push("/dashboard/overview"); }}
        className="text-[12px] font-semibold text-dash-amber-700 underline underline-offset-2 bg-transparent border-none cursor-pointer"
      >
        Exit
      </button>
    </div>
  );
}

// ── Inner layout (needs context) ───────────────────────────────────────────────
function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { userData, isLoading } = useUserData();
  const { debugRole } = useDebugMode();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!userData) { router.replace("/login"); return; }
    // Don't redirect admins even in debug mode
    const isActualAdmin = ["SUPER_ADMIN", "ADMIN"].includes(userData.role);
    if (isActualAdmin) return;
    const redirectMap: Record<string, string> = {
      TEACHER: "/teacher", COUNSELOR: "/counselor",
      PRINCIPAL: "/principal", DISTRICT_ADMIN: "/district",
    };
    if (redirectMap[userData.role]) router.replace(redirectMap[userData.role]);
  }, [userData, isLoading, router]);

  if (isLoading || !userData) {
    return (
      <div className="h-screen flex items-center justify-center bg-dash-canvas">
        <div className="w-2 h-2 rounded-full bg-dash-indigo-500 opacity-60" />
      </div>
    );
  }

  const effectiveRole = debugRole ?? userData.role;

  return (
    <div
      className="flex h-screen bg-dash-canvas overflow-hidden relative"
      style={{ fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)", color: "var(--dash-ink-900)" }}
    >
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        role={effectiveRole}
        actualRole={userData.role}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />
        <DebugBanner />
        <main className={cn("flex-1 overflow-auto", isMobile ? "px-4 py-5" : "px-10 py-8")}>
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DebugModeProvider>
      <OnboardingProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </OnboardingProvider>
    </DebugModeProvider>
  );
}
