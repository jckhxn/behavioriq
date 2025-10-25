"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Users, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PricingResponse, UserPlanResponse } from "@/types/plan";
import { useMediaQuery } from "@/hooks/use-media-query";
import { trackTelemetry } from "@/lib/utils/telemetry";

const DISMISS_STORAGE_KEY = "upgradePanel.dismissed";

type PlanTarget = "core" | "family";
type PlanTerm = "monthly" | "annual";

interface UpgradePanelProps {
  plan: UserPlanResponse;
  pricing: PricingResponse;
  onStartCheckout: (opts: {
    target: PlanTarget;
    term: PlanTerm;
    source: "panel" | "drawer";
  }) => Promise<void> | void;
  onManage?: () => void;
}

interface PlanCardProps {
  target: PlanTarget;
  headline: string;
  subline: string;
  monthlyPrice: string;
  annualPrice: string;
  bullets: string[];
  highlight: boolean;
  onMonthly: () => void;
  onAnnual: () => void;
}

function PlanCard({
  target,
  headline,
  subline,
  monthlyPrice,
  annualPrice,
  bullets,
  highlight,
  onMonthly,
  onAnnual,
}: PlanCardProps) {
  return (
    <div
      className={`rounded-2xl border px-6 py-6 transition-shadow ${highlight ? "border-primary shadow-xl shadow-primary/20" : "border-[#223043] shadow-lg"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">
            {target === "core" ? "Core Membership" : "Family Membership"}
          </p>
          <h3 className="text-xl font-bold text-slate-100">{headline}</h3>
        </div>
        {highlight && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase text-primary">
            Recommended
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-300">{subline}</p>
      <div className="mb-5 flex items-baseline gap-2 text-slate-100">
        <span className="text-3xl font-bold">{monthlyPrice}</span>
        <span className="text-sm text-slate-400">per month</span>
      </div>
      <ul className="mb-6 space-y-2 text-sm text-slate-200">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <Button
          onClick={onMonthly}
          className="h-12 rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary/90"
        >
          Start {target === "core" ? "Core" : "Family"} — {monthlyPrice}/mo
        </Button>
        <button
          type="button"
          onClick={onAnnual}
          className="text-sm font-semibold text-primary underline-offset-2 transition hover:underline"
        >
          Or {annualPrice}/yr
        </button>
      </div>
    </div>
  );
}

function useCountdown(deadline: string | null) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    if (!deadline) {
      setValue(null);
      return;
    }
    const target = new Date(deadline);
    if (Number.isNaN(target.getTime())) {
      setValue(null);
      return;
    }

    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setValue(null);
        return false;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setValue(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      return true;
    };

    update();
    const interval = window.setInterval(() => {
      if (!update()) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  return value;
}

function DesktopPanel({
  plan,
  pricing,
  onStartCheckout,
  onDismiss,
}: UpgradePanelProps & { onDismiss: () => void }) {
  const countdown = useCountdown(pricing.countdownEndsAt);
  const recommended = useMemo<PlanTarget>(() => {
    if (plan.childrenCount > 1 || plan.reportsLast30d >= 3) {
      return "family";
    }
    return "core";
  }, [plan.childrenCount, plan.reportsLast30d]);

  const lowCredits =
    (plan.plan === "core" || plan.plan === "family") && plan.remainingCredits === 0;

  const handleCheckout = (target: PlanTarget, term: PlanTerm) => {
    if (term === "annual") {
      trackTelemetry("upsell.panel_toggle_annual", {
        plan: plan.plan,
        target,
        source: "panel",
      });
    }
    const event = `upsell.panel_click_${target}_${term}`;
    trackTelemetry(event, {
      plan: plan.plan,
      target,
      term,
      source: "panel",
    });
    onStartCheckout({ target, term, source: "panel" });
  };

  useEffect(() => {
    trackTelemetry("upsell.panel_view", {
      plan: plan.plan,
      remaining: plan.remainingCredits,
      childrenCount: plan.childrenCount,
    });
  }, [plan.plan, plan.remainingCredits, plan.childrenCount]);

  return (
    <div className="sticky top-24 w-full max-w-sm space-y-6 rounded-3xl border border-[#223043] bg-[#141a21] p-6 text-slate-100 shadow-2xl relative">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#141a21]"
        aria-label="Dismiss upgrade suggestions"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-4 w-4" />
          Upgrade Path
        </div>
        <h2 className="text-2xl font-bold text-white">
          {plan.plan === "core"
            ? "Running low? Keep momentum going."
            : "Unlock instant monthly credits + rollover."}
        </h2>
        <p className="text-sm text-slate-300">
          {plan.plan === "core"
            ? "Stay ahead with rollover, member pricing, and Enhanced at $9."
            : "Upgrade for member pricing, rollover protection, and priority support."}
        </p>
        {lowCredits && (
          <div className="rounded-xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
            You're out of credits. Upgrade now to keep your next assessment ready when you need it.
          </div>
        )}
        {countdown && pricing.foundersActive && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/20 px-3 py-2 text-sm text-primary-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">
              Founders pricing ends in {countdown}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <PlanCard
          target="core"
          headline="Core"
          subline="Perfect for focused support with rollover and member perks."
          monthlyPrice={pricing.amounts.coreMonthly.formatted}
          annualPrice={pricing.amounts.coreAnnual.formatted}
          bullets={[
            "2 assessment credits / month",
            "Credits roll over up to 6",
            "Member price $77 per extra credit",
            "Enhanced $9 (vs $29 non-member)",
            "Priority email support",
            "Instant results + instant school-ready PDF",
          ]}
          highlight={recommended === "core"}
          onMonthly={() => handleCheckout("core", "monthly")}
          onAnnual={() => handleCheckout("core", "annual")}
        />

        <PlanCard
          target="family"
          headline="Family"
          subline="For multi-child families with unlimited conversational AI."
          monthlyPrice={pricing.amounts.familyMonthly.formatted}
          annualPrice={pricing.amounts.familyAnnual.formatted}
          bullets={[
            "5 assessment credits / month",
            "Rollover up to 15",
            "Unlimited Conversational AI",
            "Unlimited Enhanced included",
            "Multi-child profiles & progress",
            "Priority + live chat",
          ]}
          highlight={recommended === "family"}
          onMonthly={() => handleCheckout("family", "monthly")}
          onAnnual={() => handleCheckout("family", "annual")}
        />
      </div>

      <div className="space-y-3 text-sm text-slate-200">
        <div className="rounded-xl border border-[#223043] px-4 py-3">
          <p className="font-semibold">Trust & Safety</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>Instant results with an instant school-ready PDF.</li>
            <li>AI stores no data; the app stores minimal metadata or can be fully anonymous.</li>
            <li>Encrypted • Designed to support FERPA/HIPAA.</li>
          </ul>
        </div>

        <div>
          <details className="rounded-xl border border-[#223043] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-100">
              Will this give me a diagnosis?
            </summary>
            <p className="mt-2 text-xs text-slate-300">
              We provide a comprehensive, school-ready summary to guide next steps. Always partner with your clinician for a formal diagnosis.
            </p>
          </details>
          <details className="mt-2 rounded-xl border border-[#223043] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-100">
              How is my data handled?
            </summary>
            <p className="mt-2 text-xs text-slate-300">
              AI stores no data. You control what’s saved, with Anonymous Mode available anytime.
            </p>
          </details>
          <details className="mt-2 rounded-xl border border-[#223043] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-100">
              Can I cancel or pause?
            </summary>
            <p className="mt-2 text-xs text-slate-300">
              Cancel anytime. Pause up to 2 months (max 2 times/year) and resume when you're ready.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({
  plan,
  pricing,
  onStartCheckout,
  onDismiss,
}: UpgradePanelProps & { onDismiss: () => void }) {
  const countdown = useCountdown(pricing.countdownEndsAt);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    trackTelemetry("upsell.panel_view", {
      plan: plan.plan,
      remaining: plan.remainingCredits,
      childrenCount: plan.childrenCount,
    });
  }, [plan.plan, plan.remainingCredits, plan.childrenCount]);

  const handleCheckout = (target: PlanTarget, term: PlanTerm) => {
    if (term === "annual") {
      trackTelemetry("upsell.panel_toggle_annual", {
        plan: plan.plan,
        target,
        source: "drawer",
      });
    }
    const event = `upsell.panel_click_${target}_${term}`;
    trackTelemetry(event, {
      plan: plan.plan,
      target,
      term,
      source: "drawer",
    });
    onStartCheckout({ target, term, source: "drawer" });
    setOpen(false);
  };

  const handleDismiss = () => {
    setOpen(false);
    onDismiss();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed inset-x-4 bottom-5 z-40 flex h-14 items-center justify-between rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>Upgrade • Core {pricing.amounts.coreMonthly.formatted} / Family {pricing.amounts.familyMonthly.formatted}</span>
          <Users className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="relative max-h-[85vh] rounded-t-3xl border-[#223043] bg-[#0f141b] text-slate-100"
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f141b]"
          aria-label="Dismiss upgrade suggestions"
        >
          <X className="h-5 w-5" />
        </button>
        <SheetHeader className="pt-6 pr-10">
          <SheetTitle className="text-lg font-semibold text-white">
            Unlock monthly credits & rollover protection
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-24 pt-2">
          <PlanCard
            target="core"
            headline="Core"
            subline="2 credits monthly + rollover up to 6."
            monthlyPrice={pricing.amounts.coreMonthly.formatted}
            annualPrice={pricing.amounts.coreAnnual.formatted}
            bullets={[
              "2 assessment credits / month",
              "Credits roll over up to 6",
              "Member price $77 per extra credit",
              "Enhanced $9 (vs $29 non-member)",
              "Priority email support",
              "Instant results + instant school-ready PDF",
            ]}
            highlight={plan.childrenCount <= 1}
            onMonthly={() => handleCheckout("core", "monthly")}
            onAnnual={() => handleCheckout("core", "annual")}
          />
          <PlanCard
            target="family"
            headline="Family"
            subline="Unlimited conversational AI with rollover up to 15."
            monthlyPrice={pricing.amounts.familyMonthly.formatted}
            annualPrice={pricing.amounts.familyAnnual.formatted}
            bullets={[
              "5 assessment credits / month",
              "Rollover up to 15",
              "Unlimited Conversational AI",
              "Unlimited Enhanced included",
              "Multi-child profiles & progress",
              "Priority + live chat",
            ]}
            highlight={plan.childrenCount > 1 || plan.reportsLast30d >= 3}
            onMonthly={() => handleCheckout("family", "monthly")}
            onAnnual={() => handleCheckout("family", "annual")}
          />
          <div className="rounded-2xl border border-[#223043] px-4 py-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Trust & Safety</p>
            <p className="mt-1">
              Instant results with an instant school-ready PDF. AI stores no data; the app stores minimal metadata or can be fully anonymous.
            </p>
            <p className="mt-1">Encrypted • Designed to support FERPA/HIPAA.</p>
            {countdown && pricing.foundersActive && (
              <p className="mt-2 font-semibold text-primary">
                Founders pricing ends in {countdown}
              </p>
            )}
          </div>
        </div>
        <SheetFooter className="border-t border-[#223043] bg-[#141a21]">
          <Button
            className="h-12 rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary/90"
            onClick={() => handleCheckout("core", "monthly")}
          >
            Start Core — {pricing.amounts.coreMonthly.formatted}/mo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function UpgradePanel(props: UpgradePanelProps) {
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Check if user has actually upgraded away from free/one_time plans
  const hasUpgraded = props.plan.plan !== "free" && props.plan.plan !== "one_time";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(DISMISS_STORAGE_KEY);

      // If user has upgraded to a paid plan, permanently dismiss the panel
      if (hasUpgraded) {
        setIsDismissed(true);
        // Update storage to mark as upgraded for future visits
        const payload = JSON.stringify({
          upgraded: true,
          upgradedAt: new Date().toISOString(),
        });
        window.localStorage.setItem(DISMISS_STORAGE_KEY, payload);
        return;
      }

      // For free tier users, check if they've dismissed this session
      if (!stored) {
        setIsDismissed(false);
        return;
      }

      const parsed = JSON.parse(stored) as { upgraded?: boolean; plan?: string } | null;

      // If previously marked as upgraded, respect it
      if (parsed?.upgraded === true) {
        setIsDismissed(true);
        return;
      }

      // Legacy: check if dismissed during current free tier
      if (parsed?.plan === props.plan.plan) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [props.plan.plan, hasUpgraded]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      const payload = JSON.stringify({
        plan: props.plan.plan,
        dismissedAt: new Date().toISOString(),
      });
      window.localStorage.setItem(DISMISS_STORAGE_KEY, payload);
    }
  }, [props.plan.plan]);

  if (isDesktop === null || isDismissed === null) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  if (isDesktop) {
    return <DesktopPanel {...props} onDismiss={handleDismiss} />;
  }

  return <MobileDrawer {...props} onDismiss={handleDismiss} />;
}
