/**
 * Analytics Utilities
 * Aggregates and calculates affiliate performance metrics
 */

import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, format } from 'date-fns';

interface Commission {
  id: string;
  createdAt: Date;
  event: string;
  amountCents: number;
  status: string;
}

interface TimeSeriesDataPoint {
  date: string;
  earnings: number;
  commissionCount: number;
}

interface CommissionBreakdown {
  type: string;
  count: number;
  amount: number;
  percentage: number;
}

interface PerformanceMetrics {
  averageCommission: number;
  bestMonth: {
    month: string;
    earnings: number;
  } | null;
  growthRate: number;
  totalEarnings: number;
  totalCommissions: number;
}

/**
 * Group commissions by time period (day/week/month)
 */
export function aggregateCommissionsByPeriod(
  commissions: Commission[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): TimeSeriesDataPoint[] {
  const grouped = new Map<string, { earnings: number; count: number }>();

  commissions.forEach((commission) => {
    let dateKey: string;

    switch (groupBy) {
      case 'week':
        dateKey = format(startOfWeek(commission.createdAt), 'yyyy-MM-dd');
        break;
      case 'month':
        dateKey = format(startOfMonth(commission.createdAt), 'yyyy-MM');
        break;
      case 'day':
      default:
        dateKey = format(startOfDay(commission.createdAt), 'yyyy-MM-dd');
        break;
    }

    const existing = grouped.get(dateKey) || { earnings: 0, count: 0 };
    grouped.set(dateKey, {
      earnings: existing.earnings + commission.amountCents,
      count: existing.count + 1,
    });
  });

  // Convert to array and sort by date
  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      earnings: data.earnings / 100, // Convert to dollars
      commissionCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Break down commissions by type
 */
export function breakdownByCommissionType(commissions: Commission[]): CommissionBreakdown[] {
  const grouped = new Map<string, { count: number; amount: number }>();
  let totalAmount = 0;

  commissions.forEach((commission) => {
    const existing = grouped.get(commission.event) || { count: 0, amount: 0 };
    grouped.set(commission.event, {
      count: existing.count + 1,
      amount: existing.amount + commission.amountCents,
    });
    totalAmount += commission.amountCents;
  });

  // Convert to array with percentages
  return Array.from(grouped.entries())
    .map(([type, data]) => ({
      type: formatEventType(type),
      count: data.count,
      amount: data.amount / 100, // Convert to dollars
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(commissions: Commission[]): PerformanceMetrics {
  if (commissions.length === 0) {
    return {
      averageCommission: 0,
      bestMonth: null,
      growthRate: 0,
      totalEarnings: 0,
      totalCommissions: 0,
    };
  }

  // Calculate total earnings and average
  const totalEarnings = commissions.reduce((sum, c) => sum + c.amountCents, 0) / 100;
  const averageCommission = totalEarnings / commissions.length;

  // Find best month
  const monthlyEarnings = new Map<string, number>();
  commissions.forEach((commission) => {
    const monthKey = format(commission.createdAt, 'yyyy-MM');
    const existing = monthlyEarnings.get(monthKey) || 0;
    monthlyEarnings.set(monthKey, existing + commission.amountCents);
  });

  let bestMonth: { month: string; earnings: number } | null = null;
  monthlyEarnings.forEach((earnings, month) => {
    if (!bestMonth || earnings > bestMonth.earnings) {
      bestMonth = { month, earnings: earnings / 100 };
    }
  });

  // Calculate growth rate (comparing last month to previous month)
  const sortedMonths = Array.from(monthlyEarnings.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let growthRate = 0;
  if (sortedMonths.length >= 2) {
    const lastMonth = sortedMonths[sortedMonths.length - 1][1];
    const previousMonth = sortedMonths[sortedMonths.length - 2][1];

    if (previousMonth > 0) {
      growthRate = ((lastMonth - previousMonth) / previousMonth) * 100;
    }
  }

  return {
    averageCommission,
    bestMonth,
    growthRate,
    totalEarnings,
    totalCommissions: commissions.length,
  };
}

/**
 * Compare monthly performance (for bar chart)
 */
export function compareMonthlyPerformance(
  commissions: Commission[],
  monthsToShow: number = 6
): { month: string; earnings: number; count: number }[] {
  const monthlyData = new Map<string, { earnings: number; count: number }>();

  commissions.forEach((commission) => {
    const monthKey = format(commission.createdAt, 'MMM yyyy');
    const existing = monthlyData.get(monthKey) || { earnings: 0, count: 0 };
    monthlyData.set(monthKey, {
      earnings: existing.earnings + commission.amountCents,
      count: existing.count + 1,
    });
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      earnings: data.earnings / 100,
      count: data.count,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, monthsToShow)
    .reverse();
}

/**
 * Format event type for display
 */
function formatEventType(event: string): string {
  const eventMap: Record<string, string> = {
    paid_report: 'Paid Report',
    core_sub: 'Core Subscription',
    family_sub: 'Family Subscription',
    annual_sub: 'Annual Subscription',
  };

  return eventMap[event] || event;
}

/**
 * Calculate daily average earnings (for estimations)
 */
export function calculateDailyAverageEarnings(commissions: Commission[], days: number = 30): number {
  if (commissions.length === 0) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentCommissions = commissions.filter((c) => c.createdAt >= cutoffDate);

  if (recentCommissions.length === 0) return 0;

  const totalEarnings = recentCommissions.reduce((sum, c) => sum + c.amountCents, 0);

  return totalEarnings / days;
}
