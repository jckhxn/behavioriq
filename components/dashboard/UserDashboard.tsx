"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/use-supabase-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Plus,
  FileText,
  Calendar,
  Brain,
  TrendingUp,
  Users,
  Target,
  Trash2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DOMAIN_LABELS } from "@/lib/constants/domains";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Assessment {
  id: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  startedAt: string;
  completedAt?: string;
  scores?: Array<{
    domain: string;
    rawScore: number;
    totalPossible: number;
    riskLevel: string;
  }>;
}

export function UserDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (response.ok) {
        const data = await response.json();
        setAssessments(data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedCount = () =>
    assessments.filter((a) => a.status === "COMPLETED").length;
  const getInProgressCount = () =>
    assessments.filter(
      (a) => a.status === "IN_PROGRESS" || a.status === "ABANDONED"
    ).length;
  const getAverageScore = () => {
    const completed = assessments.filter(
      (a) => a.status === "COMPLETED" && a.scores
    );
    if (completed.length === 0) return 0;

    const totalScore = completed.reduce((sum, assessment) => {
      const avgScore =
        assessment.scores!.reduce(
          (scoreSum, score) => scoreSum + score.rawScore / score.totalPossible,
          0
        ) / assessment.scores!.length;
      return sum + avgScore;
    }, 0);

    return Math.round((totalScore / completed.length) * 100);
  };

  const toggleAssessmentSelection = (assessmentId: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(assessmentId)
        ? prev.filter((id) => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const selectAllAssessments = () => {
    if (selectedAssessments.length === assessments.length) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(assessments.map((a) => a.id));
    }
  };

  const toggleExpanded = (assessmentId: string) => {
    setExpandedAssessments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assessmentId)) {
        newSet.delete(assessmentId);
      } else {
        newSet.add(assessmentId);
      }
      return newSet;
    });
  };

  const deleteSelectedAssessments = async () => {
    if (selectedAssessments.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedAssessments.length} assessment${selectedAssessments.length > 1 ? "s" : ""}? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);

    try {
      // Delete each assessment
      const deletePromises = selectedAssessments.map((id) =>
        fetch(`/api/assessments/${id}`, { method: "DELETE" })
      );

      const results = await Promise.all(deletePromises);
      const successful = results.filter((r) => r.ok).length;

      if (successful === selectedAssessments.length) {
        // Refresh the list
        await fetchAssessments();
        setSelectedAssessments([]);
        setShowBulkActions(false);
      } else {
        alert(
          `Successfully deleted ${successful} of ${selectedAssessments.length} assessments. Please refresh and try again for any remaining items.`
        );
      }
    } catch (error) {
      console.error("Error deleting assessments:", error);
      alert("Failed to delete assessments. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getChartData = () => {
    const completed = assessments
      .filter((a) => a.status === "COMPLETED" && a.completedAt && a.scores)
      .sort(
        (a, b) =>
          new Date(a.completedAt!).getTime() -
          new Date(b.completedAt!).getTime()
      )
      .slice(-6); // Last 6 assessments for the chart

    return completed.map((assessment) => {
      const avgScore =
        assessment.scores!.reduce(
          (sum, score) => sum + (score.rawScore / score.totalPossible) * 100,
          0
        ) / assessment.scores!.length;

      return {
        name:
          assessment.subjectName.length > 10
            ? assessment.subjectName.substring(0, 10) + "..."
            : assessment.subjectName,
        score: Math.round(avgScore),
        date: format(new Date(assessment.completedAt!), "MMM dd"),
      };
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/assessment/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              All time assessments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletedCount()}</div>
            <p className="text-xs text-muted-foreground">
              Finished assessments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getInProgressCount()}</div>
            <p className="text-xs text-muted-foreground">Active assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageScore()}%</div>
            <p className="text-xs text-muted-foreground">
              Across all completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Management */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Assessments</CardTitle>
            <div className="flex items-center space-x-2">
              {selectedAssessments.length > 0 ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedAssessments.length} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedAssessments}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Selected
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAssessments([]);
                      setShowBulkActions(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  {showBulkActions ? "Exit Select" : "Select Multiple"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Brain className="mx-auto h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Welcome to AI Diagnostic
                  </h3>
                  <p className="text-muted-foreground">
                    Get started by creating your first behavioral assessment.
                  </p>
                </div>
                <Link href="/assessment/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Assessment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Select All Option */}
                {showBulkActions && assessments.length > 0 && (
                  <div className="flex items-center space-x-2 p-2 border-b border-border/50">
                    <Checkbox
                      checked={
                        selectedAssessments.length === assessments.length
                      }
                      onCheckedChange={selectAllAssessments}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">
                      Select All ({assessments.length})
                    </span>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="group border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          {/* Checkbox for bulk selection */}
                          {showBulkActions && (
                            <Checkbox
                              checked={selectedAssessments.includes(
                                assessment.id
                              )}
                              onCheckedChange={() =>
                                toggleAssessmentSelection(assessment.id)
                              }
                              className="mr-2"
                            />
                          )}

                          <Link
                            href={`/assessment/${assessment.id}`}
                            className="flex-1 min-w-0"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none truncate">
                                  {assessment.subjectName}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span>
                                    {format(
                                      new Date(assessment.startedAt),
                                      "MMM dd, yyyy"
                                    )}
                                  </span>
                                  {assessment.completedAt && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Completed{" "}
                                        {format(
                                          new Date(assessment.completedAt),
                                          "MMM dd"
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    assessment.status === "COMPLETED"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {assessment.status === "COMPLETED"
                                    ? "Complete"
                                    : "In Progress"}
                                </Badge>
                                {assessment.scores &&
                                  assessment.scores.length > 0 && (
                                    <span className="hidden sm:inline text-xs text-muted-foreground">
                                      {assessment.scores.length} domains
                                    </span>
                                  )}
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="flex items-center space-x-1">
                          {assessment.scores &&
                            assessment.scores.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => toggleExpanded(assessment.id)}
                              >
                                {expandedAssessments.has(assessment.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          {!showBulkActions && (
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Domain Scores */}
                      {expandedAssessments.has(assessment.id) &&
                        assessment.scores &&
                        assessment.scores.length > 0 && (
                          <div className="border-t border-border/50 bg-muted/30 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Domain Scores
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {assessment.scores.map((score, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-background rounded border border-border/50"
                                >
                                  <span className="text-xs font-medium capitalize truncate flex-1">
                                    {(DOMAIN_LABELS as any)[score.domain] ||
                                      score.domain}
                                  </span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs font-medium whitespace-nowrap">
                                      {score.rawScore}/{score.totalPossible}
                                    </span>
                                    <Badge
                                      variant={
                                        score.riskLevel === "LOW"
                                          ? "default"
                                          : score.riskLevel === "MODERATE"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {score.riskLevel}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Score Trends
            </CardTitle>
            <CardDescription>Recent assessment scores</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : getChartData().length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mb-2" />
                <p className="text-sm">No completed assessments yet</p>
                <p className="text-xs">Complete assessments to see trends</p>
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-2 shadow-md">
                              <p className="font-medium text-sm">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {label}
                              </p>
                              <p className="text-sm">
                                Score:{" "}
                                <span className="font-medium">
                                  {data.score}%
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      activeDot={{
                        r: 4,
                        stroke: "hsl(var(--primary))",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex-1 justify-start"
                asChild
              >
                <Link href="/assessments">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Assessments
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 justify-start"
                asChild
              >
                <Link href="/settings">
                  <Users className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
