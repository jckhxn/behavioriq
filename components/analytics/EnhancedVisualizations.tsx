"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";
import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { DOMAIN_LABELS_SHORT, RISK_COLORS } from "@/lib/constants/domains";
import {
  Download,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface Score {
  domain: AssessmentDomain;
  rawScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  timestamp: Date;
  totalPossible?: number;
  questionsAnswered?: number;
}

interface EnhancedVisualizationsProps {
  assessmentId: string;
  subjectName?: string;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
  confidence: {
    label: "Confidence",
    color: "hsl(var(--chart-2))",
  },
  risk: {
    label: "Risk Level",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function EnhancedVisualizations({
  assessmentId,
  subjectName,
}: EnhancedVisualizationsProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [assessmentId]);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/scores`);
      if (response.ok) {
        const data = await response.json();
        setScores(data.scores || []);
        setMessageCount(data.messageCount || 0);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for different chart types
  const barChartData = scores.map((score) => ({
    domain: DOMAIN_LABELS_SHORT[score.domain],
    score: score.rawScore,
    maxScore: score.totalPossible || 10,
    percentage: score.totalPossible
      ? Math.round((score.rawScore / score.totalPossible) * 100)
      : 0,
    confidence: Math.round(score.confidence * 100),
    riskLevel: score.riskLevel,
    color: RISK_COLORS[score.riskLevel].chart,
  }));

  const pieChartData = scores.map((score) => ({
    name: DOMAIN_LABELS_SHORT[score.domain],
    value: score.rawScore,
    color: RISK_COLORS[score.riskLevel].chart,
  }));

  const radarChartData = [
    {
      domain: "Overall Profile",
      ...Object.fromEntries(
        scores.map((score) => [
          DOMAIN_LABELS_SHORT[score.domain].replace(" ", ""),
          score.totalPossible
            ? Math.round((score.rawScore / score.totalPossible) * 100)
            : 0,
        ])
      ),
    },
  ];

  const confidenceData = scores.map((score) => ({
    domain: DOMAIN_LABELS_SHORT[score.domain],
    confidence: Math.round(score.confidence * 100),
    score: score.rawScore,
  }));

  const exportData = () => {
    const csvContent = [
      [
        "Domain",
        "Raw Score",
        "Total Possible",
        "Percentage",
        "Risk Level",
        "Confidence",
      ],
      ...scores.map((score) => [
        DOMAIN_LABELS_SHORT[score.domain],
        score.rawScore,
        score.totalPossible || "N/A",
        score.totalPossible
          ? Math.round((score.rawScore / score.totalPossible) * 100) + "%"
          : "N/A",
        score.riskLevel,
        Math.round(score.confidence * 100) + "%",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-${assessmentId}-data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Loading Analytics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Assessment Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No assessment data available yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete some assessment questions to see visualizations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Assessment Analytics
              </CardTitle>
              {subjectName && (
                <p className="text-sm text-muted-foreground mt-1">
                  Subject: {subjectName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{messageCount} Responses</Badge>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chart Tabs */}
      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="radar" className="flex items-center gap-2">
            <RadarIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="confidence" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Confidence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Scores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Raw scores by assessment domain with risk level indicators
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="domain"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => [
                        name === "score" ? `${value} points` : `${value}%`,
                        name === "score" ? "Score" : "Percentage",
                      ]}
                    />
                    <Bar
                      dataKey="score"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Relative distribution of scores across domains
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Profile</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overall profile showing percentage scores across all domains
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {Object.keys(radarChartData[0] || {})
                      .filter((key) => key !== "domain")
                      .map((key, index) => (
                        <Radar
                          key={key}
                          name={key}
                          dataKey={key}
                          stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                          fillOpacity={0.3}
                        />
                      ))}
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assessment confidence levels by domain
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="score"
                      name="Score"
                      label={{
                        value: "Raw Score",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      dataKey="confidence"
                      name="Confidence"
                      label={{
                        value: "Confidence %",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: any, name: string) => [
                        name === "score" ? `${value} points` : `${value}%`,
                        name === "score" ? "Score" : "Confidence",
                      ]}
                    />
                    <Scatter dataKey="confidence" fill="hsl(var(--chart-1))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scores.length > 0
                ? (
                    scores.reduce((sum, score) => sum + score.rawScore, 0) /
                    scores.length
                  ).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {scores.length} domain{scores.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Domains
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                scores.filter(
                  (s) =>
                    s.riskLevel === RiskLevel.HIGH ||
                    s.riskLevel === RiskLevel.VERY_HIGH
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scores.length > 0
                ? Math.round(
                    (scores.reduce((sum, score) => sum + score.confidence, 0) /
                      scores.length) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Assessment reliability
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
