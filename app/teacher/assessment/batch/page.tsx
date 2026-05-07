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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Brain,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
} from "lucide-react";
import { useAssessmentCredits } from "@/hooks/use-assessment-credits";
import { AssessmentLimitDialog } from "@/components/assessment/AssessmentLimitDialog";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { cn } from "@/lib/utils";

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  domains: Array<{
    domainTemplate: {
      id: string;
      name: string;
    };
    order: number;
  }>;
}

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  anonymousId: string;
  gradeLevel: string;
  assessmentStatus: "not_started" | "in_progress" | "completed";
  classroom?: {
    id: string;
    name: string;
  };
}

interface Classroom {
  id: string;
  name: string;
  _count: {
    students: number;
  };
}

export default function BatchAssessmentPage() {
  const [availableAssessments, setAvailableAssessments] = useState<
    AssessmentTemplate[]
  >([]);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  // Helper to get available credits as a number
  const availableCredits = credits?.creditsRemaining ?? 0;
  const hasUnlimitedCredits =
    credits?.licenseType === "UNLIMITED" || availableCredits === -1;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentsRes, dashboardRes] = await Promise.all([
          fetch("/api/assessments/available"),
          fetch("/api/teacher/dashboard"),
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

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setClassrooms(data.classrooms || []);
          if (data.classrooms?.length > 0) {
            setSelectedClassroom(data.classrooms[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Fetch students when classroom changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassroom) return;

      try {
        const res = await fetch(
          `/api/teacher/classroom/${selectedClassroom}/students`
        );
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          setSelectedStudents(new Set()); // Reset selection when classroom changes
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedClassroom]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchQuery ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.anonymousId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const eligibleStudents = filteredStudents.filter(
    (s) => s.assessmentStatus !== "in_progress"
  );

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudents.size === eligibleStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(eligibleStudents.map((s) => s.id)));
    }
  };

  const createBatchAssessments = async () => {
    if (selectedStudents.size === 0 || !selectedAssessment) {
      toast.error("Please select at least one student");
      return;
    }

    // Check credits
    const hasCredits = await checkCreditsBeforeAction();
    if (!hasCredits) {
      return;
    }

    // Check if user has enough credits for all selected students
    if (!hasUnlimitedCredits && availableCredits < selectedStudents.size) {
      toast.error(
        `You only have ${availableCredits} credits but selected ${selectedStudents.size} students`
      );
      return;
    }

    setCreating(true);
    const results = { success: 0, failed: 0 };

    try {
      for (const studentId of selectedStudents) {
        const student = students.find((s) => s.id === studentId);
        if (!student) continue;

        const subjectName =
          student.firstName && student.lastName
            ? `${student.firstName} ${student.lastName}`
            : student.anonymousId;

        try {
          const response = await fetch("/api/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subjectName,
              assessmentTemplateId: selectedAssessment.id,
              studentId: student.id,
            }),
          });

          if (response.ok) {
            results.success++;
          } else {
            results.failed++;
          }
        } catch (error) {
          results.failed++;
        }
      }

      refreshCredits();

      if (results.success > 0) {
        toast.success(
          `Created ${results.success} assessment${results.success > 1 ? "s" : ""} successfully`
        );
      }
      if (results.failed > 0) {
        toast.error(
          `Failed to create ${results.failed} assessment${results.failed > 1 ? "s" : ""}`
        );
      }

      // Navigate back to assessments tab
      router.push("/teacher?tab=assessments");
    } catch (error) {
      console.error("Error creating batch assessments:", error);
      toast.error("An error occurred while creating assessments");
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout userRole="TEACHER" title="Batch Assessment">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="TEACHER"
      title="Batch Assessment"
      description="Create assessments for multiple students at once"
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
      <div className="space-y-6">
        {/* Credits & Selection Info */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="flex-1 bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {hasUnlimitedCredits ? "Unlimited" : availableCredits} credit
                  {availableCredits !== 1 ? "s" : ""} available
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  {selectedStudents.size} student
                  {selectedStudents.size !== 1 ? "s" : ""} selected
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Selection */}
        {availableAssessments.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableAssessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      sessionStorage.setItem("selectedAssessmentId", assessment.id);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                      selectedAssessment?.id === assessment.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    )}
                  >
                    {assessment.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classroom Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {classrooms.map((classroom) => (
                <button
                  key={classroom.id}
                  onClick={() => setSelectedClassroom(classroom.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                    selectedClassroom === classroom.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  )}
                >
                  {classroom.name}
                  <span className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded-md text-xs">
                    {classroom._count.students}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Select Students</CardTitle>
                <CardDescription>
                  Choose students to create assessments for
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-48 text-sm bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {selectedStudents.size === eligibleStudents.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredStudents.map((student) => {
                  const isInProgress =
                    student.assessmentStatus === "in_progress";
                  const isSelected = selectedStudents.has(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isInProgress && toggleStudent(student.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                        isInProgress
                          ? "opacity-50 cursor-not-allowed bg-muted"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isInProgress}
                        onCheckedChange={() =>
                          !isInProgress && toggleStudent(student.id)
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {student.firstName && student.lastName
                            ? `${student.firstName} ${student.lastName}`
                            : student.anonymousId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Grade {student.gradeLevel} • ID: {student.anonymousId}
                        </p>
                      </div>
                      {isInProgress && (
                        <Badge variant="warning">In Progress</Badge>
                      )}
                      {student.assessmentStatus === "completed" && (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning for insufficient credits */}
        {!hasUnlimitedCredits && selectedStudents.size > availableCredits && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-orange-500">
                  You have selected {selectedStudents.size} students but only
                  have {availableCredits} credits. Please reduce your selection
                  or purchase more credits.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        <Button
          onClick={createBatchAssessments}
          disabled={
            selectedStudents.size === 0 ||
            creating ||
            (!hasUnlimitedCredits && selectedStudents.size > availableCredits)
          }
          className="w-full h-12 text-base"
          size="lg"
        >
          {creating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating {selectedStudents.size} Assessment
              {selectedStudents.size > 1 ? "s" : ""}...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              Create {selectedStudents.size} Assessment
              {selectedStudents.size > 1 ? "s" : ""}
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
