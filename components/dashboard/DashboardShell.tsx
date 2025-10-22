"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AssessmentsView } from "@/components/assessment/AssessmentsView";
import { HeaderPlanRibbon } from "@/components/dashboard/HeaderPlanRibbon";
import { UpgradePanel } from "@/components/dashboard/UpgradePanel";
import { InlineUpgradeSlot } from "@/components/dashboard/InlineUpgradeSlot";
import { ChildProfilesManager } from "@/components/dashboard/ChildProfilesManager";
import { usePlanData } from "@/hooks/use-plan-data";

type CheckoutSource = "panel" | "drawer" | "inline" | "ribbon";

export function DashboardShell() {
  const { plan, pricing, error, refresh, ribbonVisible } = usePlanData();
  const router = useRouter();
  const [checkoutPending, setCheckoutPending] = useState(false);

  const planReady = Boolean(plan && pricing && !error);

  const shouldShowPanel = useMemo(() => {
    if (!planReady || !plan || !pricing) return false;
    return plan.plan === "free" || plan.plan === "one_time";
  }, [planReady, plan, pricing]);

  const shouldShowInline = useMemo(() => {
    if (!planReady || !plan || !pricing) return false;
    if (shouldShowPanel) return false;
    if (plan.plan === "one_time") return true;
    if (plan.plan === "free") return true;
    if (plan.plan === "core" && plan.remainingCredits === 0) return true;
    return false;
  }, [planReady, plan, pricing, shouldShowPanel]);

  const inlineContext = useMemo(() => {
    if (!plan) return "empty_dashboard" as const;
    if (plan.plan === "one_time") return "post_pdf" as const;
    if (plan.plan === "core" && plan.remainingCredits === 0) return "low_credit" as const;
    return "empty_dashboard" as const;
  }, [plan]);

  const showRibbon = planReady && ribbonVisible && !shouldShowPanel && !shouldShowInline;

  const handleStartCheckout = useCallback(
    async (
      target: "core" | "family",
      term: "monthly" | "annual",
      source: CheckoutSource
    ) => {
      if (checkoutPending) return;
      try {
        setCheckoutPending(true);
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: target, term, source }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "Unable to start checkout");
        }

        const data = await response.json();
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to start checkout";
        toast.error(message);
      } finally {
        setCheckoutPending(false);
      }
    },
    [checkoutPending, router]
  );

  const handleStartSingle = useCallback(() => {
    router.push("/checkout/single?billing=one_time&source=inline");
  }, [router]);

  const handleManage = useCallback(() => {
    router.push("/?tab=settings&subtab=billing");
  }, [router]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {showRibbon && plan && pricing && (
        <HeaderPlanRibbon
          plan={plan}
          pricing={pricing}
          onDismiss={refresh}
          onUpgrade={({ target = "core", term = "monthly" } = {}) =>
            handleStartCheckout(target, term, "ribbon")
          }
          onManage={handleManage}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 lg:space-y-5">
          {planReady && plan && pricing && shouldShowInline && (
            <InlineUpgradeSlot
              context={inlineContext}
              plan={plan}
              pricing={pricing}
              onStartCheckout={({ target, term }) =>
                handleStartCheckout(target, term, "inline")
              }
              onStartSingle={handleStartSingle}
            />
          )}
          {planReady && plan && plan.plan === "family" && (
            <ChildProfilesManager plan={plan} onChildrenChange={refresh} />
          )}
          <AssessmentsView />
        </div>

        <div className="hidden lg:block">
          {planReady && plan && pricing && shouldShowPanel && (
            <UpgradePanel
              plan={plan}
              pricing={pricing}
              onStartCheckout={({ target, term, source }) =>
                handleStartCheckout(target, term, source)
              }
            />
          )}
        </div>
      </div>

      {/* Mobile drawer uses UpgradePanel internally via responsive hook */}
      <div className="lg:hidden">
        {planReady && plan && pricing && shouldShowPanel && (
          <UpgradePanel
            plan={plan}
            pricing={pricing}
            onStartCheckout={({ target, term, source }) =>
              handleStartCheckout(target, term, source)
            }
          />
        )}
      </div>
    </div>
  );
}
