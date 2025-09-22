"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AreaChart,
  Area,
} from "recharts";
import { AssessmentDomain, RiskLevel } from "@prisma/client";
import {
  Download,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface AdminAnalyticsData {
  totalAssessments: number;
  completedAssessments: number;
  activeUsers: number;
  avgScoresByDomain: Array<{
    domain: AssessmentDomain;
    avgScore: number;
    totalPossible: number;
    assessmentCount: number;
  }>;
  riskDistribution: Array<{
    riskLevel: RiskLevel;
    count: number;
  }>;
  assessmentTrends: Array<{
    date: string;
    assessments: number;
    completed: number;
  }>;
}

const DOMAIN_LABELS = {
  [AssessmentDomain.ANTISOCIAL]: "Antisocial Behavior",
  [AssessmentDomain.VIOLENCE]: "Violence Risk",
  [AssessmentDomain.ATTENTION]: "Attention Issues",
  [AssessmentDomain.EMOTIONAL]: "Emotional Regulation",
  [AssessmentDomain.CONDUCT]: "Conduct Problems",
};

const RISK_COLORS = {
  [RiskLevel.LOW]: "#10b981",
  [RiskLevel.MODERATE]: "#f59e0b",
  [RiskLevel.HIGH]: "#ef4444",
  [RiskLevel.VERY_HIGH]: "#dc2626",
};

const chartConfig = {
  assessments: {
    label: "Assessments",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  avgScore: {
    label: "Average Score",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function AdminAnalytics() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!data) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Total Assessments", data.totalAssessments],
      ["Completed Assessments", data.completedAssessments],
      ["Active Users", data.activeUsers],
      [""],
      ["Domain", "Avg Score", "Total Possible", "Assessment Count"],
      ...data.avgScoresByDomain.map((d) => [
        DOMAIN_LABELS[d.domain],
        d.avgScore.toFixed(2),
        d.totalPossible,
        d.assessmentCount,
      ]),
      [""],
      ["Risk Level", "Count"],
      ...data.riskDistribution.map((r) => [r.riskLevel, r.count]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Analytics</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
        <Button onClick={loadAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const domainChartData = data.avgScoresByDomain.map((d) => ({
    domain: DOMAIN_LABELS[d.domain],
    avgScore: Number(d.avgScore.toFixed(1)),
    percentage: Math.round((d.avgScore / d.totalPossible) * 100),
    count: d.assessmentCount,
  }));

  const riskChartData = data.riskDistribution.map((r) => ({
    name: r.riskLevel,
    value: r.count,
    color: RISK_COLORS[r.riskLevel],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">System Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive assessment system insights and trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {data.completedAssessments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalAssessments > 0
                ? Math.round(
                    (data.completedAssessments / data.totalAssessments) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Assessment completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Cases
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.riskDistribution
                .filter(
                  (r) =>
                    r.riskLevel === RiskLevel.HIGH ||
                    r.riskLevel === RiskLevel.VERY_HIGH
                )
                .reduce((sum, r) => sum + r.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="domains" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="domains">Domain Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Distribution</TabsTrigger>
          <TabsTrigger value="trends">Assessment Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Scores by Domain</CardTitle>
              <p className="text-sm text-muted-foreground">
                Performance across assessment domains
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={domainChartData}>
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
                        name === "avgScore" ? `${value} pts` : `${value}%`,
                        name === "avgScore" ? "Avg Score" : "Percentage",
                      ]}
                    />
                    <Bar
                      dataKey="avgScore"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of risk levels across all assessments
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
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

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assessment volume and completion trends over time
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.assessmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="assessments"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="2"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
