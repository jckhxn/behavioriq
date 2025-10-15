"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Users, Clock } from "lucide-react";
import Link from "next/link";
import { useAssessmentCredits } from "@/hooks/use-assessment-credits";
import { AssessmentLimitDialog } from "@/components/assessment/AssessmentLimitDialog";
import { toast } from "sonner";

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  createdAt: string;
  domains: Array<{
    domainTemplate: {
      id: string;
      name: string;
      description?: string;
    };
    order: number;
  }>;
  _count: {
    assessments: number;
  };
}

export default function NewAssessmentPage() {
  const [subjectName, setSubjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [availableAssessments, setAvailableAssessments] = useState<
    AssessmentTemplate[]
  >([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const {
    credits,
    isLoading: creditsLoading,
    isDialogOpen,
    closeDialog,
    checkCreditsBeforeAction,
    refreshCredits,
  } = useAssessmentCredits();

  // Fetch available assessments
  useEffect(() => {
    const fetchAvailableAssessments = async () => {
      try {
        const response = await fetch("/api/assessments/available");
        if (response.ok) {
          const assessments = await response.json();
          setAvailableAssessments(assessments);
          // Auto-select the first available assessment
          if (assessments.length > 0) {
            setSelectedAssessment(assessments[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching available assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAvailableAssessments();
    }
  }, [user]);

  const createAssessment = async () => {
    if (!subjectName.trim() || !selectedAssessment) return;

    // Check if user has available credits before creating
    const hasCredits = await checkCreditsBeforeAction();
    if (!hasCredits) {
      return; // Dialog will be shown by the hook
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subjectName.trim(),
          assessmentTemplateId: selectedAssessment.id,
        }),
      });

      if (response.ok) {
        const assessment = await response.json();
        refreshCredits(); // Refresh credits after successful creation
        router.push(`/assessment/${assessment.id}`);
      } else {
        const data = await response.json();
        if (data.error === "NO_CREDITS") {
          toast.error("No assessment credits available");
          // This will trigger the dialog
          await checkCreditsBeforeAction();
        } else {
          toast.error("Failed to create assessment");
        }
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      toast.error("An error occurred while creating the assessment");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      subjectName.trim() &&
      !isCreating &&
      selectedAssessment
    ) {
      createAssessment();
    }
  };

  if (!user) {
    return null; // Will redirect via middleware
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading available assessments...</p>
        </div>
      </div>
    );
  }

  if (availableAssessments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Brain className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              No Assessments Available
            </h1>
            <p className="text-muted-foreground mb-8">
              There are currently no active assessments available. Please
              contact your administrator.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Assessment Selection */}
          {availableAssessments.length > 1 && (
            <Card className="mb-6 shadow-lg dark:shadow-xl border dark:border-border">
              <CardHeader>
                <CardTitle className="text-lg">Select Assessment</CardTitle>
                <CardDescription>
                  Choose which assessment you'd like to take
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{assessment.name}</h3>
                        {assessment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {assessment._count.assessments} completed
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {assessment.domains.length} domains
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Main Card */}
          <Card className="shadow-lg dark:shadow-xl border dark:border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Start New Assessment
              </CardTitle>
              <CardDescription>
                {selectedAssessment ? (
                  <>
                    Taking: <strong>{selectedAssessment.name}</strong>
                    <br />
                    Enter the name of the person you'd like to assess
                  </>
                ) : (
                  "Enter the name of the person you'd like to assess"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject-name" className="text-sm font-medium">
                  Subject Name
                </Label>
                <Input
                  id="subject-name"
                  placeholder="Enter the person's name..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-lg"
                  autoFocus
                />
              </div>

              {selectedAssessment?.instructions && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssessment.instructions}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={createAssessment}
                  disabled={
                    !subjectName.trim() || !selectedAssessment || isCreating
                  }
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground text-lg py-6"
                >
                  {isCreating ? "Creating Assessment..." : "Start Assessment"}
                </Button>

                <Link href="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          {selectedAssessment && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>
                  This assessment includes {selectedAssessment.domains.length}{" "}
                  domain
                  {selectedAssessment.domains.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                This assessment will help identify behavioral patterns and
                provide insights for better understanding.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Limit Dialog */}
      {credits && (
        <AssessmentLimitDialog
          open={isDialogOpen}
          onOpenChange={closeDialog}
          credits={credits}
          childName={subjectName}
        />
      )}
    </div>
  );
}
