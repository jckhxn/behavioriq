"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TrialQuestion {
  id: string;
  text: string;
  order: number;
  domain: string;
  domainSlug: string;
  weight: number;
  required: boolean;
}

interface TrialAssessmentData {
  assessment: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    totalQuestions: number;
  };
  domains: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
  }>;
  questions: TrialQuestion[];
}

export function TrialAssessment() {
  const { user, isLoading } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [childName, setChildName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const [trialData, setTrialData] = useState<TrialAssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect authenticated users to regular assessment
  useEffect(() => {
    if (user) {
      router.push("/assessment/new");
      return;
    }

    if (!isLoading) {
      fetchTrialAssessment();
    }
  }, [user, isLoading, router]);

  const fetchTrialAssessment = async () => {
    try {
      const response = await fetch("/api/assessments/trial");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load trial assessment");
      }
      const data = await response.json();
      setTrialData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load trial assessment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication or loading trial data
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              {isLoading ? "Checking access..." : "Loading trial assessment..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render anything if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  if (error || !trialData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Assessment Unavailable
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "The trial assessment is currently unavailable."}
            </p>
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = trialData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / trialData.questions.length) * 100;

  const handleResponse = (response: boolean) => {
    // Convert boolean to score (Yes = 3, No = 0 for scoring)
    const score = response ? 3 : 0;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: score,
    }));

    if (currentQuestionIndex < trialData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Assessment complete, redirect to results
      const queryParams = new URLSearchParams({
        responses: JSON.stringify(responses),
        childName: childName,
        assessmentId: trialData.assessment.id,
      });
      router.push(`/trial-results?${queryParams.toString()}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const previousIndex = currentQuestionIndex - 1;
      const previousQuestion = trialData.questions[previousIndex];

      // Clear the response for the previous question so user can change their answer
      setResponses((prev) => {
        const newResponses = { ...prev };
        delete newResponses[previousQuestion.id];
        return newResponses;
      });

      setCurrentQuestionIndex(previousIndex);
    }
  };

  const handleNameSubmit = () => {
    if (childName.trim()) {
      setShowNameInput(false);
    }
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-xl gradient-primary">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AI Diagnostic</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {trialData.assessment.name}
            </h1>
            <p className="text-muted-foreground">
              {trialData.assessment.description}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Let's get started</CardTitle>
              <CardDescription>
                First, what's your child's name? (This helps personalize the
                assessment)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your child's name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
                />
                <Button
                  onClick={handleNameSubmit}
                  disabled={!childName.trim()}
                  className="w-full"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">What to expect:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • {trialData.questions.length} simple yes/no questions
                  </li>
                  <li>
                    • Takes about {Math.ceil(trialData.questions.length / 2)}{" "}
                    minutes to complete
                  </li>
                  <li>
                    • Covers {trialData.domains.length} key behavioral areas
                  </li>
                  <li>• Immediate insights and recommendations</li>
                  <li>• No diagnosis - just helpful guidance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Assessment for {childName}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of{" "}
              {trialData.questions.length}
            </span>
            <span>•</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Instructions */}
        {currentQuestionIndex === 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Instructions:</strong>{" "}
                {trialData.assessment.instructions}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="text-sm text-muted-foreground font-medium">
                {currentQuestion.domain}
              </div>
              <div className="text-xs text-muted-foreground">
                Question {currentQuestionIndex + 1}
              </div>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <CardDescription>
              Think about {childName}'s behavior over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={() => handleResponse(true)}
                className="w-full h-14 text-lg font-medium transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <CheckCircle className="mr-3 h-5 w-5" />
                Yes
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleResponse(false)}
                className="w-full h-14 text-lg font-medium transition-all duration-200 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="mr-3 h-5 w-5" />
                No
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {trialData.questions.length - currentQuestionIndex - 1} questions
            remaining
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> This assessment is for informational
            purposes only and does not constitute a medical diagnosis. Always
            consult with qualified healthcare professionals for concerns about
            your child's development.
          </p>
        </div>
      </div>
    </div>
  );
}
