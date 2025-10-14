"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Shield, TrendingUp, Megaphone } from "lucide-react";

interface NotificationPreferences {
  assessmentComplete: boolean;
  assessmentShared: boolean;
  licenseExpiring: boolean;
  licenseRenewed: boolean;
  newRecommendation: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
  accountUpdate: boolean;
  securityAlert: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (!response.ok) {
        throw new Error("Failed to load notification preferences");
      }
      const data = await response.json();
      setPreferences(data.data);
    } catch (error) {
      console.error("Error loading notification preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    // Optimistic update
    const previousPreferences = { ...preferences };
    setPreferences({ ...preferences, [key]: value });

    setUpdating(true);
    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preference");
      }

      const data = await response.json();
      setPreferences(data.data);
      toast.success("Preference updated");
    } catch (error) {
      console.error("Error updating preference:", error);
      // Revert on error
      setPreferences(previousPreferences);
      toast.error("Failed to update preference");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Email Notifications</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Loading preferences...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Email Notifications</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Choose which emails you'd like to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assessment Notifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold">Assessment Updates</h3>
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Assessment Complete</Label>
              <p className="text-xs text-muted-foreground">
                Notify when an assessment is completed
              </p>
            </div>
            <Switch
              checked={preferences.assessmentComplete}
              onCheckedChange={(checked) =>
                updatePreference("assessmentComplete", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Assessment Shared</Label>
              <p className="text-xs text-muted-foreground">
                Notify when someone shares an assessment with you
              </p>
            </div>
            <Switch
              checked={preferences.assessmentShared}
              onCheckedChange={(checked) =>
                updatePreference("assessmentShared", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">New Recommendations</Label>
              <p className="text-xs text-muted-foreground">
                Notify when AI generates new recommendations
              </p>
            </div>
            <Switch
              checked={preferences.newRecommendation}
              onCheckedChange={(checked) =>
                updatePreference("newRecommendation", checked)
              }
              disabled={updating}
            />
          </div>
        </div>

        <Separator />

        {/* License Notifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold">License & Billing</h3>
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">License Expiring</Label>
              <p className="text-xs text-muted-foreground">
                Notify when your license is about to expire
              </p>
            </div>
            <Switch
              checked={preferences.licenseExpiring}
              onCheckedChange={(checked) =>
                updatePreference("licenseExpiring", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">License Renewed</Label>
              <p className="text-xs text-muted-foreground">
                Notify when your license is successfully renewed
              </p>
            </div>
            <Switch
              checked={preferences.licenseRenewed}
              onCheckedChange={(checked) =>
                updatePreference("licenseRenewed", checked)
              }
              disabled={updating}
            />
          </div>
        </div>

        <Separator />

        {/* Summary Notifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold">Activity Summaries</h3>
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Weekly Summary</Label>
              <p className="text-xs text-muted-foreground">
                Receive a weekly digest of your activity
              </p>
            </div>
            <Switch
              checked={preferences.weeklySummary}
              onCheckedChange={(checked) =>
                updatePreference("weeklySummary", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Monthly Summary</Label>
              <p className="text-xs text-muted-foreground">
                Receive a monthly digest of your activity
              </p>
            </div>
            <Switch
              checked={preferences.monthlySummary}
              onCheckedChange={(checked) =>
                updatePreference("monthlySummary", checked)
              }
              disabled={updating}
            />
          </div>
        </div>

        <Separator />

        {/* Account & Security */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold">Account & Security</h3>
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Account Updates</Label>
              <p className="text-xs text-muted-foreground">
                Important updates about your account
              </p>
            </div>
            <Switch
              checked={preferences.accountUpdate}
              onCheckedChange={(checked) =>
                updatePreference("accountUpdate", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5 flex-1">
              <Label className="text-xs font-medium">Security Alerts</Label>
              <p className="text-xs text-muted-foreground">
                Critical security notifications (always enabled)
              </p>
            </div>
            <Switch
              checked={preferences.securityAlert}
              disabled={true}
              className="opacity-50"
            />
          </div>
        </div>

        <Separator />

        {/* Marketing & Product Updates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold">News & Updates</h3>
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Product Updates</Label>
              <p className="text-xs text-muted-foreground">
                Learn about new features and improvements
              </p>
            </div>
            <Switch
              checked={preferences.productUpdates}
              onCheckedChange={(checked) =>
                updatePreference("productUpdates", checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between pl-5">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Marketing Emails</Label>
              <p className="text-xs text-muted-foreground">
                Tips, offers, and promotional content
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) =>
                updatePreference("marketingEmails", checked)
              }
              disabled={updating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
