import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import IntentGate from "@/components/district/IntentGate";

interface PageProps {
  params: Promise<{
    schoolId: string;
  }>;
}

export default async function SchoolDetailPage({ params }: PageProps) {
  const { schoolId } = await params;
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "DISTRICT_ADMIN") {
    redirect("/dashboard");
  }

  // Fetch school details from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/district/school/${schoolId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    }
  );

  if (!response.ok) {
    redirect("/dashboard");
  }

  const data = await response.json();

  return (
    <IntentGate
      userId={user.id}
      resourceType="SCHOOL_DETAIL"
      resourceId={schoolId}
      title="View School Details"
      description="You are about to view aggregated student data for this school. This information is for educational planning and early intervention purposes only."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">{data.school.name}</h1>
            <p className="text-muted-foreground">School Overview and Metrics</p>
          </div>
        </div>

        {/* Alert Banner */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  This is NOT a diagnostic tool
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  These metrics are aggregated indicators that may warrant
                  follow-up. They should not be interpreted as diagnoses. All
                  decisions should involve human judgment and appropriate
                  professional consultation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Teachers
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assessments
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalAssessments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                May Warrant Follow-up
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.studentsWithFlaggedDomains}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.totalStudents > 0
                  ? `${Math.round((data.studentsWithFlaggedDomains / data.totalStudents) * 100)}%`
                  : "0%"}{" "}
                of students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grade Level Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Grade Level</CardTitle>
            <CardDescription>
              Distribution of students across grade levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.gradeBreakdown.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No student data available.
              </div>
            ) : (
              <div className="space-y-3">
                {data.gradeBreakdown.map((grade: any) => (
                  <div
                    key={grade.gradeLevel}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{grade.gradeLevel}</Badge>
                      <span className="font-medium">
                        {grade._count} students
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.totalStudents > 0
                        ? `${Math.round((grade._count / data.totalStudents) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Indicators Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Indicators Summary</CardTitle>
            <CardDescription>
              Aggregated counts of domain indicators that may warrant follow-up
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.domainCounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No flagged domains at this time.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {data.domainCounts.map((domain: any) => (
                  <div
                    key={domain.domainName}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{domain.domainName}</p>
                      <p className="text-sm text-muted-foreground">
                        {domain._count} occurrences across assessments
                      </p>
                    </div>
                    <Badge variant="secondary">{domain._count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </IntentGate>
  );
}
