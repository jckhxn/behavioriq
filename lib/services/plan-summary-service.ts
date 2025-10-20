import { prisma } from "@/lib/db/prisma";
import { AssessmentStatus, type LicenseType } from "@prisma/client";

export type UserPlanType = "free" | "one_time" | "core" | "family";
export type UserPlanTerm = "monthly" | "annual" | null;

export interface UserPlanSummary {
  plan: UserPlanType;
  term: UserPlanTerm;
  remainingCredits: number;
  monthlyCredits: number | null;
  rolloverCap: number | null;
  childrenCount: number;
  reportsLast30d: number;
  anonymousModeEnabled: boolean;
  pausedUntil: string | null;
  pauseCount12m: number;
  foundersPricingActive: boolean;
  ribbonSnoozedUntil: string | null;
  pendingAction: {
    type: string;
    effectiveAt: string | null;
    payload?: Record<string, any>;
  } | null;
}

interface PlanMappingResult {
  plan: UserPlanType;
  term: UserPlanTerm;
  monthlyCredits: number | null;
  rolloverCap: number | null;
}

function mapLicenseTypeToPlan(
  licenseType: LicenseType | null,
  defaultPlan: UserPlanType = "free"
): PlanMappingResult {
  switch (licenseType) {
    case "BASIC":
      return {
        plan: "one_time",
        term: null,
        monthlyCredits: null,
        rolloverCap: 0,
      };
    case "MONTHLY_LITE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 1,
        rolloverCap: 2,
      };
    case "CORE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "ANNUAL_CORE":
      return {
        plan: "core",
        term: "annual",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "DISCOUNTED_CORE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "FAMILY":
      return {
        plan: "family",
        term: "monthly",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "ANNUAL_FAMILY":
      return {
        plan: "family",
        term: "annual",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "DISCOUNTED_FAMILY":
      return {
        plan: "family",
        term: "monthly",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "PROFESSIONAL":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "ENTERPRISE":
    case "DISTRICT_STANDARD":
    case "DISTRICT_PROFESSIONAL":
    case "DISTRICT_ENTERPRISE":
    case "PARENT_PILOT":
    case "DISTRICT_PILOT":
      return {
        plan: "family",
        term: null,
        monthlyCredits: null,
        rolloverCap: null,
      };
    default:
      return {
        plan: defaultPlan,
        term: null,
        monthlyCredits: 0,
        rolloverCap: 0,
      };
  }
}

export async function getUserPlanSummary(userId: string): Promise<UserPlanSummary> {
  const [
    activeLicense,
    childSubjects,
    reportsLast30d,
    upsellState,
  ] = await Promise.all([
    prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
        license: {
          status: "ACTIVE",
        },
      },
      include: {
        license: {
          select: {
            type: true,
            status: true,
            validUntil: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    }),
    prisma.assessment.findMany({
      where: {
        userId,
      },
      distinct: ["subjectName"],
      select: {
        subjectName: true,
      },
    }),
    prisma.assessment.count({
      where: {
        userId,
        status: AssessmentStatus.COMPLETED,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.userUpsellState.findUnique({
      where: { userId },
    }),
  ]);

  const mapping = mapLicenseTypeToPlan(activeLicense?.license?.type ?? null);

  const pauseHistoryRaw = (upsellState?.pauseHistory ?? []) as any;
  const pauseDates = Array.isArray(pauseHistoryRaw)
    ? pauseHistoryRaw
        .map((value) => {
          try {
            return new Date(value);
          } catch {
            return null;
          }
        })
        .filter(
          (value): value is Date =>
            value instanceof Date && !Number.isNaN(value.getTime())
        )
    : [];
  const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const pauseCount12m = pauseDates.filter(
    (date) => date.getTime() >= twelveMonthsAgo
  ).length;

  const pendingActionRaw = (upsellState?.pendingAction ?? null) as any;
  const pendingAction = pendingActionRaw
    ? {
        type: String(pendingActionRaw.type ?? ""),
        effectiveAt: pendingActionRaw.effectiveAt ?? null,
        payload: pendingActionRaw.payload ?? undefined,
      }
    : null;

  const remainingCredits = activeLicense
    ? Math.max(0, activeLicense.assessmentsAllowed - activeLicense.assessmentsUsed)
    : 0;

  const pausedUntil = upsellState?.pausedUntil
    ? upsellState.pausedUntil.toISOString()
    : null;

  const foundersPricingActive = isFoundersPricingActive();

  return {
    plan: mapping.plan,
    term: mapping.term,
    remainingCredits,
    monthlyCredits: mapping.monthlyCredits,
    rolloverCap: mapping.rolloverCap,
    childrenCount: childSubjects.length,
    reportsLast30d,
    anonymousModeEnabled: upsellState?.anonymousModeDefault ?? false,
    pausedUntil,
    pauseCount12m,
    foundersPricingActive,
    ribbonSnoozedUntil: upsellState?.ribbonSnoozedUntil
      ? upsellState.ribbonSnoozedUntil.toISOString()
      : null,
    pendingAction,
  };
}

export async function getOrCreateUpsellState(userId: string) {
  return prisma.userUpsellState.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function snoozePlanRibbon(
  userId: string,
  {
    durationHours,
    source,
  }: { durationHours: number; source?: string }
) {
  const snoozeUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      ribbonSnoozedUntil: snoozeUntil,
      ribbonSnoozedAt: new Date(),
      ribbonSnoozeSource: source,
    },
    create: {
      userId,
      ribbonSnoozedUntil: snoozeUntil,
      ribbonSnoozedAt: new Date(),
      ribbonSnoozeSource: source,
    },
  });
  return snoozeUntil.toISOString();
}

export function isFoundersPricingActive(): boolean {
  const cutoff = process.env.FOUNDERS_PRICING_DEADLINE;
  if (!cutoff) return false;
  const cutoffDate = new Date(cutoff);
  return Number.isFinite(cutoffDate.getTime()) && cutoffDate.getTime() > Date.now();
}

export async function setAnonymousModeDefault(
  userId: string,
  enabled: boolean
) {
  const record = await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      anonymousModeDefault: enabled,
    },
    create: {
      userId,
      anonymousModeDefault: enabled,
    },
  });

  return record.anonymousModeDefault;
}

export class PlanPauseLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanPauseLimitError";
  }
}

function sanitizePauseHistory(history: any): string[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((value) => {
      try {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {
        return null;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

export async function pauseUserPlan(userId: string, durationDays = 60) {
  const state = await getOrCreateUpsellState(userId);
  const history = sanitizePauseHistory(state.pauseHistory);
  const now = new Date();
  const twelveMonthsAgo = now.getTime() - 365 * 24 * 60 * 60 * 1000;
  const recentPauses = history.filter(
    (iso) => new Date(iso).getTime() >= twelveMonthsAgo
  );

  if (recentPauses.length >= 2) {
    throw new PlanPauseLimitError(
      "You have reached the pause limit within the last 12 months."
    );
  }

  const resumeAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const updatedHistory = [...recentPauses, now.toISOString()];

  await prisma.userUpsellState.update({
    where: { userId },
    data: {
      pausedAt: now,
      pausedUntil: resumeAt,
      pauseHistory: updatedHistory,
      pauseCount12m: updatedHistory.length,
    },
  });

  return resumeAt;
}

export async function resumeUserPlan(userId: string) {
  await prisma.userUpsellState.update({
    where: { userId },
    data: {
      pausedAt: null,
      pausedUntil: null,
    },
  });
}
