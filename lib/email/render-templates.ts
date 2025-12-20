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
import { AssessmentCompleteEmail } from '@/components/email/templates/AssessmentCompleteEmail';
import { NewRecommendationEmail } from '@/components/email/templates/NewRecommendationEmail';
import { SecurityAlertEmail } from '@/components/email/templates/SecurityAlertEmail';
import { AccountUpdateEmail } from '@/components/email/templates/AccountUpdateEmail';
import { PaymentFailedEmail } from '@/components/email/templates/PaymentFailedEmail';
import { SubscriptionCancelledEmail } from '@/components/email/templates/SubscriptionCancelledEmail';
import { AdminDigestEmail } from '@/components/email/templates/AdminDigestEmail';

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

/**
 * Render Assessment Complete Email
 */
export async function renderAssessmentCompleteEmail(
  userName: string,
  assessmentName: string,
  assessmentId: string,
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
): Promise<string> {
  return render(
    React.createElement(AssessmentCompleteEmail as any, {
      userName,
      assessmentName,
      assessmentId,
      riskLevel,
      completedDate: new Date(),
    })
  );
}

/**
 * Render New Recommendation Email
 */
export async function renderNewRecommendationEmail(
  userName: string,
  assessmentName: string,
  assessmentId: string,
  recommendationCount?: number,
  topDomain?: string
): Promise<string> {
  return render(
    React.createElement(NewRecommendationEmail as any, {
      userName,
      assessmentName,
      assessmentId,
      recommendationCount: recommendationCount || 1,
      topDomain: topDomain || 'Behavioral Health',
    })
  );
}

/**
 * Render Security Alert Email
 */
export async function renderSecurityAlertEmail(
  userName: string,
  alertType: 'login' | 'password_change' | 'mfa_enabled' | 'suspicious_activity' | 'api_key_created',
  details: string,
  location?: string,
  actionUrl?: string
): Promise<string> {
  return render(
    React.createElement(SecurityAlertEmail as any, {
      userName,
      alertType,
      details,
      location,
      actionUrl,
      timestamp: new Date(),
    })
  );
}

/**
 * Render Account Update Email
 */
export async function renderAccountUpdateEmail(
  userName: string,
  updateType: 'profile_updated' | 'preferences_changed' | 'settings_modified' | 'subscription_changed',
  changes: string[],
  actionUrl?: string
): Promise<string> {
  return render(
    React.createElement(AccountUpdateEmail as any, {
      userName,
      updateType,
      changes,
      actionUrl,
      timestamp: new Date(),
    })
  );
}

/**
 * Render Payment Failed Email
 */
export async function renderPaymentFailedEmail(
  userName: string,
  productName: string,
  amount: string,
  failureReason: string,
  retryUrl?: string
): Promise<string> {
  return render(
    React.createElement(PaymentFailedEmail as any, {
      userName,
      productName,
      amount,
      failureReason,
      retryUrl,
      timestamp: new Date(),
    })
  );
}

/**
 * Render Subscription Cancelled Email
 */
export async function renderSubscriptionCancelledEmail(
  userName: string,
  planName: string,
  finalAccessDate?: Date,
  cancellationReason?: string
): Promise<string> {
  return render(
    React.createElement(SubscriptionCancelledEmail as any, {
      userName,
      planName,
      cancellationDate: new Date(),
      finalAccessDate,
      cancellationReason,
    })
  );
}

/**
 * Render Admin Digest Email
 */
export async function renderAdminDigestEmail(
  adminName: string,
  period?: 'daily' | 'weekly',
  stats?: Record<string, any>,
  alerts?: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'error' }>
): Promise<string> {
  return render(
    React.createElement(AdminDigestEmail as any, {
      adminName,
      period: period || 'daily',
      stats: stats || {},
      alerts: alerts || [],
    })
  );
}
