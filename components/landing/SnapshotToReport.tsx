import React from "react";

export function SnapshotToReport({
  onStartSnapshot,
  onGet97Report,
}: {
  onStartSnapshot: () => void;
  onGet97Report: () => void;
}) {
  return (
    <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 py-12 md:py-20">
      <div className="flex-1 flex flex-col items-center md:items-start">
        {/* Mini snapshot UI mockup */}
        <div className="mb-4 flex gap-2">
          <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
            3 of 7 indicators
          </span>
        </div>
        {/* ...add more visual cues as needed */}
      </div>
      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-bold mb-2">
          From snapshot to school-ready PDF in minutes.
        </h3>
        <ul className="list-disc pl-5 mb-4 text-slate-600 dark:text-slate-300">
          <li>Instant on-screen results</li>
          <li>Instant school-ready PDF on upgrade</li>
          <li>Not a diagnosis; plain-English guidance</li>
          <li>AI stores no data; anonymous mode available</li>
        </ul>
        <div className="flex gap-3">
          <button
            id="cta_start_snapshot_mid"
            aria-label="Start Free Snapshot"
            className="btn-primary h-12 px-6 rounded-xl font-semibold"
            onClick={onStartSnapshot}
          >
            Start Free Snapshot
          </button>
          <button
            id="cta_get_97_report"
            aria-label="Get the $97 Report"
            className="btn-outline h-12 px-6 rounded-xl font-semibold"
            onClick={onGet97Report}
          >
            Get the $97 Report
          </button>
        </div>
      </div>
    </section>
  );
}
