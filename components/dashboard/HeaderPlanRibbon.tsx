"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingResponse, UserPlanResponse } from "@/types/plan";
import { trackTelemetry } from "@/lib/utils/telemetry";

interface HeaderPlanRibbonProps {
  plan: UserPlanResponse;
  pricing: PricingResponse | null;
  onDismiss?: () => void;
  onUpgrade?: (opts?: { target?: "core" | "family"; term?: "monthly" | "annual" }) => void;
  onManage?: () => void;
}

function getRibbonCopy(plan: UserPlanResponse) {
  switch (plan.plan) {
    case "free":
      return {
        message: "You’re on Free — get 2 credits/mo + rollover with Core.",
        actionLabel: "Upgrade",
        actionTarget: "core" as const,
      };
    case "one_time":
      return {
        message: "You purchased a $97 report. Save on the next ones with Core.",
        actionLabel: "Upgrade",
        actionTarget: "core" as const,
      };
    case "core":
      return {
        message: `Core: ${plan.remainingCredits}/${plan.monthlyCredits ?? 2} credits • Rollover up to 6.`,
        actionLabel: "Manage",
        actionTarget: null,
      };
    case "family":
      return {
        message: `Family: ${plan.remainingCredits}/${plan.monthlyCredits ?? 5} • Rollover up to 15 • Unlimited child chat.`,
        actionLabel: "Manage",
        actionTarget: null,
      };
    default:
      return {
        message: "Keep momentum with your next assessment ready in minutes.",
        actionLabel: "Manage",
        actionTarget: null,
      };
  }
}

export function HeaderPlanRibbon({
  plan,
  pricing,
  onDismiss,
  onUpgrade,
  onManage,
}: HeaderPlanRibbonProps) {
  const [dismissing, setDismissing] = useState(false);
  const copy = getRibbonCopy(plan);

  const handlePrimaryAction = () => {
    trackTelemetry("upsell.ribbon_click", {
      plan: plan.plan,
      source: "ribbon",
    });
    if (copy.actionTarget && onUpgrade) {
      onUpgrade({ target: copy.actionTarget, term: "monthly" });
    } else if (onManage) {
      onManage();
    }
  };

  const handleDismiss = async () => {
    try {
      setDismissing(true);
      trackTelemetry("upsell.ribbon_dismiss", { plan: plan.plan });
      await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "snooze_ribbon", durationHours: 24 }),
      });
      onDismiss?.();
    } catch (error) {
      console.error("Failed to snooze ribbon", error);
    } finally {
      setDismissing(false);
    }
  };

  const priceLabel = plan.plan === "free" || plan.plan === "one_time"
    ? pricing?.amounts.coreMonthly.formatted ?? "$59/mo"
    : null;

  return (
    <div
      className="flex h-12 items-center justify-between gap-3 rounded-b-xl border-x border-b border-primary/30 bg-[#141a21] px-4 text-sm text-slate-100 shadow-md"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="whitespace-nowrap rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
          Membership
        </span>
        <p className="truncate font-medium">
          {copy.message}
          {priceLabel && (
            <span className="ml-2 font-semibold text-primary">
              Start Core — {priceLabel}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
          onClick={handlePrimaryAction}
        >
          {copy.actionLabel}
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={dismissing}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          aria-label="Dismiss plan reminder for 24 hours"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
