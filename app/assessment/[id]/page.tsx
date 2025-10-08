"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { AssessmentChat } from "@/components/chat/AssessmentChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
}

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assessmentId = params.id as string;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchAssessment = async () => {
      try {
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
  }, [assessmentId, user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
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
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Assessment Status
              </div>
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  assessment.status === "COMPLETED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {assessment.status === "COMPLETED"
                  ? "Completed"
                  : "In Progress"}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Assessment for {assessment.subjectName}
            </h1>
            <p className="text-muted-foreground">
              Started on {new Date(assessment.startedAt).toLocaleDateString()}
              {assessment.completedAt && (
                <>
                  {" • Completed on "}
                  {new Date(assessment.completedAt).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Assessment Chat Interface */}
        <Card className="shadow-lg dark:shadow-xl border dark:border-border">
          <CardContent className="p-0">
            <AssessmentChat assessmentId={assessmentId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
