"use client";

import { Suspense } from "react";
import SettingsPane from "@/components/settings/SettingsPane";
import { C } from "@/lib/dashboard/colors";


export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.ink500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Account
        </div>
        <h1 style={{ fontFamily: "var(--font-display, Georgia, serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink900, lineHeight: 1.1, margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: 15, color: C.ink700, lineHeight: 1.55, margin: "10px 0 0" }}>
          Manage your account preferences and notifications.
        </p>
      </div>
      <Suspense fallback={null}>
        <SettingsPane />
      </Suspense>
    </div>
  );
}
