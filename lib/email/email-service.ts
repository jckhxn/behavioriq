/**
 * Email Service
 *
 * Handles sending assessment reports, license notifications, and system alerts
 * Supports both Resend (legacy) and AWS SES with budget tracking
 */

import { Resend } from "resend";
import { render } from "@react-email/render";
import {
  checkBudgetAvailable,
  logEmailSent,
} from "@/lib/services/email-budget-service";
import { SESEmailService } from "@/lib/email/ses-email-service";

// Initialize Resend lazily
let resend: Resend | null = null;

function getResendInstance(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    resend = new Resend(apiKey);
  }
  return resend;
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
}

export interface AssessmentReportEmail {
  recipientName: string;
  recipientEmail: string;
  assessmentTitle: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  completedDate: Date;
  reportPdf?: Buffer;
  summary: string;
}

export interface LicenseNotificationEmail {
  recipientName: string;
  recipientEmail: string;
  licenseType: string;
  expirationDate: Date;
  daysUntilExpiration: number;
  renewalUrl?: string;
}

export class EmailService {
  private static fromAddress =
    process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";

  /**
   * Send a generic email
   */
  static async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Use SES if enabled
    const useSES = process.env.USE_SES === "true";
    if (useSES) {
      console.log("[EmailService] Using AWS SES for email delivery");
      return SESEmailService.sendEmail(options);
    }

