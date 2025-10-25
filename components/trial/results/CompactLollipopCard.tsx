/**
 * Compact Lollipop Card Component
 * T-Score based vertical lollipop chart (20-80 scale)
 * Shows individual score vs screener and diagnostic thresholds
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
  // T-Score scale: 20-80
  const MIN_T_SCORE = 20;
  const MAX_T_SCORE = 80;
  const T_SCORE_RANGE = MAX_T_SCORE - MIN_T_SCORE; // 60 points

  const barHeight = size === 'sm' ? 140 : size === 'lg' ? 200 : 180;
  const barWidth = size === 'sm' ? 20 : size === 'lg' ? 32 : 28;
  const containerWidth = size === 'sm' ? 70 : size === 'lg' ? 110 : 90;

  // Convert scores to T-Score scale (domain data is on 0-100, convert to 20-80 T-score)
  const convertToTScore = (score: number): number => {
    // Assuming domain scores are on 0-100 scale, map to 20-80 T-score
    // 0 -> 20, 100 -> 80
    return MIN_T_SCORE + (score / 100) * T_SCORE_RANGE;
  };

  const tScore = convertToTScore(domain.score);
  const screenerTScore = convertToTScore(domain.screener);
  const diagnosticTScore = convertToTScore(domain.diagnostic);

  // Calculate percentage positions from bottom (0% = T20, 100% = T80)
  const getPercentFromBottom = (tScore: number): number => {
    return ((tScore - MIN_T_SCORE) / T_SCORE_RANGE) * 100;
  };

  const scorePercent = getPercentFromBottom(tScore);
  const screenerPercent = getPercentFromBottom(screenerTScore);
  const diagnosticPercent = getPercentFromBottom(diagnosticTScore);

  // Color based on T-score position relative to thresholds
  const getScoreColor = (tScore: number) => {
    if (tScore >= diagnosticTScore) return 'bg-red-500';
    if (tScore >= screenerTScore) return 'bg-amber-500';
    return 'bg-blue-500';
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

  // T-Score axis marks (every 10 points: 20, 30, 40, 50, 60, 70, 80)
  const tScoreMarks = [20, 30, 40, 50, 60, 70, 80];

  return (
    <div className={`flex flex-col items-center ${sizeClasses[size]}`}>
      {/* Main chart container with axis */}
      <div className="relative flex gap-2" style={{ height: `${barHeight}px` }}>
        {/* Y-Axis labels (T-Score marks) */}
        <div
          className="relative flex flex-col justify-between items-end pr-2"
          style={{ height: `${barHeight}px`, width: '40px' }}
        >
          {tScoreMarks.reverse().map((tScore) => (
            <div
              key={tScore}
              className="text-[9px] text-muted-foreground font-semibold h-0 flex items-center"
              style={{ lineHeight: '1' }}
            >
              {tScore}
            </div>
          ))}
        </div>

        {/* Chart content area */}
        <div
          className="relative flex flex-col items-center justify-end"
          style={{ height: `${barHeight}px`, width: `${barWidth}px` }}
        >
          {/* Grid lines for marked increments (every 10 T-score points) */}
          {tScoreMarks.map((tScore) => {
            const percent = getPercentFromBottom(tScore);
            return (
              <div
                key={`grid-${tScore}`}
                className="absolute left-0 right-0 h-px bg-slate-300 dark:bg-slate-700 opacity-20"
                style={{ bottom: `${percent}%` }}
              />
            );
          })}

          {/* Diagnostic reference line (DX cutoff) - Pink/Magenta */}
          <div
            className="absolute left-0 right-0 h-1 bg-pink-500 opacity-70 rounded-sm"
            style={{ bottom: `${diagnosticPercent}%` }}
          />

          {/* Screener cutoff line - Orange/Tan */}
          <div
            className="absolute left-0 right-0 h-1 bg-orange-400 opacity-70 rounded-sm"
            style={{ bottom: `${screenerPercent}%` }}
          />

          {/* Thin vertical line (stem of lollipop) */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-400 opacity-40"
            style={{ height: `${scorePercent}%` }}
          />

          {/* Bar/stick section */}
          <div
            className={cn(
              'absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-300',
              getScoreColor(tScore)
            )}
            style={{
              height: `${scorePercent}%`,
              width: `${barWidth}px`,
              borderRadius: '4px 4px 0 0',
            }}
          />

          {/* Lollipop circle (individual score indicator) - Gray */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-400 dark:bg-slate-500 shadow-lg border-2 border-white dark:border-slate-950 transition-all duration-300 hover:scale-125 z-10"
            style={{
              bottom: `${scorePercent}%`,
              width: `${barWidth + 10}px`,
              height: `${barWidth + 10}px`,
              transform: 'translate(-50%, 50%)',
            }}
          />

          {/* Bottom baseline (T-Score 20) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-500 opacity-50 rounded-sm" />
        </div>
      </div>

      {/* Domain name - displayed below the chart */}
      {showLabels && (
        <p className={`font-semibold text-center text-foreground mt-2 w-full ${textSizes[size]}`}>
          {domain.name}
        </p>
      )}

      {/* Accessibility text */}
      <p className="sr-only">
        {domain.name}: T-Score {tScore.toFixed(1)}; Screener threshold T{screenerTScore.toFixed(1)};
        Diagnostic threshold T{diagnosticTScore.toFixed(1)}
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
