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
import { DOMAIN_LABELS_SHORT, RISK_COLORS } from "@/lib/constants/domains";
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

interface GA4Data {
  error?: string;
  views: number;
  sessions: number;
  users: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  events: Array<{ name: string; count: number }>;
  topPages: Array<{ pagePath: string; views: number; avgDuration: number }>;
  deviceBreakdown: Array<{
    deviceCategory: string;
    sessions: number;
    percentage: number;
  }>;
  dates: Array<{
    date: string;
    views: number;
    sessions: number;
    users: number;
  }>;
}

interface MetaData {
  error?: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  roas: number;
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
  deviceBreakdown: Array<{
    deviceType: string;
    impressions: number;
    clicks: number;
    spend: number;
    percentage: number;
  }>;
  dates: Array<{
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

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
  const [ga4Data, setGA4Data] = useState<GA4Data | null>(null);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [adminRes, ga4Res, metaRes] = await Promise.all([
        fetch(`/api/admin/analytics?days=${timeRange}`),
        fetch(`/api/analytics/ga4`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: parseInt(timeRange) }),
        }),
        fetch(`/api/analytics/meta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ days: parseInt(timeRange) }),
        }),
      ]);

      if (adminRes.ok) {
        const analyticsData = await adminRes.json();
        setData(analyticsData);
      }

      if (ga4Res.ok) {
        const ga4Json = await ga4Res.json();
        setGA4Data(ga4Json);
      }

      if (metaRes.ok) {
        const metaJson = await metaRes.json();
        setMetaData(metaJson);
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
        DOMAIN_LABELS_SHORT[d.domain],
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

  // Check if we have any data to display
  const hasSystemData = !!data;
  const hasGA4Data = ga4Data && !ga4Data.error;
  const hasMetaData = metaData && !metaData.error;

  // If nothing loaded, show error
  if (!hasSystemData && !hasGA4Data && !hasMetaData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
        <Button onClick={loadAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const domainChartData = data
    ? data.avgScoresByDomain.map((d) => ({
        domain: DOMAIN_LABELS_SHORT[d.domain],
        avgScore: Number(d.avgScore.toFixed(1)),
        percentage: Math.round((d.avgScore / d.totalPossible) * 100),
        count: d.assessmentCount,
      }))
    : [];

  const riskChartData = data
    ? data.riskDistribution.map((r) => ({
        name: r.riskLevel,
        value: r.count,
        color: RISK_COLORS[r.riskLevel].chart,
      }))
    : [];

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

      {/* Key Metrics - Show only if system data loaded */}
      {hasSystemData && data && (
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
      )}

      {/* Charts */}
      <Tabs defaultValue={hasSystemData ? "domains" : "ga4"} className="w-full">
        <TabsList className={`grid w-full ${hasSystemData ? "grid-cols-5" : "grid-cols-2"}`}>
          {hasSystemData && (
            <>
              <TabsTrigger value="domains">Domain Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk Distribution</TabsTrigger>
              <TabsTrigger value="trends">Assessment Trends</TabsTrigger>
            </>
          )}
          <TabsTrigger value="ga4">GA4 Analytics</TabsTrigger>
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
        </TabsList>

        {hasSystemData && (
          <>
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
          </>
        )}

        {hasSystemData && (
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
                    <AreaChart data={data?.assessmentTrends || []}>
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
        )}

        <TabsContent value="ga4" className="space-y-4">
          {!ga4Data || ga4Data.error ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  GA4 Analytics not configured. Please add GA4 credentials to your environment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ga4Data.views.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ga4Data.sessions.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ga4Data.users.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ga4Data.sessionDuration.toFixed(0)}s</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{ga4Data.bounceRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic by Device</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Session distribution by device type
                  </p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ga4Data.deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ deviceCategory, percentage }) =>
                            `${deviceCategory}: ${percentage.toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="sessions"
                        >
                          {ga4Data.deviceBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "hsl(var(--chart-1))",
                                  "hsl(var(--chart-2))",
                                  "hsl(var(--chart-3))",
                                ][index % 3]
                              }
                            />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {ga4Data.dates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Over Time</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Daily views and sessions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ga4Data.dates}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="sessions"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          {!metaData || metaData.error ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Meta Ads Analytics not configured. Please add Meta credentials to your environment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metaData.impressions.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metaData.clicks.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CTR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metaData.ctr.toFixed(2)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Spend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(metaData.spend / 100).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ROAS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metaData.roas.toFixed(2)}x</div>
                  </CardContent>
                </Card>
              </div>

              {metaData.campaigns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Campaigns</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Performance by campaign
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metaData.campaigns.map((campaign) => (
                        <div
                          key={campaign.campaignId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{campaign.campaignName}</p>
                            <p className="text-xs text-muted-foreground">
                              {campaign.impressions.toLocaleString()} imp •{" "}
                              {campaign.clicks.toLocaleString()} clicks •{" "}
                              ${(campaign.spend / 100).toFixed(2)} spend
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{campaign.conversions}</p>
                            <p className="text-xs text-muted-foreground">conversions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPC</span>
                      <span className="font-semibold">${metaData.cpc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPM</span>
                      <span className="font-semibold">${metaData.cpm.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Spend</span>
                      <span className="font-semibold">${(metaData.spend / 100).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversions</span>
                      <span className="font-semibold">{metaData.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conv. Rate</span>
                      <span className="font-semibold">{metaData.conversionRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROAS</span>
                      <span className="font-semibold">{metaData.roas.toFixed(2)}x</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
