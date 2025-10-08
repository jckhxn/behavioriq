"use client";

import React, { useState, useEffect } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { useSearchParams } from "next/navigation";
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
  PlayCircle,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import SuperAdminPanel from "@/components/admin/SuperAdminPanel";
import BillingSection from "@/components/settings/BillingSection";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";

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
  const { userData, isLoading: userLoading } = useUserData();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const { startTour } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Helper function to check if user is admin
  const isAdmin = () => {
    const userRole = userData?.role;
    return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  };

  // Check for billing tab in URL params and scroll to upgrade section
  useEffect(() => {
    const subtab = searchParams.get("subtab");
    if (subtab === "billing") {
      console.log(
        "SettingsPane: Detected subtab=billing, switching tab and scrolling..."
      );
      setActiveTab("billing");

      // Scroll to upgrade section with retry logic to ensure DOM is ready
      const scrollToUpgrade = (attempts = 0) => {
        console.log(
          `SettingsPane: Attempting to scroll (attempt ${attempts + 1})...`
        );
        const upgradeSection = document.getElementById("upgrade-plan");
        if (upgradeSection) {
          console.log("SettingsPane: Found upgrade section, scrolling...");

          // Find the scrollable container (TabsContent with overflow-auto)
          const scrollContainer = upgradeSection.closest(".overflow-auto");

          if (scrollContainer) {
            // Scroll within the container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = upgradeSection.getBoundingClientRect();
            const scrollTop = scrollContainer.scrollTop;
            const targetScroll =
              scrollTop +
              elementRect.top -
              containerRect.top -
              containerRect.height / 2 +
              elementRect.height / 2;

            scrollContainer.scrollTo({
              top: targetScroll,
              behavior: "smooth",
            });
          } else {
            // Fallback to regular scrollIntoView
            upgradeSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          console.log("SettingsPane: Upgrade section not found yet");
          if (attempts < 5) {
            // Retry up to 5 times with increasing delays
            setTimeout(
              () => scrollToUpgrade(attempts + 1),
              200 * (attempts + 1)
            );
          } else {
            console.log(
              "SettingsPane: Failed to find upgrade section after 5 attempts"
            );
          }
        }
      };

      // Initial delay to let tab content render
      setTimeout(() => scrollToUpgrade(), 300);
    }
  }, [searchParams]);

  const [profileData, setProfileData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Update profile data when userData changes
  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
      });
    }
  }, [userData?.name, userData?.email]);

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

  // Password strength checker
  const getPasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    if (!password)
      return { score: 0, label: "No password", color: "text-muted-foreground" };

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/[0-9]/.test(password)) score++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars

    if (score <= 2) return { score: 1, label: "Weak", color: "text-red-500" };
    if (score <= 4)
      return { score: 2, label: "Fair", color: "text-orange-500" };
    if (score <= 5)
      return { score: 3, label: "Good", color: "text-yellow-500" };
    return { score: 4, label: "Strong", color: "text-green-500" };
  };

  const changePassword = async () => {
    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const strength = getPasswordStrength(passwordData.newPassword);
    if (strength.score < 2) {
      toast.error(
        "Password is too weak. Please use a stronger password with a mix of characters."
      );
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Changing password...");

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
        {
          id: loadingToast,
        }
      );
    } finally {
      toast.dismiss(loadingToast);
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-3">
          <TabsTrigger value="profile" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Billing
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
                  {userData?.role || "USER"}
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

          {/* Change Password */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Change Password</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Update your account password securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Current Password */}
              <div className="grid gap-2">
                <Label htmlFor="current-password" className="text-xs">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    className="h-8 text-xs pr-10"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-8 px-0"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="grid gap-2">
                <Label htmlFor="new-password" className="text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    className="h-8 text-xs pr-10"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-8 px-0"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrength(passwordData.newPassword)
                              .score === 1
                              ? "w-1/4 bg-red-500"
                              : getPasswordStrength(passwordData.newPassword)
                                    .score === 2
                                ? "w-2/4 bg-orange-500"
                                : getPasswordStrength(passwordData.newPassword)
                                      .score === 3
                                  ? "w-3/4 bg-yellow-500"
                                  : "w-full bg-green-500"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${getPasswordStrength(passwordData.newPassword).color}`}
                      >
                        {getPasswordStrength(passwordData.newPassword).label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1">
                        {passwordData.newPassword.length >= 8 ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[A-Z]/.test(passwordData.newPassword) &&
                        /[a-z]/.test(passwordData.newPassword) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Upper & lowercase letters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[0-9]/.test(passwordData.newPassword) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>At least one number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[^a-zA-Z0-9]/.test(passwordData.newPassword) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Special character (!@#$%...)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="text-xs">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="h-8 text-xs pr-10"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-8 w-8 px-0"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                {passwordData.confirmPassword && (
                  <div className="flex items-center gap-1 text-xs">
                    {passwordData.newPassword ===
                    passwordData.confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">
                          Passwords don't match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={changePassword}
                disabled={
                  loading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword ||
                  passwordData.newPassword !== passwordData.confirmPassword
                }
                size="sm"
                className="w-full"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Dashboard Tour */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dashboard Tour</CardTitle>
              <CardDescription className="text-xs">
                Replay the interactive walkthrough of key features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={startTour}
                size="sm"
                className="w-full gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Restart Dashboard Tour
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-3">
          <BillingSection />
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
