/**
 * Email Template Service
 * Handles template rendering, variable injection, and email generation
 */

import { render } from '@react-email/render';
import { prisma } from '@/lib/db';
import type { EmailTemplateType } from '@prisma/client';

// Template component imports
import { AssessmentReportEmail } from '@/components/email/templates/AssessmentReportEmail';
import { LicenseNotificationEmail } from '@/components/email/templates/LicenseNotificationEmail';
import { LicenseRenewedEmail } from '@/components/email/templates/LicenseRenewedEmail';
import { WelcomeEmail } from '@/components/email/templates/WelcomeEmail';
import { PasswordResetEmail } from '@/components/email/templates/PasswordResetEmail';
import { MagicLinkEmail } from '@/components/email/templates/MagicLinkEmail';
import { EmailVerificationEmail } from '@/components/email/templates/EmailVerificationEmail';
import { EmailChangeEmail } from '@/components/email/templates/EmailChangeEmail';
import { AffiliateWelcomeEmail } from '@/components/email/templates/AffiliateWelcomeEmail';
import { AffiliateCommissionEmail } from '@/components/email/templates/AffiliateCommissionEmail';
import { AffiliatePayoutEmail } from '@/components/email/templates/AffiliatePayoutEmail';
import { AffiliateFraudAlertEmail } from '@/components/email/templates/AffiliateFraudAlertEmail';
import { SystemNotificationEmail } from '@/components/email/templates/SystemNotificationEmail';

export interface TemplateVariable {
  type: 'string' | 'number' | 'date' | 'boolean' | 'url';
  required: boolean;
  default?: any;
  description?: string;
}

export interface TemplateVariables {
  [key: string]: TemplateVariable;
}

export interface RenderTemplateOptions {
  templateId?: string;
  templateSlug?: string;
  templateType?: EmailTemplateType;
  variables: Record<string, any>;
}

export interface RenderedEmail {
  html: string;
  plainText: string;
  subject: string;
  preheader?: string;
}

/**
 * Template component registry
 * Maps template types to their React components
 */
const TEMPLATE_COMPONENTS = {
  ASSESSMENT_REPORT: AssessmentReportEmail,
  LICENSE_NOTIFICATION: LicenseNotificationEmail,
  LICENSE_RENEWED: LicenseRenewedEmail,
  WELCOME: WelcomeEmail,
  PASSWORD_RESET: PasswordResetEmail,
  MAGIC_LINK: MagicLinkEmail,
  EMAIL_VERIFICATION: EmailVerificationEmail,
  EMAIL_CHANGE: EmailChangeEmail,
  AFFILIATE_WELCOME: AffiliateWelcomeEmail,
  AFFILIATE_COMMISSION: AffiliateCommissionEmail,
  AFFILIATE_PAYOUT: AffiliatePayoutEmail,
  AFFILIATE_FRAUD_ALERT: AffiliateFraudAlertEmail,
  SYSTEM_NOTIFICATION: SystemNotificationEmail,
  GENERIC: SystemNotificationEmail, // Fallback to system notification
};

/**
 * Variable definitions for each template type
 */
