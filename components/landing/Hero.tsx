import React from "react";

export function Hero({
  onStartSnapshot,
  onSampleReport,
  foundersActive,
  foundersCountdown,
}: {
  onStartSnapshot: () => void;
  onSampleReport: () => void;
  foundersActive?: boolean;
  foundersCountdown?: string;
}) {
  return (
    <section className="max-w-3xl mx-auto text-center gap-4 py-16 md:py-24">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        Instant behavior snapshot. School-ready clarity without the wait.
      </h1>
      <p className="text-lg md:text-xl mb-6">
        Free 2-minute screener → optional $97 full report (instant PDF).
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <button
          id="cta_start_snapshot_top"
          aria-label="Start Free Snapshot"
          className="btn-primary h-12 px-6 rounded-xl font-semibold"
          onClick={onStartSnapshot}
        >
          Start Free Snapshot
        </button>
        <button
          id="cta_sample_report_modal"
          aria-label="See a Sample Report"
          className="btn-outline h-12 px-6 rounded-xl font-semibold"
          onClick={onSampleReport}
        >
          See a Sample Report
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500 mb-4">
        <span>AI stores no data</span>
        <span>•</span>
        <span>Anonymous mode available</span>
        <span>•</span>
        <span>Encrypted</span>
        <span>•</span>
        <span>Designed to support FERPA/HIPAA</span>
      </div>
      {foundersActive && foundersCountdown && (
        <div className="inline-block bg-primary/10 text-primary font-semibold rounded-full px-4 py-1 text-xs mt-2">
          Founders Pricing $97 (ends in {foundersCountdown})
        </div>
      )}
      {/* TODO: Add blurred dashboard/report mock image here */}
    </section>
  );
}
