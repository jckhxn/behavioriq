import type { Prisma, LicenseType } from "@prisma/client";
import type { SubscriptionPlanDefinition, SubscriptionPlanId } from "@/lib/config/pricing";
import { generateLicenseKey } from "@/lib/config/license";

const LICENSE_TYPE_BY_PLAN: Record<SubscriptionPlanId, LicenseType> = {
  CORE_MONTHLY: "CORE",
  CORE_ANNUAL: "ANNUAL_CORE",
  FAMILY_MONTHLY: "FAMILY",
  FAMILY_ANNUAL: "ANNUAL_FAMILY",
};

const UNLIMITED_INT = 2147483647;

interface ApplyPlanOptions {
  topUp?: boolean;
}

export async function applySubscriptionPlanToUser(
  tx: Prisma.TransactionClient,
  userId: string,
  plan: SubscriptionPlanDefinition,
  options: ApplyPlanOptions = {}
) {
  const licenseType = LICENSE_TYPE_BY_PLAN[plan.id];
  if (!licenseType) {
    throw new Error(`Unsupported license type mapping for plan ${plan.id}`);
  }

  const topUp = Boolean(options.topUp);

  const userLicense = await tx.userLicense.findFirst({
    where: { userId, isActive: true },
    include: { license: true },
    orderBy: { assignedAt: "desc" },
  });

  const conversationalAllowance = plan.conversationalAI.unlimited
    ? UNLIMITED_INT
    : 0;

  const enhancedReportLimit =
    plan.enhancedReports.included === "unlimited"
      ? null
      : plan.enhancedReports.included ?? 0;

  const licenseFeaturePayload = {
    planId: plan.id,
    tier: plan.tier,
    billingInterval: plan.billingInterval,
    creditsPerInterval: plan.creditsPerInterval,
    creditIntervalMonths: plan.creditIntervalMonths,
    rolloverCap: plan.rolloverCap,
    conversationalAI: plan.conversationalAI,
    enhancedReports: plan.enhancedReports,
    features: plan.features,
  };

  if (userLicense) {
    const currentUsed = userLicense.assessmentsUsed;
    const currentAllowed = userLicense.assessmentsAllowed;
    const cappedAllowance = Math.min(
      plan.rolloverCap,
      Math.max(currentAllowed, currentUsed)
    );
    const allowance = topUp
      ? Math.max(plan.rolloverCap, currentUsed)
      : cappedAllowance;

    await tx.userLicense.update({
      where: { id: userLicense.id },
      data: {
        isActive: true,
        assessmentsAllowed: allowance,
        conversationalAssessmentsAllowed: conversationalAllowance,
        conversationalReportsAllowed:
          enhancedReportLimit ?? userLicense.conversationalReportsAllowed,
      },
    });

    await tx.license.update({
      where: { id: userLicense.licenseId },
      data: {
        type: licenseType,
        maxAssessments: plan.rolloverCap,
        maxConversationalAssessments: plan.conversationalAI.unlimited
          ? null
          : plan.conversationalAI.included
            ? plan.creditsPerInterval
            : 0,
        maxConversationalReports: enhancedReportLimit,
        features: licenseFeaturePayload as any,
        status: "ACTIVE",
      },
    });
    return;
  }

  const newLicense = await tx.license.create({
    data: {
      licenseKey: generateLicenseKey(plan.tier),
      type: licenseType,
      status: "ACTIVE",
      maxAssessments: plan.rolloverCap,
      maxConversationalAssessments: plan.conversationalAI.unlimited
        ? null
        : plan.conversationalAI.included
          ? plan.creditsPerInterval
          : 0,
      maxConversationalReports: enhancedReportLimit,
      features: licenseFeaturePayload as any,
    },
  });

  await tx.userLicense.create({
    data: {
      userId,
      licenseId: newLicense.id,
      isActive: true,
      assessmentsAllowed: topUp
        ? Math.max(plan.rolloverCap, 0)
        : plan.creditsPerInterval,
      assessmentsUsed: 0,
      conversationalAssessmentsAllowed: conversationalAllowance,
      conversationalAssessmentsUsed: 0,
      conversationalReportsAllowed: enhancedReportLimit ?? 0,
      conversationalReportsUsed: 0,
    },
  });
}
