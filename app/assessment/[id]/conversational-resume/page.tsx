"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ConversationalAssessmentWrapper } from "@/components/assessment/ConversationalAssessmentWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ConversationalResumePage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`);
        if (!response.ok) {
          setError("Assessment not found");
          return;
        }

        const data = await response.json();

        if (!data.isConversational) {
          setError("This is not a conversational assessment");
          return;
        }

        if (data.status === "COMPLETED") {
          // Redirect to results page
          router.push(`/assessment/${assessmentId}/results`);
          return;
        }

        if (data.status !== "IN_PROGRESS") {
          setError("This assessment cannot be resumed");
          return;
        }

        setAssessment(data);
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Resume Assessment</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Info Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {assessment?.subjectName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Continue your conversational assessment from where you left off
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conversational Assessment Wrapper */}
          <Card>
            <CardContent className="p-6">
              <ConversationalAssessmentWrapper
                onComplete={(responses) => {
                  // On completion, redirect to results
                  router.push(`/assessment/${assessmentId}/results`);
                }}
                assessmentId={assessmentId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
