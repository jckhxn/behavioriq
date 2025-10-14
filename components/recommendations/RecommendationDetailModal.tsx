"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  User,
  BarChart3,
  Target,
  ExternalLink,
  Star,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Bookmark,
} from "lucide-react";
import { format } from "date-fns";
import { DOMAIN_LABELS_SHORT } from "@/lib/constants/domains";
import { DOMAIN_LABELS } from "@/lib/constants/domains";
import { InteractiveText } from "@/lib/utils/linkParser";

interface RecommendationDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  isBookmarked: boolean;
  createdAt: string;
  assessment: {
    id: string;
    subjectName: string;
    completedAt: string;
    status: string;
    scores: Array<{
      domain: string;
      rawScore: number;
      totalPossible: number;
      riskLevel: string;
      confidence: number;
      questionsAnswered: number;
      wasTerminatedEarly: boolean;
    }>;
  };
}

interface RecommendationDetailModalProps {
  recommendationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkToggle?: (id: string, isBookmarked: boolean) => void;
}

export function RecommendationDetailModal({
  recommendationId,
  isOpen,
  onClose,
  onBookmarkToggle,
}: RecommendationDetailModalProps) {
  const [recommendation, setRecommendation] =
    useState<RecommendationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recommendationId && isOpen) {
      fetchRecommendationDetail(recommendationId);
    }
  }, [recommendationId, isOpen]);

  const fetchRecommendationDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/recommendations/${id}?includeAssessment=true`
      );
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error("Failed to fetch recommendation detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200";
      case "MODERATE":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "HIGH":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "VERY_HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return CheckCircle;
      case "MODERATE":
        return Target;
      case "HIGH":
      case "VERY_HIGH":
        return AlertTriangle;
      default:
        return Target;
    }
  };

  const getDomainDisplayName = (domain: string) => {
    // Defensive: handle null/undefined domain
    if (!domain) return "Unknown";
    if ((DOMAIN_LABELS_SHORT as any)[domain]) {
      return (DOMAIN_LABELS_SHORT as any)[domain];
    }
    const upperDomain = typeof domain === "string" ? domain.toUpperCase() : "";
    if (upperDomain && (DOMAIN_LABELS_SHORT as any)[upperDomain]) {
      return (DOMAIN_LABELS_SHORT as any)[upperDomain];
    }
    if ((DOMAIN_LABELS as any)[domain]) {
      return (DOMAIN_LABELS as any)[domain];
    }
    if (upperDomain && (DOMAIN_LABELS as any)[upperDomain]) {
      return (DOMAIN_LABELS as any)[upperDomain];
    }
    return domain || "Unknown";
  };

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const handleBookmarkToggle = async () => {
    if (!recommendation) return;

    try {
      const response = await fetch(
        `/api/recommendations/${recommendation.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBookmarked: !recommendation.isBookmarked }),
        }
      );

      if (response.ok) {
        setRecommendation((prev) =>
          prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null
        );
        onBookmarkToggle?.(recommendation.id, !recommendation.isBookmarked);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="text-xl font-semibold">
                Loading Recommendation...
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-muted-foreground">
                  Loading recommendation details...
                </p>
              </div>
            </div>
          </div>
        ) : recommendation ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header - Enhanced */}
            <DialogHeader className="px-8 py-6 border-b bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/10 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <DialogTitle className="text-2xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {recommendation.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {recommendation.assessment.subjectName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {format(
                          new Date(recommendation.createdAt),
                          "MMM dd, yyyy 'at' h:mm a"
                        )}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium"
                    >
                      {recommendation.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className="ml-2 h-10 w-10 rounded-full hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all"
                >
                  {recommendation.isBookmarked ? (
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 drop-shadow-sm" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  )}
                </Button>
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6 pb-8">
                  {/* Assessment Overview - Enhanced */}
                  <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-bold">Assessment Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                            Completed
                          </p>
                          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {format(
                              new Date(recommendation.assessment.completedAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                            Domains Assessed
                          </p>
                          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                            {recommendation.assessment.scores.length}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                            Total Questions
                          </p>
                          <p className="text-lg font-bold text-green-900 dark:text-green-100">
                            {recommendation.assessment.scores.reduce(
                              (sum, score) => sum + score.questionsAnswered,
                              0
                            )}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                            Priority Level
                          </p>
                          <Badge
                            className="mt-1 text-sm px-3 py-1"
                            variant={
                              recommendation.priority >= 4
                                ? "destructive"
                                : recommendation.priority >= 3
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {recommendation.priority >= 4
                              ? "🔴 High"
                              : recommendation.priority >= 3
                                ? "🟡 Medium"
                                : "🟢 Low"}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* Domain Scores - Enhanced */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          Domain Scores
                        </h4>
                        {recommendation.assessment.scores.map(
                          (score, index) => {
                            const Icon = getRiskIcon(score.riskLevel);
                            const percentage = getScorePercentage(
                              score.rawScore,
                              score.totalPossible
                            );

                            return (
                              <div
                                key={index}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium">
                                      {getDomainDisplayName(score.domain)}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getRiskLevelColor(score.riskLevel)}`}
                                    >
                                      {score.riskLevel.replace("_", " ")}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {score.rawScore}/{score.totalPossible} (
                                    {percentage}%)
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={percentage}
                                    className="flex-1 h-2"
                                  />
                                  <div className="text-xs text-muted-foreground min-w-0">
                                    {(score.confidence * 100).toFixed(0)}%
                                    confidence
                                  </div>
                                </div>
                                {score.wasTerminatedEarly && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600">
                                    <Clock className="h-3 w-3" />
                                    Assessment terminated early
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendation Content - Enhanced */}
                  <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-bold">
                          Detailed Recommendations
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-slate-900 dark:prose-strong:text-slate-100">
                        <InteractiveText
                          content={recommendation.content}
                          onSaveLink={async (
                            link: any,
                            assessmentId: string
                          ) => {
                            // Handle saving links as resources
                            console.log("Saving link:", { link, assessmentId });
                          }}
                          savedLinks={[]}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons - Enhanced */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all shadow-sm"
                      asChild
                    >
                      <a
                        href={`/assessment/${recommendation.assessment.id}`}
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        View Full Assessment
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onClose}
                      className="border-2 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm px-8"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="text-xl font-semibold">
                Error Loading Recommendation
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">
                Failed to load recommendation details
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
