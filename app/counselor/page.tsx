"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  AlertTriangle,
  FileText,
  Bell,
  Search,
  Filter,
  BarChart3,
  Loader2,
  UserCheck,
  TrendingUp,
  Clock,
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

// Helper to convert risk level to lowercase format for RiskBadge
function toRiskBadgeLevel(
  level: string
): "low" | "moderate" | "high" | "very_high" {
  return level.toLowerCase().replace("_", "_") as
    | "low"
    | "moderate"
    | "high"
    | "very_high";
}

interface CaseloadStudent {
  id: string;
  anonymousId: string;
  firstName: string | null;
  lastName: string | null;
  gradeLevel: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  lastAssessmentDate: string | null;
  flaggedDomainsCount: number;
  classroom?: {
    name: string;
    school: {
      name: string;
    };
  };
}

interface DashboardData {
  caseloadCount: number;
  highRiskCount: number;
  pendingFollowUps: number;
  recentAssessments: number;
  students: CaseloadStudent[];
}

function CounselorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now, use district students endpoint filtered for counselor view
        const res = await fetch("/api/district/students?flaggedOnly=true");
        if (!res.ok) throw new Error("Failed to fetch caseload data");
        const students = await res.json();

        // Transform data for counselor view
        const highRiskStudents = students.filter(
          (s: any) => s.riskLevel === "HIGH" || s.riskLevel === "VERY_HIGH"
        );

        setData({
          caseloadCount: students.length,
          highRiskCount: highRiskStudents.length,
          pendingFollowUps: Math.floor(students.length * 0.3), // Placeholder
          recentAssessments: Math.floor(students.length * 0.2), // Placeholder
          students: students,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStudents =
    data?.students.filter((student) => {
      const matchesSearch =
        !searchQuery ||
        student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.anonymousId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !filterRisk || student.riskLevel === filterRisk;
      return matchesSearch && matchesFilter;
    }) || [];

  if (loading) {
    return (
      <DashboardLayout
        userRole="COUNSELOR"
        title="Counselor Dashboard"
        description="Loading your caseload data..."
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
      <DashboardLayout userRole="COUNSELOR" title="Counselor Dashboard">
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
        userRole="COUNSELOR"
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
        userRole="COUNSELOR"
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

  // Alerts Tab View
  if (currentTab === "alerts") {
    const highRiskStudents = data.students.filter(
      (s) => s.riskLevel === "HIGH" || s.riskLevel === "VERY_HIGH"
    );

    return (
      <DashboardLayout
        userRole="COUNSELOR"
        title="Risk Alerts"
        description="Students requiring immediate attention"
      >
        <div className="space-y-4">
          {highRiskStudents.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-12 w-12" />}
              title="No high-risk alerts"
              description="All students in your caseload are currently within normal risk levels"
            />
          ) : (
            highRiskStudents.map((student) => (
              <Card
                key={student.id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-shadow",
                  student.riskLevel === "VERY_HIGH" && "border-red-500/50"
                )}
                onClick={() => router.push(`/student/${student.id}`)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.firstName && student.lastName
                            ? `${student.firstName} ${student.lastName}`
                            : student.anonymousId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Grade {student.gradeLevel} •{" "}
                          {student.flaggedDomainsCount} flagged domains
                        </p>
                      </div>
                    </div>
                    <RiskBadge level={toRiskBadgeLevel(student.riskLevel)} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Reports Tab View
  if (currentTab === "reports") {
    return (
      <DashboardLayout
        userRole="COUNSELOR"
        title="Reports"
        description="View and generate caseload reports"
      >
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="Reports coming soon"
          description="Detailed caseload analytics and reporting features are in development"
        />
      </DashboardLayout>
    );
  }

  // Caseload Tab View
  if (currentTab === "caseload") {
    return (
      <DashboardLayout
        userRole="COUNSELOR"
        title="My Caseload"
        description="Students assigned for counseling support"
      >
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {["HIGH", "MODERATE", "LOW"].map((risk) => (
                <button
                  key={risk}
                  onClick={() =>
                    setFilterRisk(filterRisk === risk ? null : risk)
                  }
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    filterRisk === risk
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="No students found"
                description={
                  searchQuery
                    ? "Try adjusting your search"
                    : "No students in caseload"
                }
              />
            ) : (
              filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/student/${student.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {(
                              student.firstName?.[0] || student.anonymousId[0]
                            ).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {student.firstName && student.lastName
                              ? `${student.firstName} ${student.lastName}`
                              : student.anonymousId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Grade {student.gradeLevel}
                            {student.classroom &&
                              ` • ${student.classroom.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.flaggedDomainsCount > 0 && (
                          <Badge variant="warning">
                            {student.flaggedDomainsCount} flagged
                          </Badge>
                        )}
                        <RiskBadge
                          level={toRiskBadgeLevel(student.riskLevel)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default Dashboard View
  return (
    <DashboardLayout
      userRole="COUNSELOR"
      title="Counselor Dashboard"
      description={`Managing ${data.caseloadCount} students in your caseload`}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid
          stats={[
            {
              label: "Total Caseload",
              value: data.caseloadCount,
              icon: <Users className="h-6 w-6" />,
            },
            {
              label: "High Risk",
              value: data.highRiskCount,
              icon: <AlertTriangle className="h-6 w-6" />,
            },
            {
              label: "Pending Follow-ups",
              value: data.pendingFollowUps,
              icon: <Clock className="h-6 w-6" />,
            },
            {
              label: "Recent Assessments",
              value: data.recentAssessments,
              icon: <FileText className="h-6 w-6" />,
            },
          ]}
        />

        {/* High Risk Alerts */}
        {data.highRiskCount > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Priority Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.students
                  .filter(
                    (s) => s.riskLevel === "VERY_HIGH" || s.riskLevel === "HIGH"
                  )
                  .slice(0, 3)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => router.push(`/student/${student.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName && student.lastName
                            ? `${student.firstName} ${student.lastName}`
                            : student.anonymousId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.flaggedDomainsCount} domains flagged
                        </p>
                      </div>
                      <RiskBadge level={toRiskBadgeLevel(student.riskLevel)} />
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push("/counselor?tab=alerts")}
              >
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/counselor?tab=caseload")}
          >
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">View Caseload</p>
                  <p className="text-sm text-muted-foreground">
                    Browse all assigned students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/counselor?tab=reports")}
          >
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Generate Report</p>
                  <p className="text-sm text-muted-foreground">
                    Create caseload summary
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CounselorPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout userRole="COUNSELOR" title="Counselor Dashboard">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <CounselorDashboardContent />
    </Suspense>
  );
}
