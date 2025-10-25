/**
 * Compact Lollipop Card Component
 * Single domain display with enhanced visual design
 * Combines mini bar chart with reference line indicators
 */

'use client';

import type { DomainScore } from '@/lib/api/trial';
import { cn } from '@/lib/utils';

interface CompactLollipopCardProps {
  domain: DomainScore;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function CompactLollipopCard({
  domain,
  size = 'md',
  showLabels = true,
}: CompactLollipopCardProps) {
  const maxScore = 100;
  const barHeight = size === 'sm' ? 80 : size === 'lg' ? 140 : 120;
  const barWidth = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;

  // Calculate proportions
  const scorePercent = (domain.score / maxScore) * 100;
  const screenerPercent = (domain.screener / maxScore) * 100;
  const diagnosticPercent = (domain.diagnostic / maxScore) * 100;

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= domain.diagnostic) return 'from-red-600 to-red-500';
    if (score >= domain.screener) return 'from-amber-600 to-amber-500';
    return 'from-blue-600 to-blue-500';
  };

  const sizeClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex flex-col items-center ${sizeClasses[size]}`}>
      {/* Score display */}
      <div className="text-center">
        <p className={`font-bold text-foreground ${textSizes[size]}`}>
          {domain.score}
        </p>
        <p className="text-[10px] text-muted-foreground">/100</p>
      </div>

      {/* Main chart area */}
      <div className="relative flex flex-col items-center">
        {/* Reference line container with scale markers */}
        <div
          className="relative flex flex-col justify-between items-center"
          style={{ height: `${barHeight}px`, width: `${barWidth}px` }}
        >
          {/* Background scale grid */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
            <div className="h-px bg-slate-400 w-full" />
            <div className="h-px bg-slate-400 w-full" />
            <div className="h-px bg-slate-400 w-full" />
            <div className="h-px bg-slate-400 w-full" />
            <div className="h-px bg-slate-400 w-full" />
          </div>

          {/* Diagnostic reference line */}
          <div
            className="absolute w-full h-px bg-red-400 flex items-center justify-end pr-1"
            style={{ bottom: `${diagnosticPercent}%` }}
          >
            <div className="text-[8px] text-red-600 dark:text-red-400 font-semibold whitespace-nowrap ml-1">
              ◉
            </div>
          </div>

          {/* Screener cutoff line */}
          <div
            className="absolute w-full h-px bg-amber-400 flex items-center justify-end pr-1"
            style={{ bottom: `${screenerPercent}%` }}
          >
            <div className="text-[8px] text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap ml-1">
              ⊙
            </div>
          </div>

          {/* Main score bar with gradient */}
          <div className="absolute bottom-0 flex flex-col items-center w-full">
            {/* Thin stick line */}
            <div
              className="w-px bg-slate-400 opacity-40"
              style={{ height: `${(domain.score / maxScore) * barHeight}px` }}
            />

            {/* Main bar with gradient */}
            <div
              className={cn(
                'rounded-t-lg shadow-md transition-all duration-300 hover:shadow-lg',
                `bg-gradient-to-t ${getScoreColor(domain.score)}`
              )}
              style={{
                height: `${(domain.score / maxScore) * barHeight}px`,
                width: `${barWidth}px`,
              }}
            />

            {/* Lollipop circle at top */}
            <div
              className={cn(
                'rounded-full shadow-md border-2 border-white dark:border-slate-900 -mt-2 transition-all duration-300 hover:scale-125',
                domain.score >= domain.diagnostic
                  ? 'bg-red-600 shadow-red-500/50'
                  : domain.score >= domain.screener
                    ? 'bg-amber-600 shadow-amber-500/50'
                    : 'bg-blue-600 shadow-blue-500/50'
              )}
              style={{
                width: `${barWidth + 6}px`,
                height: `${barWidth + 6}px`,
              }}
            />
          </div>

          {/* Bottom axis line */}
          <div className="absolute bottom-0 w-full h-px bg-slate-400 opacity-30" />
        </div>
      </div>

      {/* Domain name */}
      {showLabels && (
        <p className={`font-medium text-center text-foreground ${textSizes[size]}`}>
          {domain.name}
        </p>
      )}

      {/* Accessibility text */}
      <p className="sr-only">
        {domain.name}: Individual score {domain.score}; Screener cutoff {domain.screener};
        Diagnostic reference {domain.diagnostic}
      </p>
    </div>
  );
}

/**
 * Lollipop grid layout for multiple domains
 */
interface LollipopGridProps {
  domains: DomainScore[];
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LollipopGrid({
  domains,
  columns = 4,
  size = 'md',
}: LollipopGridProps) {
  return (
    <div
      className="gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${size === 'sm' ? '60px' : size === 'lg' ? '100px' : '80px'}, 1fr))`,
      }}
    >
      {domains.map((domain) => (
        <div key={domain.name} className="flex justify-center">
          <CompactLollipopCard domain={domain} size={size} />
        </div>
      ))}
    </div>
  );
}
