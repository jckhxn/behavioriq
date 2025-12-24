"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DistrictMetricsCards } from "./DistrictMetricsCards";
import { DistrictFilters } from "./DistrictFilters";
import { StudentListView } from "./StudentListView";
import { Loader2 } from "lucide-react";

interface DistrictUser {
  id: string;
  email: string;
  name: string | null;
  role: "DISTRICT_ADMIN" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";
  districtId?: string;
  teacherId?: string;
}

interface DistrictDashboardProps {
  user: DistrictUser;
}

export function DistrictDashboard({ user }: DistrictDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    gradeLevel: undefined,
    classroomId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    flaggedOnly: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.gradeLevel) params.set("gradeLevel", filters.gradeLevel);
      if (filters.classroomId) params.set("classroomId", filters.classroomId);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.flaggedOnly) params.set("flaggedOnly", "true");

      // Fetch metrics and students
      const [metricsRes, studentsRes] = await Promise.all([
        fetch(`/api/district/metrics?${params}`),
        fetch(`/api/district/students?${params}`),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Failed to load district data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            District Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {user.role === "TEACHER"
              ? "View your assigned students and their screening results"
              : "Population-level mental health insights and student screening results"}
          </p>
        </div>
      </div>

      <DistrictFilters
        filters={filters}
        onFiltersChange={setFilters}
        userRole={user.role}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {metrics && <DistrictMetricsCards metrics={metrics} />}

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  This dashboard shows population-level screening data for your{" "}
                  {user.role === "TEACHER" ? "classroom" : "district"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">What you can do:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>
                        View aggregate risk metrics across all screened students
                      </li>
                      <li>Filter by grade level, classroom, or date range</li>
                      <li>
                        Review individual student reports (anonymized by
                        default)
                      </li>
                      <li>Download PDF reports for school teams</li>
                      <li>Access AI-generated intervention recommendations</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">🛡️ FERPA-Safe by Default</p>
                    <p className="text-muted-foreground text-xs">
                      All student data is anonymized by default. Identifiable
                      information is only shown when explicit consent has been
                      documented.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <StudentListView
              students={students}
              userRole={user.role}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
