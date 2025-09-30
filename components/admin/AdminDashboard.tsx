"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentManager } from "./AssessmentManager";
import { SystemStats } from "./SystemStats";
import { AssessmentBuilder } from "./AssessmentBuilder";
import { UserManagement } from "./UserManagement";
import { SystemSettings } from "./SystemSettings";
import { Users, BarChart3, Brain, Key, FileText } from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("builder");

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage assessments, users, and system settings for your organization
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessment Builder
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Active Assessments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <AssessmentBuilder />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentManager />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="analytics">
          <SystemStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
