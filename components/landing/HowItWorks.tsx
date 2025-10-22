import React from "react";

export function HowItWorks() {
  return (
    <section className="max-w-3xl mx-auto py-12 md:py-16">
      <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-primary/10 p-4">
            <span role="img" aria-label="Questions">
              📝
            </span>
          </div>
          <h3 className="font-semibold mb-1">Answer 10 questions (parent)</h3>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-primary/10 p-4">
            <span role="img" aria-label="Snapshot">
              ⚡
            </span>
          </div>
          <h3 className="font-semibold mb-1">
            See your instant snapshot (on screen)
          </h3>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full bg-primary/10 p-4">
            <span role="img" aria-label="PDF">
              📄
            </span>
          </div>
          <h3 className="font-semibold mb-1">
            Unlock full report + instant PDF (if needed)
          </h3>
        </div>
      </div>
      <p className="text-xs text-center text-slate-400 mt-4">
        Optional child conversation for $9; full transcript included.
      </p>
    </section>
  );
}
