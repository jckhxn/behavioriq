"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserData, useSignOut } from "@/lib/hooks/use-supabase-user";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Library,
  Users,
  Mail,
  Wrench,
  Flag,
  Sliders,
  LogOut,
  X,
  Menu,
  Bell,
  LifeBuoy,
  ChevronRight,
  ChevronDown,
  Search,
  Gift,
} from "lucide-react";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  canvas: "#FBF8F3",
  surface: "#FFFFFF",
  sunk: "#F4EFE6",
  ink900: "#1C1917",
  ink700: "#44403C",
  ink500: "#78716C",
  ink300: "#A8A29E",
  ink200: "#D6D3D1",
  ink100: "#E7E5E4",
  indigo50: "#EEF0FF",
  indigo100: "#DDE1FF",
  indigo500: "#6366F1",
  indigo600: "#4F46E5",
  peach50: "#FFF4EC",
  peach500: "#F97C4E",
};

// ── Nav definitions ───────────────────────────────────────────────────────────
const USER_NAV = [
  { kind: "group" as const, label: "My dashboard" },
  { id: "overview", icon: LayoutDashboard, label: "Overview", href: "/dashboard/overview" },
  { id: "library", icon: Library, label: "Library", href: "/dashboard/library" },
  { kind: "group" as const, label: "Account" },
  { id: "settings", icon: Sliders, label: "Settings", href: "/dashboard/settings" },
  { id: "earn-rewards", icon: Gift, label: "Earn rewards", href: "/earn-rewards" },
];

const ADMIN_NAV = [
  { kind: "group" as const, label: "Platform" },
  { id: "overview", icon: LayoutDashboard, label: "Overview", href: "/dashboard/overview" },
  { id: "analytics", icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { kind: "group" as const, label: "Content" },
  { id: "assessments", icon: ClipboardList, label: "Assessments", href: "/dashboard/assessments" },
  { id: "library", icon: Library, label: "Resources", href: "/dashboard/library" },
  { kind: "group" as const, label: "People" },
  { id: "users", icon: Users, label: "Users", href: "/dashboard/users" },
  { id: "leads", icon: Mail, label: "Leads", href: "/dashboard/leads" },
  { kind: "group" as const, label: "System" },
  { id: "tools", icon: Wrench, label: "Tools", href: "/dashboard/tools" },
  { id: "feature-flags", icon: Flag, label: "Feature flags", href: "/dashboard/feature-flags" },
  { id: "admin-settings", icon: Sliders, label: "Settings", href: "/dashboard/admin-settings" },
];

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview",
  library: "Library",
  settings: "Settings",
  "earn-rewards": "Earn rewards",
  analytics: "Analytics",
  assessments: "Assessments",
  users: "Users",
  leads: "Leads",
  tools: "Tools",
  "feature-flags": "Feature flags",
  "admin-settings": "Settings",
  "enhanced-report": "Enhanced report",
};

