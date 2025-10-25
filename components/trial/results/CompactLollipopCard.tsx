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
  const barHeight = size === 'sm' ? 100 : size === 'lg' ? 160 : 140;
  const barWidth = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const containerWidth = size === 'sm' ? 60 : size === 'lg' ? 100 : 80;

  // Calculate proportions from bottom
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

      {/* Main chart container */}
      <div className="relative flex justify-center" style={{ width: `${containerWidth}px` }}>
        {/* Scale background with grid lines */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-between opacity-5 pointer-events-none"
          style={{ height: `${barHeight}px`, width: '100%' }}
        >
          <div className="h-px bg-slate-400 w-full" />
          <div className="h-px bg-slate-400 w-full" />
          <div className="h-px bg-slate-400 w-full" />
          <div className="h-px bg-slate-400 w-full" />
          <div className="h-px bg-slate-400 w-full" />
        </div>

        {/* Diagnostic reference line - thicker, more visible */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none"
          style={{
            bottom: `${diagnosticPercent}%`,
            width: `${containerWidth * 0.9}px`,
          }}
        >
          <div className="h-0.5 flex-1 bg-red-500 opacity-60" />
          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold whitespace-nowrap">
            ◉ {domain.diagnostic}
          </span>
        </div>

        {/* Screener cutoff line - thicker, more visible */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none"
          style={{
            bottom: `${screenerPercent}%`,
            width: `${containerWidth * 0.9}px`,
          }}
        >
          <div className="h-0.5 flex-1 bg-amber-500 opacity-60" />
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
            ⊙ {domain.screener}
          </span>
        </div>

        {/* Chart content area */}
        <div
          className="relative flex flex-col items-center justify-end"
          style={{ height: `${barHeight}px`, width: `${barWidth}px` }}
        >
          {/* Thin stick/stem line */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-400 opacity-30"
            style={{ height: `${scorePercent}%` }}
          />

          {/* Main bar with gradient - the visual representation */}
          <div
            className={cn(
              'rounded-t-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110',
              `bg-gradient-to-t ${getScoreColor(domain.score)}`
            )}
            style={{
              height: `${scorePercent}%`,
              width: `100%`,
            }}
          />

          {/* Lollipop circle at top */}
          <div
            className={cn(
              'rounded-full shadow-lg border-2 border-white dark:border-slate-950 -mt-2 transition-all duration-300 hover:scale-125 hover:-mt-3',
              domain.score >= domain.diagnostic
                ? 'bg-red-600 shadow-red-500/60'
                : domain.score >= domain.screener
                  ? 'bg-amber-600 shadow-amber-500/60'
                  : 'bg-blue-600 shadow-blue-500/60'
            )}
            style={{
              width: `${barWidth + 8}px`,
              height: `${barWidth + 8}px`,
            }}
          />

          {/* Bottom baseline */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-slate-400 opacity-40" />
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
