"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricingResponse, UserPlanResponse } from "@/types/plan";
import { trackTelemetry } from "@/lib/utils/telemetry";

type InlineContext = "trial_snapshot" | "post_pdf" | "empty_dashboard" | "low_credit";

interface InlineUpgradeSlotProps {
  context: InlineContext;
  plan: UserPlanResponse;
  pricing: PricingResponse;
  onStartCheckout: (opts: {
    target: "core" | "family";
    term: "monthly" | "annual";
    source: "inline";
  }) => Promise<void> | void;
  onStartSingle?: () => void;
}

const CONTEXT_COPY: Record<InlineContext, {
  headline: string;
  body: string;
  primary: {
    label: string;
    action: "core" | "family" | "single";
  };
  secondary?: {
    label: string;
    action: "core" | "family";
  };
}> = {
  trial_snapshot: {
    headline: "Want the full AI report?",
    body: "Turn this into a full report + instant PDF for $97, or go Core for 2 credits/mo + rollover.",
    primary: { label: "Get $97 Report", action: "single" },
    secondary: { label: "Start Core $59/mo", action: "core" },
  },
  post_pdf: {
    headline: "Save on future reports",
    body: "Core gives 2 credits/mo, rollover up to 6, and Enhanced just $9.",
    primary: { label: "Start Core $59/mo", action: "core" },
    secondary: { label: "Upgrade to Family $99/mo", action: "family" },
  },
  empty_dashboard: {
    headline: "Ready for your next assessment?",
    body: "Core saves on every report and unlocks rollover up to 6.",
    primary: { label: "Start Core $59/mo", action: "core" },
    secondary: { label: "Family for $99/mo", action: "family" },
  },
  low_credit: {
    headline: "You're out of credits",
    body: "Family unlocks unlimited child chat and unlimited Enhanced.",
    primary: { label: "Add Family $99/mo", action: "family" },
  },
};

export function InlineUpgradeSlot({
  context,
  plan,
  pricing,
  onStartCheckout,
  onStartSingle,
}: InlineUpgradeSlotProps) {
  const copy = CONTEXT_COPY[context];

  useEffect(() => {
    trackTelemetry("upsell.inline_view", {
      context,
      plan: plan.plan,
    });
  }, [context, plan.plan]);

  const handleAction = (action: "core" | "family" | "single") => {
    if (action === "single") {
      onStartSingle?.();
      trackTelemetry("upsell.inline_click_upgrade", {
        context,
        action,
      });
      return;
    }

    trackTelemetry("upsell.inline_click_upgrade", {
      context,
      action,
    });
    onStartCheckout({ target: action, term: "monthly", source: "inline" });
  };

  const priceLabelCore = pricing.amounts.coreMonthly.formatted;
  const priceLabelFamily = pricing.amounts.familyMonthly.formatted;
  const singleLabel = pricing.amounts.single.formatted;

  const resolveLabel = (
    action: "core" | "family" | "single",
    fallback: string
  ) => {
    if (action === "core") {
      return fallback.replace("$59", priceLabelCore);
    }
    if (action === "family") {
      return fallback.replace("$99", priceLabelFamily);
    }
    if (action === "single") {
      return fallback.replace("$97", singleLabel);
    }
    return fallback;
  };

  return (
    <div className="rounded-3xl border border-dashed border-primary/40 bg-[#141a21] px-6 py-5 text-slate-100 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Upgrade Option
          </p>
          <h3 className="text-lg font-bold text-white">{copy.headline}</h3>
          <p className="mt-1 text-sm text-slate-300">{copy.body}</p>
          <p className="mt-2 text-xs text-slate-400">
            Instant results + instant school-ready PDF. AI stores no data; anonymous Mode available.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:w-72">
          <Button
            className="h-11 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90"
            onClick={() => handleAction(copy.primary.action)}
          >
            {resolveLabel(copy.primary.action, copy.primary.label)}
          </Button>
          {copy.secondary && (
            <Button
              variant="outline"
              className="h-11 rounded-xl border-primary/40 text-sm font-semibold text-slate-100 hover:bg-primary/10"
              onClick={() => handleAction(copy.secondary!.action)}
            >
              <span className="flex items-center gap-2">
                {resolveLabel(copy.secondary.action, copy.secondary.label)}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
