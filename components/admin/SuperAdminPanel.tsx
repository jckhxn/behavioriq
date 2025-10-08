"use client";

import React, { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Database,
  Activity,
  Download,
  Users,
  FileText,
  Save,
} from "lucide-react";

interface PlatformSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  trialAssessmentsEnabled: boolean;
  aiReportsEnabled: boolean;
  maxAiReportsPerUser: number;
}

interface TrialAssessmentConfig {
  name: string;
  description: string;
  questionCount: number;
  domainCount: number;
}

const SuperAdminPanel: React.FC = () => {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    trialAssessmentsEnabled: true,
    aiReportsEnabled: true,
    maxAiReportsPerUser: 10,
  });

  const [trialConfig, setTrialConfig] = useState<TrialAssessmentConfig>({
    name: "Child Behavioral Assessment - Trial",
    description: "Comprehensive behavioral assessment for children aged 6-12",
    questionCount: 15,
    domainCount: 3,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    totalReports: 0,
    activeTrials: 0,
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
          });
        }
      }

      // Load trial assessment info
      const trialResponse = await fetch("/api/assessments/trial");
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        if (trialData.assessment) {
          setTrialConfig((prev) => ({
            ...prev,
            name: trialData.assessment.name || prev.name,
            description: trialData.assessment.description || prev.description,
            questionCount:
              trialData.assessment.questions?.length || prev.questionCount,
            domainCount:
              trialData.assessment.domains?.length || prev.domainCount,
          }));
        }
      }

      // Load basic stats
      setStats({
        totalUsers: 127, // Placeholder - would come from API
        totalAssessments: 89,
        totalReports: 73,
        activeTrials: 24,
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

  const saveTrialConfig = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would update the trial assessment template
      alert("Trial assessment configuration would be updated here");
    } catch (error) {
      console.error("Error saving trial config:", error);
      alert(
        `Failed to save trial config: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        platformSettings,
        trialConfig,
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
      {/* Platform Stats */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Platform Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Current platform statistics and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-semibold">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-semibold">
                {stats.totalAssessments}
              </div>
              <div className="text-xs text-muted-foreground">Assessments</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-semibold">{stats.totalReports}</div>
              <div className="text-xs text-muted-foreground">AI Reports</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-semibold">{stats.activeTrials}</div>
              <div className="text-xs text-muted-foreground">Active Trials</div>
            </div>
          </div>
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
                Enable trial assessments for new users
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
                Enable AI-generated assessment reports
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
              max="100"
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
    </div>
  );
};

export default SuperAdminPanel;