export const TEMPLATE_VARIABLE_DEFINITIONS: Record<EmailTemplateType, TemplateVariables> = {
  ASSESSMENT_REPORT: {
    userName: { type: 'string', required: true, description: 'User full name' },
    assessmentName: { type: 'string', required: true, description: 'Assessment title' },
    assessmentId: { type: 'string', required: true, description: 'Assessment ID for links' },
    siteUrl: { type: 'url', required: false, default: process.env.NEXT_PUBLIC_SITE_URL },
    siteName: { type: 'string', required: false, default: process.env.NEXT_PUBLIC_SITE_NAME },
  },
  LICENSE_NOTIFICATION: {
    userName: { type: 'string', required: true },
    licenseType: { type: 'string', required: true },
    expiryDate: { type: 'date', required: true },
    daysUntilExpiry: { type: 'number', required: true },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  LICENSE_RENEWED: {
    userName: { type: 'string', required: true },
    licenseType: { type: 'string', required: true },
    newExpiryDate: { type: 'date', required: true },
    renewalAmount: { type: 'string', required: false },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  WELCOME: {
    userName: { type: 'string', required: true },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  PASSWORD_RESET: {
    userName: { type: 'string', required: true },
    resetUrl: { type: 'url', required: true },
    expiryMinutes: { type: 'number', required: false, default: 60 },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  MAGIC_LINK: {
    userName: { type: 'string', required: false },
    loginUrl: { type: 'url', required: true },
    expiryMinutes: { type: 'number', required: false, default: 15 },
    ipAddress: { type: 'string', required: false },
    userAgent: { type: 'string', required: false },
    siteName: { type: 'string', required: false },
  },
  EMAIL_VERIFICATION: {
    userName: { type: 'string', required: true },
    verificationUrl: { type: 'url', required: true },
    expiryHours: { type: 'number', required: false, default: 24 },
    siteName: { type: 'string', required: false },
  },
  EMAIL_CHANGE: {
    userName: { type: 'string', required: true },
    newEmail: { type: 'string', required: true },
    confirmationUrl: { type: 'url', required: true },
    expiryHours: { type: 'number', required: false, default: 24 },
    siteName: { type: 'string', required: false },
  },
  AFFILIATE_WELCOME: {
    userName: { type: 'string', required: true },
    referralCode: { type: 'string', required: true },
    referralLink: { type: 'url', required: true },
    commissionRate: { type: 'string', required: false, default: '$20' },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  AFFILIATE_COMMISSION: {
    userName: { type: 'string', required: true },
    commissionAmount: { type: 'string', required: true },
    referredUserName: { type: 'string', required: false },
    eventType: { type: 'string', required: true },
    totalPayableBalance: { type: 'string', required: true },
    payableCount: { type: 'number', required: true },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  AFFILIATE_PAYOUT: {
    userName: { type: 'string', required: true },
    payoutAmount: { type: 'string', required: true },
    transferId: { type: 'string', required: true },
    estimatedArrival: { type: 'string', required: false, default: '1-3 business days' },
    payoutMethod: { type: 'string', required: false, default: 'Stripe Connect' },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  AFFILIATE_FRAUD_ALERT: {
    userName: { type: 'string', required: true },
    reason: { type: 'string', required: true },
    actionTaken: { type: 'string', required: true },
    appealUrl: { type: 'url', required: false },
    contactEmail: { type: 'string', required: false, default: 'support@behavioriq.com' },
    siteUrl: { type: 'url', required: false },
    siteName: { type: 'string', required: false },
  },
  SYSTEM_NOTIFICATION: {
    userName: { type: 'string', required: false },
    title: { type: 'string', required: true },
    message: { type: 'string', required: true },
    actionUrl: { type: 'url', required: false },
    actionLabel: { type: 'string', required: false },
    priority: { type: 'string', required: false, default: 'medium' },
    siteName: { type: 'string', required: false },
  },
  GENERIC: {
    userName: { type: 'string', required: false },
    title: { type: 'string', required: true },
    message: { type: 'string', required: true },
    siteName: { type: 'string', required: false },
  },
};

/**
 * Validate template variables against requirements
 */
export function validateVariables(
  templateType: EmailTemplateType,
  variables: Record<string, any>
): { valid: boolean; errors: string[] } {
  const definition = TEMPLATE_VARIABLE_DEFINITIONS[templateType];
  const errors: string[] = [];

  // Check required variables
  for (const [varName, varDef] of Object.entries(definition)) {
    if (varDef.required && (variables[varName] === undefined || variables[varName] === null)) {
      errors.push(`Required variable '${varName}' is missing`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply default values to variables
 */
export function applyDefaults(
  templateType: EmailTemplateType,
  variables: Record<string, any>
): Record<string, any> {
  const definition = TEMPLATE_VARIABLE_DEFINITIONS[templateType];
  const result = { ...variables };

  for (const [varName, varDef] of Object.entries(definition)) {
    if (result[varName] === undefined && varDef.default !== undefined) {
      result[varName] = varDef.default;
    }
  }

  return result;
}

/**
 * Render a template using React Email components
 */
export async function renderTemplate(options: RenderTemplateOptions): Promise<RenderedEmail> {
  let template;

  // Fetch template from database
  if (options.templateId) {
    template = await prisma.emailTemplate.findUnique({
      where: { id: options.templateId, isActive: true },
    });
  } else if (options.templateSlug) {
    template = await prisma.emailTemplate.findUnique({
      where: { slug: options.templateSlug, isActive: true },
    });
  } else if (options.templateType) {
    template = await prisma.emailTemplate.findFirst({
      where: { type: options.templateType, isActive: true },
      orderBy: { version: 'desc' },
    });
  }

  if (!template) {
    throw new Error('Template not found or inactive');
  }

  // Validate and apply defaults
  const validation = validateVariables(template.type, options.variables);
  if (!validation.valid) {
    throw new Error(`Variable validation failed: ${validation.errors.join(', ')}`);
  }

  const variables = applyDefaults(template.type, options.variables);

  // Get the React component for this template type
  const TemplateComponent = TEMPLATE_COMPONENTS[template.type];
  if (!TemplateComponent) {
    throw new Error(`No component registered for template type: ${template.type}`);
  }

  // Render HTML
  const html = render(TemplateComponent(variables as any), {
    pretty: false,
  });

  // Render plain text
  const plainText = render(TemplateComponent(variables as any), {
    plainText: true,
  });

  // Inject variables into subject
  let subject = template.subject;
  for (const [key, value] of Object.entries(variables)) {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }

  return {
    html,
    plainText,
    subject,
    preheader: template.preheader || undefined,
  };
}

/**
 * Render a custom HTML template with variable injection
 */
export function renderCustomTemplate(
  html: string,
  variables: Record<string, any>
): string {
  let result = html;

  // Replace {{variableName}} with actual values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Extract variable names from template HTML
 */
export function extractVariables(html: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = html.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Get template by type (latest version)
 */
export async function getTemplateByType(type: EmailTemplateType) {
  return prisma.emailTemplate.findFirst({
    where: {
      type,
      isActive: true,
    },
    orderBy: {
      version: 'desc',
    },
  });
}

/**
 * Create a new template version
 */
export async function createTemplateVersion(
  templateId: string,
  userId: string,
  changeDescription?: string
) {
  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Increment version
  const newVersion = template.version + 1;

  // Create version history record
  await prisma.emailTemplateVersion.create({
    data: {
      templateId,
      version: template.version,
      name: template.name,
      subject: template.subject,
      preheader: template.preheader,
      html: template.html,
      plainText: template.plainText,
      variables: template.variables,
      metadata: template.metadata,
      changeDescription,
      createdById: userId,
    },
  });

  // Update template version
  await prisma.emailTemplate.update({
    where: { id: templateId },
    data: { version: newVersion },
  });

  return newVersion;
}

/**
 * Restore a template from version history
 */
export async function restoreTemplateVersion(
  templateId: string,
  versionNumber: number,
  userId: string
) {
  const version = await prisma.emailTemplateVersion.findUnique({
    where: {
      templateId_version: {
        templateId,
        version: versionNumber,
      },
    },
  });

  if (!version) {
    throw new Error('Version not found');
  }

  // Create a new version history entry for current state
  await createTemplateVersion(templateId, userId, `Restored from version ${versionNumber}`);

  // Update template with version data
  await prisma.emailTemplate.update({
    where: { id: templateId },
    data: {
      subject: version.subject,
      preheader: version.preheader,
      html: version.html,
      plainText: version.plainText,
      variables: version.variables,
      metadata: version.metadata,
    },
  });
}
