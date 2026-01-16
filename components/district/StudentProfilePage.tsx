"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  Loader2,
  FileText,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  User,
  School,
  AlertTriangle,
  Clock,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DOMAIN_LABELS_SHORT, DOMAIN_ORDER } from "@/lib/constants/domains";
import { AssessmentDomain } from "@prisma/client";

interface StudentProfilePageProps {
  studentId: string;
  user: {
    id: string;
    role: string;
  };
  backUrl?: string;
}

interface Assessment {
  id: string;
  assessmentId: string;
  isTrial: boolean;
  trialCompletedAt: string | null;
  fullCompletedAt: string | null;
  reviewedAt: string | null;
  flaggedDomains: string[];
  createdAt: string;
  assessment: {
    id: string;
    status: string;
    completedAt: string | null;
    startedAt: string | null;
    scores: Array<{
      id: string;
      domain: string;
      rawScore: number;
      totalPossible: number;
      riskLevel: string;
    }>;
  };
}

interface StudentData {
  id: string;
  anonymousId: string;
  firstName: string | null;
  lastName: string | null;
  gradeLevel: string | null;
  birthDate: string | null;
  consentGiven: boolean;
  isAnonymous: boolean;
  createdAt: string;
  school: { id: string; name: string } | null;
  classrooms: Array<{
    classroom: {
      id: string;
      name: string;
    };
  }>;
  assessments: Assessment[];
  recommendations: Array<{
    id: string;
    summary: string;
    schoolStrategies: string[];
    classroomAccommodations: string[];
    parentNextSteps: string[];
    referralGuidance: string | null;
    generatedAt: string;
  }>;
}

