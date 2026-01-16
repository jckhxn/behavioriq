"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DomainData {
  domain: string;
  flagged: number;
  total: number;
  percentage: number;
}

interface Summary {
  totalStudents: number;
  studentsNotStarted: number;
  studentsInProgress: number;
  studentsCompleted: number;
  studentsScreened: number;
  studentsFlagged: number;
  flaggedPercentage: number;
  completionRate: number;
}

interface DistrictMetrics {
  summary: Summary;
  domainBreakdown: DomainData[];
  schoolBreakdown?: {
    id: string;
    name: string;
    total: number;
    screened: number;
    flagged: number;
    flaggedPercentage: number;
  }[];
  gradeBreakdown?: {
    grade: string;
    total: number;
    screened: number;
    flagged: number;
    flaggedPercentage: number;
  }[];
}

interface DistrictMetricsCardsProps {
  metrics: DistrictMetrics;
}

const DOMAIN_COLORS: Record<string, string> = {
  Anxiety: "bg-purple-500",
  Mood: "bg-blue-500",
  Attention: "bg-orange-500",
  Conduct: "bg-red-500",
  Social: "bg-green-500",
  Depression: "bg-indigo-500",
  Antisocial: "bg-gray-500",
};

export function DistrictMetricsCards({ metrics }: DistrictMetricsCardsProps) {
  const { summary, domainBreakdown, schoolBreakdown, gradeBreakdown } = metrics;

  // Find the top flagged domain
  const topDomain =
    domainBreakdown.length > 0
      ? domainBreakdown.sort((a, b) => b.flagged - a.flagged)[0]
      : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {summary.studentsScreened} screened ({summary.completionRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.studentsCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.studentsInProgress} in progress •{" "}
              {summary.studentsNotStarted} not started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged for Follow-up
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.studentsFlagged}</div>
            <p className="text-xs text-muted-foreground">
              {summary.flaggedPercentage}% of screened students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Concern Area
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topDomain ? (
              <>
                <div className="text-2xl font-bold">{topDomain.domain}</div>
                <p className="text-xs text-muted-foreground">
                  {topDomain.flagged} students ({topDomain.percentage}%)
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">
                  —
                </div>
                <p className="text-xs text-muted-foreground">No data yet</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Domain Breakdown */}
      {domainBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domain Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Students flagged in each screening domain
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {domainBreakdown.map((domain) => (
                <div key={domain.domain} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium">
                    {domain.domain}
                  </div>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${DOMAIN_COLORS[domain.domain] || "bg-gray-500"} flex items-center justify-end pr-3 text-white text-xs font-medium transition-all`}
                      style={{
                        width: `${Math.max(Math.min(domain.percentage, 100), domain.percentage > 0 ? 8 : 0)}%`,
                      }}
                    >
                      {domain.percentage > 15 && `${domain.percentage}%`}
                    </div>
                  </div>
                  <div className="w-24 text-sm text-muted-foreground text-right">
                    {domain.flagged} / {domain.total}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Students may be flagged in multiple domains. This is a screening
              tool, not a diagnosis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* School Breakdown */}
      {schoolBreakdown && schoolBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schoolBreakdown.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {school.total} students • {school.screened} screened
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">
                      {school.flagged} flagged
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {school.flaggedPercentage}% of screened
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Breakdown */}
      {gradeBreakdown && gradeBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Grade Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {gradeBreakdown.map((grade) => (
                <div
                  key={grade.grade}
                  className="p-3 border rounded-lg text-center"
                >
                  <p className="font-medium">Grade {grade.grade}</p>
                  <p className="text-2xl font-bold">{grade.total}</p>
                  <p className="text-xs text-muted-foreground">
                    {grade.flagged} flagged ({grade.flaggedPercentage}%)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
