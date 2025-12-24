"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  CheckCircle,
  Clock,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import CreateStudentDialog from "@/components/district/CreateStudentDialog";
import EditStudentDialog from "@/components/district/EditStudentDialog";
import DeleteStudentDialog from "@/components/district/DeleteStudentDialog";
import ActionableMetricCard from "@/components/district/ActionableMetricCard";
import ClassroomProgressCard from "@/components/district/ClassroomProgressCard";
import AssessmentStatusBadge from "@/components/district/AssessmentStatusBadge";
import ScreeningSnapshotBadge from "@/components/district/ScreeningSnapshotBadge";
import ContextualActionMenu from "@/components/district/ContextualActionMenu";
import EmptyStateCard from "@/components/district/EmptyStateCard";
import NonDiagnosticDisclaimer from "@/components/district/NonDiagnosticDisclaimer";

interface Classroom {
  id: string;
  name: string;
  schoolId: string;
  _count: {
    students: number;
  };
  school: {
    name: string;
  };
  studentsScreened: number;
  flaggedCount: number;
  completionPercentage: number;
}

interface Student {
  id: string;
  anonymousId: string;
  firstName: string | null;
  lastName: string | null;
  gradeLevel: string;
  dateOfBirth: string | null;
  _count: {
    assessments: number;
  };
  assessmentStatus: string;
  screeningSnapshot: string;
  lastActivityDate: string | null;
  flaggedDomainsCount: number;
  latestAssessmentMode: string | null;
}

interface DashboardData {
  classrooms: Classroom[];
  totalStudents: number;
  totalAssessments: number;
  studentsScreened: number;
  studentsNeedingFollowUp: number;
  assessmentsInProgress: number;
  recentlyCompleted: number;
}

