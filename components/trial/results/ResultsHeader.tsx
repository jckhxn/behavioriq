/**
 * Results Header Component
 * Displays title, child info, and assessment date
 */

interface ResultsHeaderProps {
  childLabel: string;
  age: number;
  completedAt: string; // MM/DD/YYYY format
}

export function ResultsHeader({
  childLabel,
  age,
  completedAt,
}: ResultsHeaderProps) {
  return (
    <section aria-labelledby="results-title" className="mb-8">
      <h1
        id="results-title"
        className="text-3xl font-bold text-foreground mb-2"
      >
        Behavior Assessment Results
      </h1>
      <p className="text-sm text-muted-foreground mb-1">
        For: <span className="font-semibold">{childLabel}</span> • Age{' '}
        <span className="font-semibold">{age}</span> • Completed{' '}
        <span className="font-semibold">{completedAt}</span> • Status:{' '}
        <span className="font-semibold">Screening</span>
      </p>
      <p className="text-xs text-muted-foreground italic">
        Screening tool, not a diagnosis.
      </p>
    </section>
  );
}
