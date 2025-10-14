/**
 * Email Budget Service
 *
 * Tracks SES email usage and enforces monthly budget limits.
 * Cost: $0.10 per 1,000 emails = $0.0001 per email
 */

import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// SES pricing: $0.10 per 1,000 emails
export const EMAIL_COST_PER_SEND = 0.0001; // $0.0001 per email

/**
 * Budget status for dashboard display
 */
export interface BudgetStatus {
  currentMonthEmails: number;
  currentMonthCost: number;
  monthlyBudget: number;
  percentageUsed: number;
  remainingBudget: number;
  remainingEmails: number;
  alertLevel: "safe" | "warning" | "danger" | "exceeded";
  isEmailSendingEnabled: boolean;
  canSendEmails: boolean;
}

/**
 * Check if email sending is available
 * Returns true if emails can be sent, false if blocked by toggle or budget
 *
 * @throws Error with specific message if sending is blocked
 */
export async function checkBudgetAvailable(): Promise<boolean> {
  // Get platform settings
  const settings = await prisma.platformSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Check manual toggle first
  if (!settings?.emailSendingEnabled) {
    throw new Error(
      "Email sending is currently disabled by platform administrator"
    );
  }

  // Get current month's usage
  const currentMonth = getFirstDayOfMonth(new Date());
  const monthlyTotal = await prisma.sESMonthlyTotal.findUnique({
    where: { month: currentMonth },
  });

  const currentCost = monthlyTotal?.totalCost
    ? parseFloat(monthlyTotal.totalCost.toString())
    : 0;
  const monthlyBudget = settings?.sesMonthlyBudget
    ? parseFloat(settings.sesMonthlyBudget.toString())
    : 5.0;

  // Check if budget exceeded
  if (currentCost >= monthlyBudget) {
    throw new Error(
      `SES sending blocked: Monthly budget of $${monthlyBudget.toFixed(2)} exceeded. Current usage: $${currentCost.toFixed(4)}`
    );
  }

  return true;
}

/**
 * Log email(s) sent and update monthly totals
 *
 * @param emailCount Number of emails sent
 * @param recipient Optional recipient email for audit trail
 * @param emailType Optional type of email (e.g., "PDF Report", "Welcome")
 */
export async function logEmailSent(
  emailCount: number = 1,
  recipient?: string,
  emailType?: string
): Promise<void> {
  const cost = emailCount * EMAIL_COST_PER_SEND;
  const currentMonth = getFirstDayOfMonth(new Date());

  // Log individual send
  await prisma.sESUsage.create({
    data: {
      emailsSent: emailCount,
      estimatedCost: new Decimal(cost),
      recipient,
      emailType,
      sentAt: new Date(),
    },
  });

  // Update or create monthly total
  await prisma.sESMonthlyTotal.upsert({
    where: { month: currentMonth },
    create: {
      month: currentMonth,
      totalEmailsSent: emailCount,
      totalCost: new Decimal(cost),
    },
    update: {
      totalEmailsSent: { increment: emailCount },
      totalCost: { increment: new Decimal(cost) },
      updatedAt: new Date(),
    },
  });
}

/**
 * Get current month's usage statistics
 */
export async function getCurrentMonthUsage() {
  const currentMonth = getFirstDayOfMonth(new Date());

  const monthlyTotal = await prisma.sESMonthlyTotal.findUnique({
    where: { month: currentMonth },
  });

  return {
    month: currentMonth,
    totalEmailsSent: monthlyTotal?.totalEmailsSent || 0,
    totalCost: monthlyTotal?.totalCost
      ? parseFloat(monthlyTotal.totalCost.toString())
      : 0,
  };
}

/**
 * Get budget status for dashboard display
 */
export async function getBudgetStatus(): Promise<BudgetStatus> {
  // Get platform settings
  const settings = await prisma.platformSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const isEmailSendingEnabled = settings?.emailSendingEnabled ?? true;
  const monthlyBudget = settings?.sesMonthlyBudget
    ? parseFloat(settings.sesMonthlyBudget.toString())
    : 5.0;

  // Get current month usage
  const usage = await getCurrentMonthUsage();
  const currentMonthCost = usage.totalCost;
  const currentMonthEmails = usage.totalEmailsSent;

  // Calculate metrics
  const percentageUsed = (currentMonthCost / monthlyBudget) * 100;
  const remainingBudget = Math.max(0, monthlyBudget - currentMonthCost);
  const remainingEmails = Math.floor(remainingBudget / EMAIL_COST_PER_SEND);

  // Determine alert level
  let alertLevel: BudgetStatus["alertLevel"];
  if (percentageUsed >= 100) {
    alertLevel = "exceeded";
  } else if (percentageUsed >= 90) {
    alertLevel = "danger";
  } else if (percentageUsed >= 70) {
    alertLevel = "warning";
  } else {
    alertLevel = "safe";
  }

  const canSendEmails =
    isEmailSendingEnabled && currentMonthCost < monthlyBudget;

  return {
    currentMonthEmails,
    currentMonthCost,
    monthlyBudget,
    percentageUsed,
    remainingBudget,
    remainingEmails,
    alertLevel,
    isEmailSendingEnabled,
    canSendEmails,
  };
}

/**
 * Get usage history for the last N months
 *
 * @param months Number of months to retrieve (default: 6)
 */
export async function getUsageHistory(months: number = 6) {
  const history = await prisma.sESMonthlyTotal.findMany({
    orderBy: { month: "desc" },
    take: months,
  });

  return history.map((record) => ({
    month: record.month,
    totalEmailsSent: record.totalEmailsSent,
    totalCost: parseFloat(record.totalCost.toString()),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));
}

/**
 * Get platform email settings
 */
export async function getEmailSettings() {
  const settings = await prisma.platformSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return {
    emailSendingEnabled: settings?.emailSendingEnabled ?? true,
    sesMonthlyBudget: settings?.sesMonthlyBudget
      ? parseFloat(settings.sesMonthlyBudget.toString())
      : 5.0,
  };
}

/**
 * Helper: Get first day of month for a given date
 */
function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
