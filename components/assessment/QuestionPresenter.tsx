"use client";

import { useState, useEffect } from "react";
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

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAnswer(questionId, selectedAnswer);
      // Don't reset selectedAnswer here - let it reset when the question changes
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              variant={selectedAnswer === true ? "default" : "outline"}
              size="lg"
              className={`w-full h-14 text-lg font-medium transition-all duration-200 ${
                selectedAnswer === true
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  : "hover:border-green-500 hover:bg-green-50"
              }`}
              onClick={() => setSelectedAnswer(true)}
              disabled={isLoading || isSubmitting}
            >
              <CheckCircle className="mr-3 h-5 w-5" />
              Yes
            </Button>

            <Button
              variant={selectedAnswer === false ? "default" : "outline"}
              size="lg"
              className={`w-full h-14 text-lg font-medium transition-all duration-200 ${
                selectedAnswer === false
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                  : "hover:border-red-500 hover:bg-red-50"
              }`}
              onClick={() => setSelectedAnswer(false)}
              disabled={isLoading || isSubmitting}
            >
              <XCircle className="mr-3 h-5 w-5" />
              No
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || isLoading || isSubmitting}
            size="lg"
            className="w-full h-12 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>

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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="card-gradient p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="text-lg font-medium">
                Processing your response...
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
