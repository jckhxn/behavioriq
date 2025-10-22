import React, { useState } from "react";

export function PricingCards({
  onStartCore,
  onStartFamily,
  onCompare,
}: {
  onStartCore: () => void;
  onStartFamily: () => void;
  onCompare: () => void;
}) {
  const [annual, setAnnual] = useState(false);
  return (
    <section className="max-w-4xl mx-auto py-12 md:py-20">
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full font-semibold ${!annual ? "bg-primary text-white" : "bg-slate-200 text-slate-700"}`}
          onClick={() => setAnnual(false)}
          id="pricing.toggle_plan_monthly"
          aria-label="Show monthly pricing"
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 rounded-full font-semibold ${annual ? "bg-primary text-white" : "bg-slate-200 text-slate-700"}`}
          onClick={() => setAnnual(true)}
          id="pricing.toggle_plan_annual"
          aria-label="Show annual pricing"
        >
          Annual <span className="ml-1 text-xs">(save $51/$69)</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Core Card */}
        <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-[#141a21] border border-slate-200 dark:border-[#223043] flex flex-col">
          <h4 className="text-xl font-bold mb-2">Core</h4>
          <div className="text-2xl font-bold mb-2">
            {annual ? "$597/yr" : "$59/mo"}
          </div>
          <ul className="mb-4 text-slate-600 dark:text-slate-300">
            <li>2 credits/mo</li>
            <li>Rollover to 6</li>
            <li>$77 extra credit</li>
            <li>Enhanced $9</li>
            <li>Priority email support</li>
          </ul>
          <button
            id="cta_start_core"
            aria-label="Start Core"
            className="btn-primary h-12 rounded-xl font-semibold mb-2"
            onClick={onStartCore}
          >
            Start Core
          </button>
        </div>
        {/* Family Card */}
        <div className="rounded-2xl p-6 shadow-lg bg-white dark:bg-[#141a21] border border-slate-200 dark:border-[#223043] flex flex-col">
          <h4 className="text-xl font-bold mb-2">Family</h4>
          <div className="text-2xl font-bold mb-2">
            {annual ? "$997/yr" : "$99/mo"}
          </div>
          <ul className="mb-4 text-slate-600 dark:text-slate-300">
            <li>5 credits/mo</li>
            <li>Rollover 15</li>
            <li>Unlimited child chat</li>
            <li>Unlimited Enhanced</li>
            <li>Multi-child; live chat</li>
          </ul>
          <button
            id="cta_start_family"
            aria-label="Start Family"
            className="btn-primary h-12 rounded-xl font-semibold mb-2"
            onClick={onStartFamily}
          >
            Start Family
          </button>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 mb-4">
        Instant results + instant PDF • AI stores no data
      </div>
      <button
        className="underline text-primary text-sm"
        onClick={onCompare}
        id="cta_compare_options"
        aria-label="Compare all options"
      >
        Compare all options
      </button>
    </section>
  );
}
