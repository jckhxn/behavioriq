"use client";

import ResourceLibraryManager from "@/components/admin/ResourceLibraryManager";


export default function ResourcesPage() {
  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">Content</div>
        <h1 className="[font-family:var(--font-display,Georgia,serif)] text-[32px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.1] m-0">
          Resource library
        </h1>
        <p className="text-[15px] text-dash-ink-700 leading-[1.55] mt-2.5 mb-0">
          Manage supplementary resources attached to assessments and domains.
        </p>
      </div>
      <ResourceLibraryManager />
    </div>
  );
}
