/**
 * Results Charts Component
 * Displays domain scores as lollipop charts with reference lines
 */

'use client';

import { useState } from 'react';
import { type DomainScore } from '@/lib/api/trial';
import { trackTelemetry } from '@/lib/utils/telemetry';
import { CompactLollipopCard } from './CompactLollipopCard';

interface ResultsChartsProps {
  domains: DomainScore[];
  subdomains: DomainScore[];
  trialId?: string;
  sessionId?: string;
}

export function ResultsCharts({
  domains,
  subdomains,
  trialId = '',
  sessionId = '',
}: ResultsChartsProps) {
  const [expandedSubdomains, setExpandedSubdomains] = useState(false);

  const elevatedCount = subdomains.filter(s => s.score >= 70).length;

  const handleExpandSubdomains = () => {
    setExpandedSubdomains(!expandedSubdomains);
    trackTelemetry('trial.expand_subdomains', {
      trialId,
      sessionId,
      expanded: !expandedSubdomains,
    });
  };

  return (
    <section className="mb-8">
      {/* Overall Domains */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Overall Domains</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {domains.map((domain) => (
            <CompactLollipopCard key={domain.name} domain={domain} size="md" />
          ))}
        </div>
      </div>

      {/* Specific Areas - Collapsible */}
      <details
        className="mb-4 group"
        onToggle={handleExpandSubdomains}
      >
        <summary className="cursor-pointer">
          <h2 className="text-lg font-semibold inline">Specific Areas</h2>
          <span className="text-sm text-muted-foreground ml-2">
            {elevatedCount > 0 && `${elevatedCount} items elevated • `}
            tap to expand
          </span>
        </summary>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {subdomains.map((subdomain) => (
            <CompactLollipopCard key={subdomain.name} domain={subdomain} size="md" />
          ))}
        </div>
      </details>

      {/* Inline Legend */}
      <div className="text-xs text-muted-foreground mt-6 pt-4 border-t">
        <p>
          ● Individual Score • ⊙ Screener Cutoff • ◉ Diagnostic Reference
        </p>
      </div>
    </section>
  );
}

