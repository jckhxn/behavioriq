"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { useSignOut } from "@/lib/hooks/use-supabase-user";
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
} from "lucide-react";
import { C } from "@/lib/dashboard/colors";

const NAV = [
  { kind: "group" as const, label: "Platform" },
  { id: "overview", icon: LayoutDashboard, label: "Overview", href: "/admin/overview" },
  { id: "analytics", icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { kind: "group" as const, label: "Content" },
  { id: "assessments", icon: ClipboardList, label: "Assessments", href: "/admin/assessments" },
  { id: "resources", icon: Library, label: "Resources", href: "/admin/resources" },
  { kind: "group" as const, label: "People" },
  { id: "users", icon: Users, label: "Users", href: "/admin/users" },
  { id: "leads", icon: Mail, label: "Leads", href: "/admin/leads" },
  { kind: "group" as const, label: "System" },
  { id: "tools", icon: Wrench, label: "Tools", href: "/admin/tools" },
  { id: "feature-flags", icon: Flag, label: "Feature flags", href: "/admin/feature-flags" },
  { id: "settings", icon: Sliders, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useUserData();
  const { signOut } = useSignOut();

  const displayName = userData?.name || userData?.email || "Admin";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = userData?.role?.toLowerCase().replace("_", " ") ?? "admin";

  return (
    <aside
      style={{
        width: 240,
        background: C.surface,
        borderRight: `1px solid ${C.ink100}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
      }}
    >
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
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink900 }}>BehaviorIQ</span>
          <span style={{ fontSize: 11, color: C.ink500, letterSpacing: "0.04em" }}>
            Super admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
        {NAV.map((item, i) => {
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
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
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
          <div style={{ fontSize: 11, color: C.ink500 }}>{roleLabel}</div>
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
