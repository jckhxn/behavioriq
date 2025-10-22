import React from "react";

export function SampleReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#141a21] rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          aria-label="Close sample report"
          className="absolute top-3 right-3 text-xl text-slate-400 hover:text-primary"
          onClick={onClose}
          id="sample_report.close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Sample Report</h2>
        <div className="mb-4 text-xs text-slate-500">
          (Some sections masked for privacy)
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-[#223043] p-4 mb-4 text-sm">
          <div className="mb-2 font-semibold">Summary</div>
          <div className="blur-sm select-none">[Masked summary content]</div>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-[#223043] p-4 mb-4 text-sm">
          <div className="mb-2 font-semibold">Indicators</div>
          <div className="blur-sm select-none">[Masked indicators]</div>
        </div>
        <div className="rounded-lg bg-slate-100 dark:bg-[#223043] p-4 text-sm">
          <div className="mb-2 font-semibold">Recommendations</div>
          <div className="blur-sm select-none">[Masked recommendations]</div>
        </div>
      </div>
    </div>
  );
}
