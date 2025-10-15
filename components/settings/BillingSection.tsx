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
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import {
  formatPrice,
  getPricingPlanById,
  type PricingPlanId,
} from "@/lib/config/pricing";
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

type PlanVisual = {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
};

const planVisualMap = (
  planId: PricingPlanId | "FREE" | "UNKNOWN"
): PlanVisual => {
  switch (planId) {
    case "BASIC":
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    case "PLUS":
      return {
        icon: Zap,
        color: "text-sky-500",
        bgColor: "bg-sky-100 dark:bg-sky-900/30",
      };
    case "FAMILY":
      return {
        icon: Users,
        color: "text-indigo-500",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      };
    case "PRO":
      return {
        icon: Crown,
        color: "text-purple-500",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
      };
    case "ENTERPRISE":
      return {
        icon: Building2,
        color: "text-orange-500",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
      };
    case "FREE":
      return {
        icon: ArrowUpCircle,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      };
    default:
      return {
        icon: CheckCircle,
        color: "text-primary",
        bgColor: "bg-muted/20",
      };
  }
};

export default function BillingSection() {
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
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
  const planTypeMap: Record<string, PricingPlanId> = {
    BASIC: "BASIC",
    PLUS: "PLUS",
    FAMILY: "FAMILY",
    PRO: "PRO",
    PROFESSIONAL: "PRO",
    ENTERPRISE: "ENTERPRISE",
  };

  const matchedPlanId =
    planTypeMap[licenseType] ??
    (licenseType === "FREE" ? "BASIC" : "BASIC");
  const planDetails = getPricingPlanById(matchedPlanId);
  const visuals = planVisualMap(
    licenseType === "FREE" ? "FREE" : matchedPlanId
  );

  let featureSummary: string[] = [];

  if (licenseType === "FREE") {
    featureSummary = [
      "Preview assessment experience",
      "Basic scoring and recommendations",
      "Upgrade to unlock full AI reports",
    ];
  } else if (planDetails) {
    const pricingSummary =
      planDetails.monthlyCents !== null
        ? `${formatPrice(planDetails.monthlyCents)}/month${
            planDetails.annualCents !== null
              ? ` • ${formatPrice(planDetails.annualCents)} billed annually`
              : ""
          }`
        : planDetails.headline;

    featureSummary = [
      pricingSummary,
      planDetails.credits,
      `Conversational AI: ${planDetails.conversationalAI}`,
      planDetails.pdfExport
        ? "School-ready PDF exports included"
        : "Upgrade for PDF exports",
      planDetails.multiChild
        ? "Supports multi-child profiles"
        : "Single child profile",
      `Support level: ${planDetails.supportLevel}`,
      ...planDetails.features.slice(0, 2),
    ];
  } else {
    featureSummary = [
      "Flexible assessment access",
      "Upgrade for full AI features",
    ];
  }

  const planOrder: PricingPlanId[] = [
    "BASIC",
    "PLUS",
    "FAMILY",
    "PRO",
    "ENTERPRISE",
  ];
  const baseIndex = planOrder.indexOf(matchedPlanId);
  const upgradePlanIds =
    licenseType === "FREE"
      ? planOrder
      : baseIndex >= 0
        ? planOrder.slice(baseIndex + 1)
        : planOrder;
  const upgradePlans = upgradePlanIds
    .map((id) => getPricingPlanById(id))
    .filter(
      (
        plan
      ): plan is NonNullable<ReturnType<typeof getPricingPlanById>> =>
        Boolean(plan)
    );

  const canManageSubscription = [
    "BASIC",
    "PLUS",
    "FAMILY",
    "PRO",
    "PROFESSIONAL",
  ].includes(licenseType);

  const manageModalPlan: "MONTHLY" | "ANNUAL" | "LITE" =
    licenseType === "FREE"
      ? "LITE"
      : planDetails?.monthlyCents === null && planDetails?.annualCents !== null
        ? "ANNUAL"
        : "MONTHLY";

  const licenseInfo = {
    name:
      licenseType === "FREE"
        ? "Free Trial"
        : planDetails?.name || licenseType || "Plan",
    icon: visuals.icon,
    color: visuals.color,
    bgColor: visuals.bgColor,
    features: Array.from(new Set(featureSummary.filter(Boolean))),
  };

  const Icon = licenseInfo.icon;

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
          {canManageSubscription && (
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
        currentPlan={manageModalPlan}
        currentPrice={
          planDetails?.monthlyCents ?? planDetails?.annualCents ?? 0
        }
        billingPeriodEnd={license?.validUntil ?? undefined}
      />

      {/* Upgrade Options */}
      {upgradePlans.length > 0 && (
        <Card id="upgrade-plan">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUpCircle className="h-5 w-5" />
              Explore Upgrade Options
            </CardTitle>
            <CardDescription>
              Unlock more assessment credits, conversational AI capacity, and
              premium support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {upgradePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  {plan.badge && (
                    <Badge
                      variant={plan.badgeVariant ?? "secondary"}
                      className="mb-2"
                    >
                      {plan.badge}
                    </Badge>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{plan.name}</h4>
                    <div className="text-right">
                      {plan.monthlyCents !== null ? (
                        <>
                          <span className="text-xl font-bold">
                            {formatPrice(plan.monthlyCents)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            /month
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-semibold">
                          {plan.headline}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {plan.description}
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground mb-4">
                    <li>• {plan.credits}</li>
                    <li>• Conversational AI: {plan.conversationalAI}</li>
                    <li>• Support: {plan.supportLevel}</li>
                    {plan.pdfExport && <li>• School-ready PDF exports</li>}
                    {plan.multiChild && <li>• Multi-child profiles</li>}
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="mailto:sales@aidiagnostic.com">
                      Request upgrade
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Our team assists with plan upgrades to ensure credits, invoices,
              and access transfer smoothly.
            </p>
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
