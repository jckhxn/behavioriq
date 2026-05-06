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
  Loader2,
  Building2,
  Settings as SettingsIcon,
  Plus,
  Download,
  GraduationCap,
} from "lucide-react";
import {
  DashboardLayout,
  EmptyState,
  StatsGrid,
} from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge, RiskBadge, StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DistrictMetricsCards } from "./DistrictMetricsCards";
import { DistrictFilters, type Filters } from "./DistrictFilters";
import { StudentListView } from "./StudentListView";
import UserResourceLibrary from "@/components/resources/UserResourceLibrary";
import SettingsPane from "@/components/settings/SettingsPane";
import { OnboardingProvider } from "@/lib/contexts/OnboardingContext";

interface DistrictUser {
  id: string;
  email: string;
  name: string | null;
  role:
    | "DISTRICT_ADMIN"
    | "PRINCIPAL"
    | "COUNSELOR"
    | "TEACHER"
    | "ADMIN"
    | "SUPER_ADMIN";
  districtId?: string;
  teacherId?: string;
}

interface DistrictAdminDashboardProps {
  user: DistrictUser;
}

interface DistrictData {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalAssessments: number;
  schools: Array<{
    id: string;
    name: string;
    _count: {
      classrooms: number;
    };
  }>;
  riskBreakdown?: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
    VERY_HIGH: number;
  };
}

