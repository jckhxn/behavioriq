import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DASHBOARD_PLAN_OPTIONS,
  SubscriptionPlanDefinition,
  SubscriptionPlanId,
  getSubscriptionPlanById,
} from "../../lib/config/pricing";

// GA4 event tracking helper
function trackEvent(event: string, params: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...params });
  }
}

const PLAN_ID_ALIAS: Record<string, SubscriptionPlanId> = {
  CORE: "CORE_MONTHLY",
  CORE_MONTHLY: "CORE_MONTHLY",
  MONTHLY_CORE: "CORE_MONTHLY",
  ANNUAL_CORE: "CORE_ANNUAL",
  CORE_ANNUAL: "CORE_ANNUAL",
  FAMILY: "FAMILY_MONTHLY",
  FAMILY_MONTHLY: "FAMILY_MONTHLY",
  MONTHLY_FAMILY: "FAMILY_MONTHLY",
  ANNUAL_FAMILY: "FAMILY_ANNUAL",
  FAMILY_ANNUAL: "FAMILY_ANNUAL",
};

function normalizePlanId(planId?: string | null): SubscriptionPlanId | null {
  if (!planId) return null;
  const key = planId.toUpperCase();
  return PLAN_ID_ALIAS[key] ?? null;
}

function getCreditsCopy(plan: SubscriptionPlanDefinition): string {
  if (plan.billingInterval === "monthly") {
    return `${plan.creditsPerInterval} credits/mo (parent or child)`;
  }
  const creditsPerYear =
    plan.creditIntervalMonths === 0
      ? plan.creditsPerInterval
      : plan.creditsPerInterval * Math.round(12 / plan.creditIntervalMonths);
  return `${creditsPerYear} credits/yr (${plan.creditsPerInterval} per month pacing)`;
}

function getConversationalCopy(plan: SubscriptionPlanDefinition): string {
  if (plan.conversationalAI.included && plan.conversationalAI.unlimited) {
    return "Conversational AI included (unlimited)";
  }
  if (plan.conversationalAI.included) {
    return `Conversational AI included (${plan.conversationalAI.description})`;
  }
  return `Conversational AI ${plan.conversationalAI.description}`;
}

interface UpgradePlanProps {
  currentPlanId: string;
  creditsAvailable: number;
  rolloverCap: number;
  nextCreditInDays: number;
  conversationalAI?: string;
}

