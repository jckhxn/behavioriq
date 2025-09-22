"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoringSidebar } from "@/components/scoring/ScoringSidebar";
import { EnhancedVisualizations } from "@/components/analytics/EnhancedVisualizations";
import { BarChart3, TrendingUp } from "lucide-react";

interface EnhancedDashboardProps {
  assessmentId: string;
  subjectName?: string;
}

export function EnhancedDashboard({
  assessmentId,
  subjectName,
}: EnhancedDashboardProps) {
  return (
    <div className="h-full">
      <Tabs defaultValue="scoring" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Live Scoring
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="flex-1 mt-0">
          <ScoringSidebar
            assessmentId={assessmentId}
            subjectName={subjectName}
          />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 mt-0 overflow-auto">
          <EnhancedVisualizations
            assessmentId={assessmentId}
            subjectName={subjectName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