function DistrictAdminDashboardInner({ user }: DistrictAdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  const [data, setData] = useState<DistrictData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({ flaggedOnly: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.gradeLevel) params.set("gradeLevel", filters.gradeLevel);
      if (filters.classroomId) params.set("classroomId", filters.classroomId);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.flaggedOnly) params.set("flaggedOnly", "true");

      const [dashboardRes, studentsRes, metricsRes] = await Promise.all([
        fetch(`/api/district/dashboard`),
        fetch(`/api/district/students?${params}`),
        fetch(`/api/district/metrics?${params}`),
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();

        // Merge metrics data if available
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setData({
            ...dashboardData,
            riskBreakdown: metricsData.riskBreakdown,
          });
        } else {
          setData(dashboardData);
        }
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        "/api/district/export?format=csv&scope=district"
      );
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `district-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="District Dashboard"
        description="Loading district data..."
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

  if (error) {
    return (
      <DashboardLayout userRole="DISTRICT_ADMIN" title="District Dashboard">
        <Alert variant="error" title="Error loading dashboard">
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  // Library Tab
  if (currentTab === "library") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="Resource Library"
        description="Access helpful resources and materials"
      >
        <div className="max-w-7xl mx-auto">
          <UserResourceLibrary />
        </div>
      </DashboardLayout>
    );
  }

  // Settings Tab
  if (currentTab === "settings") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="Settings"
        description="Manage your district settings"
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

  // Schools Tab
  if (currentTab === "schools") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="Schools"
        description="Manage schools in your district"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {data?.schools.length || 0} schools in district
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>

          {data?.schools.length === 0 ? (
            <EmptyState
              icon={<School className="h-12 w-12" />}
              title="No schools yet"
              description="Add your first school to get started"
            />
          ) : (
            <div className="space-y-3">
              {data?.schools.map((school) => (
                <Card
                  key={school.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/district/school/${school.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <School className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{school.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {school._count.classrooms} classrooms
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Users Tab
  if (currentTab === "users") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="Users"
        description="Manage district staff and users"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {data?.totalTeachers || 0} teachers across all schools
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="User management coming soon"
            description="User management features are in development"
          />
        </div>
      </DashboardLayout>
    );
  }

  // Analytics Tab
  if (currentTab === "analytics") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="District Analytics"
        description="Performance metrics across your district"
      >
        <div className="space-y-6">
          {/* Risk Distribution */}
          {data?.riskBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {data.riskBreakdown.LOW || 0}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      Low Risk
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-center">
                    <p className="text-3xl font-bold text-yellow-600">
                      {data.riskBreakdown.MODERATE || 0}
                    </p>
                    <p className="text-sm text-yellow-600 font-medium">
                      Moderate
                    </p>
                  </div>
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-center">
                    <p className="text-3xl font-bold text-orange-600">
                      {data.riskBreakdown.HIGH || 0}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">
                      High Risk
                    </p>
                  </div>
                  <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {data.riskBreakdown.VERY_HIGH || 0}
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      Very High
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title="More analytics coming soon"
            description="Detailed trends and insights will be available in a future update"
          />
        </div>
      </DashboardLayout>
    );
  }

  // Students Tab (filtered view)
  if (currentTab === "students") {
    return (
      <DashboardLayout
        userRole="DISTRICT_ADMIN"
        title="Students"
        description="View and manage district students"
      >
        <div className="space-y-6">
          <DistrictFilters
            filters={filters}
            onFiltersChange={setFilters}
            userRole={user.role}
          />
          <StudentListView
            students={students}
            userRole={user.role}
            onRefresh={loadData}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Default Dashboard View
  const highRiskCount =
    (data?.riskBreakdown?.HIGH || 0) + (data?.riskBreakdown?.VERY_HIGH || 0);
  const dashboardSections = [
    { id: "dashboard-overview", label: "Overview" },
    ...(highRiskCount > 0
      ? [{ id: "risk-alert", label: "Risk Alerts" }]
      : []),
    { id: "quick-actions", label: "Quick Actions" },
    { id: "schools-overview", label: "Schools Overview" },
    { id: "ferpa-notice", label: "FERPA Notice" },
  ];

  return (
    <DashboardLayout
      userRole="DISTRICT_ADMIN"
      title="District Dashboard"
      description={`Managing ${data?.totalStudents || 0} students across ${data?.totalSchools || 0} schools`}
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8">
        <div className="space-y-6">
        {/* Stats Grid */}
          <section id="dashboard-overview" className="scroll-mt-24">
            <StatsGrid
              stats={[
                {
                  label: "Total Students",
                  value: data?.totalStudents || 0,
                  icon: <Users className="h-6 w-6" />,
                },
                {
                  label: "Schools",
                  value: data?.totalSchools || 0,
                  icon: <School className="h-6 w-6" />,
                },
                {
                  label: "Teachers",
                  value: data?.totalTeachers || 0,
                  icon: <GraduationCap className="h-6 w-6" />,
                },
                {
                  label: "Assessments",
                  value: data?.totalAssessments || 0,
                  icon: <FileText className="h-6 w-6" />,
                },
              ]}
            />
          </section>

        {/* High risk alert */}
        {highRiskCount > 0 && (
          <section id="risk-alert" className="scroll-mt-24">
            <Alert variant="warning" title="Attention Required">
              {highRiskCount} students across the district have been identified as
              high risk and may need intervention.
            </Alert>
          </section>
        )}

        {/* Quick Actions */}
          <section id="quick-actions" className="scroll-mt-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/district?tab=students")}
              >
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">View Students</p>
                      <p className="text-sm text-muted-foreground">
                        Browse all district students
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/district?tab=schools")}
              >
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <School className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Manage Schools</p>
                      <p className="text-sm text-muted-foreground">
                        View and configure schools
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/district?tab=analytics")}
              >
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Analytics</p>
                      <p className="text-sm text-muted-foreground">
                        District-wide insights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Schools Overview */}
          <section id="schools-overview" className="scroll-mt-24">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Schools Overview</CardTitle>
                  <CardDescription>Schools in your district</CardDescription>
                </div>
                <Button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  variant="outline"
                  size="sm"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {data?.schools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schools found. Add your first school to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.schools.slice(0, 5).map((school) => (
                      <div
                        key={school.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => router.push(`/district/school/${school.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <School className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{school.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {school._count.classrooms} classrooms
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                    {(data?.schools.length || 0) > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.push("/district?tab=schools")}
                      >
                        View all {data?.schools.length} schools
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* FERPA Notice */}
          <section id="ferpa-notice" className="scroll-mt-24">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">🛡️ FERPA-Safe by Default</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All student data is anonymized by default. Identifiable
                      information is only shown when explicit consent has been
                      documented.
                    </p>
                  </div>
                </div>
                </CardContent>
            </Card>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-1/2 -translate-y-1/2 max-h-[70vh] overflow-y-auto rounded-xl border bg-card/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Dashboard Sections
            </p>
            <nav className="space-y-1">
              {dashboardSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

export function DistrictAdminDashboard({ user }: DistrictAdminDashboardProps) {
  return (
    <Suspense
      fallback={
        <DashboardLayout userRole="DISTRICT_ADMIN" title="District Dashboard">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <DistrictAdminDashboardInner user={user} />
    </Suspense>
  );
}
