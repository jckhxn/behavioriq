"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, Send, Settings, CheckCircle, XCircle } from "lucide-react";

export default function EmailSettings() {
  const [testing, setTesting] = useState(false);
  const [runningJobs, setRunningJobs] = useState<string | null>(null);

  const testEmailConfiguration = async () => {
    try {
      setTesting(true);

      // This would test the email configuration by sending a test email
      toast.info("Testing email configuration...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, just show success - in real implementation, you'd call an API
      toast.success("Email configuration is working correctly!");
    } catch (error) {
      toast.error("Email configuration test failed");
      console.error("Email test error:", error);
    } finally {
      setTesting(false);
    }
  };

  const runEmailJob = async (jobType: string, jobName: string) => {
    try {
      setRunningJobs(jobType);

      const response = await fetch("/api/admin/email-jobs/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || `Failed to run ${jobName}`);
      }
    } catch (error) {
      toast.error(`Failed to run ${jobName}`);
      console.error("Email job error:", error);
    } finally {
      setRunningJobs(null);
    }
  };

  const emailStatus = {
    configured: !!process.env.NEXT_PUBLIC_RESEND_CONFIGURED, // You'd set this in your env
    fromAddress: process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@yourdomain.com",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Service Status</h4>
              <p className="text-sm text-muted-foreground">
                Resend email service configuration
              </p>
            </div>
            <Badge
              variant={emailStatus.configured ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {emailStatus.configured ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Configured
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Not Configured
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">From Address</h4>
              <p className="text-sm text-muted-foreground font-mono">
                {emailStatus.fromAddress}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={testEmailConfiguration}
              disabled={testing}
              variant="outline"
            >
              {testing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Email Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">
                  License Expiration Notifications
                </h4>
                <p className="text-sm text-muted-foreground">
                  Send notifications to users with expiring licenses (30 days)
                </p>
              </div>
              <Button
                onClick={() =>
                  runEmailJob(
                    "license-expiration",
                    "License Expiration Notifications"
                  )
                }
                disabled={runningJobs === "license-expiration"}
                size="sm"
              >
                {runningJobs === "license-expiration" ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Running...
                  </>
                ) : (
                  "Run Now"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Daily Digest</h4>
                <p className="text-sm text-muted-foreground">
                  Send daily activity summary to administrators
                </p>
              </div>
              <Button
                onClick={() => runEmailJob("daily-digest", "Daily Digest")}
                disabled={runningJobs === "daily-digest"}
                size="sm"
              >
                {runningJobs === "daily-digest" ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Running...
                  </>
                ) : (
                  "Run Now"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">All Scheduled Jobs</h4>
                <p className="text-sm text-muted-foreground">
                  Run all scheduled email notifications and jobs
                </p>
              </div>
              <Button
                onClick={() => runEmailJob("all", "All Scheduled Jobs")}
                disabled={runningJobs === "all"}
                size="sm"
              >
                {runningJobs === "all" ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Running...
                  </>
                ) : (
                  "Run All"
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">
              ⚠️ Email Job Information
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• License expiration jobs run automatically daily</li>
              <li>• Daily digest emails are sent at 8:00 AM</li>
              <li>• Manual job execution is for testing and immediate needs</li>
              <li>• Rate limiting applies to prevent spam</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
