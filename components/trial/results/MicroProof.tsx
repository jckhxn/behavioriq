/**
 * Micro Proof Component
 * Social proof: testimonials + outcome stat
 */

import { Quote } from 'lucide-react';

export function MicroProof() {
  return (
    <section className="mb-8 py-6 border-t border-b border-slate-200 dark:border-slate-800">
      <div className="space-y-4">
        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Quote className="w-4 h-4 text-primary mb-2" />
            <p className="text-sm text-foreground italic mb-2">
              "The teacher used the 1-pager the next day."
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Parent of 10-year-old
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Quote className="w-4 h-4 text-primary mb-2" />
            <p className="text-sm text-foreground italic mb-2">
              "We knew exactly what to ask for in the meeting."
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Parent of 8-year-old
            </p>
          </div>
        </div>

        {/* Outcome stat */}
        <p className="text-xs text-muted-foreground text-center">
          Parents reported fewer classroom incidents within 3 weeks.
        </p>
      </div>
    </section>
  );
}
