"use client";

import { useState } from "react";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SuperAdminPlatformSettings } from "@/components/admin/SuperAdminPlatformSettings";
import { C } from "@/lib/dashboard/colors";


const TABS = [
  { id: "system", label: "System settings" },
  { id: "platform", label: "Platform settings" },
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<"system" | "platform">("system");

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.ink500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          System
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: C.ink900,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Global platform configuration and admin preferences.
        </p>
      </div>

      <div
        style={{
          display: "inline-flex",
          padding: 4,
          background: C.sunk,
          borderRadius: 10,
          border: `1px solid ${C.ink100}`,
          marginBottom: 24,
        }}
      >
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 16px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                background: isActive ? C.surface : "transparent",
                color: isActive ? C.ink900 : C.ink500,
                boxShadow: isActive ? "0 1px 2px rgba(28,25,23,0.06)" : "none",
                transition: "background 120ms, color 120ms",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "system" ? <SystemSettings /> : <SuperAdminPlatformSettings />}
    </div>
  );
}
