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
import { toast } from "sonner";
import {
  Shield,
  Settings,
  Globe,
  Users,
  Brain,
  AlertTriangle,
} from "lucide-react";

interface PlatformSettings {
  id: string;
  globalTrialAssessmentId?: string;
  globalRegularAssessmentId?: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  trialAssessmentsEnabled: boolean;
  aiReportsEnabled: boolean;
  maxAiReportsPerUser: number;
  globalTrialAssessment?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  globalRegularAssessment?: {
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/platform-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
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
        setSettings(data.settings);
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
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Super Admin Platform Settings
          </CardTitle>
          <CardDescription>
            Global configuration for the AI Diagnostic platform. These settings
            affect all users and districts.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Global Assessment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Assessment Configuration
          </CardTitle>
          <CardDescription>
            Set which assessments are available to trial users and regular users
            platform-wide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="trial-assessment">
                Trial Assessment (Free Users)
              </Label>
              <Select
                value={settings.globalTrialAssessmentId || "none"}
                onValueChange={(value) =>
                  updateSetting(
                    "globalTrialAssessmentId",
                    value === "none" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trial assessment..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    None (Disable trial assessments)
                  </SelectItem>
                  {availableAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.name}{" "}
                      {assessment.isActive ? "" : "(Inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {settings.globalTrialAssessment && (
                <p className="text-sm text-muted-foreground">
                  Current: {settings.globalTrialAssessment.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="regular-assessment">
                Regular Assessment (Paid Users)
              </Label>
              <Select
                value={settings.globalRegularAssessmentId || "none"}
                onValueChange={(value) =>
                  updateSetting(
                    "globalRegularAssessmentId",
                    value === "none" ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regular assessment..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    None (Use district-specific assessments)
                  </SelectItem>
                  {availableAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.name}{" "}
                      {assessment.isActive ? "" : "(Inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {settings.globalRegularAssessment && (
                <p className="text-sm text-muted-foreground">
                  Current: {settings.globalRegularAssessment.name}
                </p>
              )}
            </div>
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
              <Label htmlFor="max-ai-reports">Max AI Reports Per User</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? "Saving..." : "Save Platform Settings"}
        </Button>
      </div>
    </div>
  );
}
