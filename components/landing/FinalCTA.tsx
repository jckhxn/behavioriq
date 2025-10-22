import React from "react";

export function FinalCTA({
  onStartSnapshot,
  onGet97Report,
}: {
  onStartSnapshot: () => void;
  onGet97Report: () => void;
}) {
  return (
    <section className="max-w-3xl mx-auto text-center py-12 md:py-20">
      <h3 className="text-2xl font-bold mb-4">
        Get answers in minutes — not months.
      </h3>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
        <button
          id="cta_final_start_snapshot"
          aria-label="Start Free Snapshot"
          className="btn-primary h-12 px-6 rounded-xl font-semibold"
          onClick={onStartSnapshot}
        >
          Start Free Snapshot
        </button>
        <button
          id="cta_get_97_report_final"
          aria-label="Get the $97 Report"
          className="btn-outline h-12 px-6 rounded-xl font-semibold"
          onClick={onGet97Report}
        >
          Get the $97 Report
        </button>
      </div>
      <div className="text-xs text-slate-500 mt-2">
        Instant results + instant school-ready PDF. AI stores no data.
      </div>
    </section>
  );
}
