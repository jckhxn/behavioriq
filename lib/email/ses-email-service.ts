/**
 * SES Email Service using AWS SDK v3
 *
 * Handles email sending via Amazon SES with budget tracking and rate limiting
 */

import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
import {
  renderAssessmentReportEmail,
  renderWelcomeEmail,
  renderLicenseNotificationEmail,
} from "./render-templates";
import {
  checkBudgetAvailable,
  logEmailSent,
} from "@/lib/services/email-budget-service";
import {
  EmailRateLimiter,
  type EmailType,
} from "@/lib/services/email-rate-limiter";
import type { Transporter, SendMailOptions } from "nodemailer";
import type { Options as SESOptions } from "nodemailer/lib/ses-transport";

// Lazy initialization for SES client
let sesClient: SESClient | null = null;
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const client = getSESClient();
    transporter = nodemailer.createTransport({
      SES: client,
      aws: { SendRawEmailCommand },
    } as any);
  }
  return transporter;
}

function getSESClient(): SESClient {
  if (!sesClient) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in environment variables."
      );
    }

    sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return sesClient;

  function getTransporter(): Transporter {
    if (!transporter) {
      const client = getSESClient();
      transporter = nodemailer.createTransport({
        SES: client,
        aws: { SendRawEmailCommand },
      } as any);
    }
    return transporter;
  }
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  // Rate limiting metadata
  userId?: string;
  emailType?: EmailType;
}

export interface AssessmentReportEmail {
  to: string;
  userName: string;
  assessmentName: string;
  assessmentId: string;
  pdfBuffer?: Buffer;
  userId?: string; // For rate limiting
}

export interface LicenseNotificationEmail {
  to: string;
  userName: string;
  licenseType: string;
  expiryDate: Date;
  userId?: string; // For rate limiting
}

