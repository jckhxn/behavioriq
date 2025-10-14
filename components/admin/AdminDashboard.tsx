"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemStats } from "./SystemStats";
import { AssessmentBuilder } from "./AssessmentBuilder";
import { UserManagementTab } from "./UserManagementTab";
import { SystemSettings } from "./SystemSettings";
import { Users, BarChart3, Settings, FileText } from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("builder");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage assessments, users, and system settings for your organization
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger
            value="builder"
            className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Templates</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <AssessmentBuilder />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
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