export function TeacherDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        setData(data);
        if (data.classrooms.length > 0) {
          setSelectedClassroom(data.classrooms[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStudents = async () => {
    if (!selectedClassroom) return;
    setStudentsLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/classroom/${selectedClassroom}/students`
      );
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClassroom]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pb-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load dashboard"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter students based on selected filter
  const filteredStudents = filterStatus
    ? students.filter((s) => {
        if (filterStatus === "NEED_FOLLOWUP") {
          return (
            s.screeningSnapshot === "MONITOR" ||
            s.screeningSnapshot === "ELEVATED"
          );
        }
        if (filterStatus === "IN_PROGRESS") {
          return s.assessmentStatus === "IN_PROGRESS";
        }
        return true;
      })
    : students;

  return (
    <div className="space-y-6 pb-20">
      {/* Non-diagnostic disclaimer inline */}
      <NonDiagnosticDisclaimer variant="inline" />

      {/* Summary Cards - Actionable Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActionableMetricCard
          title="Students Screened"
          value={data.studentsScreened}
          subtitle={`${data.totalStudents > 0 ? Math.round((data.studentsScreened / data.totalStudents) * 100) : 0}% of roster`}
          tooltip="Number of students who have completed at least one screening assessment. Not a diagnosis."
          icon={CheckCircle}
          progressValue={data.studentsScreened}
          progressMax={data.totalStudents}
        />

        <ActionableMetricCard
          title="May Need Follow-Up"
          value={data.studentsNeedingFollowUp}
          subtitle={
            data.studentsNeedingFollowUp > 0
              ? "Students with elevated indicators"
              : "No elevated indicators"
          }
          tooltip="Students with elevated screening indicators. Review their screening summary to plan next steps."
          icon={AlertCircle}
          onClick={() => {
            setFilterStatus(
              filterStatus === "NEED_FOLLOWUP" ? null : "NEED_FOLLOWUP"
            );
          }}
        />

        <ActionableMetricCard
          title="In Progress"
          value={data.assessmentsInProgress}
          subtitle="Assessments started but not completed"
          tooltip="Assessments that students have started but not yet completed. These may be paused mid-session and resumed later."
          icon={Clock}
          onClick={() => {
            setFilterStatus(
              filterStatus === "IN_PROGRESS" ? null : "IN_PROGRESS"
            );
          }}
        />

        <ActionableMetricCard
          title="Recently Completed"
          value={data.recentlyCompleted}
          subtitle="In last 30 days"
          tooltip="Completed assessments in the last 30 days."
          icon={CalendarCheck}
        />
      </div>

      {/* Classroom Selector */}
      {data.classrooms.length === 0 ? (
        <EmptyStateCard
          variant="no-classrooms"
          onAction={() => {
            window.location.href = "mailto:admin@school.edu";
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select Classroom</CardTitle>
            <CardDescription>
              Choose a classroom to view and manage students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.classrooms.map((classroom) => (
                <ClassroomProgressCard
                  key={classroom.id}
                  classroom={classroom}
                  isSelected={selectedClassroom === classroom.id}
                  onClick={() => {
                    setSelectedClassroom(classroom.id);
                    setFilterStatus(null);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      {selectedClassroom && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Manage students in{" "}
                  {
                    data.classrooms.find((c) => c.id === selectedClassroom)
                      ?.name
                  }
                  {filterStatus && (
                    <span className="ml-2">
                      (Filtered:{" "}
                      {filterStatus === "NEED_FOLLOWUP"
                        ? "May Need Follow-Up"
                        : "In Progress"}
                      )
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {filterStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterStatus(null)}
                  >
                    Clear Filter
                  </Button>
                )}
                <CreateStudentDialog
                  classroomId={selectedClassroom}
                  onSuccess={fetchStudents}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : students.length === 0 ? (
              <EmptyStateCard
                variant="no-students"
                onAction={() => {
                  // Trigger the CreateStudentDialog
                  document
                    .querySelector<HTMLButtonElement>(
                      "[data-student-dialog-trigger]"
                    )
                    ?.click();
                }}
              />
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No students match the current filter.</p>
                <Button variant="outline" onClick={() => setFilterStatus(null)}>
                  Clear Filter
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Student
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Assessment Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Screening Snapshot
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Last Activity
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => {
                      const displayName =
                        student.firstName && student.lastName
                          ? `${student.firstName} ${student.lastName}`
                          : student.anonymousId;

                      const lastActivity = student.lastActivityDate
                        ? new Date(student.lastActivityDate)
                        : null;

                      const formatDate = (date: Date) => {
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffDays = Math.floor(
                          diffMs / (1000 * 60 * 60 * 24)
                        );

                        if (diffDays === 0) return "Today";
                        if (diffDays === 1) return "Yesterday";
                        if (diffDays < 7) return `${diffDays} days ago`;
                        return date.toLocaleDateString();
                      };

                      return (
                        <tr
                          key={student.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            <div>
                              <div className="font-medium">{displayName}</div>
                              <div className="text-xs text-muted-foreground">
                                {student.gradeLevel}
                                {student.anonymousId !== displayName && (
                                  <span className="ml-2">
                                    ID: {student.anonymousId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <AssessmentStatusBadge
                              status={student.assessmentStatus}
                              mode={student.latestAssessmentMode}
                            />
                          </td>
                          <td className="p-4 align-middle">
                            <ScreeningSnapshotBadge
                              snapshot={
                                student.assessmentStatus === "COMPLETED"
                                  ? (student.screeningSnapshot as any)
                                  : "NOT_STARTED"
                              }
                              flaggedDomainsCount={student.flaggedDomainsCount}
                            />
                          </td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            {lastActivity ? formatDate(lastActivity) : "—"}
                          </td>
                          <td className="p-4 align-middle">
                            <ContextualActionMenu
                              student={student}
                              onEdit={() => {
                                // Edit dialog will be triggered via ref or state
                              }}
                              onArchive={() => {
                                // Archive functionality
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer Disclaimer */}
      <NonDiagnosticDisclaimer variant="footer" />
    </div>
  );
}
