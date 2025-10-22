import React from "react";

export function ProofTrust() {
  return (
    <section className="max-w-4xl mx-auto py-12 md:py-20">
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">
          What families and experts say
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <blockquote className="rounded-xl bg-slate-100 dark:bg-[#223043] p-4 min-w-[220px] text-sm italic">
            “We got answers in minutes, not months.”
          </blockquote>
          <blockquote className="rounded-xl bg-slate-100 dark:bg-[#223043] p-4 min-w-[220px] text-sm italic">
            “The PDF was ready for our IEP meeting the same day.”
          </blockquote>
          <blockquote className="rounded-xl bg-slate-100 dark:bg-[#223043] p-4 min-w-[220px] text-sm italic">
            “Finally, something that respects our privacy.”
          </blockquote>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>As referenced by</span>
        <a
          href="https://www.cdc.gov/childrensmentalhealth/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          CDC
        </a>
        <a
          href="https://www.mayoclinic.org/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mayo Clinic
        </a>
        <a
          href="https://www.apa.org/"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          APA
        </a>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-[#223043] bg-slate-50 dark:bg-[#141a21] p-4 text-xs text-slate-600 dark:text-slate-300">
        Designed to support FERPA/HIPAA. No data is stored by the AI; app stores
        minimal metadata or can be fully anonymous. Encryption in transit & at
        rest. DPA available.
      </div>
    </section>
  );
}
