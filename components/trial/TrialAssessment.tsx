"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TRIAL_QUESTIONS = [
  {
    id: 1,
    text: "Does your child have difficulty paying attention to details or makes careless mistakes?",
    domain: "ATTENTION",
  },
  {
    id: 2,
    text: "Does your child have trouble keeping attention on tasks or play activities?",
    domain: "ATTENTION",
  },
  {
    id: 3,
    text: "Does your child seem not to listen when spoken to directly?",
    domain: "ATTENTION",
  },
  {
    id: 4,
    text: "Does your child often lose things necessary for tasks or activities?",
    domain: "ATTENTION",
  },
  {
    id: 5,
    text: "Does your child often argue with adults or refuses to comply with rules?",
    domain: "CONDUCT",
  },
  {
    id: 6,
    text: "Does your child often lose temper or has angry outbursts?",
    domain: "EMOTIONAL",
  },
  {
    id: 7,
    text: "Does your child often seem angry or resentful?",
    domain: "EMOTIONAL",
  },
];

export function TrialAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, boolean>>({});
  const [childName, setChildName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const router = useRouter();

  const currentQuestion = TRIAL_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / TRIAL_QUESTIONS.length) * 100;

  const handleResponse = (response: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: response,
    }));

    if (currentQuestionIndex < TRIAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Assessment complete, redirect to results
      const queryParams = new URLSearchParams({
        responses: JSON.stringify(responses),
        childName: childName,
      });
      router.push(`/trial-results?${queryParams.toString()}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
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
              Free Behavioral Assessment
            </h1>
            <p className="text-muted-foreground">
              Get insights into your child's behavioral patterns in just 5
              minutes
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
                  <li>• 7 simple yes/no questions</li>
                  <li>• Takes about 5 minutes to complete</li>
                  <li>• Immediate snapshot of key indicators</li>
                  <li>• No diagnosis - just helpful insights</li>
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
              Question {currentQuestionIndex + 1} of {TRIAL_QUESTIONS.length}
            </span>
            <span>•</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <CardDescription>
              Think about {childName}'s behavior over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleResponse(false)}
                className="h-16 text-lg hover:bg-green-50 hover:border-green-200"
              >
                No
              </Button>
              <Button
                size="lg"
                onClick={() => handleResponse(true)}
                className="h-16 text-lg"
              >
                Yes
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
            {TRIAL_QUESTIONS.length - currentQuestionIndex - 1} questions
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
