"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { AssessmentChat } from "@/components/chat/AssessmentChat";
import { ConversationalAssessment } from "@/components/assessment/ConversationalAssessment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  startedAt: string;
  completedAt?: string;
  isConversational?: boolean;
  assessmentTemplateId?: string | null;
  scores?: Array<{
    domain: string;
    rawScore: number;
    totalPossible: number;
    riskLevel: string;
    timestamp?: string;
    domainDisplayName?: string;
  }>;
}

interface AssessmentDetailSidebarProps {
  assessmentId: string;
  onClose: () => void;
}

export function AssessmentDetailSidebar({
  assessmentId,
  onClose,
}: AssessmentDetailSidebarProps) {
  const { user } = useUser();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !assessmentId) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Assessment not found");
          } else {
            setError("Failed to load assessment");
          }
          return;
        }
        const data = await response.json();
        setAssessment(data);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, user]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "VERY_HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Assessment Details</div>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Assessment Details</div>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="text-destructive mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Assessment Details</div>
          <div className="flex items-center gap-2">
            {assessment.status === "COMPLETED" && (
              <Link href={`/assessment/${assessmentId}/results`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Results
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content with independent scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Assessment Info */}
        <div className="p-4 space-y-4 border-b bg-muted/30 flex-shrink-0">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">{assessment.subjectName}</h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge
                className={`${
                  assessment.status === "COMPLETED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {assessment.status === "COMPLETED" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </>
                )}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Started {new Date(assessment.startedAt).toLocaleDateString()}
              </div>
              {assessment.completedAt && (
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed{" "}
                  {new Date(assessment.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Score Summary */}
          {assessment.scores && assessment.scores.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Domain Scores</h3>
              <div className="space-y-1">
                {assessment.scores.map((score, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium">
                      {score.domainDisplayName || score.domain}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        {score.rawScore}/{score.totalPossible}
                      </span>
                      <Badge
                        className={`text-xs ${getRiskLevelColor(score.riskLevel)}`}
                      >
                        {score.riskLevel.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {assessment.isConversational ? (
            assessment.status === "COMPLETED" ? (
              // Completed conversational - show link to full results
              <div className="flex items-center justify-center h-full p-6">
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <ExternalLink className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Conversational Assessment Complete
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        View the full results with domain scores and recommendations.
                      </p>
                      <Link href={`/assessment/${assessmentId}/results`}>
                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Full Results
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // In-progress conversational - show chat interface
              <div className="h-full">
                <ConversationalAssessment
                  onComplete={() => {
                    // Refresh assessment data to show completed state
                    window.location.reload();
                  }}
                  isTrial={false}
                  assessmentId={assessmentId}
                  assessmentTemplateId={
                    assessment.assessmentTemplateId || undefined
                  }
                  subjectName={assessment.subjectName}
                />
              </div>
            )
          ) : (
            <AssessmentChat assessmentId={assessmentId} />
          )}
        </div>
      </div>
    </div>
  );
}
