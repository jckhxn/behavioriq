"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface BudgetStatus {
  currentMonthEmails: number;
  currentMonthCost: number;
  monthlyBudget: number;
  percentageUsed: number;
  remainingBudget: number;
  remainingEmails: number;
  alertLevel: "safe" | "warning" | "danger" | "exceeded";
  isEmailSendingEnabled: boolean;
  canSendEmails: boolean;
}

export function SESUsageWidget() {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchBudgetStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBudgetStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBudgetStatus = async () => {
    try {
      const response = await fetch("/api/admin/ses-budget-status");
      if (response.ok) {
        const data = await response.json();
        setBudgetStatus(data);
        setLastRefresh(new Date());
      } else {
        toast.error("Failed to load SES budget status");
      }
    } catch (error) {
      console.error("Error fetching SES budget status:", error);
      toast.error("Failed to load SES budget status");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading budget status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!budgetStatus) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-sm">Failed to load budget status</p>
        </CardContent>
      </Card>
    );
  }

  const getAlertConfig = () => {
    switch (budgetStatus.alertLevel) {
      case "exceeded":
        return {
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          icon: XCircle,
          message: "Budget exceeded - email sending blocked",
        };
      case "danger":
        return {
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          icon: AlertTriangle,
          message: "Budget critical - approaching limit",
        };
      case "warning":
        return {
          color: "text-warning",
          bgColor: "bg-warning/10",
          icon: AlertTriangle,
          message: "Budget warning - monitor usage",
        };
      default:
        return {
          color: "text-success",
          bgColor: "bg-success/10",
          icon: CheckCircle,
          message: "Budget healthy",
        };
    }
  };

  const alertConfig = getAlertConfig();
  const AlertIcon = alertConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SES Email Usage
        </CardTitle>
        <CardDescription>
          Current month's email sending and budget tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert className={alertConfig.bgColor}>
          <AlertIcon className={`h-4 w-4 ${alertConfig.color}`} />
          <AlertDescription className={alertConfig.color}>
            {alertConfig.message}
          </AlertDescription>
        </Alert>

        {/* Email Sending Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Email Sending</span>
          <span
            className={`text-sm font-semibold ${
              budgetStatus.canSendEmails
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {budgetStatus.canSendEmails ? "Enabled" : "Disabled"}
          </span>
        </div>

        {/* Budget Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Budget Usage</span>
            <span className="text-2xl font-bold">
              {(budgetStatus.percentageUsed ?? 0).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(budgetStatus.percentageUsed ?? 0, 100)}
            className="h-3"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              ${budgetStatus.currentMonthCost.toFixed(4)} used
            </span>
            <span>
              ${budgetStatus.monthlyBudget.toFixed(2)} budget
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {budgetStatus.currentMonthEmails.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Emails Sent
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold text-success">
              {budgetStatus.remainingEmails.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Remaining
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold">
              ${budgetStatus.currentMonthCost.toFixed(4)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Cost This Month
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-2xl font-bold text-success">
              ${budgetStatus.remainingBudget.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Budget Left
            </div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>
              SES Cost: $0.10 per 1,000 emails ($0.0001 per email)
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