export class SESEmailService {
  private static getFromAddress(): string {
    const fromEmail = process.env.SES_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error(
        "SES_FROM_EMAIL not configured. Set SES_FROM_EMAIL in environment variables to a verified email address."
      );
    }
    return fromEmail;
  }

  /**
   * Send a generic email with budget tracking and rate limiting
   */
  static async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { userId, emailType: providedEmailType, ...emailOptions } = options;
    const recipient = Array.isArray(options.to) ? options.to[0] : options.to;

    // Determine email type
    const emailType: EmailType =
      providedEmailType || this.inferEmailType(options.subject);

    try {
      // 1. Check global rate limit (platform-wide)
      const globalCheck = await EmailRateLimiter.checkGlobalLimit();
      if (!globalCheck.allowed) {
        console.error(
          `[SES] 🚫 Global rate limit exceeded: ${globalCheck.reason}`
        );
        await EmailRateLimiter.logEmail({
          userId,
          recipientEmail: recipient,
          emailType,
          subject: options.subject,
          status: "FAILED",
          errorMessage: globalCheck.reason,
        });
        return { success: false, error: globalCheck.reason };
      }

      // 2. Check per-user rate limit (if userId provided)
      if (userId) {
        const userCheck = await EmailRateLimiter.checkUserLimit(
          userId,
          emailType
        );
        if (!userCheck.allowed) {
          console.warn(
            `[SES] 🚫 User rate limit exceeded: ${userCheck.reason}`
          );
          await EmailRateLimiter.logEmail({
            userId,
            recipientEmail: recipient,
            emailType,
            subject: options.subject,
            status: "FAILED",
            errorMessage: userCheck.reason,
          });
          return { success: false, error: userCheck.reason };
        }
      }

      // 3. Check recipient rate limit
      const recipientCheck =
        await EmailRateLimiter.checkRecipientLimit(recipient);
      if (!recipientCheck.allowed) {
        console.warn(
          `[SES] 🚫 Recipient rate limit exceeded: ${recipientCheck.reason}`
        );
        await EmailRateLimiter.logEmail({
          userId,
          recipientEmail: recipient,
          emailType,
          subject: options.subject,
          status: "FAILED",
          errorMessage: recipientCheck.reason,
        });
        return { success: false, error: recipientCheck.reason };
      }

      // 4. Check budget availability before sending
      try {
        await checkBudgetAvailable();
      } catch (budgetError) {
        const errorMessage =
          budgetError instanceof Error
            ? budgetError.message
            : "Budget check failed";
        console.error("[SES] Budget check failed:", errorMessage);
        await EmailRateLimiter.logEmail({
          userId,
          recipientEmail: recipient,
          emailType,
          subject: options.subject,
          status: "FAILED",
          errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      // 5. Prepare and send email
      const mailOptions: SendMailOptions = {
        from: this.getFromAddress(),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments as any,
      };

      const result = await getTransporter().sendMail(mailOptions);

      // 6. Log successful send
      const emailCount = Array.isArray(options.to) ? options.to.length : 1;

      // Log for budget tracking
      await logEmailSent(emailCount, recipient, emailType);

      // Log for rate limiting
      await EmailRateLimiter.logEmail({
        userId,
        recipientEmail: recipient,
        emailType,
        subject: options.subject,
        status: "SENT",
        messageId: result.messageId,
      });

      console.log(
        `[SES] ✅ Email sent to ${recipient} - Type: ${emailType} - MessageId: ${result.messageId}`
      );
      return { success: true, messageId: result.messageId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[SES] ❌ Failed to send email to ${recipient}:`, error);

      // Log failed attempt
      await EmailRateLimiter.logEmail({
        userId,
        recipientEmail: recipient,
        emailType,
        subject: options.subject,
        status: "FAILED",
        errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Infer email type from subject line
   */
  private static inferEmailType(subject: string): EmailType {
    const lowerSubject = subject.toLowerCase();

    if (lowerSubject.includes("assessment report")) return "ASSESSMENT_REPORT";
    if (lowerSubject.includes("pdf") || lowerSubject.includes("report"))
      return "PDF_REPORT";
    if (lowerSubject.includes("license") && lowerSubject.includes("expir"))
      return "LICENSE_NOTIFICATION";
    if (lowerSubject.includes("license") && lowerSubject.includes("renew"))
      return "LICENSE_RENEWED";
    if (lowerSubject.includes("welcome")) return "WELCOME";
    if (lowerSubject.includes("password") || lowerSubject.includes("reset"))
      return "PASSWORD_RESET";
    if (lowerSubject.includes("magic link") || lowerSubject.includes("sign in"))
      return "MAGIC_LINK";
    if (lowerSubject.includes("verify") || lowerSubject.includes("confirm"))
      return "EMAIL_VERIFICATION";
    if (lowerSubject.includes("email") && lowerSubject.includes("change"))
      return "EMAIL_CHANGE";
    if (lowerSubject.includes("system")) return "SYSTEM";

    return "GENERIC";
  }

  /**
   * Send assessment report with PDF attachment
   */
  static async sendAssessmentReport(
    data: AssessmentReportEmail
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = await renderAssessmentReportEmail(
      data.userName,
      data.assessmentName,
      data.assessmentId
    );

    const attachments = data.pdfBuffer
      ? [
          {
            filename: `assessment-report-${data.assessmentId.slice(0, 8)}.pdf`,
            content: data.pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : undefined;

    return this.sendEmail({
      to: data.to,
      subject: `Your ${data.assessmentName} Assessment Report`,
      html,
      attachments,
      userId: data.userId,
      emailType: "ASSESSMENT_REPORT",
    });
  }

  /**
   * Send license expiration notification
   */
  static async sendLicenseExpirationNotification(
    data: LicenseNotificationEmail
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const daysUntilExpiry = Math.ceil(
      (new Date(data.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const html = await renderLicenseNotificationEmail(
      data.userName,
      data.licenseType,
      data.expiryDate,
      daysUntilExpiry
    );

    return this.sendEmail({
      to: data.to,
      subject: `Your ${data.licenseType} License Expires in ${daysUntilExpiry} Days`,
      html,
      userId: data.userId,
      emailType: "LICENSE_NOTIFICATION",
    });
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(data: {
    to: string;
    userName: string;
    userId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = await renderWelcomeEmail(data.userName);

    return this.sendEmail({
      to: data.to,
      subject: `Welcome to ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}!`,
      html,
      userId: data.userId,
      emailType: "WELCOME",
    });
  }
}
