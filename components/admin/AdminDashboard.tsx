"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManager } from "./UserManager";
import { AssessmentManager } from "./AssessmentManager";
import { SystemStats } from "./SystemStats";
import LicenseManager from "./LicenseManager";
import EmailSettings from "./EmailSettings";
import { Users, BarChart3, Brain, Key, Mail } from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("assessments");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="assessments" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Assessments
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="licenses" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Licenses
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Statistics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assessments">
        <AssessmentManager />
      </TabsContent>

      <TabsContent value="users">
        <UserManager />
      </TabsContent>

      <TabsContent value="licenses">
        <LicenseManager />
      </TabsContent>

      <TabsContent value="email">
        <EmailSettings />
      </TabsContent>

      <TabsContent value="stats">
        <SystemStats />
      </TabsContent>
    </Tabs>
  );
}
