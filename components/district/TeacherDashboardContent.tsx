"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  PlayCircle,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  DashboardLayout,
  EmptyState,
  StatsGrid,
} from "@/components/dashboard/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, RiskBadge, StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UserResourceLibrary from "@/components/resources/UserResourceLibrary";
import SettingsPane from "@/components/settings/SettingsPane";
import { OnboardingProvider } from "@/lib/contexts/OnboardingContext";

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

export function TeacherDashboardContentNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchQuery ||
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.anonymousId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      !filterStatus || student.assessmentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="Teacher Dashboard"
        description="Loading your classroom data..."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout userRole="TEACHER" title="Teacher Dashboard">
        <Alert variant="error" title="Error loading dashboard">
          {error || "Failed to load dashboard data. Please try again."}
        </Alert>
      </DashboardLayout>
    );
  }

  const selectedClassroomData = data.classrooms.find(
    (c) => c.id === selectedClassroom
  );

  // Library Tab View
  if (currentTab === "library") {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="Resource Library"
        description="Access helpful resources and materials"
      >
        <div className="max-w-7xl mx-auto">
          <UserResourceLibrary />
        </div>
      </DashboardLayout>
    );
  }

  // Settings Tab View
  if (currentTab === "settings") {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="Settings"
        description="Manage your account and preferences"
      >
        <div className="max-w-4xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <OnboardingProvider>
              <SettingsPane />
            </OnboardingProvider>
          </Suspense>
        </div>
      </DashboardLayout>
    );
  }

  // Assessments Tab View
  if (currentTab === "assessments") {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="Assessments"
        description="Create and manage behavioral assessments for your students"
        actions={
          <Button onClick={() => router.push("/teacher/assessment/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => router.push("/teacher/assessment/new")}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      New Assessment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start a behavioral screening
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/teacher/assessment/batch")}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Batch Assessment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Screen multiple students
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/teacher?tab=reports")}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Analyze classroom data
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Assessments */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {data.totalAssessments === 0 ? (
                <EmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No assessments yet"
                  description="Create your first assessment to start screening students"
                  action={{
                    label: "Create Assessment",
                    onClick: () => router.push("/teacher/assessment/new"),
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  {data.totalAssessments} total assessments •{" "}
                  {data.studentsScreened} completed •{" "}
                  {data.assessmentsInProgress} in progress
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Students Tab View
  if (currentTab === "students") {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="My Students"
        description={`Manage ${data.totalStudents} students across ${data.classrooms.length} classrooms`}
        actions={
          <Button onClick={() => router.push("/teacher/student/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        }
      >
        {/* Classroom Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedClassroom(null)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all",
                !selectedClassroom
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              )}
            >
              All Classrooms
            </button>
            {data.classrooms.map((classroom) => (
              <button
                key={classroom.id}
                onClick={() => setSelectedClassroom(classroom.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all",
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
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 text-sm bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="No students found"
                description="Add students to your classroom to get started"
                action={{
                  label: "Add Student",
                  onClick: () => router.push("/teacher/student/add"),
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Student
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Grade
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                              {student.firstName?.[0] || student.anonymousId[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {student.firstName && student.lastName
                                  ? `${student.firstName} ${student.lastName}`
                                  : student.anonymousId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {student.anonymousId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary">
                            {student.gradeLevel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={
                              student.assessmentStatus === "completed"
                                ? "success"
                                : student.assessmentStatus === "in_progress"
                                  ? "pending"
                                  : "inactive"
                            }
                            label={
                              student.assessmentStatus === "completed"
                                ? "Completed"
                                : student.assessmentStatus === "in_progress"
                                  ? "In Progress"
                                  : "Not Started"
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/teacher/student/${student.id}`)
                              }
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/teacher/assessment/new?student=${student.id}`
                                )
                              }
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Start Assessment"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Reports Tab View
  if (currentTab === "reports") {
    return (
      <DashboardLayout
        userRole="TEACHER"
        title="Class Reports"
        description="View classroom analytics and student progress reports"
      >
        <div className="grid gap-6">
          {/* Summary Stats */}
          <StatsGrid
            stats={[
              {
                label: "Total Students",
                value: data.totalStudents,
                icon: <Users className="h-6 w-6" />,
              },
              {
                label: "Screenings Completed",
                value: data.studentsScreened,
                change: 12,
                icon: <CheckCircle className="h-6 w-6" />,
              },
              {
                label: "In Progress",
                value: data.assessmentsInProgress,
                icon: <Clock className="h-6 w-6" />,
              },
              {
                label: "Need Follow-Up",
                value: data.studentsNeedingFollowUp,
                icon: <AlertTriangle className="h-6 w-6" />,
              },
            ]}
          />

          {/* Classroom Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Classroom Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {classroom.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {classroom.school.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {classroom._count.students}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Students
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {classroom.completionPercentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Complete
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-500">
                          {classroom.flaggedCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Flagged</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Default: Dashboard Tab
  return (
    <DashboardLayout
      userRole="TEACHER"
      title="Teacher Dashboard"
      description={`Welcome back! You have ${data.totalStudents} students across ${data.classrooms.length} classrooms.`}
      actions={
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      }
    >
      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: "Total Students",
            value: data.totalStudents,
            icon: <Users className="h-6 w-6" />,
          },
          {
            label: "Screenings Completed",
            value: data.studentsScreened,
            change: 12,
            icon: <CheckCircle className="h-6 w-6" />,
          },
          {
            label: "In Progress",
            value: data.assessmentsInProgress,
            icon: <Clock className="h-6 w-6" />,
          },
          {
            label: "Need Follow-Up",
            value: data.studentsNeedingFollowUp,
            icon: <AlertTriangle className="h-6 w-6" />,
          },
        ]}
      />

      {/* Classrooms Tabs */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {data.classrooms.map((classroom) => (
            <button
              key={classroom.id}
              onClick={() => setSelectedClassroom(classroom.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all",
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
      </div>

      {/* Classroom Progress Card */}
      {selectedClassroomData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedClassroomData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedClassroomData.school.name}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {selectedClassroomData.completionPercentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {selectedClassroomData.studentsScreened}
                    </p>
                    <p className="text-xs text-muted-foreground">Screened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">
                      {selectedClassroomData.flaggedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Flagged</p>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${selectedClassroomData.completionPercentage}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Students</CardTitle>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 text-sm bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Filter */}
            <select
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-3 py-2 text-sm bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={fetchStudents}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {studentsLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No students found"
              description={
                searchQuery
                  ? "Try adjusting your search criteria"
                  : "Add students to get started with screenings"
              }
              action={{
                label: "Add Student",
                onClick: () => {},
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Student
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Grade
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Risk Level
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Last Activity
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            {student.firstName?.[0] || student.anonymousId[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {student.firstName && student.lastName
                                ? `${student.firstName} ${student.lastName}`
                                : student.anonymousId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {student.anonymousId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{student.gradeLevel}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            student.assessmentStatus === "completed"
                              ? "success"
                              : student.assessmentStatus === "in_progress"
                                ? "pending"
                                : "inactive"
                          }
                          label={
                            student.assessmentStatus === "completed"
                              ? "Completed"
                              : student.assessmentStatus === "in_progress"
                                ? "In Progress"
                                : "Not Started"
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        {student.flaggedDomainsCount > 0 ? (
                          <RiskBadge
                            level={
                              student.flaggedDomainsCount >= 3
                                ? "high"
                                : student.flaggedDomainsCount >= 2
                                  ? "moderate"
                                  : "low"
                            }
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {student.lastActivityDate
                          ? new Date(
                              student.lastActivityDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/teacher/student/${student.id}`)
                            }
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

// Alias for backward compatibility
export const TeacherDashboardContent = TeacherDashboardContentNew;
