"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PricingResponse, UserPlanResponse } from "@/types/plan";

interface PlanDataState {
  plan: UserPlanResponse | null;
  pricing: PricingResponse | null;
  loading: boolean;
  error: Error | null;
}

const INITIAL_STATE: PlanDataState = {
  plan: null,
  pricing: null,
  loading: true,
  error: null,
};

export function usePlanData() {
  const [state, setState] = useState<PlanDataState>(INITIAL_STATE);
  const [refreshToken, setRefreshToken] = useState(0);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [planRes, pricingRes] = await Promise.all([
        fetch("/api/user/plan", { credentials: "include" }),
        fetch("/api/pricing", { credentials: "include" }),
      ]);

      if (!planRes.ok) {
        throw new Error("Failed to load plan data");
      }
      if (!pricingRes.ok) {
        throw new Error("Failed to load pricing data");
      }

      const [plan, pricing] = await Promise.all([
        planRes.json() as Promise<UserPlanResponse>,
        pricingRes.json() as Promise<PricingResponse>,
      ]);

      setState({ plan, pricing, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error("Failed to load plan data"),
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  const ribbonVisible = useMemo(() => {
    if (!state.plan) return false;
    if (!state.plan.ribbonSnoozedUntil) return true;
    return new Date(state.plan.ribbonSnoozedUntil).getTime() < Date.now();
  }, [state.plan]);

  return {
    plan: state.plan,
    pricing: state.pricing,
    loading: state.loading,
    error: state.error,
    refresh,
    ribbonVisible,
  };
}
