/**
 * Email Template Rendering
 *
 * Provides server-side rendering functions for React Email components
 * This allows .ts files to use React components via async rendering
 */

import { render } from '@react-email/render';
import React from 'react';
import { AssessmentReportEmail } from '@/components/email/templates/AssessmentReportEmail';
import { WelcomeEmail } from '@/components/email/templates/WelcomeEmail';
import { LicenseNotificationEmail } from '@/components/email/templates/LicenseNotificationEmail';
import { AffiliateWelcomeEmail } from '@/components/email/templates/AffiliateWelcomeEmail';
import { AffiliateCommissionEmail } from '@/components/email/templates/AffiliateCommissionEmail';
import { AffiliatePayoutEmail } from '@/components/email/templates/AffiliatePayoutEmail';
import { AffiliateFraudAlertEmail } from '@/components/email/templates/AffiliateFraudAlertEmail';

/**
 * Render Assessment Report Email
 */
export async function renderAssessmentReportEmail(
  userName: string,
  assessmentName: string,
  assessmentId: string
): Promise<string> {
  return render(
    React.createElement(AssessmentReportEmail as any, {
      userName,
      assessmentName,
      assessmentId,
    })
  );
}

/**
 * Render Welcome Email
 */
export async function renderWelcomeEmail(userName: string): Promise<string> {
  return render(
    React.createElement(WelcomeEmail as any, {
      userName,
    })
  );
}

/**
 * Render License Notification Email
 */
export async function renderLicenseNotificationEmail(
  userName: string,
  licenseType: string,
  expiryDate: Date,
  daysUntilExpiry: number
): Promise<string> {
  return render(
    React.createElement(LicenseNotificationEmail as any, {
      userName,
      licenseType,
      expiryDate,
      daysUntilExpiry,
    })
  );
}

/**
 * Render Affiliate Welcome Email
 */
export async function renderAffiliateWelcomeEmail(
  userName: string,
  referralCode: string,
  referralLink: string
): Promise<string> {
  return render(
    React.createElement(AffiliateWelcomeEmail as any, {
      userName,
      referralCode,
      referralLink,
      commissionRate: '$20',
    })
  );
}

/**
 * Render Affiliate Commission Email
 */
export async function renderAffiliateCommissionEmail(
  userName: string,
  commissionAmount: string,
  payableCount: number
): Promise<string> {
  return render(
    React.createElement(AffiliateCommissionEmail as any, {
      userName,
      commissionAmount,
      eventType: 'Referral Sign-up',
      totalPayableBalance: commissionAmount,
      payableCount,
    })
  );
}

/**
 * Render Affiliate Payout Email
 */
export async function renderAffiliatePayoutEmail(
  userName: string,
  payoutAmount: string,
  transferId: string
): Promise<string> {
  return render(
    React.createElement(AffiliatePayoutEmail as any, {
      userName,
      payoutAmount,
      transferId,
      estimatedArrival: '1-3 business days',
      payoutMethod: 'Stripe Connect',
    })
  );
}

/**
 * Render Affiliate Fraud Alert Email
 */
export async function renderAffiliateFraudAlertEmail(
  userName: string,
  reason: string,
  appealUrl: string
): Promise<string> {
  return render(
    React.createElement(AffiliateFraudAlertEmail as any, {
      userName,
      reason,
      actionTaken: 'Your affiliate account has been temporarily suspended pending review',
      appealUrl,
    })
  );
}
