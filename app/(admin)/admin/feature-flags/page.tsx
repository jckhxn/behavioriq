"use client";

import { FeatureFlagsManager } from "@/components/admin/FeatureFlagsManager";


export default function FeatureFlagsPage() {
  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">System</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Feature flags
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Enable or disable platform features without a deployment.
        </p>
      </div>
      <FeatureFlagsManager />
    </div>
  );
}
