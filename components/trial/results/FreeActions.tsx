/**
 * Free Actions Component
 * "What to do before you buy" section with actionable steps
 */

export function FreeActions() {
  return (
    <section className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-4">What to do before you buy</h3>
      <ul className="space-y-3">
        <li className="flex gap-3">
          <span className="font-bold text-primary min-w-6">1.</span>
          <span className="text-sm text-foreground">
            Write down your top 2 concerns based on these results.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-bold text-primary min-w-6">2.</span>
          <span className="text-sm text-foreground">
            Ask your child's teacher these 3 questions tomorrow.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-bold text-primary min-w-6">3.</span>
          <span className="text-sm text-foreground">
            Plan a follow-up screening in ~30 days to check progress.
          </span>
        </li>
      </ul>
    </section>
  );
}
