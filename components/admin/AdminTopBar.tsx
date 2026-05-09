"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, LifeBuoy, Search, ChevronRight, ChevronDown } from "lucide-react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { C } from "@/lib/dashboard/colors";

const ROUTE_LABELS: Record<string, string> = {
  overview: "Overview",
  analytics: "Analytics",
  assessments: "Assessments",
  resources: "Resources",
  users: "Users",
  leads: "Leads",
  tools: "Tools",
  "feature-flags": "Feature flags",
  settings: "Settings",
};

const ROUTE_SECTIONS: Record<string, string> = {
  overview: "Platform",
  analytics: "Platform",
  assessments: "Content",
  resources: "Content",
  users: "People",
  leads: "People",
  tools: "System",
  "feature-flags": "System",
  settings: "System",
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
        padding: "0 28px",
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.ink500, fontSize: 13 }}>
        <span>{section}</span>
        <ChevronRight size={14} strokeWidth={1.6} />
        <span style={{ color: C.ink900, fontWeight: 600 }}>{pageLabel}</span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, minWidth: 200, maxWidth: 400, marginLeft: 16, position: "relative" }}>
        <Search
          size={14}
          color={C.ink500}
          strokeWidth={1.6}
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments, users…"
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 32,
            paddingRight: 56,
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
            padding: "2px 6px",
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

      {/* Actions */}
      <button style={iconBtn} title="Notifications">
        <Bell size={16} color={C.ink700} strokeWidth={1.6} />
      </button>
      <button style={iconBtn} title="Help">
        <LifeBuoy size={16} color={C.ink700} strokeWidth={1.6} />
      </button>

      <span style={{ width: 1, height: 24, background: C.ink100 }} />

      {/* User menu */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 10px 0 6px",
          borderRadius: 8,
          background: "transparent",
          border: `1px solid ${C.ink100}`,
          cursor: "pointer",
          fontFamily: "inherit",
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
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink900 }}>
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown size={14} color={C.ink500} strokeWidth={1.6} />
      </button>
    </header>
  );
}
