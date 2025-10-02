"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings,
  Bell,
  Shield,
  Download,
  Trash2,
  Database,
  Activity,
} from "lucide-react";
import SuperAdminPanel from "@/components/admin/SuperAdminPanel";

interface UserSettings {
  compactView: boolean;
  autoSave: boolean;
  emailNotifications: boolean;
  assessmentReminders: boolean;
  reportGeneration: boolean;
}

interface SystemSettings {
  maxDailyAICalls: number;
  maxMonthlyCost: number;
  enableDataExport: boolean;
  enableMockMode: boolean;
}

const SettingsPane: React.FC = () => {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  // Helper function to check if user is admin
  const isAdmin = () => {
    const userRole = session?.user?.role as string;
    return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  };

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  // Update profile data when session changes
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session?.user?.name, session?.user?.email]);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    compactView: false,
    autoSave: true,
    emailNotifications: true,
    assessmentReminders: true,
    reportGeneration: true,
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxDailyAICalls: 1000,
    maxMonthlyCost: 1000,
    enableDataExport: true,
    enableMockMode: false,
  });

  useEffect(() => {
    loadSettings();
    loadProfileFromDatabase();
  }, []);

  const loadProfileFromDatabase = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile from database:", error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load user preferences from localStorage for now
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        setUserSettings(JSON.parse(saved));
      }

      // Load system settings if admin or super admin
      if (isAdmin()) {
        // In a real app, this would fetch from an API
        setSystemSettings({
          maxDailyAICalls: 1000,
          maxMonthlyCost: 1000,
          enableDataExport: true,
          enableMockMode: true,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveUserSettings = async (newSettings: UserSettings) => {
    setLoading(true);
    try {
      // Save to localStorage for now
      localStorage.setItem("userSettings", JSON.stringify(newSettings));
      setUserSettings(newSettings);

      // In a real app, you'd save to a database
      // await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Updating profile...");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const data = await response.json();

      // Update the session with the new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          email: data.user.email,
        },
      });

      // Reload profile from database to ensure UI is in sync
      await loadProfileFromDatabase();

      toast.success("Profile updated successfully!", {
        id: loadingToast,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
        {
          id: loadingToast,
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // In a real app, this would export user data
      const data = {
        profile: profileData,
        settings: userSettings,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const deleteAccount = async () => {
    const confirmMessage =
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your assessments, recommendations, and data.";

    if (!confirm(confirmMessage)) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleConfirm !== "DELETE") return;

    try {
      // In a real app, this would delete the account
      console.log("Account deletion requested");
      alert(
        "Account deletion requested. This feature is not implemented in demo mode."
      );
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <div className="p-3 space-y-3">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-3">
          <TabsTrigger value="profile" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            {isAdmin() ? "Admin Settings" : "Preferences"}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-3">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Profile</CardTitle>
              <CardDescription className="text-xs">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs">
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Your display name"
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="your.email@example.com"
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Account Role</Label>
                <Badge variant="secondary" className="w-fit text-xs">
                  {session?.user?.role || "USER"}
                </Badge>
              </div>
              <Button
                onClick={updateProfile}
                disabled={loading}
                size="sm"
                className="w-full"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-3">
          {/* Super Admin Settings - Main Content */}
          {isAdmin() && <SuperAdminPanel />}

          {/* User Preferences - Secondary for Admins */}
          {!isAdmin() && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">User Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Customize your personal application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Switch theme
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light");
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Compact View</Label>
                    <p className="text-xs text-muted-foreground">
                      Show more info
                    </p>
                  </div>
                  <Switch
                    checked={userSettings.compactView}
                    onCheckedChange={(checked) => {
                      const newSettings = {
                        ...userSettings,
                        compactView: checked,
                      };
                      saveUserSettings(newSettings);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Theme Settings for Admins */}
          {isAdmin() && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Personal Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Your personal settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Switch theme
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light");
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPane;