const ROUTE_SECTIONS: Record<string, string> = {
  overview: "My dashboard",
  library: "My dashboard",
  settings: "Account",
  "earn-rewards": "Account",
  analytics: "Platform",
  assessments: "Content",
  resources: "Content",
  users: "People",
  leads: "People",
  tools: "System",
  "feature-flags": "System",
  "admin-settings": "System",
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  open,
  onClose,
  isMobile,
  role,
}: {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useUserData();
  const { signOut } = useSignOut();

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(role);
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  const displayName = userData?.name || userData?.email || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = userData?.role?.toLowerCase().replace("_", " ") ?? "";

  const sidebarStyle: React.CSSProperties = {
    width: 240,
    background: C.surface,
    borderRight: `1px solid ${C.ink100}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    height: "100%",
    ...(isMobile
      ? {
          position: "fixed",
          top: 0,
          left: open ? 0 : -240,
          bottom: 0,
          zIndex: 50,
          transition: "left 200ms cubic-bezier(0.2,0.8,0.2,1)",
          boxShadow: open ? "4px 0 24px rgba(28,25,23,0.12)" : "none",
        }
      : {}),
  };

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${C.ink100}`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: C.ink900,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display, Georgia, serif)",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          B
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink900 }}>BehaviorIQ</span>
          {isAdmin && (
            <span style={{ fontSize: 11, color: C.ink500, letterSpacing: "0.04em" }}>
              {roleLabel}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color={C.ink500} strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        {nav.map((item, i) => {
          if (item.kind === "group") {
            return (
              <div
                key={i}
                style={{
                  padding: "14px 10px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.ink500,
                }}
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
              onClick={() => {
                router.push(item.href);
                if (isMobile) onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? C.indigo600 : C.ink700,
                background: isActive ? C.indigo50 : "transparent",
                marginBottom: 2,
                transition: "background 120ms, color 120ms",
              }}
            >
              <Icon size={16} strokeWidth={1.6} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: `1px solid ${C.ink100}`,
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: C.peach50,
            color: C.peach500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.ink900,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </div>
          {roleLabel && (
            <div style={{ fontSize: 11, color: C.ink500 }}>{roleLabel}</div>
          )}
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: `1px solid ${C.ink100}`,
            background: "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <LogOut size={14} color={C.ink500} strokeWidth={1.6} />
        </button>
      </div>
    </aside>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function TopBar({
  onMenuClick,
  isMobile,
}: {
  onMenuClick: () => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const { userData } = useUserData();
  const [search, setSearch] = useState("");

  const segment = pathname.split("/")[2] ?? "overview";
  const section = ROUTE_SECTIONS[segment] ?? "Dashboard";
  const pageLabel = ROUTE_LABELS[segment] ?? segment;

  const displayName = userData?.name || userData?.email || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();

  const iconBtn: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: `1px solid ${C.ink100}`,
    background: "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <header
      style={{
        height: 60,
        borderBottom: `1px solid ${C.ink100}`,
        background: C.surface,
        display: "flex",
        alignItems: "center",
        padding: "0 16px 0 20px",
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          style={{ ...iconBtn, flexShrink: 0 }}
          aria-label="Open menu"
        >
          <Menu size={18} color={C.ink700} strokeWidth={1.6} />
        </button>
      )}

      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: C.ink500,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        <span style={{ display: isMobile ? "none" : "inline" }}>{section}</span>
        <ChevronRight
          size={14}
          strokeWidth={1.6}
          style={{ display: isMobile ? "none" : "inline" }}
        />
        <span style={{ color: C.ink900, fontWeight: 600 }}>{pageLabel}</span>
      </div>

      {/* Search — hidden on small mobile */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: 380,
          marginLeft: isMobile ? 0 : 16,
          position: "relative",
          display: isMobile ? "none" : "block",
        }}
      >
        <Search
          size={14}
          color={C.ink500}
          strokeWidth={1.6}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 32,
            paddingRight: 48,
            borderRadius: 8,
            border: `1px solid ${C.ink200}`,
            background: C.canvas,
            fontFamily: "inherit",
            fontSize: 13,
            color: C.ink900,
            outline: "none",
          }}
        />
        <kbd
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-mono-admin, monospace)",
            fontSize: 11,
            padding: "2px 5px",
            border: `1px solid ${C.ink200}`,
            borderRadius: 4,
            color: C.ink500,
            background: C.surface,
            pointerEvents: "none",
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div style={{ flex: 1 }} />

      {/* Icons */}
      <button style={iconBtn} title="Notifications">
        <Bell size={16} color={C.ink700} strokeWidth={1.6} />
      </button>

      <span style={{ width: 1, height: 24, background: C.ink100, flexShrink: 0 }} />

      {/* User chip */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          height: 36,
          padding: "0 10px 0 6px",
          borderRadius: 8,
          background: "transparent",
          border: `1px solid ${C.ink100}`,
          cursor: "pointer",
          fontFamily: "inherit",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: C.peach50,
            color: C.peach500,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {initials}
        </span>
        {!isMobile && (
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink900 }}>
            {displayName.split("@")[0].split(" ")[0]}
          </span>
        )}
        <ChevronDown size={14} color={C.ink500} strokeWidth={1.6} />
      </button>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData, isLoading } = useUserData();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on route change (mobile)
  const pathname = usePathname();
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;
    if (!userData) {
      router.replace("/login");
      return;
    }
    const districtRoles = ["TEACHER", "COUNSELOR", "PRINCIPAL", "DISTRICT_ADMIN"];
    if (districtRoles.includes(userData.role)) {
      const redirectMap: Record<string, string> = {
        TEACHER: "/teacher",
        COUNSELOR: "/counselor",
        PRINCIPAL: "/principal",
        DISTRICT_ADMIN: "/district",
      };
      router.replace(redirectMap[userData.role] ?? "/");
    }
  }, [userData, isLoading, router]);

  if (isLoading || !userData) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: C.canvas,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.indigo500,
            opacity: 0.6,
          }}
        />
      </div>
    );
  }

  const role = userData.role;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.canvas,
        fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)",
        color: C.ink900,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,25,23,0.4)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      {(!isMobile || sidebarOpen) && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          role={role}
        />
      )}

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          isMobile={isMobile}
        />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: isMobile ? "20px 16px" : "32px 40px",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
