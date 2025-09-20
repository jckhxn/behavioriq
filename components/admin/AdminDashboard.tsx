"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentManager } from "./DocumentManager";
import { UserManager } from "./UserManager";
import { AssessmentManager } from "./AssessmentManager";
import { SystemStats } from "./SystemStats";
import { FileText, Users, BarChart3, Brain } from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="assessments" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Assessments
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statistics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="documents">
        <DocumentManager />
      </TabsContent>

      <TabsContent value="assessments">
        <AssessmentManager />
      </TabsContent>

      <TabsContent value="users">
        <UserManager />
      </TabsContent>

      <TabsContent value="stats">
        <SystemStats />
      </TabsContent>
    </Tabs>
  );
}
