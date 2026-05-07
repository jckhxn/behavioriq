"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Brain, ArrowLeft, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAssessmentCredits } from "@/hooks/use-assessment-credits";
import { AssessmentLimitDialog } from "@/components/assessment/AssessmentLimitDialog";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

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

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  anonymousId: string;
  gradeLevel: string;
}

function NewAssessmentContent() {
  const [subjectName, setSubjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [availableAssessments, setAvailableAssessments] = useState<
    AssessmentTemplate[]
  >([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const {
    credits,
    isLoading: creditsLoading,
    isDialogOpen,
    closeDialog,
    checkCreditsBeforeAction,
    refreshCredits,
  } = useAssessmentCredits();

  const studentIdParam = searchParams.get("student");

  // Fetch available assessments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentsRes, studentsRes] = await Promise.all([
          fetch("/api/assessments/available"),
          fetch("/api/teacher/students"),
        ]);

        if (assessmentsRes.ok) {
          const assessments = await assessmentsRes.json();
          setAvailableAssessments(assessments);
          if (assessments.length > 0) {
            const savedId = sessionStorage.getItem("selectedAssessmentId");
            const saved = savedId ? assessments.find((a: AssessmentTemplate) => a.id === savedId) : null;
            setSelectedAssessment(saved || assessments[0]);
          }
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData.students || []);

          // If student param is provided, find and select that student
          if (studentIdParam && studentsData.students) {
            const student = studentsData.students.find(
              (s: Student) => s.id === studentIdParam
            );
            if (student) {
              setSelectedStudent(student);
              setSubjectName(
                student.firstName && student.lastName
                  ? `${student.firstName} ${student.lastName}`
                  : student.anonymousId
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, studentIdParam]);

  const createAssessment = async () => {
    if (!subjectName.trim() || !selectedAssessment) return;

    const hasCredits = await checkCreditsBeforeAction();
    if (!hasCredits) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subjectName.trim(),
          assessmentTemplateId: selectedAssessment.id,
          studentId: selectedStudent?.id,
        }),
      });

      if (response.ok) {
        const assessment = await response.json();
        sessionStorage.removeItem("selectedAssessmentId");
        refreshCredits();
        router.push(`/assessment/${assessment.id}`);
      } else {
        const data = await response.json();
        if (data.error === "NO_CREDITS") {
          toast.error("No assessment credits available");
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
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout userRole="TEACHER" title="Create Assessment">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (availableAssessments.length === 0) {
    return (
      <DashboardLayout userRole="TEACHER" title="Create Assessment">
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              No Assessments Available
            </h2>
            <p className="text-muted-foreground mb-6">
              There are currently no active assessments available. Please
              contact your administrator.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/teacher?tab=assessments")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="TEACHER"
      title="Create New Assessment"
      description="Start a behavioral screening for a student"
      actions={
        <Button
          variant="outline"
          onClick={() => router.push("/teacher?tab=assessments")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Credits Banner */}
        {!creditsLoading && credits && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {credits.licenseType === "UNLIMITED" ||
                    credits.creditsRemaining === -1
                      ? "Unlimited"
                      : credits.creditsRemaining}{" "}
                    assessment{credits.creditsRemaining !== 1 ? "s" : ""}{" "}
                    available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Type Selection */}
        {availableAssessments.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Assessment Type</CardTitle>
              <CardDescription>
                Choose the type of screening to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {availableAssessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      sessionStorage.setItem("selectedAssessmentId", assessment.id);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAssessment?.id === assessment.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {assessment.name}
                        </h3>
                        {assessment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assessment.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {assessment.domains.length} domains
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Selection / Subject Name */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Select a student or enter a name for this assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {students.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Select Student (Optional)
                </Label>
                <select
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const student = students.find(
                      (s) => s.id === e.target.value
                    );
                    setSelectedStudent(student || null);
                    if (student) {
                      setSubjectName(
                        student.firstName && student.lastName
                          ? `${student.firstName} ${student.lastName}`
                          : student.anonymousId
                      );
                    }
                  }}
                  className="mt-2 w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName && student.lastName
                        ? `${student.firstName} ${student.lastName}`
                        : student.anonymousId}{" "}
                      ({student.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="subjectName" className="text-sm font-medium">
                Subject Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter student's name or identifier"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This can be a name, pseudonym, or any identifier you prefer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Assessment Info */}
        {selectedAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Approximately 10-15 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {selectedAssessment._count.assessments} assessments
                    completed
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedAssessment.domains.map((domain) => (
                    <Badge key={domain.domainTemplate.id} variant="outline">
                      {domain.domainTemplate.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Button */}
        <Button
          onClick={createAssessment}
          disabled={!subjectName.trim() || isCreating || !selectedAssessment}
          className="w-full h-12 text-base"
          size="lg"
        >
          {isCreating ? (
            <>
              <Brain className="h-5 w-5 mr-2 animate-spin" />
              Creating Assessment...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Start Assessment
            </>
          )}
        </Button>
      </div>

      {credits && (
        <AssessmentLimitDialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          credits={credits}
        />
      )}
    </DashboardLayout>
  );
}

export default function NewAssessmentPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout userRole="TEACHER" title="Create Assessment">
          <div className="flex items-center justify-center py-12">
            <Brain className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <NewAssessmentContent />
    </Suspense>
  );
}
