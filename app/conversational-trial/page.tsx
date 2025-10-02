"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversationalAssessment } from "@/components/assessment/ConversationalAssessment";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export default function ConversationalTrialPage() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [responses, setResponses] = useState<Record<string, boolean>>({});

  const handleComplete = (assessmentResponses: Record<string, boolean>) => {
    setResponses(assessmentResponses);
    setCompleted(true);

    // Redirect to trial results after a brief delay
    setTimeout(() => {
      window.location.href = "/trial-results";
    }, 2000);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-green-500" />
              Assessment Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for completing our conversational assessment! Your
              responses have been processed and we're preparing your
              personalized report.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">
              Redirecting to your results...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto py-8">
          <ConversationalAssessment onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            Try Our Conversational Assessment
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Experience a more natural way to complete behavioral assessments
            through conversation with our AI assistant.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <div>
                <h3 className="font-medium">Natural Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Chat naturally with our AI about your child's behavior instead
                  of filling out traditional forms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div>
                <h3 className="font-medium">Adaptive Questions</h3>
                <p className="text-sm text-muted-foreground">
                  The AI asks follow-up questions based on your responses to get
                  a complete picture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <div>
                <h3 className="font-medium">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get your personalized behavioral assessment report immediately
                  after completion.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">What to Expect</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • Conversational format - just like chatting with a counselor
              </li>
              <li>• Takes about 5-10 minutes to complete</li>
              <li>• AI understands natural language responses</li>
              <li>• Same comprehensive assessment as our traditional format</li>
            </ul>
          </div>

          <Button onClick={() => setStarted(true)} className="w-full" size="lg">
            Start Conversational Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a free trial assessment. No registration required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
