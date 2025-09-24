"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { TrendingUp } from "lucide-react";
import { DOMAIN_LABELS_SHORT, DOMAIN_ORDER } from "@/lib/constants/domains";

interface Score {
  domain: AssessmentDomain;
  rawScore: number;
  riskLevel: RiskLevel;
  totalPossible?: number;
}

interface AssessmentLineChartProps {
  assessmentId: string;
  className?: string;
  showTitle?: boolean;
  height?: number;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AssessmentLineChart({
  assessmentId,
  className = "",
  showTitle = true,
  height = 300,
}: AssessmentLineChartProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [assessmentId]);

  const loadScores = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/scores`);
      if (response.ok) {
        const data = await response.json();
        setScores(data.scores || []);
      }
    } catch (error) {
      console.error("Error loading scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for line chart, ensuring consistent domain order
  const chartData = DOMAIN_ORDER.map((domain) => {
    const score = scores.find((s) => s.domain === domain);
    return {
      domain: DOMAIN_LABELS_SHORT[domain],
      score: score ? score.rawScore : 0,
      percentage:
        score && score.totalPossible
          ? Math.round((score.rawScore / score.totalPossible) * 100)
          : 0,
    };
  }).filter((item) => {
    // Only include domains that have actual scores
    const hasScore = scores.some(
      (s) =>
        s.domain ===
        DOMAIN_ORDER.find((d) => DOMAIN_LABELS_SHORT[d] === item.domain)
    );
    return hasScore;
  });

  if (loading) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Assessment Results
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Assessment Results
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            No assessment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="domain"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: "Score", angle: -90, position: "insideLeft" }}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: any, name: string) => [
              `${value} points`,
              "Score",
            ]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            dot={{ r: 6, fill: "hsl(var(--chart-1))" }}
            activeDot={{ r: 8, fill: "hsl(var(--chart-1))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  if (!showTitle) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Assessment Results
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Score progression across assessment domains
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
