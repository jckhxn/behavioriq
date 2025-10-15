/**
 * SES Email Service using AWS SDK v3
 *
 * Handles email sending via Amazon SES with budget tracking and rate limiting
 */

import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
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
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .content { padding: 40px 30px; background: #ffffff; }
      .content h2 { color: #333; font-size: 20px; margin-top: 0; }
      .content ul { padding-left: 20px; }
      .content li { margin-bottom: 10px; color: #555; }
      .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; background: #f8fafc; }
      .highlight { background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>📊 Your Assessment Report is Ready!</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.userName},</h2>
        <p>Your <strong>${data.assessmentName}</strong> assessment report has been generated and is attached to this email as a PDF.</p>

        <div class="highlight">
          <p style="margin: 0;"><strong>📄 Report Contents:</strong></p>
        </div>

        <ul>
          <li>Comprehensive behavioral analysis across all domains</li>
          <li>AI-generated personalized recommendations</li>
          <li>Visual score representations and risk assessments</li>
          <li>Actionable next steps for development</li>
        </ul>

        <p>You can also view your assessment online anytime from your dashboard.</p>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/assessment/${data.assessmentId}" class="button">View Assessment Online</a>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you have any questions about your assessment results, please don't hesitate to contact our support team.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}. All rights reserved.</p>
        <p style="margin-top: 10px;">This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  </body>
</html>
    `;

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

    const urgencyColor = daysUntilExpiry <= 7 ? "#ef4444" : "#f97316";

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; }
      .header { background: ${urgencyColor}; color: white; padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .content { padding: 40px 30px; background: #ffffff; }
      .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; }
      .button { display: inline-block; padding: 14px 28px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; background: #f8fafc; }
      ul { padding-left: 20px; }
      li { margin-bottom: 8px; color: #555; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⚠️ License Expiration Notice</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${daysUntilExpiry} days remaining</p>
      </div>
      <div class="content">
        <h2>Hi ${data.userName},</h2>

        <div class="warning">
          <p style="margin: 0;"><strong>Your ${data.licenseType} license will expire in ${daysUntilExpiry} days.</strong></p>
          <p style="margin: 10px 0 0 0;">Expiration Date: ${new Date(data.expiryDate).toLocaleDateString()}</p>
        </div>

        <p>To avoid service interruption and continue accessing your assessments, please renew your license before the expiration date.</p>

        <h3>What happens when your license expires?</h3>
        <ul>
          <li>Access to assessment tools will be restricted</li>
          <li>PDF report generation will be disabled</li>
          <li>AI-generated recommendations will be unavailable</li>
          <li>Historical assessment data will be preserved</li>
        </ul>

        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?action=renew" class="button">Renew License Now</a>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you have any questions about license renewal, please contact our support team.
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;

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
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; background: white; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .content { padding: 40px 30px; background: #ffffff; }
      .feature { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
      .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; background: #f8fafc; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Welcome to ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}!</h1>
      </div>
      <div class="content">
        <h2>Hi ${data.userName},</h2>
        <p>Welcome aboard! We're excited to help you gain valuable insights into behavioral patterns and development.</p>

        <h3>Get Started:</h3>

        <div class="feature">
          <strong>📋 Create Assessments</strong>
          <p style="margin: 8px 0 0 0; color: #555;">Conduct comprehensive behavioral assessments with our intuitive question flow.</p>
        </div>

        <div class="feature">
          <strong>🤖 AI-Powered Analysis</strong>
          <p style="margin: 8px 0 0 0; color: #555;">Get personalized, AI-generated recommendations based on assessment results.</p>
        </div>

        <div class="feature">
          <strong>📊 Professional Reports</strong>
          <p style="margin: 8px 0 0 0; color: #555;">Download beautifully designed PDF reports with visual score representations.</p>
        </div>

        <p style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard" class="button">Go to Dashboard</a>
        </p>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you need any assistance getting started, our support team is here to help!
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;

    return this.sendEmail({
      to: data.to,
      subject: `Welcome to ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"}!`,
      html,
      userId: data.userId,
      emailType: "WELCOME",
    });
  }
}
