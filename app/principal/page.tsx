"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  School,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  UserCheck,
  Loader2,
  Building2,
  GraduationCap,
  Activity,
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

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalCounselors: number;
  completedAssessments: number;
  pendingAssessments: number;
  highRiskStudents: number;
  moderateRiskStudents: number;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  studentCount: number;
  assessmentsCompleted: number;
}

interface DashboardData {
  stats: SchoolStats;
  staff: StaffMember[];
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

function PrincipalDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch school analytics data
        const [studentsRes, usersRes] = await Promise.all([
          fetch("/api/district/students"),
          fetch("/api/district/users"),
        ]);

        if (!studentsRes.ok) throw new Error("Failed to fetch school data");

        const students = await studentsRes.json();
        const users = usersRes.ok ? await usersRes.json() : [];

        // Calculate stats from student data
        const highRisk = students.filter(
          (s: any) => s.riskLevel === "HIGH" || s.riskLevel === "VERY_HIGH"
        ).length;
        const moderateRisk = students.filter(
          (s: any) => s.riskLevel === "MODERATE"
        ).length;

        // Filter staff
        const teachers = users.filter((u: any) => u.role === "TEACHER");
        const counselors = users.filter((u: any) => u.role === "COUNSELOR");

        setData({
          stats: {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalCounselors: counselors.length,
            completedAssessments: students.filter(
              (s: any) => s.latestAssessment
            ).length,
            pendingAssessments: students.filter((s: any) => !s.latestAssessment)
              .length,
            highRiskStudents: highRisk,
            moderateRiskStudents: moderateRisk,
          },
          staff: [...teachers, ...counselors].map((u: any) => ({
            id: u.id,
            name: u.name || "Unknown",
            email: u.email,
            role: u.role,
            studentCount: u.studentCount || 0,
            assessmentsCompleted: u.assessmentsCompleted || 0,
          })),
          recentActivity: [], // Placeholder for activity feed
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        userRole="PRINCIPAL"
        title="School Dashboard"
        description="Loading school data..."
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
      <DashboardLayout userRole="PRINCIPAL" title="School Dashboard">
        <Alert variant="error" title="Error loading dashboard">
          {error || "Failed to load dashboard data. Please try again."}
        </Alert>
      </DashboardLayout>
    );
  }

  // Library Tab View
  if (currentTab === "library") {
    return (
      <DashboardLayout
        userRole="PRINCIPAL"
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
        userRole="PRINCIPAL"
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

  // Staff Tab View
  if (currentTab === "staff") {
    return (
      <DashboardLayout
        userRole="PRINCIPAL"
        title="Staff Overview"
        description="Manage teachers and counselors"
      >
        <div className="space-y-6">
          {/* Staff Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Teachers
                    </p>
                    <p className="text-3xl font-bold">
                      {data.stats.totalTeachers}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Counselors
                    </p>
                    <p className="text-3xl font-bold">
                      {data.stats.totalCounselors}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <CardTitle>All Staff</CardTitle>
            </CardHeader>
            <CardContent>
              {data.staff.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12" />}
                  title="No staff members"
                  description="Staff will appear here once added to your school"
                />
              ) : (
                <div className="space-y-3">
                  {data.staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            member.role === "TEACHER" ? "default" : "secondary"
                          }
                        >
                          {member.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {member.studentCount} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Analytics Tab View
  if (currentTab === "analytics") {
    return (
      <DashboardLayout
        userRole="PRINCIPAL"
        title="School Analytics"
        description="Performance metrics and insights"
      >
        <div className="space-y-6">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Student Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {data.stats.totalStudents -
                      data.stats.highRiskStudents -
                      data.stats.moderateRiskStudents}
                  </p>
                  <p className="text-sm text-green-600 font-medium">Low Risk</p>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {data.stats.moderateRiskStudents}
                  </p>
                  <p className="text-sm text-yellow-600 font-medium">
                    Moderate Risk
                  </p>
                </div>
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {data.stats.highRiskStudents}
                  </p>
                  <p className="text-sm text-red-600 font-medium">High Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {data.stats.completedAssessments} of{" "}
                    {data.stats.totalStudents} students assessed
                  </span>
                  <span className="font-medium">
                    {data.stats.totalStudents > 0
                      ? Math.round(
                          (data.stats.completedAssessments /
                            data.stats.totalStudents) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${
                        data.stats.totalStudents > 0
                          ? (data.stats.completedAssessments /
                              data.stats.totalStudents) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title="More analytics coming soon"
            description="Detailed trends and insights will be available in a future update"
          />
        </div>
      </DashboardLayout>
    );
  }

  // Reports Tab View
  if (currentTab === "reports") {
    return (
      <DashboardLayout
        userRole="PRINCIPAL"
        title="Reports"
        description="Generate and view school reports"
      >
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Reports coming soon"
          description="School-wide reporting features are in development"
        />
      </DashboardLayout>
    );
  }

  // Default Dashboard View
  return (
    <DashboardLayout
      userRole="PRINCIPAL"
      title="School Dashboard"
      description={`Managing ${data.stats.totalStudents} students across your school`}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid
          stats={[
            {
              label: "Total Students",
              value: data.stats.totalStudents,
              icon: <Users className="h-6 w-6" />,
            },
            {
              label: "Staff Members",
              value: data.stats.totalTeachers + data.stats.totalCounselors,
              icon: <GraduationCap className="h-6 w-6" />,
            },
            {
              label: "Assessments Done",
              value: data.stats.completedAssessments,
              icon: <FileText className="h-6 w-6" />,
            },
            {
              label: "High Risk",
              value: data.stats.highRiskStudents,
              icon: <AlertTriangle className="h-6 w-6" />,
            },
          ]}
        />

        {/* High Risk Alert */}
        {data.stats.highRiskStudents > 0 && (
          <Alert variant="warning" title="Action Required">
            {data.stats.highRiskStudents} students have been identified as high
            risk and may need immediate attention from counselors.
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/principal?tab=staff")}
          >
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">View Staff</p>
                  <p className="text-sm text-muted-foreground">
                    Manage teachers & counselors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/principal?tab=analytics")}
          >
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    View school insights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/principal?tab=reports")}
          >
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Generate school reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  School-wide completion rate
                </span>
                <span className="font-medium">
                  {data.stats.totalStudents > 0
                    ? Math.round(
                        (data.stats.completedAssessments /
                          data.stats.totalStudents) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${
                      data.stats.totalStudents > 0
                        ? (data.stats.completedAssessments /
                            data.stats.totalStudents) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{data.stats.completedAssessments} completed</span>
                <span>{data.stats.pendingAssessments} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function PrincipalPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout userRole="PRINCIPAL" title="School Dashboard">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <PrincipalDashboardContent />
    </Suspense>
  );
}
