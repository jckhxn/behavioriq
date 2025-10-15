"use client";

import React, { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Activity,
  Download,
  Users,
  Save,
  Library,
  FileText,
  BarChart3,
} from "lucide-react";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import ResourceLibraryManager from "@/components/admin/ResourceLibraryManager";
import { AssessmentBuilder } from "@/components/admin/AssessmentBuilder";
import { SystemStats } from "@/components/admin/SystemStats";
import { TemplatesAndStylesTab } from "@/components/admin/TemplatesAndStylesTab";

interface PlatformSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  trialAssessmentsEnabled: boolean;
  aiReportsEnabled: boolean;
  maxAiReportsPerUser: number;
  maxConversationalSessionsPerUser: number;
}

const SuperAdminPanel: React.FC = () => {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("platform");

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    trialAssessmentsEnabled: true,
    aiReportsEnabled: true,
    maxAiReportsPerUser: 10,
    maxConversationalSessionsPerUser: 10,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    totalReports: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load platform settings
      const settingsResponse = await fetch("/api/admin/platform-settings");
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.data) {
          setPlatformSettings({
            maintenanceMode: settingsData.data.maintenanceMode || false,
            registrationEnabled:
              settingsData.data.registrationEnabled !== false,
            trialAssessmentsEnabled:
              settingsData.data.trialAssessmentsEnabled !== false,
            aiReportsEnabled: settingsData.data.aiReportsEnabled !== false,
            maxAiReportsPerUser: settingsData.data.maxAiReportsPerUser || 10,
            maxConversationalSessionsPerUser:
              settingsData.data.maxConversationalSessionsPerUser ?? 10,
          });
        }
      }

      // Load basic stats
      setStats({
        totalUsers: 127, // Placeholder - would come from API
        totalAssessments: 89,
        totalReports: 73,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const savePlatformSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/platform-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(platformSettings),
      });

      if (response.ok) {
        alert("Platform settings updated successfully!");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving platform settings:", error);
      alert(
        `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        platformSettings,
        stats,
        exportedAt: new Date().toISOString(),
        exportedBy: userData?.email,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `platform-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const userRole = userData?.role;
  if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
    return null; // Return null instead of error card since this is integrated into preferences
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full mb-3 ${userData?.role === "SUPER_ADMIN" ? "grid-cols-4" : "grid-cols-2"}`}>
          <TabsTrigger value="platform" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Users
          </TabsTrigger>
          {userData?.role === "SUPER_ADMIN" && (
            <>
              <TabsTrigger value="resources" className="text-xs">
                <Library className="h-3 w-3 mr-1" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Templates
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Platform Tab */}
        <TabsContent value="platform" className="space-y-4 mt-0">
          {/* Analytics */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </CardTitle>
              <CardDescription className="text-xs">
                Platform statistics and system overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStats />
            </CardContent>
          </Card>

          {/* Assessment Management */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Assessment Management
              </CardTitle>
              <CardDescription className="text-xs">
                Create and manage assessment templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentBuilder />
            </CardContent>
          </Card>

      {/* Platform Settings */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Platform Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Global platform configuration and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">
                Disable platform access for maintenance
              </p>
            </div>
            <Switch
              checked={platformSettings.maintenanceMode}
              onCheckedChange={(checked) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  maintenanceMode: checked,
                }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">User Registration</Label>
              <p className="text-xs text-muted-foreground">
                Allow new user registrations
              </p>
            </div>
            <Switch
              checked={platformSettings.registrationEnabled}
              onCheckedChange={(checked) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  registrationEnabled: checked,
                }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">Trial Assessments</Label>
              <p className="text-xs text-muted-foreground">
                Allow users to take trial assessments
              </p>
            </div>
            <Switch
              checked={platformSettings.trialAssessmentsEnabled}
              onCheckedChange={(checked) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  trialAssessmentsEnabled: checked,
                }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">AI Reports</Label>
              <p className="text-xs text-muted-foreground">
                Enable AI-generated assessment reports for all users
              </p>
            </div>
            <Switch
              checked={platformSettings.aiReportsEnabled}
              onCheckedChange={(checked) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  aiReportsEnabled: checked,
                }))
              }
            />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="maxReports" className="text-xs">
              Max AI Reports per User
            </Label>
            <p className="text-xs text-muted-foreground">
              Maximum AI reports allowed per user (supersedes license limits)
            </p>
            <Input
              id="maxReports"
              type="number"
              value={platformSettings.maxAiReportsPerUser}
              onChange={(e) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  maxAiReportsPerUser: parseInt(e.target.value) || 10,
                }))
              }
              className="h-8 text-xs"
              min="1"
              max="1000"
            />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label htmlFor="maxConvos" className="text-xs">
              Max Conversational Sessions per User
            </Label>
            <p className="text-xs text-muted-foreground">
              Maximum conversational AI sessions allowed per user.
            </p>
            <Input
              id="maxConvos"
              type="number"
              value={platformSettings.maxConversationalSessionsPerUser}
              onChange={(e) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  maxConversationalSessionsPerUser: Math.max(
                    0,
                    parseInt(e.target.value) || 0
                  ),
                }))
              }
              className="h-8 text-xs"
              min="0"
              max="1000"
            />
          </div>
          <Button
            onClick={savePlatformSettings}
            disabled={loading}
            size="sm"
            className="w-full mt-3"
          >
            <Save className="h-3 w-3 mr-1" />
            {loading ? "Saving..." : "Save Platform Settings"}
          </Button>
        </CardContent>
      </Card>

          {/* Data Export */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription className="text-xs">
                Export platform data and configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download className="h-3 w-3 mr-1" />
                Export Platform Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-0">
          <UserManagementTab />
        </TabsContent>

        {/* Resources Tab - Only for SUPER_ADMIN */}
        {userData?.role === "SUPER_ADMIN" && (
          <TabsContent value="resources" className="space-y-4 mt-0">
            <ResourceLibraryManager />
          </TabsContent>
        )}

        {/* Templates & Styles Tab - Only for SUPER_ADMIN */}
        {userData?.role === "SUPER_ADMIN" && (
          <TabsContent value="templates" className="space-y-4 mt-0">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Email & PDF Templates
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize email templates and PDF styling for reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesAndStylesTab />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SuperAdminPanel;
