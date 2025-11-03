"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface SettingsData {
  payoutPreferences: {
    minPayoutThresholdCents: number;
    payoutFrequency: string;
    autoPayoutEnabled: boolean;
    payoutDayOfMonth?: number;
    payoutDayOfWeek?: number;
  };
  taxStatus: {
    earningsYearToDate: number;
    thresholdCents: number;
    formStatus: string;
    lastFourSSN?: string;
  };
  notificationPreferences: {
    emailOnPayout: boolean;
    emailOnCommissionEarned: boolean;
    emailOnCommissionPayable: boolean;
    emailWeeklySummary: boolean;
    emailMonthlySummary: boolean;
  };
  stripeStatus: {
    isOnboarded: boolean;
    kycComplete: boolean;
    pendingRequirements: string[];
  };
}

export function SettingsTab() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("payout");

  // Payout Preferences
  const [threshold, setThreshold] = useState(5000);
  const [frequency, setFrequency] = useState("auto");
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [dayOfWeek, setDayOfWeek] = useState("1");

  // Notification Preferences
  const [notif, setNotif] = useState({
    emailOnPayout: true,
    emailOnCommissionEarned: true,
    emailOnCommissionPayable: true,
    emailWeeklySummary: false,
    emailMonthlySummary: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [prefRes, notifRes, taxRes] = await Promise.all([
        fetch("/api/affiliate/preferences"),
        fetch("/api/affiliate/notifications"),
        fetch("/api/affiliate/tax-status"),
      ]);

      if (prefRes.ok && notifRes.ok && taxRes.ok) {
        const prefData = await prefRes.json();
        const notifData = await notifRes.json();
        const taxData = await taxRes.json();

        setData({
          payoutPreferences: prefData,
          notificationPreferences: notifData,
          taxStatus: taxData,
          stripeStatus: { isOnboarded: true, kycComplete: true, pendingRequirements: [] },
        });

        setThreshold(prefData.minPayoutThresholdCents || 5000);
        setFrequency(prefData.payoutFrequency || "auto");
        setAutoEnabled(prefData.autoPayoutEnabled ?? true);
        setNotif(notifData);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const savePayoutPreferences = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/affiliate/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minPayoutThresholdCents: threshold,
          payoutFrequency: frequency,
          autoPayoutEnabled: autoEnabled,
          payoutDayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
          payoutDayOfWeek: frequency === "weekly" ? parseInt(dayOfWeek) : undefined,
        }),
      });

      if (res.ok) {
        alert("Payout preferences saved!");
        fetchSettings();
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationPreferences = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/affiliate/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notif),
      });

      if (res.ok) {
        alert("Notification preferences saved!");
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">Settings Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <p>Unable to load settings. Please try refreshing the page or contact support if the problem persists.</p>
        </CardContent>
      </Card>
    );
  }

  const earningsProgress =
    ((data?.taxStatus.earningsYearToDate || 0) /
      (data?.taxStatus.thresholdCents || 60000)) *
    100;

  return (
    <div className="space-y-6">
      {/* Stripe Connect Status */}
      {data?.stripeStatus && (
        <Card
          className={`border-l-4 ${
            data.stripeStatus.isOnboarded ? "border-l-green-500" : "border-l-yellow-500"
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {data.stripeStatus.isOnboarded ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                Stripe Connect Status
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open("/stripe/dashboard", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Onboarding:</span>{" "}
              <Badge
                className={
                  data.stripeStatus.isOnboarded
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {data.stripeStatus.isOnboarded ? "Complete" : "Incomplete"}
              </Badge>
            </p>
            <p>
              <span className="font-medium">KYC Verification:</span>{" "}
              <Badge
                className={
                  data.stripeStatus.kycComplete
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {data.stripeStatus.kycComplete ? "Complete" : "Pending"}
              </Badge>
            </p>
            {data.stripeStatus.pendingRequirements.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Pending Requirements:</p>
                  <ul className="list-disc list-inside text-sm">
                    {data.stripeStatus.pendingRequirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tax Information */}
      {data?.taxStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
            <CardDescription>
              Current year earnings and 1099 threshold
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Year-to-Date Earnings</Label>
                <span className="font-semibold">
                  ${(data.taxStatus.earningsYearToDate / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Threshold for 1099-NEC</span>
                <span>${(data.taxStatus.thresholdCents / 100).toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    earningsProgress >= 100 ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${Math.min(earningsProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {earningsProgress.toFixed(1)}% of threshold
              </p>
            </div>

            <div>
              <Label className="font-medium">Tax Form Status</Label>
              <Badge
                className={
                  data.taxStatus.formStatus === "verified"
                    ? "bg-green-100 text-green-800 mt-2"
                    : "bg-yellow-100 text-yellow-800 mt-2"
                }
              >
                {data.taxStatus.formStatus}
              </Badge>
            </div>

            {data.taxStatus.lastFourSSN && (
              <p className="text-sm text-gray-600">
                Tax ID: <code className="bg-gray-100 px-2 py-1 rounded">
                  ***-**-{data.taxStatus.lastFourSSN}
                </code>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payout Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Preferences</CardTitle>
          <CardDescription>
            Configure how and when you receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minimum Threshold */}
          <div className="space-y-2">
            <Label>Minimum Payout Threshold</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[threshold]}
                onValueChange={(val) => setThreshold(val[0])}
                min={5000}
                max={50000}
                step={5000}
                className="flex-1"
              />
              <span className="text-lg font-bold min-w-24 text-right">
                ${(threshold / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Minimum amount required before automatic payout (must be between $50-$500)
            </p>
          </div>

          {/* Payout Frequency */}
          <div className="space-y-2">
            <Label>Payout Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic (when threshold reached)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection */}
          {frequency === "monthly" && (
            <div className="space-y-2">
              <Label>Payout Day of Month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Payout Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day, idx) => (
                      <SelectItem key={day} value={idx.toString()}>
                        {day}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auto Payout Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label>Enable Automatic Payouts</Label>
            <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} />
          </div>

          <Button
            onClick={savePayoutPreferences}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Payout Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose when to receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border-b">
            <Label className="font-medium">Email on Payout</Label>
            <Switch
              checked={notif.emailOnPayout}
              onCheckedChange={(val) =>
                setNotif({ ...notif, emailOnPayout: val })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border-b">
            <Label className="font-medium">Email on Commission Earned</Label>
            <Switch
              checked={notif.emailOnCommissionEarned}
              onCheckedChange={(val) =>
                setNotif({ ...notif, emailOnCommissionEarned: val })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border-b">
            <Label className="font-medium">Email on Commission Payable</Label>
            <Switch
              checked={notif.emailOnCommissionPayable}
              onCheckedChange={(val) =>
                setNotif({ ...notif, emailOnCommissionPayable: val })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border-b">
            <Label className="font-medium">Weekly Summary Email</Label>
            <Switch
              checked={notif.emailWeeklySummary}
              onCheckedChange={(val) =>
                setNotif({ ...notif, emailWeeklySummary: val })
              }
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <Label className="font-medium">Monthly Summary Email</Label>
            <Switch
              checked={notif.emailMonthlySummary}
              onCheckedChange={(val) =>
                setNotif({ ...notif, emailMonthlySummary: val })
              }
            />
          </div>

          <Button
            onClick={saveNotificationPreferences}
            disabled={saving}
            variant="outline"
            className="w-full"
          >
            {saving ? "Saving..." : "Save Notification Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
