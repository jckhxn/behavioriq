/**
 * Risk Summary Component
 * Displays elevated domain chips and key takeaway
 */

import { Badge } from '@/components/ui/badge';

interface RiskSummaryProps {
  flags: string[];
}

export function RiskSummary({ flags }: RiskSummaryProps) {
  const displayedFlags = flags.slice(0, 3);
  const remainingCount = Math.max(0, flags.length - 3);

  // Create summary text mentioning all elevated domains
  const getSummaryText = () => {
    if (flags.length === 0) return 'some areas';
    if (flags.length === 1) return flags[0];
    if (flags.length === 2) return `${flags[0]} and ${flags[1]}`;
    return `${flags.slice(0, -1).join(', ')}, and ${flags[flags.length - 1]}`;
  };

  const summaryText = getSummaryText();

  return (
    <section className="mb-8">
      {/* Domain chips - show up to 3, aggregate the rest */}
      {flags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {displayedFlags.map((flag) => (
            <Badge
              key={flag}
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              {flag}: Elevated
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              +{remainingCount} more
            </Badge>
          )}
        </div>
      )}

      {/* Key takeaway - mentions all elevated domains */}
      <p className="text-sm text-foreground mb-2">
        Based on your screening,{' '}
        <span className="font-semibold">{summaryText} {flags.length !== 1 ? 'show' : 'shows'} elevated indicators</span>
        . Consider next steps.
      </p>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground italic">
        Screening ≠ diagnosis. Use to guide next steps.
      </p>
    </section>
  );
}
