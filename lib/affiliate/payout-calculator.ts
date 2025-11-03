/**
 * Payout Calculator
 * Calculates next payout estimates based on balance and preferences
 */

import { addDays, addMonths, addWeeks, setDate, setDay } from 'date-fns';

interface PayoutPreferences {
  minPayoutThresholdCents: number;
  payoutFrequency: 'auto' | 'daily' | 'weekly' | 'monthly';
  autoPayoutEnabled: boolean;
  payoutDayOfMonth?: number | null;
  payoutDayOfWeek?: number | null;
}

interface NextPayoutEstimate {
  eligible: boolean;
  amountCents: number;
  estimatedDate: Date | null;
  daysUntil: number | null;
  reason: string;
  needsAdditionalCents?: number;
}

/**
 * Calculate next payout date and eligibility
 */
export function calculateNextPayout(
  currentBalanceCents: number,
  preferences: PayoutPreferences,
  averageDailyEarningsCents?: number
): NextPayoutEstimate {
  const { minPayoutThresholdCents, payoutFrequency, autoPayoutEnabled, payoutDayOfMonth, payoutDayOfWeek } = preferences;

  // Check if auto-payout is disabled
  if (!autoPayoutEnabled) {
    return {
      eligible: currentBalanceCents >= minPayoutThresholdCents,
      amountCents: currentBalanceCents,
      estimatedDate: null,
      daysUntil: null,
      reason: 'Auto-payout disabled. Request manual payout when ready.',
    };
  }

  // Check if balance meets minimum threshold
  if (currentBalanceCents < minPayoutThresholdCents) {
    const needsAdditional = minPayoutThresholdCents - currentBalanceCents;

    // Estimate days until threshold if we have earnings data
    let estimatedDays: number | null = null;
    let estimatedDate: Date | null = null;

    if (averageDailyEarningsCents && averageDailyEarningsCents > 0) {
      estimatedDays = Math.ceil(needsAdditional / averageDailyEarningsCents);
      estimatedDate = addDays(new Date(), estimatedDays);
    }

    return {
      eligible: false,
      amountCents: currentBalanceCents,
      estimatedDate,
      daysUntil: estimatedDays,
      reason: `Need $${(needsAdditional / 100).toFixed(2)} more to reach minimum threshold.`,
      needsAdditionalCents: needsAdditional,
    };
  }

  // Balance meets threshold - calculate next payout date based on frequency
  const now = new Date();
  let nextPayoutDate: Date;

  switch (payoutFrequency) {
    case 'daily':
      // Next payout is tomorrow at 3 AM UTC
      nextPayoutDate = addDays(now, 1);
      nextPayoutDate.setUTCHours(3, 0, 0, 0);
      break;

    case 'weekly':
      // Next payout is on the specified day of week at 3 AM UTC
      const targetDayOfWeek = payoutDayOfWeek ?? 1; // Default to Monday
      nextPayoutDate = setDay(now, targetDayOfWeek, { weekStartsOn: 0 });

      // If target day has passed this week, move to next week
      if (nextPayoutDate <= now) {
        nextPayoutDate = addWeeks(nextPayoutDate, 1);
      }
      nextPayoutDate.setUTCHours(3, 0, 0, 0);
      break;

    case 'monthly':
      // Next payout is on the specified day of month at 3 AM UTC
      const targetDayOfMonth = payoutDayOfMonth ?? 1; // Default to 1st
      nextPayoutDate = setDate(now, targetDayOfMonth);

      // If target day has passed this month, move to next month
      if (nextPayoutDate <= now) {
        nextPayoutDate = addMonths(nextPayoutDate, 1);
        nextPayoutDate = setDate(nextPayoutDate, targetDayOfMonth);
      }
      nextPayoutDate.setUTCHours(3, 0, 0, 0);
      break;

    case 'auto':
    default:
      // Auto means immediate - next cron run (3 AM UTC tomorrow or tonight if before 3 AM)
      nextPayoutDate = new Date(now);
      nextPayoutDate.setUTCHours(3, 0, 0, 0);

      // If it's past 3 AM UTC today, schedule for tomorrow
      if (now.getUTCHours() >= 3) {
        nextPayoutDate = addDays(nextPayoutDate, 1);
      }
      break;
  }

  const daysUntil = Math.ceil((nextPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hoursUntil = Math.ceil((nextPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  let reason: string;
  if (hoursUntil < 1) {
    reason = 'Payout processing soon (next cron run)';
  } else if (hoursUntil < 24) {
    reason = `Next payout in ${hoursUntil} hours`;
  } else {
    reason = `Next payout in ${daysUntil} days`;
  }

  return {
    eligible: true,
    amountCents: currentBalanceCents,
    estimatedDate: nextPayoutDate,
    daysUntil,
    reason,
  };
}

/**
 * Format payout estimate for display
 */
export function formatPayoutEstimate(estimate: NextPayoutEstimate): string {
  if (!estimate.eligible) {
    return estimate.reason;
  }

  if (!estimate.estimatedDate) {
    return 'Manual payout available';
  }

  return estimate.reason;
}

/**
 * Calculate estimated arrival date (2-3 business days after payout)
 */
export function calculateArrivalDate(payoutDate: Date, delayDays: number = 2): Date {
  return addDays(payoutDate, delayDays);
}
