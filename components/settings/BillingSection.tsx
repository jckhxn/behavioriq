"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Zap,
  Crown,
  Building2,
  CheckCircle,
  ArrowUpCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, PRICING } from "@/lib/config/pricing";
import { toast } from "sonner";
import { ManageSubscriptionModal } from "./ManageSubscriptionModal";

interface License {
  type: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE"; // TRIAL removed - legacy type
  status: string;
  maxAssessments: number;
  maxUsers: number;
  validUntil: string | null; // ISO date string from API
  features: {
    conversationalAI?: boolean;
    aiRecommendations?: boolean;
  };
}

export default function BillingSection() {
  const LICENSE_INFO = {
    // TRIAL removed - legacy license type no longer used
    BASIC: {
      name: "Basic",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      features: [
        "Single assessment purchase",
        "Full AI recommendations",
        `${formatPrice(PRICING.SINGLE_ASSESSMENT)} per assessment`,
      ],
    },
    PROFESSIONAL: {
      name: "Professional",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      features: [
        "Unlimited assessments",
        "3 FREE Conversational AI sessions",
        // Enhanced report pricing removed
        // `${formatPrice(PRICING.ENHANCED_REPORT)}/session after`,
        `${formatPrice(PRICING.MONTHLY_SUBSCRIPTION)}/month or ${formatPrice(PRICING.ANNUAL_SUBSCRIPTION)}/year`,
      ],
    },
    ENTERPRISE: {
      name: "Enterprise",
      icon: Building2,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      features: [
        "Unlimited assessments",
        "Unlimited Conversational AI",
        "Multi-user support",
        "District-wide access",
      ],
    },
  };
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    fetchLicenseInfo();
  }, []);

  const fetchLicenseInfo = async () => {
    try {
      const response = await fetch("/api/user/license");
      if (response.ok) {
        const data = await response.json();
        setLicense(data.license);
      }
    } catch (error) {
      console.error("Failed to load license:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: "MONTHLY" | "ANNUAL" | "BASIC") => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: planType === "BASIC" ? "oneTime" : "subscription",
          plan: planType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to process upgrade. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const licenseType = license?.type || "BASIC";
  const licenseInfo =
    LICENSE_INFO[licenseType as keyof typeof LICENSE_INFO] ||
    LICENSE_INFO.BASIC;
  const Icon = licenseInfo?.icon || Crown;

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${licenseInfo.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-6 w-6 ${licenseInfo.color}`} />
                <h3 className="font-semibold text-lg">{licenseInfo.name}</h3>
              </div>
              <Badge
                variant={license?.status === "ACTIVE" ? "default" : "secondary"}
              >
                {license?.status || license?.type || "Unknown"}
              </Badge>
            </div>
            <ul className="space-y-2 text-sm">
              {licenseInfo.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">
                Assessments Available
              </p>
              <p className="font-semibold text-lg">
                {license?.maxAssessments === -1
                  ? "Unlimited"
                  : license?.maxAssessments || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Users</p>
              <p className="font-semibold text-lg">
                {license?.maxUsers === -1
                  ? "Unlimited"
                  : license?.maxUsers || 1}
              </p>
            </div>
          </div>

          {license?.validUntil && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Valid Until</p>
                <p className="font-semibold">
                  {new Date(license.validUntil).toLocaleDateString()}
                </p>
              </div>
            </>
          )}

          {/* Manage Subscription Button - Show for PROFESSIONAL, BASIC with recurring subscription */}
          {(licenseType === "PROFESSIONAL" || licenseType === "BASIC") && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowManageModal(true)}
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        open={showManageModal}
        onOpenChange={setShowManageModal}
        currentPlan={licenseType === "PROFESSIONAL" ? "MONTHLY" : "MONTHLY"} // TODO: Determine actual plan
        currentPrice={2900} // TODO: Get actual price from license/subscription
        billingPeriodEnd={license?.validUntil ?? undefined}
      />

      {/* Upgrade Options */}
      {licenseType !== "PROFESSIONAL" && licenseType !== "ENTERPRISE" && (
        <Card id="upgrade-plan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUpCircle className="h-5 w-5" />
              Upgrade Your Plan
            </CardTitle>
            <CardDescription>
              Get more assessments and unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Plan Option */}
            {licenseType === "FREE" || licenseType === "BASIC" ? (
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Single Assessment</h4>
                  <span className="text-2xl font-bold">
                    {formatPrice(PRICING.SINGLE_ASSESSMENT)}
                  </span>
                </div>
                <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
                  <li>• One complete assessment</li>
                  <li>• Full AI recommendations</li>
                  <li>• School-ready PDF report</li>
                </ul>
                <Button
                  onClick={() => handleUpgrade("BASIC")}
                  disabled={upgrading}
                  className="w-full"
                  variant="outline"
                >
                  Purchase Assessment
                </Button>
              </div>
            ) : null}

            {/* Professional Plan Options */}
            <div className="border-2 border-primary rounded-lg p-4">
              <Badge className="mb-2">Most Popular</Badge>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Professional Monthly</h4>
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    {formatPrice(PRICING.MONTHLY_SUBSCRIPTION)}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
              </div>
              <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
                <li>• Unlimited assessments</li>
                <li>• 3 FREE Conversational AI sessions</li>
                {/* Enhanced report pricing removed */}
                {/* <li>
                  • {formatPrice(PRICING.ENHANCED_REPORT)}/session after that
                </li> */}
                <li>• Priority support</li>
              </ul>
              <Button
                onClick={() => handleUpgrade("MONTHLY")}
                disabled={upgrading}
                className="w-full"
              >
                {upgrading ? "Processing..." : "Upgrade to Monthly"}
              </Button>
            </div>

            <div className="border-2 border-green-500 rounded-lg p-4">
              <Badge className="mb-2 bg-green-500">
                Best Value - Save $
                {(PRICING.MONTHLY_SUBSCRIPTION * 12 -
                  PRICING.ANNUAL_SUBSCRIPTION) /
                  100}
                /year
              </Badge>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Professional Annual</h4>
                <div className="text-right">
                  <span className="text-2xl font-bold">
                    {formatPrice(PRICING.ANNUAL_SUBSCRIPTION)}
                  </span>
                  <span className="text-muted-foreground text-sm">/year</span>
                </div>
              </div>
              <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
                <li>• All Monthly features</li>
                <li>
                  • Save $
                  {(PRICING.MONTHLY_SUBSCRIPTION * 12 -
                    PRICING.ANNUAL_SUBSCRIPTION) /
                    100}{" "}
                  per year
                </li>
                <li>
                  • Equivalent to ~$
                  {(PRICING.ANNUAL_SUBSCRIPTION / 100 / 12).toFixed(2)}/month
                </li>
              </ul>
              <Button
                onClick={() => handleUpgrade("ANNUAL")}
                disabled={upgrading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {upgrading ? "Processing..." : "Upgrade to Annual"}
              </Button>
            </div>

            {/* Enterprise Option */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Enterprise</h4>
              <p className="text-sm text-muted-foreground mb-4">
                For districts and organizations requiring unlimited
                Conversational AI and multi-user support.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="mailto:sales@aidiagnostic.com">Contact Sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Need help with billing? Contact us at{" "}
            <a
              href="mailto:support@aidiagnostic.com"
              className="text-primary hover:underline"
            >
              support@aidiagnostic.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
