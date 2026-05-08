"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Shield,
  Settings,
  Globe,
  Users,
  Brain,
  AlertTriangle,
  Library,
  Download,
  Mail,
  BarChart3,
  FileText,
  Wrench,
  Flag,
  Bell,
} from "lucide-react";
import ResourceLibraryManager from "@/components/admin/ResourceLibraryManager";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { SESUsageWidget } from "@/components/admin/SESUsageWidget";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { LeadsManagementTab } from "@/components/admin/LeadsManagementTab";
import { AssessmentBuilder } from "@/components/admin/AssessmentBuilder";
import TemplatesAndStylesTab from "@/components/admin/TemplatesAndStylesTab";
import { FeatureFlagsManager } from "@/components/admin/FeatureFlagsManager";
import { PushNotificationsTab } from "@/components/admin/PushNotificationsTab";

interface PlatformSettings {
  id: string;
  globalTrialAssessmentId?: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  trialAssessmentsEnabled: boolean;
  aiReportsEnabled: boolean;
  maxAiReportsPerUser: number;
  maxConversationalSessionsPerUser: number;
  emailSendingEnabled: boolean;
  sesMonthlyBudget: number;
  globalTrialAssessment?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export function SuperAdminPlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [availableAssessments, setAvailableAssessments] = useState<
    AssessmentTemplate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/platform-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data.settings,
          maxConversationalSessionsPerUser:
            data.settings.maxConversationalSessionsPerUser ?? 10,
        });
        setAvailableAssessments(data.availableAssessments);
      } else {
        toast.error("Failed to load platform settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load platform settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/platform-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data.settings,
          maxConversationalSessionsPerUser:
            data.settings.maxConversationalSessionsPerUser ?? 10,
        });
        toast.success("Platform settings updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const toggleAssessmentActive = async (id: string, currentlyActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/assessment-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });
      if (res.ok) {
        setAvailableAssessments((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isActive: !currentlyActive } : t))
        );
        toast.success(`Assessment ${!currentlyActive ? "enabled" : "disabled"}`);
      } else {
        toast.error("Failed to update assessment");
      }
    } catch {
      toast.error("Failed to update assessment");
    } finally {
      setTogglingId(null);
    }
  };

  const exportPlatformData = () => {
    try {
      const data = {
        platformSettings: settings,
        exportedAt: new Date().toISOString(),
        exportedBy: "Super Admin",
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
      toast.success("Platform data exported successfully");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export platform data");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading platform settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p>Failed to load platform settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Super Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage platform settings, resources, and administrative tools.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
          <TabsTrigger value="platform" className="whitespace-nowrap">
            <Settings className="h-4 w-4 mr-2" />
            Platform
          </TabsTrigger>
          <TabsTrigger value="analytics" className="whitespace-nowrap">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="assessments" className="whitespace-nowrap">
            <FileText className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="users" className="whitespace-nowrap">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="leads" className="whitespace-nowrap">
            <Mail className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="resources" className="whitespace-nowrap">
            <Library className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="templates" className="whitespace-nowrap">
            <Mail className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="tools" className="whitespace-nowrap">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="notifications" className="whitespace-nowrap">
            <Bell className="h-4 w-4 mr-1" />
            Push
          </TabsTrigger>
          <TabsTrigger value="feature-flags" className="whitespace-nowrap">
            <Flag className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6 mt-6">
          {/* Available Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Available Assessments
              </CardTitle>
              <CardDescription>
                Toggle which assessments are available to users. Active assessments appear in the iOS app and web assessment picker.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableAssessments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No assessment templates found. Create one in the Assessments tab.</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {availableAssessments.map((assessment) => {
                    const isTrialTemplate = assessment.id === settings.globalTrialAssessmentId;
                    return (
                      <div key={assessment.id} className="flex items-center justify-between px-4 py-3">
                        <div className="space-y-0.5 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{assessment.name}</span>
                            {isTrialTemplate && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                                TRIAL SOURCE
                              </span>
                            )}
                          </div>
                          {assessment.description && (
                            <p className="text-xs text-muted-foreground truncate">{assessment.description}</p>
                          )}
                        </div>
                        <Switch
                          checked={assessment.isActive}
                          disabled={togglingId === assessment.id}
                          onCheckedChange={() => toggleAssessmentActive(assessment.id, assessment.isActive)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trial Assessment Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Trial Assessment Source
              </CardTitle>
              <CardDescription>
                The template whose <code className="bg-muted px-1 rounded text-[10px]">isTrial: true</code> questions are served to anonymous trial users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="trial-assessment">Trial Source Template</Label>
                <Select
                  value={settings.globalTrialAssessmentId || "none"}
                  onValueChange={(value) =>
                    updateSetting("globalTrialAssessmentId", value === "none" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trial source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (trial disabled)</SelectItem>
                    {availableAssessments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {settings.globalTrialAssessment && (
                  <p className="text-xs text-muted-foreground">Current: {settings.globalTrialAssessment.name}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Controls
              </CardTitle>
              <CardDescription>
                System-wide feature toggles and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable platform access for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting("maintenanceMode", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new user account creation
                    </p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("registrationEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trial Assessments</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable free trial assessments
                    </p>
                  </div>
                  <Switch
                    checked={settings.trialAssessmentsEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("trialAssessmentsEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-generated reports
                    </p>
                  </div>
                  <Switch
                    checked={settings.aiReportsEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("aiReportsEnabled", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Control AI usage and limits across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-ai-reports">
                    Max AI Reports Per User
                  </Label>
                  <Input
                    id="max-ai-reports"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxAiReportsPerUser}
                    onChange={(e) =>
                      updateSetting(
                        "maxAiReportsPerUser",
                        parseInt(e.target.value) || 10
                      )
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of AI reports a user can generate (to control
                    costs)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-ai-convos">
                    Max Conversational Sessions Per User
                  </Label>
                  <Input
                    id="max-ai-convos"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.maxConversationalSessionsPerUser}
                    onChange={(e) =>
                      updateSetting(
                        "maxConversationalSessionsPerUser",
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of conversational AI sessions a user can run.
                    Set to 0 to block usage entirely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email / SES Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email / SES Configuration
                </CardTitle>
                <CardDescription>
                  Control email sending and manage SES budget limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Sending</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all email sending platform-wide
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailSendingEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("emailSendingEnabled", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ses-monthly-budget">
                    SES Monthly Budget (USD)
                  </Label>
                  <Input
                    id="ses-monthly-budget"
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    value={settings.sesMonthlyBudget}
                    onChange={(e) =>
                      updateSetting(
                        "sesMonthlyBudget",
                        parseFloat(e.target.value) || 5.0
                      )
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email sending will be automatically blocked when this budget
                    is exceeded. Cost: $0.10 per 1,000 emails.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SES Usage Widget */}
            <SESUsageWidget />
          </div>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export platform configuration and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportPlatformData}
                variant="outline"
                className="w-full md:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Platform Data
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? "Saving..." : "Save Platform Settings"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>
                System statistics and usage metrics across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment Management
              </CardTitle>
              <CardDescription>
                Create and manage assessment templates for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <LeadsManagementTab />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourceLibraryManager />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & PDF Templates
              </CardTitle>
              <CardDescription>
                Customize email templates and PDF styling for assessment
                reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full mx-auto">
              <TemplatesAndStylesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <PushNotificationsTab />
        </TabsContent>

        <TabsContent value="feature-flags" className="mt-6">
          <FeatureFlagsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