    // Fallback to Resend
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured, email sending disabled");
        return { success: false, error: "Email service not configured" };
      }

      // Check budget availability before sending
      try {
        await checkBudgetAvailable();
      } catch (budgetError) {
        const errorMessage =
          budgetError instanceof Error
            ? budgetError.message
            : "Budget check failed";
        console.error("Email budget check failed:", errorMessage);
        return { success: false, error: errorMessage };
      }

      const emailData: any = {
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
      };

      // Add content - prefer html, fallback to text
      if (options.html) {
        emailData.html = options.html;
      }
      if (options.text) {
        emailData.text = options.text;
      }

      // Add attachments if provided
      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments;
      }

      const result = await getResendInstance().emails.send(emailData);

      if (result.error) {
        console.error("Email sending error:", result.error);
        return { success: false, error: result.error.message };
      }

      // Log successful email send for budget tracking
      const emailCount = Array.isArray(options.to)
        ? options.to.length
        : 1;
      const recipient = Array.isArray(options.to)
        ? options.to[0]
        : options.to;

      // Determine email type from subject
      let emailType = "General";
      if (options.subject.includes("Assessment Report")) {
        emailType = "Assessment Report";
      } else if (options.subject.includes("License")) {
        emailType = "License Notification";
      } else if (options.subject.includes("Welcome")) {
        emailType = "Welcome Email";
      }

      await logEmailSent(emailCount, recipient, emailType);

      console.log("Email sent successfully:", result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send assessment report via email
   */
  static async sendAssessmentReport(
    data: AssessmentReportEmail
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Use SES if enabled
    const useSES = process.env.USE_SES === "true";
    if (useSES) {
      // Use SES-optimized format
      return SESEmailService.sendAssessmentReport({
        to: data.recipientEmail,
        userName: data.recipientName,
        assessmentName: data.assessmentTitle,
        assessmentId: "unknown", // Will be improved when assessmentId is passed
        pdfBuffer: data.reportPdf,
      });
    }

    // Fallback to Resend
    const subject = `Assessment Report: ${data.assessmentTitle}`;

    const html = this.generateAssessmentReportHTML(data);
    const text = this.generateAssessmentReportText(data);

    const attachments = data.reportPdf
      ? [
          {
            filename: `assessment-report-${Date.now()}.pdf`,
            content: data.reportPdf,
            contentType: "application/pdf",
          },
        ]
      : undefined;

    return await this.sendEmail({
      to: data.recipientEmail,
      subject,
      html,
      text,
      attachments,
    });
  }

  /**
   * Send license expiration notification
   */
  static async sendLicenseExpirationNotification(
    data: LicenseNotificationEmail
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Use SES if enabled
    const useSES = process.env.USE_SES === "true";
    if (useSES) {
      return SESEmailService.sendLicenseExpirationNotification({
        to: data.recipientEmail,
        userName: data.recipientName,
        licenseType: data.licenseType,
        expiryDate: data.expirationDate,
      });
    }

    // Fallback to Resend
    const subject = `License Expiration Notice - ${data.daysUntilExpiration} days remaining`;

    const html = this.generateLicenseNotificationHTML(data);
    const text = this.generateLicenseNotificationText(data);

    return await this.sendEmail({
      to: data.recipientEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Send welcome email with license information
   */
  static async sendWelcomeEmail(data: {
    recipientName: string;
    recipientEmail: string;
    licenseType: string;
    loginUrl: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = "Welcome to AI Diagnostic Platform";

    const html = this.generateWelcomeHTML(data);
    const text = this.generateWelcomeText(data);

    return await this.sendEmail({
      to: data.recipientEmail,
      subject,
      html,
      text,
    });
  }

  /**
   * Generate HTML for assessment report email
   */
  private static generateAssessmentReportHTML(
    data: AssessmentReportEmail
  ): string {
    const riskColors = {
      LOW: "#22c55e",
      MODERATE: "#eab308",
      HIGH: "#f97316",
      VERY_HIGH: "#ef4444",
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessment Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .risk-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: 600; font-size: 14px; margin: 10px 0; }
        .summary { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Assessment Report</h1>
            <p>Comprehensive Diagnostic Analysis</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            
            <p>Your assessment report for <strong>"${data.assessmentTitle}"</strong> is now ready.</p>
            
            <div style="margin: 20px 0;">
                <strong>Assessment Details:</strong><br>
                Completed: ${data.completedDate.toLocaleDateString()}<br>
                Risk Level: <span class="risk-badge" style="background-color: ${riskColors[data.riskLevel]}">${data.riskLevel}</span>
            </div>
            
            <div class="summary">
                <h3>Executive Summary</h3>
                <p>${data.summary}</p>
            </div>
            
            ${data.reportPdf ? "<p>📄 <strong>Detailed PDF report is attached to this email.</strong></p>" : ""}
            
            <p>If you have any questions about your assessment results, please don't hesitate to contact our support team.</p>
        </div>
        
        <div class="footer">
            <p>This report was generated by AI Diagnostic Platform<br>
            For support, contact us at support@yourdomain.com</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text version for assessment report email
   */
  private static generateAssessmentReportText(
    data: AssessmentReportEmail
  ): string {
    return `
Assessment Report - ${data.assessmentTitle}

Hello ${data.recipientName},

Your assessment report is now ready.

Assessment Details:
- Completed: ${data.completedDate.toLocaleDateString()}
- Risk Level: ${data.riskLevel}

Executive Summary:
${data.summary}

${data.reportPdf ? "A detailed PDF report is attached to this email." : ""}

If you have any questions about your assessment results, please contact our support team.

---
AI Diagnostic Platform
Support: support@yourdomain.com
`;
  }

  /**
   * Generate HTML for license notification email
   */
  private static generateLicenseNotificationHTML(
    data: LicenseNotificationEmail
  ): string {
    const urgencyColor = data.daysUntilExpiration <= 7 ? "#ef4444" : "#f97316";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>License Expiration Notice</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: ${urgencyColor}; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .warning { background: #fef3cd; border: 1px solid #feca57; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ License Expiration Notice</h1>
            <p>${data.daysUntilExpiration} days remaining</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            
            <div class="warning">
                <strong>Your ${data.licenseType} license will expire in ${data.daysUntilExpiration} days.</strong><br>
                Expiration Date: ${data.expirationDate.toLocaleDateString()}
            </div>
            
            <p>To avoid service interruption, please renew your license before the expiration date.</p>
            
            <h3>What happens when your license expires?</h3>
            <ul>
                <li>Access to assessment tools will be restricted</li>
                <li>PDF report generation will be disabled</li>
                <li>Advanced features will be unavailable</li>
            </ul>
            
            ${data.renewalUrl ? `<p style="text-align: center;"><a href="${data.renewalUrl}" class="btn">Renew License Now</a></p>` : ""}
            
            <p>If you have any questions about license renewal, please contact our sales team.</p>
        </div>
        
        <div class="footer">
            <p>AI Diagnostic Platform<br>
            Sales: sales@yourdomain.com | Support: support@yourdomain.com</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text version for license notification email
   */
  private static generateLicenseNotificationText(
    data: LicenseNotificationEmail
  ): string {
    return `
LICENSE EXPIRATION NOTICE

Hello ${data.recipientName},

Your ${data.licenseType} license will expire in ${data.daysUntilExpiration} days.
Expiration Date: ${data.expirationDate.toLocaleDateString()}

To avoid service interruption, please renew your license before the expiration date.

What happens when your license expires?
- Access to assessment tools will be restricted
- PDF report generation will be disabled  
- Advanced features will be unavailable

${data.renewalUrl ? `Renew your license: ${data.renewalUrl}` : ""}

For questions about license renewal, contact our sales team.

---
AI Diagnostic Platform
Sales: sales@yourdomain.com
Support: support@yourdomain.com
`;
  }

  /**
   * Generate HTML for welcome email
   */
  private static generateWelcomeHTML(data: {
    recipientName: string;
    licenseType: string;
    loginUrl: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AI Diagnostic Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .feature { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to AI Diagnostic Platform!</h1>
            <p>Your ${data.licenseType} license is now active</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.recipientName},</h2>
            
            <p>Welcome to the AI Diagnostic Platform! Your account has been set up with a <strong>${data.licenseType}</strong> license.</p>
            
            <h3>Getting Started</h3>
            <div class="feature">
                <strong>📋 Create Assessments</strong><br>
                Upload and process diagnostic assessments with AI-powered analysis
            </div>
            
            <div class="feature">
                <strong>📊 Generate Reports</strong><br>
                Create professional PDF reports with clinical recommendations
            </div>
            
            <div class="feature">
                <strong>🎯 Risk Assessment</strong><br>
                Get detailed risk analysis with actionable insights
            </div>
            
            <p style="text-align: center;">
                <a href="${data.loginUrl}" class="btn">Access Your Dashboard</a>
            </p>
            
            <p>If you need any assistance getting started, our support team is here to help!</p>
        </div>
        
        <div class="footer">
            <p>AI Diagnostic Platform<br>
            Support: support@yourdomain.com</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text version for welcome email
   */
  private static generateWelcomeText(data: {
    recipientName: string;
    licenseType: string;
    loginUrl: string;
  }): string {
    return `
Welcome to AI Diagnostic Platform!

Hello ${data.recipientName},

Welcome to the AI Diagnostic Platform! Your account has been set up with a ${data.licenseType} license.

Getting Started:
- Create Assessments: Upload and process diagnostic assessments with AI-powered analysis
- Generate Reports: Create professional PDF reports with clinical recommendations  
- Risk Assessment: Get detailed risk analysis with actionable insights

Access your dashboard: ${data.loginUrl}

If you need any assistance getting started, our support team is here to help!

---
AI Diagnostic Platform
Support: support@yourdomain.com
`;
  }
}
