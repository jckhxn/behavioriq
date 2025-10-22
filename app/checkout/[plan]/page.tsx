"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function normalizePlanKey(rawPlan: string, billingParam: string | null) {
  const cleaned = rawPlan.trim().toUpperCase().replace(/[-\s]/g, "_");

  if (cleaned === "SINGLE" || cleaned === "SINGLE_ASSESSMENT") {
    return "SINGLE";
  }

  const billing =
    billingParam && billingParam.toLowerCase().startsWith("annual")
      ? "ANNUAL"
      : "MONTHLY";

  if (cleaned === "CORE" || cleaned === "CORE_PLAN") {
    return `CORE_${billing}`;
  }

  if (cleaned === "FAMILY" || cleaned === "FAMILY_PLAN") {
    return `FAMILY_${billing}`;
  }

  return cleaned;
}

export default function CheckoutPlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const planParam = Array.isArray(params.plan)
    ? params.plan[0]
    : (params.plan as string | undefined) ?? "";

  const planKey = useMemo(
    () => normalizePlanKey(planParam, searchParams.get("billing")),
    [planParam, searchParams]
  );

  useEffect(() => {
    if (!planKey) {
      setError("Missing plan identifier. Please return to the dashboard.");
      return;
    }

    const controller = new AbortController();

    async function startCheckout() {
      try {
        setError(null);
        const topUp = searchParams.get("topUp") === "true";
        const planType =
          planKey === "SINGLE" ? "payment" : (searchParams.get("type") ?? "subscription");
        const fromDashboard = searchParams.get("source") === "dashboard";
        const isUpgrade = searchParams.get("upgrade") === "true";

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({
            planType,
            planId: planKey,
            plan: planKey,
            topUp,
            fromDashboard,
            isUpgrade,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data?.url) {
          throw new Error(data?.error || "Unable to create checkout session.");
        }

        window.location.href = data.url;
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error("Checkout redirect error:", err);
        setError(
          err?.message ||
            "Something went wrong while preparing your checkout session."
        );
      }
    }

    startCheckout();

    return () => controller.abort();
  }, [planKey, searchParams]);

  const handleRetry = () => {
    setRetrying(true);
    router.refresh();
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-gray-50">
        <div className="max-w-lg w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            We couldn&apos;t start your checkout
          </h1>
          <p className="text-gray-600">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              onClick={handleRetry}
              disabled={retrying}
            >
              Try again
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              onClick={() => router.push("/dashboard")}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h1 className="text-xl font-semibold text-gray-900">
          Redirecting to secure checkout…
        </h1>
        <p className="text-gray-600 text-sm">
          We&apos;re preparing your Stripe checkout session for the{" "}
          <span className="font-medium">{planKey.replace(/_/g, " ").toLowerCase()}</span>{" "}
          plan.
        </p>
      </div>
    </main>
  );
}