export default function UpgradePlan({
  currentPlanId,
  creditsAvailable,
  rolloverCap,
  nextCreditInDays,
  conversationalAI,
}: UpgradePlanProps) {
  const router = useRouter();
  const normalizedCurrentPlanId = normalizePlanId(currentPlanId);
  const currentPlan = normalizedCurrentPlanId
    ? getSubscriptionPlanById(normalizedCurrentPlanId)
    : null;

  const [selectedPlanId, setSelectedPlanId] =
    useState<SubscriptionPlanId | null>(null);
  const [topUp, setTopUp] = useState(false);

  const selectedPlan = useMemo(
    () => (selectedPlanId ? getSubscriptionPlanById(selectedPlanId) : null),
    [selectedPlanId]
  );

  const effectiveRolloverCap =
    rolloverCap || currentPlan?.rolloverCap || DASHBOARD_PLAN_OPTIONS[0].rolloverCap;
  const creditFillPercent =
    effectiveRolloverCap > 0
      ? Math.min(
          100,
          Math.max(0, (creditsAvailable / effectiveRolloverCap) * 100)
        )
      : 0;
  const conversationalAIDescription =
    conversationalAI ||
    currentPlan?.conversationalAI.description ||
    "See plan options";

  const currentPlanDisplayName = currentPlan
    ? `${currentPlan.tier === "CORE" ? "Core" : "Family"}${
        currentPlan.billingInterval === "annual" ? " (Annual)" : ""
      }`
    : currentPlanId;

  useEffect(() => {
    trackEvent("upgrade_view", {
      plan_current: normalizedCurrentPlanId ?? currentPlanId ?? "UNKNOWN",
      credits: creditsAvailable,
      rollover_cap: effectiveRolloverCap,
    });
  }, [normalizedCurrentPlanId, currentPlanId, creditsAvailable, effectiveRolloverCap]);

  const handlePlanSelect = (plan: SubscriptionPlanDefinition) => {
    setSelectedPlanId(plan.id);
    trackEvent("upgrade_click", {
      plan_current: normalizedCurrentPlanId ?? currentPlanId ?? "UNKNOWN",
      plan_target: plan.id,
      billing: plan.billingInterval,
      price_cents: plan.priceCents,
      credits_per_interval: plan.creditsPerInterval,
      rollover_cap: plan.rolloverCap,
    });
  };

  const planCards = useMemo(
    () =>
      DASHBOARD_PLAN_OPTIONS.map((plan) => {
        const isCurrent = plan.id === normalizedCurrentPlanId;
        const creditsCopy = getCreditsCopy(plan);
        const conversationalCopy = getConversationalCopy(plan);
        const enhancedCopy = plan.enhancedReports.description;
        const keyFeature =
          plan.tier === "FAMILY"
            ? plan.features.find((feature) =>
                feature.toLowerCase().includes("multi-child")
              )
            : plan.features.find((feature) =>
                feature.toLowerCase().includes("priority")
              );
        const highlights = [
          `• ${creditsCopy}`,
          `• Rollover up to ${plan.rolloverCap}`,
          `• ${conversationalCopy}`,
        ];
        if (enhancedCopy) {
          highlights.push(`• ${enhancedCopy}`);
        }
        if (keyFeature) {
          highlights.push(`• ${keyFeature}`);
        }

        const shouldShowBadge =
          plan.badge &&
          (plan.billingInterval !== "annual" ||
            !currentPlan ||
            (currentPlan.tier === plan.tier &&
              currentPlan.billingInterval === "monthly"));

        return {
          plan,
          isCurrent,
          highlights,
          badge: shouldShowBadge ? plan.badge : null,
        };
      }),
    [normalizedCurrentPlanId, currentPlan]
  );

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Plan</h1>

      {/* Current Plan */}
      <div className="rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Your Plan: {currentPlanDisplayName}
            </h2>
            <p className="text-gray-600 text-sm">
              Conversational AI: {conversationalAIDescription}
            </p>
          </div>
          <button
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800"
            onClick={async () => {
              trackEvent("add_report_click", {
                plan_current: normalizedCurrentPlanId ?? currentPlanId ?? "UNKNOWN",
                price_cents: 9700,
              });
              router.push("/checkout/single?source=dashboard&type=payment");
            }}
          >
            Add One-Time Report — $97
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Credits: {creditsAvailable} of {effectiveRolloverCap} available
            </span>
            <span className="text-gray-500">
              Next credit in {nextCreditInDays} days
            </span>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-100 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${creditFillPercent}%` }}
              aria-valuenow={creditsAvailable}
              aria-valuemax={effectiveRolloverCap}
              aria-label="Credit balance bar"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Rollover cap: {effectiveRolloverCap}. Unused credits expire after 12
            months (oldest first).
          </p>
        </div>

        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                });
              }
            }}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {planCards.map(({ plan, isCurrent, highlights, badge }) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 transition hover:shadow-md ${
              isCurrent ? "opacity-60 pointer-events-none" : "border-gray-200"
            }`}
          >
            {badge && (
              <div
                className={`absolute -top-3 left-4 text-xs px-3 py-1 rounded-full ${
                  plan.badgeVariant === "secondary"
                    ? "bg-green-100 text-green-800"
                    : "bg-indigo-600 text-white"
                }`}
                aria-label={plan.badgeAriaLabel ?? badge}
              >
                {badge}
              </div>
            )}
            <h3 className="text-lg font-semibold">{plan.label}</h3>
            <p className="text-sm text-gray-600">{plan.priceLabel}</p>
            {plan.savingsLabel && (
              <p className="text-xs text-green-700 font-medium mt-1">
                {plan.savingsLabel}
              </p>
            )}
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button
              className={`mt-4 w-full py-2 rounded-lg font-semibold ${
                isCurrent
                  ? "bg-gray-200 text-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600"
              }`}
              disabled={isCurrent}
              onClick={() => handlePlanSelect(plan)}
            >
              {isCurrent ? "Current Plan" : plan.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Confirm Upgrade to {selectedPlan.label}
            </h2>
            <p className="mb-2">
              New plan: {selectedPlan.label} — {selectedPlan.priceLabel}
            </p>
            <p className="mb-2">
              Prorated today: calculated automatically (credit from current plan
              applied).
            </p>
            <p className="mb-2">
              You’ll get: immediate credit top-up to the new rollover cap (if you
              toggle top-up), {selectedPlan.conversationalAI.description},{" "}
              rollover cap {selectedPlan.rolloverCap}.
            </p>
            <p className="text-xs text-gray-500">
              {selectedPlan.creditRolloverNote}
            </p>

            <div className="flex items-center gap-2 my-4">
              <label className="text-sm font-medium">
                Top-up credits now to new allowance
              </label>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={topUp}
                onChange={(event) => setTopUp(event.target.checked)}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                onClick={async () => {
                  trackEvent("upgrade_confirm", {
                    plan_from: normalizedCurrentPlanId ?? currentPlanId ?? "UNKNOWN",
                    plan_to: selectedPlan.id,
                    billing: selectedPlan.billingInterval,
                    price_cents: selectedPlan.priceCents,
                    credits_per_interval: selectedPlan.creditsPerInterval,
                    rollover_cap: selectedPlan.rolloverCap,
                    prorated: true,
                    topup: topUp,
                  });

                  const billingParam =
                    selectedPlan.billingInterval === "annual"
                      ? "annual"
                      : "monthly";
                  const searchParams = new URLSearchParams({
                    billing: billingParam,
                    source: "dashboard",
                    type: "subscription",
                  });
                  if (topUp) {
                    searchParams.set("topUp", "true");
                  }
                  router.push(
                    `/checkout/${selectedPlan.slug}?${searchParams.toString()}`
                  );
                }}
              >
                Confirm Upgrade
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                onClick={() => setSelectedPlanId(null)}
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Proration applies automatically. Renews on your regular billing
              schedule. Cancel anytime.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