const riskColors: Record<string, string> = {
  LOW: "text-green-600 bg-green-100 dark:bg-green-900/30",
  MODERATE: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  HIGH: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  VERY_HIGH: "text-red-600 bg-red-100 dark:bg-red-900/30",
  ELEVATED: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
};

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function StudentProfilePage({
  studentId,
  user,
  backUrl = "/district",
}: StudentProfilePageProps) {
  const router = useRouter();
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  async function loadStudentData() {
    setLoading(true);
    setError(null);
    try {
      console.log("[StudentProfilePage] Fetching student:", studentId);
      const res = await fetch(`/api/district/students/${studentId}`);
      if (res.ok) {
        const responseData = await res.json();
        // API returns { student, recommendations }
        // Merge recommendations into student data if they exist
        const studentData = responseData.student || responseData;
        if (
          responseData.recommendations &&
          !studentData.recommendations?.length
        ) {
          studentData.recommendations = [responseData.recommendations];
        }
        
        // Parse JSON fields in recommendations
        if (studentData.recommendations) {
          studentData.recommendations = studentData.recommendations.map((rec: any) => ({
            ...rec,
            schoolStrategies: typeof rec.schoolStrategies === 'string' 
              ? JSON.parse(rec.schoolStrategies) 
              : rec.schoolStrategies,
            classroomAccommodations: typeof rec.classroomAccommodations === 'string'
              ? JSON.parse(rec.classroomAccommodations)
              : rec.classroomAccommodations,
            parentNextSteps: typeof rec.parentNextSteps === 'string'
              ? JSON.parse(rec.parentNextSteps)
              : rec.parentNextSteps,
          }));
        }
        
        console.log("[StudentProfilePage] Data loaded:", studentData);
        setData(studentData);
      } else {
        const errorData = await res.json();
        console.error("[StudentProfilePage] API error:", res.status, errorData);
        setError(errorData.error || "Failed to load student data");
      }
    } catch (err) {
      console.error("[StudentProfilePage] Error loading student:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  }

  // Calculate metrics from assessments
  const metrics = useMemo(() => {
    if (!data?.assessments?.length) return null;

    const completedAssessments = data.assessments.filter(
      (a) => a.assessment?.status === "COMPLETED"
    );

    if (completedAssessments.length === 0) return null;

    const latestAssessment = completedAssessments[0];
    const previousAssessment = completedAssessments[1] || null;

    // Calculate overall risk from latest assessment
    let overallRisk = "LOW";
    let maxScore = 0;
    const latestScores = latestAssessment.assessment?.scores || [];

    latestScores.forEach((score) => {
      const percentage = (score.rawScore / score.totalPossible) * 100;
      if (percentage > maxScore) maxScore = percentage;
    });

    if (maxScore >= 90) overallRisk = "VERY_HIGH";
    else if (maxScore >= 80) overallRisk = "HIGH";
    else if (maxScore >= 70) overallRisk = "MODERATE";

    // Calculate trend (improvement or decline)
    let trend: "improving" | "declining" | "stable" = "stable";
    if (previousAssessment) {
      const prevScores = previousAssessment.assessment?.scores || [];
      const prevAvg =
        prevScores.reduce(
          (sum, s) => sum + (s.rawScore / s.totalPossible) * 100,
          0
        ) / (prevScores.length || 1);
      const currAvg =
        latestScores.reduce(
          (sum, s) => sum + (s.rawScore / s.totalPossible) * 100,
          0
        ) / (latestScores.length || 1);

      if (currAvg < prevAvg - 5) trend = "improving";
      else if (currAvg > prevAvg + 5) trend = "declining";
    }

    // Count flagged domains
    const flaggedDomains = latestScores.filter((s) =>
      ["HIGH", "VERY_HIGH", "ELEVATED"].includes(s.riskLevel)
    );

    return {
      totalAssessments: completedAssessments.length,
      latestAssessment,
      previousAssessment,
      overallRisk,
      trend,
      flaggedDomainsCount: flaggedDomains.length,
      maxScore,
    };
  }, [data]);

  // Prepare chart data for progress over time
  const progressChartData = useMemo(() => {
    if (!data?.assessments?.length) return [];

    return data.assessments
      .filter((a) => a.assessment?.status === "COMPLETED")
      .reverse()
      .map((assessment, index) => {
        const scores = assessment.assessment?.scores || [];
        const avgScore =
          scores.reduce(
            (sum, s) => sum + (s.rawScore / s.totalPossible) * 100,
            0
          ) / (scores.length || 1);

        return {
          date: assessment.assessment?.completedAt
            ? format(new Date(assessment.assessment.completedAt), "MMM d")
            : `Assessment ${index + 1}`,
          score: Math.round(avgScore),
          assessment: index + 1,
        };
      });
  }, [data]);

  // Prepare radar chart data for domain comparison
  const radarChartData = useMemo(() => {
    if (!metrics?.latestAssessment) return [];

    const latestScores = metrics.latestAssessment.assessment?.scores || [];

    return DOMAIN_ORDER.map((domain) => {
      const score = latestScores.find((s) => s.domain === domain);
      const percentage = score
        ? Math.round((score.rawScore / score.totalPossible) * 100)
        : 0;

      return {
        domain: DOMAIN_LABELS_SHORT[domain] || domain,
        current: percentage,
        threshold: 70, // Risk threshold
      };
    }).filter((d) => d.current > 0);
  }, [metrics]);

  // Domain comparison bar chart data
  const domainBarData = useMemo(() => {
    if (!metrics?.latestAssessment) return [];

    const latestScores = metrics.latestAssessment.assessment?.scores || [];
    const previousScores = metrics.previousAssessment?.assessment?.scores || [];

    return DOMAIN_ORDER.map((domain) => {
      const currentScore = latestScores.find((s) => s.domain === domain);
      const previousScore = previousScores.find((s) => s.domain === domain);

      return {
        domain: DOMAIN_LABELS_SHORT[domain] || domain,
        current: currentScore
          ? Math.round(
              (currentScore.rawScore / currentScore.totalPossible) * 100
            )
          : 0,
        previous: previousScore
          ? Math.round(
              (previousScore.rawScore / previousScore.totalPossible) * 100
            )
          : 0,
        riskLevel: currentScore?.riskLevel || "LOW",
      };
    }).filter((d) => d.current > 0);
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading student {studentId}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {error || "Student not found"}
          </p>
          <Link href={backUrl}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const displayName = data.isAnonymous
    ? data.anonymousId
    : data.firstName && data.lastName
      ? `${data.firstName} ${data.lastName}`
      : data.anonymousId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {metrics && (
                <Badge className={riskColors[metrics.overallRisk]}>
                  {metrics.overallRisk.replace("_", " ")} Risk
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {data.gradeLevel && `Grade ${data.gradeLevel}`}
              {data.gradeLevel && data.school && " • "}
              {data.school?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assessments</p>
                  <p className="text-2xl font-bold">
                    {metrics.totalAssessments}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Flagged Areas</p>
                  <p className="text-2xl font-bold">
                    {metrics.flaggedDomainsCount}
                  </p>
                </div>
                <AlertTriangle
                  className={`h-8 w-8 ${metrics.flaggedDomainsCount > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peak Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(metrics.maxScore)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className="text-2xl font-bold capitalize">
                    {metrics.trend}
                  </p>
                </div>
                {metrics.trend === "improving" ? (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                ) : metrics.trend === "declining" ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : (
                  <Minus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-mono font-medium">{data.anonymousId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade Level</p>
                    <p className="font-medium">
                      {data.gradeLevel || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium">
                      {data.school?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consent</p>
                    <Badge
                      variant="outline"
                      className={
                        data.consentGiven ? "text-green-600" : "text-yellow-600"
                      }
                    >
                      {data.consentGiven ? "Given" : "Pending"}
                    </Badge>
                  </div>
                </div>
                {data.classrooms.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Classrooms
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.classrooms.map((c) => (
                        <Badge key={c.classroom.id} variant="secondary">
                          {c.classroom.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Domain Radar Chart */}
            {radarChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Domain Overview
                  </CardTitle>
                  <CardDescription>
                    Latest assessment scores by domain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px]">
                    <RadarChart data={radarChartData}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fontSize: 12 }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="current"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.5}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.assessments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No assessments completed yet
                </p>
              ) : (
                <div className="space-y-4">
                  {data.assessments.slice(0, 3).map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            assessment.assessment?.status === "COMPLETED"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-yellow-100 dark:bg-yellow-900/30"
                          }`}
                        >
                          <FileText
                            className={`h-5 w-5 ${
                              assessment.assessment?.status === "COMPLETED"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {assessment.isTrial
                              ? "Trial Assessment"
                              : "Full Assessment"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assessment.assessment?.completedAt
                              ? format(
                                  new Date(assessment.assessment.completedAt),
                                  "MMM d, yyyy"
                                )
                              : "In Progress"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            assessment.assessment?.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assessment.assessment?.status || "Unknown"}
                        </Badge>
                        {assessment.flaggedDomains.length > 0 && (
                          <Badge variant="destructive">
                            {assessment.flaggedDomains.length} flagged
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                All assessments completed for this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.assessments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assessments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.assessments.map((assessment, index) => {
                    const scores = assessment.assessment?.scores || [];
                    const avgScore =
                      scores.length > 0
                        ? Math.round(
                            scores.reduce(
                              (sum, s) =>
                                sum + (s.rawScore / s.totalPossible) * 100,
                              0
                            ) / scores.length
                          )
                        : 0;

                    return (
                      <Card
                        key={assessment.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  Assessment #{data.assessments.length - index}
                                </h4>
                                <Badge
                                  variant={
                                    assessment.isTrial ? "secondary" : "default"
                                  }
                                >
                                  {assessment.isTrial ? "Trial" : "Full"}
                                </Badge>
                                <Badge
                                  variant={
                                    assessment.assessment?.status ===
                                    "COMPLETED"
                                      ? "outline"
                                      : "secondary"
                                  }
                                >
                                  {assessment.assessment?.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {assessment.assessment?.completedAt
                                  ? `Completed ${format(new Date(assessment.assessment.completedAt), "MMMM d, yyyy 'at' h:mm a")}`
                                  : `Started ${format(new Date(assessment.createdAt), "MMMM d, yyyy")}`}
                              </p>
                            </div>

                            {assessment.assessment?.status === "COMPLETED" && (
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">
                                    Average Score
                                  </p>
                                  <p className="text-xl font-bold">
                                    {avgScore}%
                                  </p>
                                </div>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Domain scores preview */}
                          {scores.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm font-medium mb-3">
                                Domain Scores
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {scores.map((score) => {
                                  const percentage = Math.round(
                                    (score.rawScore / score.totalPossible) * 100
                                  );
                                  return (
                                    <div
                                      key={score.id}
                                      className="p-2 bg-muted rounded-lg text-center"
                                    >
                                      <p className="text-xs text-muted-foreground truncate">
                                        {DOMAIN_LABELS_SHORT[
                                          score.domain as AssessmentDomain
                                        ] || score.domain}
                                      </p>
                                      <p
                                        className={`text-lg font-bold ${
                                          percentage >= 80
                                            ? "text-red-600"
                                            : percentage >= 70
                                              ? "text-orange-600"
                                              : "text-green-600"
                                        }`}
                                      >
                                        {percentage}%
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {progressChartData.length < 2 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  At least 2 completed assessments are needed to show progress
                  trends
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Progress Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress Over Time
                  </CardTitle>
                  <CardDescription>
                    Average assessment scores across all completed assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={progressChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Domain Comparison */}
              {domainBarData.length > 0 && metrics?.previousAssessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Domain Comparison
                    </CardTitle>
                    <CardDescription>
                      Current vs previous assessment scores by domain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <BarChart data={domainBarData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="domain"
                          tick={{ fontSize: 12 }}
                          width={80}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="previous"
                          fill="hsl(var(--chart-2))"
                          name="Previous"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="current"
                          fill="hsl(var(--chart-1))"
                          name="Current"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[hsl(var(--chart-2))]" />
                        <span className="text-muted-foreground">Previous</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[hsl(var(--chart-1))]" />
                        <span className="text-muted-foreground">Current</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {data.recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No AI recommendations generated yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete a full assessment to receive personalized
                  recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            data.recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <CardTitle>AI Recommendations</CardTitle>
                  </div>
                  <CardDescription>
                    Generated on{" "}
                    {format(new Date(rec.generatedAt), "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.summary}
                    </p>
                  </div>

                  <Separator />

                  {/* School Strategies */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <School className="h-4 w-4" />
                      School Strategies
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {(rec.schoolStrategies as string[]).map((strategy, i) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Classroom Accommodations */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Classroom Accommodations
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {(rec.classroomAccommodations as string[]).map(
                        (acc, i) => (
                          <li key={i}>{acc}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Parent Next Steps */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Parent/Guardian Next Steps
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {(rec.parentNextSteps as string[]).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Referral Guidance */}
                  {rec.referralGuidance && (
                    <>
                      <Separator />
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                          Referral Guidance
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {rec.referralGuidance}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          {/* Disclaimer */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Disclaimer:</strong> These recommendations are
              AI-generated and for guidance only. They do not constitute a
              diagnosis. All decisions should be made by qualified professionals
              in consultation with the student's support team and family.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
