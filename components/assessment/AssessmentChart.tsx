"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DomainScore } from "@/lib/assessment/scoring";

interface AssessmentChartProps {
  domainScores: DomainScore[];
}

export function AssessmentChart({ domainScores }: AssessmentChartProps) {
  const chartData = domainScores.map((score) => ({
    domain: score.displayName,
    score: score.score,
    totalPossible: score.totalPossible,
    percentage: score.percentage,
    isClinicallySignificant: score.isClinicallySignificant,
    skipped: score.skipped,
  }));

  const getBarColor = (isClinicallySignificant: boolean, skipped: boolean) => {
    if (skipped) return "#9CA3AF"; // Gray
    if (isClinicallySignificant) return "#EF4444"; // Red
    return "#10B981"; // Green
  };

  return (
    <div className="w-full h-96 p-4">
      <h3 className="text-lg font-semibold mb-4">
        Assessment Results by Domain
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="domain"
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value}/${
                props.payload.totalPossible
              } (${props.payload.percentage.toFixed(1)}%)`,
              "Score",
            ]}
            labelFormatter={(label) => `Domain: ${label}`}
          />
          <Bar dataKey="score" name="Score">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.isClinicallySignificant, entry.skipped)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Within Normal Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Clinically Significant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Skipped</span>
        </div>
      </div>
    </div>
  );
}
