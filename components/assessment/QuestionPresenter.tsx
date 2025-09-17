"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { EARLY_DETECTION_SCREENER } from "@/lib/assessment/assessments";

interface QuestionPresenterProps {
  questionId: string;
  questionText: string;
  currentDomain: string;
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  };
  isLoading?: boolean;
  onAnswer: (questionId: string, response: boolean) => Promise<void>;
}

export function QuestionPresenter({
  questionId,
  questionText,
  currentDomain,
  progress,
  isLoading = false,
  onAnswer,
}: QuestionPresenterProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (response: boolean) => {
    if (isLoading || isSubmitting) return;

    setSelectedAnswer(response);
    setIsSubmitting(true);

    try {
      await onAnswer(questionId, response);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // Reset on error
      setSelectedAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find domain configuration from our Early Detection Screener
  const domainConfig = EARLY_DETECTION_SCREENER.find(
    (domain) => domain.name === currentDomain
  ) || {
    name: currentDomain,
    displayName: currentDomain,
    totalPossibleScore: 0,
    clinicallySignificantScore: 0,
    questions: [],
  };

  const progressPercentage = Math.round(progress.overallProgress);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Assessment Progress</CardTitle>
              <p className="text-sm text-muted-foreground">
                {progress.answeredQuestions} of {progress.totalQuestions}{" "}
                questions completed
              </p>
            </div>
            <Badge variant="outline">{progressPercentage}% Complete</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Domains completed: {progress.completedDomains}/3</span>
            <span>Current: {domainConfig.displayName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Domain */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{domainConfig.displayName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {domainConfig.totalPossibleScore} total questions,{" "}
            {domainConfig.clinicallySignificantScore} needed for clinical
            significance
          </p>
        </CardHeader>
      </Card>

      {/* Question */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {questionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedAnswer === true ? "default" : "outline"}
                size="lg"
                className="h-16 text-lg flex items-center justify-center space-x-2"
                onClick={() => handleAnswer(true)}
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting && selectedAnswer === true ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Yes</span>
                  </>
                )}
              </Button>

              <Button
                variant={selectedAnswer === false ? "default" : "outline"}
                size="lg"
                className="h-16 text-lg flex items-center justify-center space-x-2"
                onClick={() => handleAnswer(false)}
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting && selectedAnswer === false ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span>No</span>
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>
                Please answer honestly. Select "Yes" if this applies to you, or
                "No" if it doesn't.
              </p>
              <p className="mt-1">
                Your responses help us provide the most accurate assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading next question...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface AssessmentCompleteProps {
  totalQuestions: number;
  answeredQuestions: number;
  completedDomains: number;
  onViewResults?: () => void;
}

export function AssessmentComplete({
  totalQuestions,
  answeredQuestions,
  completedDomains,
  onViewResults,
}: AssessmentCompleteProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          <p className="text-muted-foreground">
            Thank you for completing the behavioral assessment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">
                {answeredQuestions}
              </p>
              <p className="text-sm text-muted-foreground">
                Questions Answered
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {completedDomains}
              </p>
              <p className="text-sm text-muted-foreground">Domains Assessed</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Your responses have been analyzed across all behavioral domains.
              Results are now available in your dashboard.
            </p>

            {onViewResults && (
              <Button onClick={onViewResults} size="lg" className="w-full">
                View Assessment Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DomainSkippedProps {
  domainName: string;
  reason: string;
  onContinue: () => void;
}

export function DomainSkipped({
  domainName,
  reason,
  onContinue,
}: DomainSkippedProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Badge variant="secondary">{domainName}</Badge>
          <span>Section Skipped</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{reason}</p>
        <p className="text-sm text-muted-foreground">
          This helps make the assessment more efficient by focusing on areas
          most relevant to your responses.
        </p>
        <Button onClick={onContinue} className="w-full">
          Continue to Next Section
        </Button>
      </CardContent>
    </Card>
  );
}
