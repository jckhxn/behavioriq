import { getUserPlanSummary } from "@/lib/services/plan-summary-service";
import type { UserPlanResponse } from "@/types/plan";

/**
 * Get plan data for a user
 * Wraps getUserPlanSummary to return UserPlanResponse format
 */
export async function getPlanData(userId: string): Promise<UserPlanResponse> {
  const summary = await getUserPlanSummary(userId);

  return {
    plan: summary.plan,
    term: summary.term,
    remainingCredits: summary.remainingCredits,
    monthlyCredits: summary.monthlyCredits,
    rolloverCap: summary.rolloverCap,
    childrenCount: summary.childrenCount,
    reportsLast30d: summary.reportsLast30d,
    anonymousModeEnabled: summary.anonymousModeEnabled,
    pausedUntil: summary.pausedUntil,
    pauseCount12m: summary.pauseCount12m,
    foundersPricingActive: summary.foundersPricingActive,
    ribbonSnoozedUntil: summary.ribbonSnoozedUntil,
    pendingAction: summary.pendingAction,
    stripe: summary.stripe,
    paymentMethod: summary.paymentMethod,
  };
}
