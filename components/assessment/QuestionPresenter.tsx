"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import {
  loadAssessmentConfigsClient,
  QuestionSetConfig,
} from "@/lib/assessment/db-loader";

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
  onBack?: () => void;
  canGoBack?: boolean;
}

export function QuestionPresenter({
  questionId,
  questionText,
  currentDomain,
  progress,
  isLoading = false,
  onAnswer,
  onBack,
  canGoBack = false,
}: QuestionPresenterProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentConfigs, setAssessmentConfigs] = useState<
    QuestionSetConfig[]
  >([]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [questionId]);

  // Load assessment configurations
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configs = await loadAssessmentConfigsClient();
        setAssessmentConfigs(configs);
      } catch (error) {
        console.error("Error loading assessment configurations:", error);
      }
    };
    loadConfigs();
  }, []);

  const handleAnswerClick = useCallback(
    async (response: boolean) => {
      if (isSubmitting || selectedAnswer !== null || isLoading) return;

      // Show selected button
      setSelectedAnswer(response);
      setIsSubmitting(true);

      // Wait a brief moment to show the selection, then submit
      setTimeout(async () => {
        try {
          await onAnswer(questionId, response);
          // Don't reset selectedAnswer here - let it reset when the question changes
        } catch (error) {
          console.error("Error submitting answer:", error);
          setSelectedAnswer(null); // Reset on error so user can try again
        } finally {
          setIsSubmitting(false);
        }
      }, 300);
    },
    [isSubmitting, selectedAnswer, isLoading, onAnswer, questionId]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Y key or Enter key = Yes (true)
      if (key === "y" || key === "enter") {
        event.preventDefault();
        handleAnswerClick(true);
      }
      // N key = No (false)
      else if (key === "n") {
        event.preventDefault();
        handleAnswerClick(false);
      }
      // Backspace or left arrow = Previous question
      else if (
        (key === "backspace" || key === "arrowleft") &&
        canGoBack &&
        onBack
      ) {
        event.preventDefault();
        if (!isLoading && !isSubmitting) {
          onBack();
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleAnswerClick, canGoBack, onBack, isLoading, isSubmitting]);

  // Find domain configuration from our assessment configs
  const domainConfig = assessmentConfigs.find(
    (domain) => domain.name === currentDomain
  ) || {
    domain: currentDomain as any,
    name: currentDomain,
    description: "",
    order: 0,
    questions: [],
    terminationRules: [],
  };

  const progressPercentage = Math.round(progress.overallProgress);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Progress Header */}
      <Card className="card-gradient border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                Assessment Progress
              </CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {domainConfig.name}
              </Badge>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                {progress.answeredQuestions} of {progress.totalQuestions}{" "}
                questions
              </div>
              <div className="text-2xl font-bold gradient-text">
                {progressPercentage}%
              </div>
            </div>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 gradient-animated"
          />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="card-gradient border-primary/20 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => handleAnswerClick(true)}
              disabled={selectedAnswer !== null || isLoading}
              className={`w-full h-14 text-lg font-medium transition-all duration-200 border-2 ${
                selectedAnswer === true
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500 ring-4 ring-green-200 dark:ring-green-900 shadow-lg scale-105"
                  : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-foreground hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/50"
              }`}
            >
              <CheckCircle className="mr-3 h-5 w-5" />
              Yes
            </Button>

            <Button
              size="lg"
              onClick={() => handleAnswerClick(false)}
              disabled={selectedAnswer !== null || isLoading}
              className={`w-full h-14 text-lg font-medium transition-all duration-200 border-2 ${
                selectedAnswer === false
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500 ring-4 ring-red-200 dark:ring-red-900 shadow-lg scale-105"
                  : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-foreground hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
              }`}
            >
              <XCircle className="mr-3 h-5 w-5" />
              No
            </Button>
          </div>

          {/* Keyboard Shortcuts Hint - Subtle */}
          <div className="text-center text-xs text-muted-foreground/60 space-y-0.5">
            <p>
              Keyboard shortcuts:{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded border border-border/50 font-mono">
                Y
              </kbd>{" "}
              Yes •{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded border border-border/50 font-mono">
                N
              </kbd>{" "}
              No •{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded border border-border/50 font-mono">
                Enter
              </kbd>{" "}
              Yes
              {canGoBack && (
                <>
                  {" • "}
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-muted/50 rounded border border-border/50 font-mono">
                    ←
                  </kbd>{" "}
                  Back
                </>
              )}
            </p>
          </div>

          {/* Back Button */}
          {canGoBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="lg"
              className="w-full h-12 text-lg font-medium flex items-center justify-center gap-2"
              disabled={isLoading || isSubmitting}
            >
              <ArrowLeft className="h-5 w-5" />
              Previous Question
            </Button>
          )}

          {/* Progress Details */}
          <div className="pt-4 border-t border-border/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <div className="font-semibold text-primary">
                  {progress.answeredQuestions}
                </div>
                <div className="text-muted-foreground">Answered</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/5">
                <div className="font-semibold text-accent">
                  {progress.completedDomains}
                </div>
                <div className="text-muted-foreground">Domains</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtle Loading Indicator - only shows between questions */}
      {isLoading && !isSubmitting && (
        <Card className="card-gradient border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Loading next question...
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
