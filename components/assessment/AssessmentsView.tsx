"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Calendar,
  Search,
  Download,
  Eye,
  Play,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { AssessmentDomain } from "@prisma/client";

interface Assessment {
  id: string;
  shortId?: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
  scores?: Array<{
    domain: string;
    rawScore: number;
    totalPossible: number;
    riskLevel: string;
    timestamp?: string;
    domainDisplayName?: string;
  }>;
}

export function AssessmentsView() {
  const { data: session } = useSession();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "COMPLETED" | "IN_PROGRESS"
  >("ALL");

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    let filtered = assessments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((assessment) =>
        assessment.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (assessment) => assessment.status === filterStatus
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, filterStatus]);

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

  const generatePDF = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/pdf`, {
        method: "POST",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assessment-${assessmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "very_high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getOverallRiskLevel = (scores: Assessment["scores"]) => {
    if (!scores || scores.length === 0) return null;

    const riskLevels = scores.map((s) => s.riskLevel.toLowerCase());
    if (riskLevels.includes("very_high")) return "Very High";
    if (riskLevels.includes("high")) return "High";
    if (riskLevels.includes("moderate")) return "Moderate";
    return "Low";
  };

  const getCompletedCount = () =>
    assessments.filter((a) => a.status === "COMPLETED").length;

  const getInProgressCount = () =>
    assessments.filter((a) => a.status === "IN_PROGRESS").length;

  const getAverageScore = () => {
    const completed = assessments.filter(
      (a) => a.status === "COMPLETED" && a.scores
    );
    if (completed.length === 0) return 0;

    const totalScore = completed.reduce((sum, assessment) => {
      if (!assessment.scores) return sum;
      const avgScore =
        assessment.scores.reduce(
          (scoreSum, score) => scoreSum + score.rawScore / score.totalPossible,
          0
        ) / assessment.scores.length;
      return sum + avgScore;
    }, 0);

    return Math.round((totalScore / completed.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
          <p className="text-muted-foreground">
            Manage and view your assessment history
          </p>
        </div>
        <Link href="/assessment/new">
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed / In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCompletedCount()} / {getInProgressCount()}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageScore()}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "ALL" ? "default" : "outline"}
                onClick={() => setFilterStatus("ALL")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                onClick={() => setFilterStatus("COMPLETED")}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === "IN_PROGRESS" ? "default" : "outline"}
                onClick={() => setFilterStatus("IN_PROGRESS")}
                size="sm"
              >
                In Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">
                {assessments.length === 0
                  ? "No assessments yet"
                  : "No matching assessments"}
              </h3>
              <p className="mt-1 text-muted-foreground">
                {assessments.length === 0
                  ? "Get started by creating your first assessment."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {assessments.length === 0 && (
                <Link href="/">
                  <Button className="mt-4">Create Assessment</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {assessment.subjectName}
                      </h3>
                      {assessment.shortId && (
                        <Badge variant="outline" className="text-xs">
                          {assessment.shortId}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          assessment.status === "COMPLETED"
                            ? "default"
                            : "secondary"
                        }
                        className="flex items-center gap-1"
                      >
                        {assessment.status === "COMPLETED" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {assessment.status === "COMPLETED"
                          ? "Complete"
                          : "In Progress"}
                      </Badge>
                      {assessment.status === "COMPLETED" &&
                        assessment.scores && (
                          <Badge
                            className={getRiskLevelColor(
                              getOverallRiskLevel(assessment.scores) || ""
                            )}
                          >
                            {getOverallRiskLevel(assessment.scores)} Risk
                          </Badge>
                        )}
                    </div>

                    <div className="text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started:{" "}
                          {format(
                            new Date(assessment.startedAt),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        {assessment.completedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Completed:{" "}
                            {format(
                              new Date(assessment.completedAt),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {assessment.scores && assessment.scores.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(() => {
                          // Deduplicate scores by domain, keeping the latest score per domain
                          const latestScoresByDomain: Record<string, any> = {};
                          assessment.scores.forEach((score) => {
                            if (
                              !latestScoresByDomain[score.domain] ||
                              new Date(score.timestamp || 0) >
                                new Date(
                                  latestScoresByDomain[score.domain]
                                    .timestamp || 0
                                )
                            ) {
                              latestScoresByDomain[score.domain] = score;
                            }
                          });

                          return Object.values(latestScoresByDomain).map(
                            (score, index) => (
                              <Badge
                                key={`${assessment.id}-${score.domain}-latest`}
                                variant="outline"
                                className="text-xs"
                              >
                                {score.domainDisplayName || score.domain}:{" "}
                                {score.rawScore}/{score.totalPossible}
                              </Badge>
                            )
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {assessment.status === "IN_PROGRESS" ? (
                      <Link href={`/assessment/${assessment.id}`}>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href={`/assessment/${assessment.id}/results`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePDF(assessment.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
