import { prisma } from "@/lib/db/prisma";
import {
  type SubscriptionPlanDefinition,
  type SubscriptionPlanId,
  getSubscriptionPlanById,
} from "@/lib/config/pricing";
import { applySubscriptionPlanToUser } from "@/lib/services/subscription-plan-updater";
import {
  PlanPauseLimitError,
  pauseUserPlan,
  resumeUserPlan,
} from "@/lib/services/plan-summary-service";

type PlanTarget = "core" | "family";
type PlanTerm = "monthly" | "annual";

const PLAN_LOOKUP: Record<PlanTarget, Record<PlanTerm, SubscriptionPlanId>> = {
  core: {
    monthly: "CORE_MONTHLY",
    annual: "CORE_ANNUAL",
  },
  family: {
    monthly: "FAMILY_MONTHLY",
    annual: "FAMILY_ANNUAL",
  },
};

async function recordTelemetry(
  userId: string,
  event: string,
  metadata: Record<string, any>
) {
  await prisma.telemetryEvent.create({
    data: { userId, event, metadata },
  });
}

function resolvePlanDefinition(
  target: PlanTarget,
  term: PlanTerm
): SubscriptionPlanDefinition {
  const planId = PLAN_LOOKUP[target][term];
  const plan = getSubscriptionPlanById(planId);
  if (!plan) {
    throw new Error(`Unknown subscription plan for ${target} (${term})`);
  }
  return plan;
}

export async function upgradeUserPlan(
  userId: string,
  target: PlanTarget,
  term: PlanTerm
) {
  const plan = resolvePlanDefinition(target, term);
  await prisma.$transaction(async (tx) => {
    await applySubscriptionPlanToUser(tx, userId, plan, { topUp: false });
  });

  await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      pendingAction: null,
    },
    create: { userId },
  });

  await recordTelemetry(userId, "billing.plan_upgraded", {
    planBefore: target === "core" ? "free_or_single" : "core",
    planAfter: plan.id,
    term,
    price: plan.priceCents / 100,
  });

  return { planId: plan.id, planLabel: plan.label, price: plan.priceCents / 100 };
}

export async function switchUserToAnnual(
  userId: string,
  target: PlanTarget
) {
  const plan = resolvePlanDefinition(target, "annual");
  await prisma.$transaction(async (tx) => {
    await applySubscriptionPlanToUser(tx, userId, plan, { topUp: false });
  });

  await recordTelemetry(userId, "billing.plan_switched_annual", {
    planAfter: plan.id,
    price: plan.priceCents / 100,
    term: "annual",
  });

  return {
    planId: plan.id,
    planLabel: plan.label,
    price: plan.priceCents / 100,
  };
}

export async function downgradeUserPlan(
  userId: string,
  target: PlanTarget,
  effectiveAt: Date
) {
  await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      pendingAction: {
        type: "downgrade",
        target,
        effectiveAt: effectiveAt.toISOString(),
      },
    },
    create: {
      userId,
      pendingAction: {
        type: "downgrade",
        target,
        effectiveAt: effectiveAt.toISOString(),
      },
    },
  });

  await recordTelemetry(userId, "billing.downgrade_requested", {
    planAfter: target,
    effectiveAt: effectiveAt.toISOString(),
  });

  return { effectiveAt: effectiveAt.toISOString() };
}

export async function addCreditsToUserPlan(userId: string, qty: number) {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be positive");
  }

  await prisma.$transaction(async (tx) => {
    const license = await tx.userLicense.findFirst({
      where: { userId, isActive: true },
      orderBy: { assignedAt: "desc" },
    });

    if (!license) {
      throw new Error("No active license to add credits");
    }

    await tx.userLicense.update({
      where: { id: license.id },
      data: {
        assessmentsAllowed: license.assessmentsAllowed + qty,
      },
    });
  });

  await recordTelemetry(userId, "billing.add_credits", {
    quantity: qty,
  });
}

export async function pauseUserSubscription(userId: string) {
  try {
    const resumeAt = await pauseUserPlan(userId);
    await recordTelemetry(userId, "billing.pause_started", {
      resumeAt: resumeAt.toISOString(),
    });
    return { resumeAt: resumeAt.toISOString() };
  } catch (error) {
    if (error instanceof PlanPauseLimitError) {
      throw error;
    }
    console.error("pauseUserSubscription error", error);
    throw new Error("Failed to pause subscription");
  }
}

export async function resumeUserSubscription(userId: string) {
  await resumeUserPlan(userId);
  await recordTelemetry(userId, "billing.pause_resumed", {});
}

export async function cancelUserPlan(
  userId: string,
  choice: "pause" | "lite" | "annual" | "cancel"
) {
  if (choice === "pause") {
    return pauseUserSubscription(userId);
  }

  const effectiveAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      pendingAction: {
        type: "cancel",
        choice,
        effectiveAt: effectiveAt.toISOString(),
      },
    },
    create: {
      userId,
      pendingAction: {
        type: "cancel",
        choice,
        effectiveAt: effectiveAt.toISOString(),
      },
    },
  });

  await recordTelemetry(userId, "billing.cancel_requested", {
    choice,
    effectiveAt: effectiveAt.toISOString(),
  });

  return { effectiveAt: effectiveAt.toISOString(), choice };
}
