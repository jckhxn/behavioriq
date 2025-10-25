/**
 * Enhanced Lollipop Chart Component
 * Uses Recharts with custom styling for better visual appeal
 * Combines bar chart visual with lollipop/scatter plot markers
 */

'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import type { DomainScore } from '@/lib/api/trial';

interface EnhancedLollipopChartProps {
  domains: DomainScore[];
}

export function EnhancedLollipopChart({ domains }: EnhancedLollipopChartProps) {
  // Prepare data for Recharts
  const chartData = domains.map((domain) => ({
    name: domain.name,
    score: domain.score,
    screener: domain.screener,
    diagnostic: domain.diagnostic,
  }));

  const chartConfig = {
    score: {
      label: 'Score',
      color: 'hsl(217, 91%, 60%)', // blue-600
    },
    screener: {
      label: 'Screener Cutoff',
      color: 'hsl(38, 92%, 50%)', // amber-500
    },
    diagnostic: {
      label: 'Diagnostic Reference',
      color: 'hsl(0, 84%, 60%)', // red-500
    },
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[0]; value: number; name: string }>;
  }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-950 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
        <p className="font-semibold text-foreground text-sm">{data.name}</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Score: {data.score}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Screener: {data.screener}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          Diagnostic: {data.diagnostic}
        </p>
      </div>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <defs>
            {/* Gradient for the bar */}
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
              <stop offset="100%" stopColor="hsl(217, 91%, 40%)" />
            </linearGradient>
          </defs>

          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(0, 0%, 90%)"
            className="dark:stroke-slate-800"
            vertical={false}
          />

          {/* Reference Lines for Thresholds */}
          <ReferenceLine
            y={60}
            stroke="hsl(38, 92%, 50%)"
            strokeDasharray="5 5"
            label={{
              value: 'Screener (60)',
              position: 'insideTopRight',
              offset: -5,
              fill: 'hsl(38, 92%, 50%)',
              fontSize: 11,
            }}
          />
          <ReferenceLine
            y={75}
            stroke="hsl(0, 84%, 60%)"
            strokeDasharray="5 5"
            label={{
              value: 'Diagnostic (75)',
              position: 'insideTopRight',
              offset: -5,
              fill: 'hsl(0, 84%, 60%)',
              fontSize: 11,
            }}
          />

          {/* Axes */}
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
            tickFormatter={(name) => {
              // Shorten long names
              return name.length > 12 ? name.substring(0, 12) + '...' : name;
            }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />

          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Bar for the main score - represents the "stick" of the lollipop */}
          <Bar
            dataKey="score"
            fill="url(#scoreGradient)"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            shape={<CustomBarShape />}
          />

          {/* Line for visual enhancement - creates the lollipop aesthetic */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(217, 91%, 60%)"
            dot={{
              fill: 'hsl(217, 91%, 60%)',
              r: 6,
              strokeWidth: 2,
              stroke: 'white',
            }}
            activeDot={{
              fill: 'hsl(217, 91%, 40%)',
              r: 8,
              strokeWidth: 2,
              stroke: 'white',
            }}
            isAnimationActive={true}
            animationDuration={800}
            strokeWidth={0}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(217, 91%, 60%)' }} />
          <span>Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 rounded-full" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
          <span>Screener Cutoff</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 rounded-full" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
          <span>Diagnostic Ref</span>
        </div>
      </div>
    </ChartContainer>
  );
}

/**
 * Custom bar shape to create lollipop stick effect
 */
function CustomBarShape(props: any) {
  const { fill, x, y, width, height } = props;

  return (
    <g>
      {/* Thin vertical line (stick) */}
      <line
        x1={x + width / 2}
        y1={y + height}
        x2={x + width / 2}
        y2={y}
        stroke={fill}
        strokeWidth={2}
        opacity={0.6}
      />
      {/* Wider bar for visual weight */}
      <rect x={x} y={y} width={width} height={height} fill={fill} radius={4} />
    </g>
  );
}
