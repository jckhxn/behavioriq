/**
 * Results Charts Component
 * Displays domain scores as vertical bar charts with inline legend
 */

import { type DomainScore } from '@/lib/api/trial';

interface ResultsChartsProps {
  domains: DomainScore[];
  subdomains: DomainScore[];
}

export function ResultsCharts({ domains, subdomains }: ResultsChartsProps) {
  return (
    <section className="mb-8">
      {/* Overall Domains */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Overall Domains</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {domains.map((domain) => (
            <DomainChart key={domain.name} domain={domain} />
          ))}
        </div>
      </div>

      {/* Specific Areas */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4">Specific Areas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {subdomains.map((subdomain) => (
            <DomainChart key={subdomain.name} domain={subdomain} />
          ))}
        </div>
      </div>

      {/* Inline Legend */}
      <div className="text-xs text-muted-foreground mt-6 pt-4 border-t">
        <p>
          ● Individual Score • ⊙ Screener Cutoff • ◉ Diagnostic Reference
        </p>
      </div>
    </section>
  );
}

/**
 * Individual domain chart (vertical bar + reference lines)
 */
function DomainChart({ domain }: { domain: DomainScore }) {
  const maxScore = 100;

  return (
    <div className="flex flex-col items-center">
      {/* Score number at top */}
      <div className="text-center mb-2">
        <p className="text-sm font-bold text-foreground">{domain.score}</p>
        <p className="text-xs text-muted-foreground">/100</p>
      </div>

      {/* Visual bar container */}
      <div className="w-full flex flex-col items-center mb-2">
        <div
          className="w-8 bg-blue-500 rounded-t mb-1"
          style={{ height: `${(domain.score / maxScore) * 120}px` }}
          role="img"
          aria-label={`${domain.name}: ${domain.score} out of 100`}
        />

        {/* Reference lines container */}
        <div className="w-full h-24 relative border-l border-r border-gray-200 text-xs text-muted-foreground flex flex-col justify-between py-1">
          {/* Diagnostic reference line (top) */}
          <div className="flex items-center justify-center h-px bg-red-300 relative -top-1">
            <span className="text-[10px] absolute -top-3 right-0">
              ◉ {domain.diagnostic}
            </span>
          </div>

          {/* Screener cutoff line (middle) */}
          <div className="flex items-center justify-center h-px bg-orange-300 relative">
            <span className="text-[10px] absolute -top-3 right-0">
              ⊙ {domain.screener}
            </span>
          </div>

          {/* Zero line (bottom) */}
          <div className="flex items-center justify-center h-px bg-gray-300 relative -bottom-1" />
        </div>
      </div>

      {/* Domain name */}
      <p className="text-xs font-medium text-center text-foreground mt-2">
        {domain.name}
      </p>

      {/* Accessibility text summary */}
      <p className="sr-only">
        {domain.name}: Individual score {domain.score}; Screener cutoff{' '}
        {domain.screener}; Diagnostic reference {domain.diagnostic}
      </p>
    </div>
  );
}
