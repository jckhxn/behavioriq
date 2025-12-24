"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";

interface DomainBreakdown {
  count: number;
  percentage: number;
}

interface DistrictMetrics {
  totalStudents: number;
  studentsScreened: number;
  flaggedStudents: number;
  flaggedPercentage: number;
  averageRiskScore: number;
  domainBreakdown: {
    anxiety: DomainBreakdown;
    depression: DomainBreakdown;
    attention: DomainBreakdown;
    conduct: DomainBreakdown;
    antisocial: DomainBreakdown;
  };
}

interface DistrictMetricsCardsProps {
  metrics: DistrictMetrics;
}

export function DistrictMetricsCards({ metrics }: DistrictMetricsCardsProps) {
  const screeningRate =
    metrics.totalStudents > 0
      ? Math.round((metrics.studentsScreened / metrics.totalStudents) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.studentsScreened} screened ({screeningRate}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Flagged Students
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.flaggedStudents}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.flaggedPercentage}% above screener threshold
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageRiskScore}</div>
          <p className="text-xs text-muted-foreground">
            Out of 100 (population average)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Domain</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {(() => {
            const domains = [
              { name: "Anxiety", ...metrics.domainBreakdown.anxiety },
              { name: "Depression", ...metrics.domainBreakdown.depression },
              { name: "Attention", ...metrics.domainBreakdown.attention },
              { name: "Conduct", ...metrics.domainBreakdown.conduct },
              { name: "Antisocial", ...metrics.domainBreakdown.antisocial },
            ];
            const topDomain = domains.sort((a, b) => b.count - a.count)[0];

            return (
              <>
                <div className="text-2xl font-bold">{topDomain.name}</div>
                <p className="text-xs text-muted-foreground">
                  {topDomain.count} students ({topDomain.percentage}%)
                </p>
              </>
            );
          })()}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Domain Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Anxiety",
                data: metrics.domainBreakdown.anxiety,
                color: "bg-purple-500",
              },
              {
                name: "Depression",
                data: metrics.domainBreakdown.depression,
                color: "bg-blue-500",
              },
              {
                name: "Attention",
                data: metrics.domainBreakdown.attention,
                color: "bg-orange-500",
              },
              {
                name: "Conduct",
                data: metrics.domainBreakdown.conduct,
                color: "bg-red-500",
              },
              {
                name: "Antisocial",
                data: metrics.domainBreakdown.antisocial,
                color: "bg-gray-500",
              },
            ].map((domain) => (
              <div key={domain.name} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium">{domain.name}</div>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${domain.color} flex items-center justify-end pr-3 text-white text-xs font-medium transition-all`}
                    style={{
                      width: `${Math.min(domain.data.percentage, 100)}%`,
                    }}
                  >
                    {domain.data.percentage > 10 &&
                      `${domain.data.percentage}%`}
                  </div>
                </div>
                <div className="w-20 text-sm text-muted-foreground text-right">
                  {domain.data.count} students
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Students may be flagged in multiple domains
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
