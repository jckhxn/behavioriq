import React, { useState } from "react";

const FAQS = [
  {
    id: "diagnosis",
    q: "Is this a diagnosis?",
    a: "No. We provide a comprehensive, school-ready summary to guide next steps. Always partner with your clinician for a formal diagnosis.",
  },
  {
    id: "data",
    q: "What happens to my data?",
    a: "AI stores no data. You control what’s saved, with Anonymous Mode available anytime.",
  },
  {
    id: "pdf",
    q: "How fast is the PDF? (Instant)",
    a: "Your PDF is generated instantly after upgrade — no waiting, no manual review.",
  },
  {
    id: "anonymous",
    q: "Can I be anonymous? (Yes)",
    a: "Yes. You can use Anonymous Mode for any assessment, and your data is never shared.",
  },
  {
    id: "teachers",
    q: "Can teachers use the PDF? (Yes, educator-ready)",
    a: "Yes. The PDF is designed for easy sharing with teachers, counselors, and school teams.",
  },
  {
    id: "help",
    q: "What if I need help? (Support + live chat for Family)",
    a: "Support is available for all users, with live chat for Family members.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="max-w-3xl mx-auto py-12 md:py-20">
      <h3 className="text-xl font-bold mb-6 text-center">
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {FAQS.map((faq) => (
          <details
            key={faq.id}
            open={open === faq.id}
            onClick={() => {
              setOpen(open === faq.id ? null : faq.id);
              (window as any)?.gtag?.("event", "faq.open", {
                question: faq.id,
              });
            }}
            className="rounded-xl border border-slate-200 dark:border-[#223043] bg-white dark:bg-[#141a21] p-4"
          >
            <summary className="font-semibold cursor-pointer">{faq.q}</summary>
            <div className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
