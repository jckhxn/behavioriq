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
    return (DOMAIN_LABELS_SHORT as any)[domain] || domain;
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
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-semibold leading-tight">
                    {recommendation.title}
                  </DialogTitle>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {recommendation.assessment.subjectName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(recommendation.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </div>
                    <Badge variant="secondary">{recommendation.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className="ml-4"
                >
                  {recommendation.isBookmarked ? (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6 pb-8">
                  {/* Assessment Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5" />
                        Assessment Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">
                            {format(
                              new Date(recommendation.assessment.completedAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Domains Assessed
                          </p>
                          <p className="font-medium">
                            {recommendation.assessment.scores.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Total Questions
                          </p>
                          <p className="font-medium">
                            {recommendation.assessment.scores.reduce(
                              (sum, score) => sum + score.questionsAnswered,
                              0
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Priority Level
                          </p>
                          <Badge
                            variant={
                              recommendation.priority >= 4
                                ? "destructive"
                                : recommendation.priority >= 3
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {recommendation.priority >= 4
                              ? "High"
                              : recommendation.priority >= 3
                                ? "Medium"
                                : "Low"}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* Domain Scores */}
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
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
                              <div key={index} className="space-y-2">
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

                  {/* Recommendation Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Detailed Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
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

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" asChild>
                      <a
                        href={`/assessment/${recommendation.assessment.id}`}
                        className="flex items-center gap-2"
                      >
                        View Full Assessment
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={onClose}>
                        Close
                      </Button>
                    </div>
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
