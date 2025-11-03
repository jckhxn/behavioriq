/**
 * CSV Export Utilities
 * Generates CSV files for commissions and payouts
 */

interface Commission {
  id: string;
  createdAt: Date;
  event: string;
  amountCents: number;
  status: string;
  holdUntil?: Date | null;
  referredUserId: string;
  voidReason?: string | null;
}

interface Payout {
  id: string;
  createdAt: Date;
  amountCents: number;
  status: string;
  transferId?: string | null;
  feesCents?: number;
  netAmountCents?: number | null;
  estimatedArrivalDate?: Date | null;
  actualArrivalDate?: Date | null;
  failureReason?: string | null;
}

/**
 * Convert array to CSV string
 */
function arrayToCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerRow = headers.map(escape).join(',');
  const dataRows = rows.map((row) => row.map(escape).join(',')).join('\n');

  return `${headerRow}\n${dataRows}`;
}

/**
 * Export commissions to CSV
 */
export function exportCommissionsToCSV(commissions: Commission[]): string {
  const headers = [
    'Date',
    'Event Type',
    'Amount (USD)',
    'Status',
    'Hold Period',
    'Days Remaining',
    'Referred User (Anonymized)',
    'Void Reason',
  ];

  const rows = commissions.map((commission) => {
    const date = commission.createdAt.toISOString().split('T')[0];
    const eventType = formatEventType(commission.event);
    const amount = `$${(commission.amountCents / 100).toFixed(2)}`;
    const status = commission.status;

    // Calculate days remaining in hold period
    let holdPeriod = 'N/A';
    let daysRemaining = 'N/A';

    if (commission.status === 'pending' && commission.holdUntil) {
      const now = new Date();
      const holdEnd = new Date(commission.holdUntil);
      const totalDays = 14; // Assuming 14-day hold
      const daysLeft = Math.max(0, Math.ceil((holdEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      holdPeriod = `${totalDays} days`;
      daysRemaining = `${daysLeft}`;
    } else if (commission.status === 'payable' || commission.status === 'paid') {
      holdPeriod = '14 days (completed)';
      daysRemaining = '0';
    }

    // Anonymize user ID (show first 4 chars only)
    const anonymizedUserId = commission.referredUserId.substring(0, 8) + '***';

    const voidReason = commission.voidReason || '';

    return [date, eventType, amount, status, holdPeriod, daysRemaining, anonymizedUserId, voidReason];
  });

  return arrayToCSV(headers, rows);
}

/**
 * Export payouts to CSV
 */
export function exportPayoutsToCSV(payouts: Payout[]): string {
  const headers = [
    'Date',
    'Amount (USD)',
    'Status',
    'Transfer ID',
    'Fees (USD)',
    'Net Amount (USD)',
    'Estimated Arrival',
    'Actual Arrival',
    'Failure Reason',
  ];

  const rows = payouts.map((payout) => {
    const date = payout.createdAt.toISOString().split('T')[0];
    const amount = `$${(payout.amountCents / 100).toFixed(2)}`;
    const status = payout.status;
    const transferId = payout.transferId || 'N/A';
    const fees = `$${((payout.feesCents || 0) / 100).toFixed(2)}`;
    const netAmount = payout.netAmountCents
      ? `$${(payout.netAmountCents / 100).toFixed(2)}`
      : `$${((payout.amountCents - (payout.feesCents || 0)) / 100).toFixed(2)}`;

    const estimatedArrival = payout.estimatedArrivalDate
      ? new Date(payout.estimatedArrivalDate).toISOString().split('T')[0]
      : 'N/A';

    const actualArrival = payout.actualArrivalDate
      ? new Date(payout.actualArrivalDate).toISOString().split('T')[0]
      : 'N/A';

    const failureReason = payout.failureReason || '';

    return [date, amount, status, transferId, fees, netAmount, estimatedArrival, actualArrival, failureReason];
  });

  return arrayToCSV(headers, rows);
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
 * Generate filename for CSV export
 */
export function generateCSVFilename(type: 'commissions' | 'payouts', startDate?: string, endDate?: string): string {
  const now = new Date().toISOString().split('T')[0];
  const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : `_${now}`;

  return `affiliate_${type}${dateRange}.csv`;
}
