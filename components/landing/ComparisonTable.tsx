import React from "react";

export function ComparisonTable() {
  return (
    <section className="max-w-4xl mx-auto py-12 md:py-20">
      <h3 className="text-xl font-bold mb-4 text-center">
        How BehaviorIQ™ Compares
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-3 font-semibold">&nbsp;</th>
              <th className="p-3 font-semibold">BehaviorIQ™</th>
              <th className="p-3 font-semibold">Traditional Evaluations</th>
              <th className="p-3 font-semibold">Other Apps</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 font-medium">Time to results</td>
              <td className="p-3">Instant</td>
              <td className="p-3">6–12 weeks</td>
              <td className="p-3">24–48 hrs</td>
            </tr>
            <tr className="bg-slate-50 dark:bg-[#223043]">
              <td className="p-3 font-medium">Price</td>
              <td className="p-3">$97</td>
              <td className="p-3">$1,500–$3,000</td>
              <td className="p-3">$20–$50/mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium">Perspectives</td>
              <td className="p-3">Parent + Child</td>
              <td className="p-3">Clinician only</td>
              <td className="p-3">Parent only</td>
            </tr>
            <tr className="bg-slate-50 dark:bg-[#223043]">
              <td className="p-3 font-medium">Output</td>
              <td className="p-3">Instant school-ready PDF</td>
              <td className="p-3">Long clinical report</td>
              <td className="p-3">Basic summary</td>
            </tr>
            <tr>
              <td className="p-3 font-medium">Reassessments</td>
              <td className="p-3">Monthly</td>
              <td className="p-3">One-time</td>
              <td className="p-3">Limited</td>
            </tr>
            <tr className="bg-slate-50 dark:bg-[#223043]">
              <td className="p-3 font-medium">Privacy</td>
              <td className="p-3">No AI data storage</td>
              <td className="p-3">N/A</td>
              <td className="p-3">Varies</td>
            </tr>
            <tr>
              <td colSpan={4} className="p-3 text-center">
                <button
                  id="cta_comparison_start_snapshot"
                  aria-label="Start Free Snapshot"
                  className="btn-primary h-12 px-6 rounded-xl font-semibold mt-2"
                >
                  Start Free Snapshot
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
