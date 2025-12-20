/**
 * Email Configuration Registry
 *
 * Centralized configuration for all email types in the application
 * This provides a single source of truth for email subjects, preview text, and categories
 */

export type EmailType =
  // Authentication & Security
  | 'welcome'
  | 'magic_link'
  | 'password_reset'
  | 'email_verification'
  | 'email_change'
  | 'security_alert'
  | 'account_update'

  // Assessments
  | 'assessment_complete'
  | 'new_recommendation'
  | 'assessment_report'
  | 'assessment_shared'

  // Licensing & Billing
  | 'license_expiration'
  | 'license_renewed'
  | 'payment_failed'
  | 'subscription_cancelled'

  // Admin
  | 'admin_digest'
  | 'system_notification'

  // Affiliate
  | 'affiliate_welcome'
  | 'affiliate_commission'
  | 'affiliate_payout'
  | 'affiliate_fraud_alert';

export interface EmailConfig {
  type: EmailType;
  category: 'auth' | 'assessment' | 'billing' | 'admin' | 'affiliate' | 'system';
  subject: string;
  preheader: string;
  description: string;
  priority: 'high' | 'normal' | 'low';
  transactional: boolean; // Whether to send regardless of user preferences
}

/**
 * Complete email configuration registry
 */
export const EMAIL_CONFIG: Record<EmailType, EmailConfig> = {
  // ===== Authentication & Security =====
  welcome: {
    type: 'welcome',
    category: 'auth',
    subject: 'Welcome to AI Diagnostic',
    preheader: 'Get started with behavioral health assessments',
    description: 'Sent to new users after sign-up',
    priority: 'high',
    transactional: true,
  },
  magic_link: {
    type: 'magic_link',
    category: 'auth',
    subject: 'Your Magic Link - Sign In to AI Diagnostic',
    preheader: 'Click to sign in securely',
    description: 'Passwordless login link',
    priority: 'high',
    transactional: true,
  },
  password_reset: {
    type: 'password_reset',
    category: 'auth',
    subject: 'Reset Your Password',
    preheader: 'Click to reset your password',
    description: 'Password reset request',
    priority: 'high',
    transactional: true,
  },
  email_verification: {
    type: 'email_verification',
    category: 'auth',
    subject: 'Verify Your Email Address',
    preheader: 'Confirm your email to get started',
    description: 'Email verification link',
    priority: 'high',
    transactional: true,
  },
  email_change: {
    type: 'email_change',
    category: 'auth',
    subject: 'Confirm Your Email Change',
    preheader: 'Verify your new email address',
    description: 'Email address change confirmation',
    priority: 'high',
    transactional: true,
  },
  security_alert: {
    type: 'security_alert',
    category: 'auth',
    subject: 'Security Alert on Your Account',
    preheader: 'Review account activity',
    description: 'Login, password change, or suspicious activity alerts',
    priority: 'high',
    transactional: true,
  },
  account_update: {
    type: 'account_update',
    category: 'auth',
    subject: 'Your Account Has Been Updated',
    preheader: 'Review the changes made',
    description: 'Profile, preferences, or settings modifications',
    priority: 'normal',
    transactional: true,
  },

  // ===== Assessments =====
  assessment_complete: {
    type: 'assessment_complete',
    category: 'assessment',
    subject: 'Your Assessment is Complete',
    preheader: 'Review your results and recommendations',
    description: 'Sent when an assessment is completed',
    priority: 'high',
    transactional: false,
  },
  new_recommendation: {
    type: 'new_recommendation',
    category: 'assessment',
    subject: 'New AI Recommendations Available',
    preheader: 'Review AI-generated recommendations',
    description: 'Sent when new recommendations are generated',
    priority: 'normal',
    transactional: false,
  },
  assessment_report: {
    type: 'assessment_report',
    category: 'assessment',
    subject: 'Your Assessment Report',
    preheader: 'Your PDF report is ready',
    description: 'Full assessment report with PDF attachment',
    priority: 'high',
    transactional: false,
  },
  assessment_shared: {
    type: 'assessment_shared',
    category: 'assessment',
    subject: 'An Assessment Has Been Shared With You',
    preheader: 'View the shared assessment',
    description: 'Notification that an assessment was shared',
    priority: 'normal',
    transactional: false,
  },

  // ===== Licensing & Billing =====
  license_expiration: {
    type: 'license_expiration',
    category: 'billing',
    subject: 'Your License is Expiring Soon',
    preheader: 'Renew your license to continue',
    description: 'License expiration warning',
    priority: 'high',
    transactional: true,
  },
  license_renewed: {
    type: 'license_renewed',
    category: 'billing',
    subject: 'Your License Has Been Renewed',
    preheader: 'Your subscription is active',
    description: 'License renewal confirmation',
    priority: 'normal',
    transactional: true,
  },
  payment_failed: {
    type: 'payment_failed',
    category: 'billing',
    subject: 'Payment Failed - Action Required',
    preheader: 'Update your payment method',
    description: 'Payment processing failure notification',
    priority: 'high',
    transactional: true,
  },
  subscription_cancelled: {
    type: 'subscription_cancelled',
    category: 'billing',
    subject: 'Your Subscription Has Been Cancelled',
    preheader: 'Your subscription details',
    description: 'Subscription cancellation confirmation',
    priority: 'normal',
    transactional: true,
  },

  // ===== Admin =====
  admin_digest: {
    type: 'admin_digest',
    category: 'admin',
    subject: 'Admin Daily Digest',
    preheader: 'Your daily platform summary',
    description: 'Daily or weekly admin dashboard summary',
    priority: 'normal',
    transactional: true,
  },
  system_notification: {
    type: 'system_notification',
    category: 'system',
    subject: 'System Notification',
    preheader: 'Important system message',
    description: 'System-wide notifications and alerts',
    priority: 'high',
    transactional: true,
  },

  // ===== Affiliate Program =====
  affiliate_welcome: {
    type: 'affiliate_welcome',
    category: 'affiliate',
    subject: 'Welcome to Our Affiliate Program',
    preheader: 'Start earning commissions',
    description: 'Affiliate program onboarding',
    priority: 'high',
    transactional: true,
  },
  affiliate_commission: {
    type: 'affiliate_commission',
    category: 'affiliate',
    subject: 'Commission Earned',
    preheader: 'You\'ve earned a commission',
    description: 'Commission earned notification',
    priority: 'normal',
    transactional: true,
  },
  affiliate_payout: {
    type: 'affiliate_payout',
    category: 'affiliate',
    subject: 'Payout Sent',
    preheader: 'Your payout has been processed',
    description: 'Payout confirmation',
    priority: 'normal',
    transactional: true,
  },
  affiliate_fraud_alert: {
    type: 'affiliate_fraud_alert',
    category: 'affiliate',
    subject: 'Account Suspension Notice',
    preheader: 'Action required on your account',
    description: 'Fraud alert and account suspension',
    priority: 'high',
    transactional: true,
  },
};

/**
 * Get email configuration by type
 */
export function getEmailConfig(type: EmailType): EmailConfig {
  const config = EMAIL_CONFIG[type];
  if (!config) {
    throw new Error(`Unknown email type: ${type}`);
  }
  return config;
}

/**
 * Get all emails in a category
 */
export function getEmailsByCategory(category: EmailConfig['category']): EmailConfig[] {
  return Object.values(EMAIL_CONFIG).filter(config => config.category === category);
}

/**
 * Get all transactional emails (sent regardless of preferences)
 */
export function getTransactionalEmails(): EmailConfig[] {
  return Object.values(EMAIL_CONFIG).filter(config => config.transactional);
}

/**
 * Get all marketing emails (respects user preferences)
 */
export function getMarketingEmails(): EmailConfig[] {
  return Object.values(EMAIL_CONFIG).filter(config => !config.transactional);
}

/**
 * Verify email exists in configuration
 */
export function isValidEmailType(type: string): type is EmailType {
  return type in EMAIL_CONFIG;
}
