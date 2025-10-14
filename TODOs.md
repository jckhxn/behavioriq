# 🚀 AI Diagnostic - Prioritized TODO List

**Last Updated**: October 8, 2025
**MVP Launch Target**: 2 weeks
**Status**: 95% Ready for Launch ✨

# # Additional stuff in /PRICING_MATRIX.MD

# # Costs

2.5 cents per regular assessment report.
1.7. conversational assessment (94 questions)
$1 per 10k emails (SES)

---

## Bugs Track

- [] Two assessments are created every time one is started.
- [] Cleanup all the damn console.logs

## Features

- [] AI Recommendation read out could be prettier (use custom components?)
- [] Update UI to reflect pricing changes (IDs alreadu generated)
- [] Verify Convo Assessment Flow (A->Results Page->Generate AI Report?)
- [] Add trial taking, full assessment taking as a ChatGPT App (https://chatgpt.com/c/68e861c5-9f8c-8320-9d58-94114bc55ab8)
- - chatgpt app example https://vercel.com/templates/next.js/chatgpt-app-with-next-js
- [] Make it an iOS/iPad app
- [] Command Menu on Dash (https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/command-menu.tsx)
- [] Global max limit for both reports and convos (convos always bc I dont want to spend crazy)
- [] Districts can configure PDF Branding & Email settings
- [] Super Admin can set global defaults for PDF Branding Email settings
  - - [PDF Style, https ://v0.app/chat/behavior-assessment-report-hUefj467caB]
- [] Amazon SES / Supabase config.
- [] Sort out email notiification options on dashboard.
- [] Sentry and Analytics.

---

## 📧 Amazon SES Email Engine Implementation

**Timeline**: 7 days | **Cost**: $1-2/month (vs Resend $20/month) | **Priority**: High

### Overview

Replace Resend with Amazon SES for all email delivery. Includes Supabase Auth integration (magic links, password resets), user notifications, PDF attachments, and comprehensive cost controls.

### Expected Usage

- **Estimated**: 5,000 emails/month
- **SES Free Tier**: 62,000 emails/month (first year with AWS)
- **Daily Limit**: 10,000 emails/day
- **Cost**: $0.10 per 1,000 emails after free tier

---

### Phase 1: AWS SES Setup & Cost Controls (Day 1)

**Time**: 2-3 hours

#### AWS SES Configuration

- [ ] **Verify Domain in SES** (30 min)
  - Go to AWS SES Console → Verified Identities → Create Identity
  - Choose "Domain" and enter your domain (e.g., `yourdomain.com`)
  - Add DNS records (DKIM, SPF, DMARC) to your DNS provider
  - Wait for verification (can take up to 72 hours, usually 15-30 min)
  - Set up default configuration set for tracking

- [ ] **Request Production Access** (Form submission - AWS reviews in 24-48hrs)
  - By default, SES is in sandbox mode (can only send to verified emails)
  - Go to SES Console → Account Dashboard → Request production access
  - Fill out form:
    - Use case: "Transactional emails for SaaS application (user notifications, password resets, assessment reports)"
    - Expected volume: "5,000 emails/month"
    - Compliance: "Double opt-in for marketing, transactional only"
  - AWS typically approves within 24 hours

- [ ] **Generate SMTP Credentials** (5 min)
  - Go to SES Console → SMTP Settings → Create SMTP Credentials
  - Download credentials (username & password)
  - Note the SMTP endpoint (e.g., `email-smtp.us-east-1.amazonaws.com`)
  - **IMPORTANT**: Store credentials in password manager immediately

#### Cost Control Setup

- [ ] **Set Up AWS Budgets** (15 min)

  ```
  Budget Name: "SES Email Budget"
  Budget Amount: $50/month (safety threshold)
  Alert at: 50%, 80%, 100%
  Email notifications to: your-admin@email.com

  Secondary Budget: "Critical SES Limit"
  Budget Amount: $100/month (hard stop)
  Alert at: 100%
  Actions: Send SNS notification + Email
  ```

- [ ] **Configure CloudWatch Alarms** (20 min)
  - **Daily Send Quota Alarm**:
    ```
    Metric: SES > Sent
    Threshold: > 8,000 emails/day (80% of 10k limit)
    Action: SNS notification
    ```
  - **Bounce Rate Alarm**:
    ```
    Metric: SES > Reputation.BounceRate
    Threshold: > 5%
    Action: SNS notification (indicates email list issues)
    ```
  - **Complaint Rate Alarm**:
    ```
    Metric: SES > Reputation.ComplaintRate
    Threshold: > 0.1%
    Action: SNS notification (indicates spam issues)
    ```

- [ ] **Create IAM User for SES** (10 min)

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["ses:SendEmail", "ses:SendRawEmail"],
        "Resource": "*"
      }
    ]
  }
  ```

  - Create IAM user: `ses-email-sender`
  - Attach policy above
  - Generate access keys
  - Store in `.env.local`

---

### Phase 2: Code Implementation (Day 2-3)

**Time**: 4-6 hours

#### Install Dependencies

- [ ] **Update package.json** (2 min)
  ```bash
  npm install @aws-sdk/client-ses nodemailer
  npm install --save-dev @types/nodemailer
  npm uninstall resend  # Remove unused Resend dependency
  ```

#### Create SES Email Service

- [ ] **Create `lib/email/ses-email-service.ts`** (2-3 hours)

  ```typescript
  import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
  import nodemailer from "nodemailer";
  import {
    EmailOptions,
    AssessmentReportEmail,
    LicenseNotificationEmail,
  } from "./types";

  // Initialize SES client
  const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Create Nodemailer transporter using SES
  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } },
  });

  export class SESEmailService {
    private static fromAddress =
      process.env.SES_FROM_EMAIL || "noreply@yourdomain.com";

    /**
     * Send a basic email
     */
    static async sendEmail(options: EmailOptions) {
      try {
        const result = await transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          attachments: options.attachments,
        });

        console.log(
          `[SES] ✅ Email sent to ${options.to} - MessageId: ${result.messageId}`
        );
        return { success: true, messageId: result.messageId };
      } catch (error) {
        console.error(`[SES] ❌ Failed to send email to ${options.to}:`, error);
        throw error;
      }
    }

    /**
     * Send assessment report with PDF attachment
     */
    static async sendAssessmentReport(data: AssessmentReportEmail) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Assessment Report is Ready!</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.userName},</h2>
                <p>Your <strong>${data.assessmentName}</strong> assessment report has been generated and is attached to this email.</p>
                <p>This comprehensive report includes:</p>
                <ul>
                  <li>Detailed behavioral analysis across all domains</li>
                  <li>Personalized recommendations</li>
                  <li>Visual score representations</li>
                  <li>Actionable next steps</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/assessment/${data.assessmentId}" class="button">View Assessment Online</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} AI Diagnostic. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      return this.sendEmail({
        to: data.to,
        subject: `Your ${data.assessmentName} Assessment Report`,
        html,
        attachments: data.pdfBuffer
          ? [
              {
                filename: `assessment-report-${data.assessmentId.slice(0, 8)}.pdf`,
                content: data.pdfBuffer,
              },
            ]
          : undefined,
      });
    }

    /**
     * Send license expiration notification
     */
    static async sendLicenseExpirationNotification(
      data: LicenseNotificationEmail
    ) {
      const daysUntilExpiry = Math.ceil(
        (new Date(data.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; }
              .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="warning">
                <h2>⚠️ License Expiring Soon</h2>
                <p>Hi ${data.userName},</p>
                <p>Your <strong>${data.licenseType}</strong> license will expire in <strong>${daysUntilExpiry} days</strong> on ${new Date(data.expiryDate).toLocaleDateString()}.</p>
                <p>Renew now to continue accessing your assessments and reports.</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?action=renew" class="button">Renew License</a>
              </div>
            </div>
          </body>
        </html>
      `;

      return this.sendEmail({
        to: data.to,
        subject: `Your ${data.licenseType} License Expires in ${daysUntilExpiry} Days`,
        html,
      });
    }

    /**
     * Send welcome email
     */
    static async sendWelcomeEmail(data: { to: string; userName: string }) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to AI Diagnostic!</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.userName},</h2>
                <p>Thank you for joining AI Diagnostic! We're excited to help you gain insights into behavioral patterns and development.</p>
                <p><strong>Get started:</strong></p>
                <ul>
                  <li>Take your first assessment</li>
                  <li>Explore AI-generated recommendations</li>
                  <li>Download comprehensive PDF reports</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
            </div>
          </body>
        </html>
      `;

      return this.sendEmail({
        to: data.to,
        subject: "Welcome to AI Diagnostic!",
        html,
      });
    }
  }
  ```

- [ ] **Update `lib/email/email-service.ts`** (1 hour)
  - Replace Resend implementation with SES
  - Import and use `SESEmailService`
  - Maintain backward compatibility with existing method signatures
  - Add feature flag for gradual rollout:
    ```typescript
    const USE_SES = process.env.USE_SES === "true";
    ```

- [ ] **Update `lib/email/send-pdf.ts`** (30 min)
  - Replace Resend with SES
  - Test PDF attachment handling

  ```typescript
  import { SESEmailService } from "./ses-email-service";

  export async function sendAssessmentPDFEmail(params: SendPDFEmailParams) {
    const pdfBuffer = await generateAssessmentPDF(params.assessmentId);

    return SESEmailService.sendAssessmentReport({
      to: params.to,
      userName: params.userName,
      assessmentName: "BehaviorIQ Assessment",
      assessmentId: params.assessmentId,
      pdfBuffer,
    });
  }
  ```

- [ ] **Remove Resend references** (30 min)
  - Delete all `import { Resend }` statements
  - Remove `RESEND_API_KEY` environment variable references
  - Update any error messages referencing Resend

#### Testing

- [ ] **Create test script `scripts/test-ses-email.ts`** (30 min)

  ```typescript
  import { SESEmailService } from "@/lib/email/ses-email-service";

  async function testSES() {
    console.log("Testing SES email service...");

    // Test 1: Basic email
    await SESEmailService.sendEmail({
      to: "your-test-email@example.com",
      subject: "SES Test Email",
      html: "<h1>Hello from SES!</h1><p>This is a test email.</p>",
    });

    console.log("✅ Test complete! Check your inbox.");
  }

  testSES();
  ```

  - Run: `npx tsx scripts/test-ses-email.ts`

---

### 🧪 Development Testing Guide

**IMPORTANT**: Test thoroughly in development before deploying to production.

#### SES Sandbox Mode Testing

By default, AWS SES starts in **sandbox mode** which means:

- ✅ You can send emails, but only to verified email addresses
- ✅ Perfect for development and testing
- ✅ No cost implications for testing
- ❌ Cannot send to unverified addresses until production access is granted

#### Setup for Local Testing

- [ ] **Verify Test Email Addresses** (5 min)

  ```
  1. Go to AWS SES Console → Verified Identities
  2. Click "Create Identity" → Choose "Email address"
  3. Enter your test email (e.g., your@email.com)
  4. Check your inbox and click verification link
  5. Repeat for 2-3 test emails
  ```

- [ ] **Configure Local Environment** (2 min)

  ```bash
  # .env.local
  AWS_REGION="us-east-1"
  AWS_ACCESS_KEY_ID="AKIA..."  # From IAM user
  AWS_SECRET_ACCESS_KEY="..."   # From IAM user
  SES_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified in SES
  USE_SES="true"

  # For testing, verify the FROM email too!
  ```

#### Testing Checklist

- [ ] **Test 1: Basic Email** (5 min)

  ```bash
  npx tsx scripts/test-ses-email.ts
  ```

  - Should send email successfully
  - Check inbox for receipt
  - Verify HTML rendering

- [ ] **Test 2: Welcome Email** (5 min)

  ```typescript
  // Add to test script
  await SESEmailService.sendWelcomeEmail({
    to: "your-verified-email@example.com",
    userName: "Test User",
  });
  ```

- [ ] **Test 3: PDF Attachment** (10 min)

  ```typescript
  // Test with real assessment PDF
  await sendAssessmentPDFEmail({
    to: "your-verified-email@example.com",
    assessmentId: "existing-assessment-id",
    userName: "Test User",
  });
  ```

  - Verify PDF is attached correctly
  - Check file size is reasonable
  - Open PDF and verify content

- [ ] **Test 4: Error Handling** (10 min)

  ```typescript
  // Test with invalid email (should fail gracefully)
  try {
    await SESEmailService.sendEmail({
      to: "not-verified@example.com",
      subject: "Test",
      html: "Test",
    });
  } catch (error) {
    console.log("✅ Error caught correctly:", error.message);
  }
  ```

- [ ] **Test 5: Rate Limiting** (5 min)
  ```typescript
  // Send multiple emails quickly
  for (let i = 0; i < 10; i++) {
    await SESEmailService.sendEmail({
      to: "your-verified-email@example.com",
      subject: `Test ${i}`,
      html: `Test email ${i}`,
    });
  }
  // Should respect rate limits
  ```

#### Monitoring During Testing

- [ ] **Check AWS SES Console** (Ongoing)
  - Go to SES → Account Dashboard
  - Monitor "Sending Statistics" (updates every few minutes)
  - Check for bounces/complaints (should be 0 during testing)

- [ ] **Check CloudWatch Logs** (Optional)
  - Go to CloudWatch → Log Groups
  - Look for `/aws/lambda/ses-*` or your application logs
  - Verify successful sends and any errors

#### Common Development Issues

- [ ] **Issue: "Email address is not verified"**

  ```
  Solution: Verify the email address in SES Console
  OR: Request production access to exit sandbox mode
  ```

- [ ] **Issue: "Invalid AWS credentials"**

  ```
  Solution: Double-check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  Verify IAM user has SendEmail permissions
  ```

- [ ] **Issue: "MessageRejected: Email address not verified"**
  ```
  Solution: In sandbox mode, BOTH sender and recipient must be verified
  Verify your SES_FROM_EMAIL address in SES Console
  ```

---

### Phase 3: Supabase Auth Integration (Day 3)

**Time**: 1-2 hours

#### Configure Supabase to Use SES SMTP

- [ ] **Update Supabase Project Settings** (15 min)
  - Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings
  - Enable "Custom SMTP"
  - Fill in SES SMTP details:
    ```
    Host: email-smtp.us-east-1.amazonaws.com
    Port: 587
    Username: [Your SES SMTP username]
    Password: [Your SES SMTP password]
    Sender email: noreply@yourdomain.com
    Sender name: AI Diagnostic
    ```
  - Save settings

- [ ] **Test Magic Link** (10 min)
  - Create test user flow
  - Trigger magic link email
  - Verify email received via SES
  - Check SES console for delivery confirmation

- [ ] **Test Password Reset** (10 min)
  - Trigger password reset flow
  - Verify email received via SES
  - Confirm reset link works correctly

- [ ] **Customize Supabase Email Templates** (30 min)
  - Go to Auth → Email Templates
  - Customize templates for:
    - Confirmation email (magic link)
    - Password reset
    - Email change confirmation
  - Add branding, styling, and clear CTAs
  - Preview and test each template

---

### Phase 4: User Notifications System (Day 4)

**Time**: 3-4 hours

#### Create Notification Service

- [ ] **Create `lib/services/notification-service.ts`** (2 hours)

  ```typescript
  import { prisma } from "@/lib/db/prisma";
  import { SESEmailService } from "@/lib/email/ses-email-service";

  export type NotificationType =
    | "ASSESSMENT_COMPLETE"
    | "LICENSE_EXPIRING"
    | "LICENSE_RENEWED"
    | "NEW_RECOMMENDATION"
    | "WEEKLY_SUMMARY"
    | "ACCOUNT_UPDATE";

  interface NotificationPreferences {
    assessmentComplete: boolean;
    licenseExpiring: boolean;
    licenseRenewed: boolean;
    newRecommendation: boolean;
    weeklySummary: boolean;
    accountUpdate: boolean;
  }

  export class NotificationService {
    /**
     * Send notification if user has enabled it
     */
    static async send(userId: string, type: NotificationType, data: any) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPreferences: true },
      });

      if (!user || !user.email) return;

      // Check if user has enabled this notification type
      const prefs = user.notificationPreferences;
      const prefKey = this.getPreferenceKey(type);
      if (prefs && !prefs[prefKey]) {
        console.log(
          `[Notification] Skipping ${type} for ${user.email} (disabled by user)`
        );
        return;
      }

      // Send notification based on type
      switch (type) {
        case "ASSESSMENT_COMPLETE":
          await SESEmailService.sendAssessmentReport(data);
          break;
        case "LICENSE_EXPIRING":
          await SESEmailService.sendLicenseExpirationNotification(data);
          break;
        // ... other cases
      }
    }

    private static getPreferenceKey(
      type: NotificationType
    ): keyof NotificationPreferences {
      const mapping = {
        ASSESSMENT_COMPLETE: "assessmentComplete",
        LICENSE_EXPIRING: "licenseExpiring",
        LICENSE_RENEWED: "licenseRenewed",
        NEW_RECOMMENDATION: "newRecommendation",
        WEEKLY_SUMMARY: "weeklySummary",
        ACCOUNT_UPDATE: "accountUpdate",
      };
      return mapping[type] as keyof NotificationPreferences;
    }
  }
  ```

- [ ] **Add notification preferences to database** (30 min)
  - Update `prisma/schema.prisma`:

    ```prisma
    model NotificationPreferences {
      id                    String   @id @default(cuid())
      userId                String   @unique
      user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

      assessmentComplete    Boolean  @default(true)
      licenseExpiring       Boolean  @default(true)
      licenseRenewed        Boolean  @default(true)
      newRecommendation     Boolean  @default(true)
      weeklySummary         Boolean  @default(false)
      accountUpdate         Boolean  @default(true)

      createdAt             DateTime @default(now())
      updatedAt             DateTime @updatedAt
    }
    ```

  - Run migration: `npx prisma migrate dev --name add_notification_preferences`

- [ ] **Create notification preferences UI** (1 hour)
  - Add to settings page
  - Toggle switches for each notification type
  - Save preferences to database

#### Scheduled Notifications

- [ ] **Update `lib/email/email-scheduler.ts`** (1 hour)
  - Use `NotificationService` for all scheduled emails
  - Add weekly summary notification
  - Add license renewal reminders (7 days, 3 days, 1 day before expiry)

---

### Phase 4.5: Rate Limiting & Abuse Prevention (Day 4)

**Time**: 3-4 hours | **Critical for preventing SES cost overruns and account suspension**

AWS SES can be expensive if abused, and Amazon will suspend accounts with high bounce/complaint rates. Implement multiple layers of rate limiting.

#### Database Schema for Email Tracking

- [ ] **Add email tracking table to Prisma schema** (15 min)

  ```prisma
  model EmailLog {
    id            String   @id @default(cuid())
    userId        String?  // Null for system emails
    user          User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

    recipientEmail String
    emailType      String   // "WELCOME", "PASSWORD_RESET", "ASSESSMENT_REPORT", etc.
    subject        String
    status         String   // "SENT", "FAILED", "BOUNCED", "COMPLAINED"
    messageId      String?  // SES message ID
    errorMessage   String?

    sentAt         DateTime @default(now())

    @@index([userId, sentAt])
    @@index([recipientEmail, sentAt])
    @@index([sentAt])
  }
  ```

  - Run migration: `npx prisma migrate dev --name add_email_logs`

#### Per-User Rate Limiting

- [ ] **Create rate limiter service `lib/services/email-rate-limiter.ts`** (2 hours)

  ```typescript
  import { prisma } from "@/lib/db/prisma";

  export class EmailRateLimiter {
    /**
     * Check if user can send an email based on rate limits
     * Returns { allowed: boolean, reason?: string, retryAfter?: number }
     */
    static async checkUserLimit(
      userId: string,
      emailType: string
    ): Promise<{
      allowed: boolean;
      reason?: string;
      retryAfter?: number;
    }> {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Rule 1: Max 5 emails per hour per user
      const emailsLastHour = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneHourAgo },
          status: "SENT",
        },
      });

      if (emailsLastHour >= 5) {
        return {
          allowed: false,
          reason:
            "Too many emails sent in the last hour. Please try again later.",
          retryAfter: 3600, // seconds
        };
      }

      // Rule 2: Max 20 emails per day per user
      const emailsLastDay = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
      });

      if (emailsLastDay >= 20) {
        return {
          allowed: false,
          reason: "Daily email limit reached. Please try again tomorrow.",
          retryAfter: 86400, // seconds
        };
      }

      // Rule 3: Prevent duplicate emails (same type within 5 minutes)
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const recentDuplicate = await prisma.emailLog.findFirst({
        where: {
          userId,
          emailType,
          sentAt: { gte: fiveMinutesAgo },
          status: "SENT",
        },
      });

      if (recentDuplicate) {
        return {
          allowed: false,
          reason: "This email was recently sent. Please wait a few minutes.",
          retryAfter: 300, // seconds
        };
      }

      return { allowed: true };
    }

    /**
     * Check global rate limits (all users combined)
     */
    static async checkGlobalLimit(): Promise<{
      allowed: boolean;
      reason?: string;
    }> {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Global limit: 5,000 emails per day (adjust based on your needs)
      const emailsToday = await prisma.emailLog.count({
        where: {
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
      });

      if (emailsToday >= 5000) {
        console.error("[EmailRateLimiter] 🚨 GLOBAL DAILY LIMIT REACHED!");
        return {
          allowed: false,
          reason: "System email capacity reached. Please try again tomorrow.",
        };
      }

      // Warning threshold: Log when approaching limit
      if (emailsToday >= 4000) {
        console.warn(
          `[EmailRateLimiter] ⚠️ WARNING: ${emailsToday}/5000 emails sent today`
        );
      }

      return { allowed: true };
    }

    /**
     * Check if recipient email is on cooldown (to prevent spam to same address)
     */
    static async checkRecipientLimit(recipientEmail: string): Promise<{
      allowed: boolean;
      reason?: string;
    }> {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Max 10 emails to same address per hour (across all users)
      const emailsToRecipient = await prisma.emailLog.count({
        where: {
          recipientEmail: recipientEmail.toLowerCase(),
          sentAt: { gte: oneHourAgo },
          status: "SENT",
        },
      });

      if (emailsToRecipient >= 10) {
        return {
          allowed: false,
          reason: "This email address has received too many emails recently.",
        };
      }

      return { allowed: true };
    }

    /**
     * Log email send attempt
     */
    static async logEmail(data: {
      userId?: string;
      recipientEmail: string;
      emailType: string;
      subject: string;
      status: "SENT" | "FAILED";
      messageId?: string;
      errorMessage?: string;
    }) {
      try {
        await prisma.emailLog.create({
          data: {
            userId: data.userId,
            recipientEmail: data.recipientEmail.toLowerCase(),
            emailType: data.emailType,
            subject: data.subject,
            status: data.status,
            messageId: data.messageId,
            errorMessage: data.errorMessage,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        console.error("[EmailRateLimiter] Failed to log email:", error);
        // Don't throw - logging failure shouldn't stop email sending
      }
    }

    /**
     * Get email statistics for admin dashboard
     */
    static async getStats(days: number = 7) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await prisma.emailLog.groupBy({
        by: ["emailType", "status"],
        where: { sentAt: { gte: startDate } },
        _count: true,
      });

      const totalSent = await prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate },
          status: "SENT",
        },
      });

      return { stats, totalSent };
    }
  }
  ```

#### Update SES Email Service with Rate Limiting

- [ ] **Integrate rate limiter into `lib/email/ses-email-service.ts`** (1 hour)

  ```typescript
  import { EmailRateLimiter } from "@/lib/services/email-rate-limiter";

  export class SESEmailService {
    // ... existing code ...

    /**
     * Send email with rate limiting
     */
    static async sendEmail(options: EmailOptions & { userId?: string; emailType?: string }) {
      const { userId, emailType = "GENERIC", ...emailOptions } = options;

      try {
        // 1. Check global rate limit
        const globalCheck = await EmailRateLimiter.checkGlobalLimit();
        if (!globalCheck.allowed) {
          console.error(`[SES] 🚫 Global rate limit: ${globalCheck.reason}`);
          throw new Error(globalCheck.reason);
        }

        // 2. Check per-user rate limit
        if (userId) {
          const userCheck = await EmailRateLimiter.checkUserLimit(userId, emailType);
          if (!userCheck.allowed) {
            console.warn(`[SES] 🚫 User rate limit: ${userCheck.reason}`);
            throw new Error(userCheck.reason);
          }
        }

        // 3. Check recipient rate limit
        const recipientCheck = await EmailRateLimiter.checkRecipientLimit(emailOptions.to);
        if (!recipientCheck.allowed) {
          console.warn(`[SES] 🚫 Recipient rate limit: ${recipientCheck.reason}`);
          throw new Error(recipientCheck.reason);
        }

        // 4. Send email
        const result = await transporter.sendMail({
          from: this.fromAddress,
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
          attachments: emailOptions.attachments,
        });

        // 5. Log successful send
        await EmailRateLimiter.logEmail({
          userId,
          recipientEmail: emailOptions.to,
          emailType,
          subject: emailOptions.subject,
          status: "SENT",
          messageId: result.messageId,
        });

        console.log(`[SES] ✅ Email sent to ${emailOptions.to} - MessageId: ${result.messageId}`);
        return { success: true, messageId: result.messageId };
      } catch (error) {
        // Log failed attempt
        await EmailRateLimiter.logEmail({
          userId,
          recipientEmail: emailOptions.to,
          emailType,
          subject: emailOptions.subject,
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });

        console.error(`[SES] ❌ Failed to send email to ${emailOptions.to}:`, error);
        throw error;
      }
    }

    /**
     * Update all email methods to include userId and emailType
     */
    static async sendAssessmentReport(data: AssessmentReportEmail & { userId?: string }) {
      // ... existing HTML template ...

      return this.sendEmail({
        to: data.to,
        subject: `Your ${data.assessmentName} Assessment Report`,
        html,
        attachments: data.pdfBuffer ? [...] : undefined,
        userId: data.userId,
        emailType: "ASSESSMENT_REPORT",
      });
    }

    // Update other methods similarly...
  }
  ```

#### Admin Dashboard for Email Monitoring

- [ ] **Create email analytics API `app/api/admin/email-stats/route.ts`** (30 min)

  ```typescript
  import { NextResponse } from "next/server";
  import { getServerSession } from "next-auth";
  import { EmailRateLimiter } from "@/lib/services/email-rate-limiter";

  export async function GET() {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await EmailRateLimiter.getStats(7); // Last 7 days
    return NextResponse.json(stats);
  }
  ```

- [ ] **Add email stats widget to admin dashboard** (30 min)
  - Show total emails sent today
  - Show emails by type (pie chart)
  - Show success/failure rate
  - Alert when approaching limits

#### IP-Based Rate Limiting (Optional - for public endpoints)

- [ ] **Add IP rate limiting for unauthenticated actions** (1 hour)

  ```typescript
  // For endpoints like "email assessment report" that might not require auth
  import { headers } from "next/headers";

  export async function checkIPRateLimit(): Promise<boolean> {
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const requestsFromIP = await prisma.emailLog.count({
      where: {
        // Store IP in a new field or use errorMessage temporarily
        sentAt: { gte: oneHourAgo },
        recipientEmail: { contains: ip }, // Hacky, but works for MVP
      },
    });

    return requestsFromIP < 10; // Max 10 emails per hour from one IP
  }
  ```

#### Testing Rate Limits

- [ ] **Create rate limit test script `scripts/test-rate-limits.ts`** (30 min)

  ```typescript
  import { EmailRateLimiter } from "@/lib/services/email-rate-limiter";

  async function testRateLimits() {
    const testUserId = "test-user-id";
    const testEmail = "test@example.com";

    console.log("Testing rate limits...\n");

    // Test 1: Send 6 emails rapidly (should hit hourly limit)
    console.log("Test 1: Hourly user limit (max 5/hour)");
    for (let i = 0; i < 6; i++) {
      const check = await EmailRateLimiter.checkUserLimit(testUserId, "TEST");
      console.log(
        `  Email ${i + 1}: ${check.allowed ? "✅ Allowed" : `🚫 Blocked - ${check.reason}`}`
      );

      if (check.allowed) {
        await EmailRateLimiter.logEmail({
          userId: testUserId,
          recipientEmail: testEmail,
          emailType: "TEST",
          subject: `Test ${i + 1}`,
          status: "SENT",
        });
      }
    }

    // Test 2: Duplicate prevention (same email type within 5 min)
    console.log("\nTest 2: Duplicate prevention (5 min cooldown)");
    const check2 = await EmailRateLimiter.checkUserLimit(testUserId, "WELCOME");
    console.log(
      `  First send: ${check2.allowed ? "✅ Allowed" : "🚫 Blocked"}`
    );

    if (check2.allowed) {
      await EmailRateLimiter.logEmail({
        userId: testUserId,
        recipientEmail: testEmail,
        emailType: "WELCOME",
        subject: "Welcome",
        status: "SENT",
      });
    }

    const check3 = await EmailRateLimiter.checkUserLimit(testUserId, "WELCOME");
    console.log(
      `  Immediate retry: ${check3.allowed ? "❌ Should be blocked!" : "✅ Correctly blocked"}`
    );

    console.log("\n✅ Rate limit tests complete!");
  }

  testRateLimits();
  ```

  - Run: `npx tsx scripts/test-rate-limits.ts`

#### Rate Limit Summary

| Limit Type           | Threshold        | Purpose                     |
| -------------------- | ---------------- | --------------------------- |
| Per-user hourly      | 5 emails/hour    | Prevent individual abuse    |
| Per-user daily       | 20 emails/day    | Daily user protection       |
| Per-recipient hourly | 10 emails/hour   | Prevent spam to one address |
| Duplicate prevention | 5 minutes        | Prevent double-sends        |
| Global daily         | 5,000 emails/day | Cost control & AWS limits   |
| IP-based (optional)  | 10/hour          | Public endpoint protection  |

---

### Phase 5: PDF Email Handling (Day 5)

**Time**: 2-3 hours

#### Enhanced PDF Support

- [ ] **Test PDF attachments with SES** (1 hour)
  - Verify attachment size limits (10MB for SES)
  - Test with various PDF sizes
  - Add compression if needed
  - Handle large PDFs (>10MB) with S3 links instead

- [ ] **Create API endpoint for email PDF** (1 hour)
  - Create `app/api/assessments/[id]/email-pdf/route.ts`

  ```typescript
  export async function POST(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientEmail } = await req.json();

    await sendAssessmentPDFEmail({
      to: recipientEmail || session.user.email,
      assessmentId: params.id,
      userName: session.user.name || "User",
    });

    return NextResponse.json({ success: true });
  }
  ```

- [ ] **Add "Email Report" button to UI** (30 min)
  - Add to assessment results page
  - Modal to confirm recipient email
  - Success/error toast notifications

#### Optional: Receive PDFs via Email (Advanced)

- [ ] **Set up SES email receiving** (If needed)
  - Configure SES to receive emails
  - Set up S3 bucket for email storage
  - Create Lambda to process incoming emails
  - Extract PDF attachments
  - Store in database

---

### Phase 6: Monitoring & Analytics (Day 6)

**Time**: 2-3 hours

#### CloudWatch Dashboard

- [ ] **Create SES monitoring dashboard** (1 hour)
  - Go to CloudWatch → Dashboards → Create Dashboard
  - Add widgets:
    - Total emails sent (daily)
    - Delivery rate (%)
    - Bounce rate (%)
    - Complaint rate (%)
    - Open rate (if using configuration sets)
  - Set refresh to 5 minutes

#### Bounce & Complaint Handling

- [ ] **Set up SNS topic for bounces/complaints** (30 min)
  - Create SNS topic: `ses-bounces-complaints`
  - Subscribe your admin email
  - Configure SES to send notifications:
    - Go to SES → Configuration Sets → Create Set
    - Add Event Destination → SNS
    - Select types: Bounces, Complaints

- [ ] **Create webhook handler for bounces** (1 hour)
  - Create `app/api/webhooks/ses-notifications/route.ts`

  ```typescript
  export async function POST(req: Request) {
    const body = await req.json();

    // Verify SNS signature
    // ...

    if (body.Type === "Notification") {
      const message = JSON.parse(body.Message);

      if (message.notificationType === "Bounce") {
        // Mark email as bounced in database
        await prisma.user.update({
          where: { email: message.bounce.bouncedRecipients[0].emailAddress },
          data: { emailBounced: true },
        });
      }

      if (message.notificationType === "Complaint") {
        // Mark email as complained
        // Unsubscribe user from marketing emails
      }
    }

    return NextResponse.json({ success: true });
  }
  ```

#### Email Analytics

- [ ] **Create admin analytics page** (1 hour)
  - Show daily email volume
  - Delivery success rate
  - Top email types sent
  - Failed emails list with reasons

---

### Phase 7: Environment Configuration & Deployment (Day 7)

**Time**: 1-2 hours

#### Environment Variables

- [ ] **Update `.env.local`** (5 min)

  ```bash
  # AWS Configuration
  AWS_REGION="us-east-1"
  AWS_ACCESS_KEY_ID="AKIA..."
  AWS_SECRET_ACCESS_KEY="..."

  # SES Configuration
  SES_FROM_EMAIL="noreply@yourdomain.com"
  SES_FROM_NAME="AI Diagnostic"

  # Feature Flags
  USE_SES="true"

  # Remove these (no longer needed):
  # RESEND_API_KEY="..."
  # RESEND_FROM_EMAIL="..."
  ```

- [ ] **Update production environment** (10 min)
  - Add same variables to Vercel/production environment
  - Verify all variables are set correctly
  - Test email sending in production

#### Documentation

- [ ] **Create SES runbook** (30 min)
  - Document common issues:
    - Sandbox mode limitations
    - Bounce rate too high
    - Complaint rate too high
    - Daily send quota exceeded
  - Include troubleshooting steps
  - Add links to AWS Console pages

- [ ] **Update README** (10 min)
  - Add SES setup instructions
  - Document environment variables
  - Add cost monitoring info

#### Deployment & Testing

- [ ] **Gradual rollout** (30 min)
  - Deploy with `USE_SES="false"` initially
  - Test in production with feature flag enabled for admin users only
  - Monitor for 24 hours
  - Enable for all users: `USE_SES="true"`

- [ ] **Set up cron jobs** (If using Vercel Cron)
  - Configure `vercel.json`:
    ```json
    {
      "crons": [
        {
          "path": "/api/cron/check-license-expirations",
          "schedule": "0 9 * * *"
        },
        {
          "path": "/api/cron/send-daily-digest",
          "schedule": "0 10 * * *"
        }
      ]
    }
    ```

---

### Monitoring Checklist

After deployment, monitor these metrics for the first week:

- [ ] Daily email volume (should be <200/day initially)
- [ ] Bounce rate (should be <5%)
- [ ] Complaint rate (should be <0.1%)
- [ ] Delivery rate (should be >95%)
- [ ] AWS costs (should be <$5/month)
- [ ] User feedback on email delivery

---

### Cost Breakdown

| Item                       | Monthly Cost     |
| -------------------------- | ---------------- |
| SES sending (5,000 emails) | $0.50            |
| SMTP sending               | $0.00 (included) |
| Data transfer              | $0.00 (minimal)  |
| CloudWatch logs            | $0.50            |
| **Total**                  | **~$1-2/month**  |

**Comparison**:

- Resend: $20/month (10,000 emails)
- SendGrid: $15/month (40,000 emails)
- **SES: $1-2/month** (5,000 emails) ✅

---

### High Priority

- [] **PDF Email sending** -
  - Integrated with pdf-generator.ts
  - Resend email service support ready
  - HTML email template with PDF attachment
  - Fallback for unconfigured email service

### Medium Priority

- [ ] **Processing assessment answers speed** - Needs testing
  - Current: 300ms delay with visual feedback (seems reasonable)
  - Test with real users for feedback
  - May not need changes

- [ ] **PDF Downloads Styling** - Needs testing
  - pdf-generator.ts exists
  - Need to review output quality and styling
  - Test with different screen sizes
  - Estimated: 1-2 hours if issues found

- [x] **Fix Recommendations views** -
  - Display logic corrected
  - Proper loading of existing recommendations

## 📖 Quick Links

- [MVP Launch Guide](MVP_LAUNCH_GUIDE.md) - Complete launch readiness guide
- [OAuth/MFA Setup](docs/OAUTH_MFA_PASSKEY_SETUP.md) - Authentication configuration

---

## 🔴 PRIORITY 1: MUST FIX BEFORE LAUNCH (This Week)

### Infrastructure & Configuration

- [ ] **Set up Stripe Production** (1-2 hours)
  - Switch to production mode
  - Create production price IDs (Basic, Monthly, Annual, Conversational AI)
  - Update environment variables
  - Configure webhook
  - Test payment flow
- [ ] **Update Pricing and Price IDs according to GPT** - New task
  - Review and update pricing structure based on GPT recommendations
  - Update Stripe price IDs to match new pricing model
  - Update frontend pricing displays
- [ ] **Environment Variables for Production** (30 min)
  - Set production URLs (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_RP_ID)
  - Set Stripe production keys
  - Set production price IDs
  - Verify all required env vars
- [ ] **Verify Database Migrations** (30 min)
  - Review migration status: `npx prisma migrate status`
  - Test on staging
  - Deploy to production: `npx prisma migrate deploy`

### Code Quality

- [ ] **Clean up unused files** (2-3 hours)
  - Delete `app/(auth)/register/page-old.tsx` (causing TS errors)
  - Remove unused markdown files (keep docs/)
  - Delete test scripts in /scripts/
  - Remove commented-out code
  - Clean up unused imports

---

## 🟡 PRIORITY 2: IMPORTANT BEFORE LAUNCH (Next Week)

### Testing & Quality Assurance

- [ ] **Test Critical User Flows** (3-4 hours)
  - [ ] Sign up & login (password, OAuth, MFA)
  - [ ] Trial assessment flow (not logged in)
  - [ ] Full assessment flow (logged in)
  - [ ] Payment flows (all subscription types)
  - [ ] Enhanced report purchase
  - [ ] PDF report generation
  - [ ] Share assessment link
  - [ ] Admin dashboard functions

### Performance & Monitoring

- [ ] **Add Error Tracking** (1-2 hours)
  - Set up Sentry or similar
  - Log critical events (payments, auth, assessments)
  - Configure error monitoring dashboard
- [ ] **Performance Optimization** (2-4 hours)
  - Run Lighthouse audit (target 90+ scores)
  - Optimize images (use Next.js Image)
  - Add missing loading states
  - Enable caching strategies
  - Test bundle size: `npm run build -- --profile`

### SEO & Analytics

- [ ] **Basic SEO Setup** (2-3 hours)
  - Add Google Analytics 4 (30 min) 🚀 QUICK WIN
  - Create robots.txt
  - Add sitemap.xml
  - Verify page metadata (titles, descriptions)
  - Add Open Graph images
  - Set up Google Search Console
- [ ] **Add Meta Pixel** (30 min) - Only if running ads
  - Quick win for retargeting

---

## 🟢 PRIORITY 3: POST-MVP (After Launch, Based on User Feedback)

### User-Requested Features (Build After Validation)

- [x] **Resource Library Feature** - NOT STARTED
  - Time: 8-12 hours
  - When: After 50+ users request it
  - Status: Nice-to-have, not essential for core value
  - [ ] Create ResourceLibrary database model
  - [ ] Create API routes for CRUD operations
  - [ ] Create admin UI for managing resources
  - [ ] Integrate into admin dashboard

### B2B Features (Build After First B2B Customer)

- [ ] **District Admin Signup Links** - PLANNED
  - Time: 6-8 hours
  - When: After first district customer signs up
  - Signup invite via email or link
  - Admins can create signup links for their district license
  - Districts can create/manage assessments for users
- [ ] **SIS/PowerSchool Integration** - NOT STARTED
  - Time: 20-40 hours
  - When: After 3+ schools request it
  - Import students
  - Select student at assessment start
  - Link to SIS system flow

### Marketing & Growth (After Product-Market Fit)

- [ ] **Email Service Setup** - PARTIAL (Stripe emails work)
  - Time: 4-6 hours
  - When: After 100+ users for marketing campaigns
  - Current: Stripe handles payments ✅, Supabase handles auth ✅
  - Future: AWS SES, Resend, MailGun, SendGrid
  - Marketing email sequences
  - Custom notification emails
- [ ] **Abandoned Cart Email for Cancelled Trials** - NOT STARTED
  - Time: 2-4 hours
  - When: After email service is set up
  - Trigger: User completes trial but clicks "Maybe Later" on upsell
  - Send follow-up email with discount code or reminder
  - Track conversion rate from abandoned cart emails
  - Similar to e-commerce abandoned cart recovery
- [ ] **Affiliate Program** - NOT STARTED
  - Time: 8-12 hours
  - When: After $5K+ monthly revenue
  - Requires proven product first
- [ ] **pSEO (Programmatic SEO)** - NOT STARTED
  - Time: 8-16 hours
  - When: After 1,000+ monthly visitors
  - Links: [pSEO Doc](https://docs.google.com/document/d/e/2PACX-1vTFgkhHVLh2MVU05EIdV1feAFZXljeFbRZEvz24Sl3oSUR-m1VwMQlmlAV_n8B2WZQReGcKEwoFjput/pub), [Twitter Thread](https://x.com/iannuttall/status/1783868343495319801?s=42)
    [CHATGPT Nextjs setup] https://chatgpt.com/c/68d30617-c060-8328-8e0e-04cc543473a5

### UX Enhancements (Based on User Feedback)

- [ ] **Clear local storage for trial** - BUG
  - Time: 1-2 hours
  - When: If users report confusion
  - Trial answers persist, may confuse users retaking trial
- [ ] **Domain Template Organization by type** - UI ENHANCEMENT
  - Time: 2-3 hours
  - When: After usage patterns emerge
- [ ] **Drag and Drop Dashboard Components** - UI ENHANCEMENT
  - Time: 12-20 hours
  - When: Based on user requests (low priority)
- [ ] **Dynamically load trial "what to expect" section**
  - Time: 2-3 hours
  - When: After content strategy defined
- [ ] **Trial questions match assessment (progress carries over)**
  - Time: 4-6 hours
  - When: After user testing reveals need

---

## 🤔 CONSIDERATIONS (Discuss & Decide)

### Business Model

- [ ] **Determine AI cost basis**
  - Analyze current OpenAI usage
  - Calculate cost per assessment
  - Adjust pricing if needed
- [ ] **Validate pricing model**
  - A/B test different price points
  - Monitor conversion rates
  - Adjust based on customer feedback

### AI Enhancement

- [ c] **Improve AI prompt for domain resources**
  - Current: AI receives assessment results
  - Enhancement: Include domain resource citations
  - Test with real assessments

---

## ✅ COMPLETED FEATURES

### Authentication & Security

- [x] OAuth Authentication (Google & Apple) - Just needs Supabase config
- [x] MFA/2FA with TOTP
- [x] Passkey/WebAuthn biometric auth
- [x] Secure payment processing (Stripe)

### Core Assessment

- [x] User can take assessments
- [x] Yes/no question flow
- [x] Domain skipping based on criteria
- [x] Per-domain scoring with graphs
- [x] AI-generated recommendations
- [x] Visual score representation
- [x] PDF report generation
- [x] Enhanced report option

### Admin Features

- [x] Dynamic domain templates
- [x] Dynamic assessment templates
- [x] Admin dashboard
- [x] User management
- [x] License management

### Payments

- [x] Stripe integration
- [x] Multiple subscription tiers
- [x] One-time payments (enhanced reports)
- [x] Subscription management

---

## 🎯 CURRENT USER STORY (Validated & Working)

1. User visits site
2. Takes free trial assessment (optional sign up)
3. Answers yes/no questions
4. Sees domain scores on graph
5. AI generates personalized recommendations
6. Option to purchase enhanced report ($5)
7. Can sign up for full access
8. Subscription options: Basic, Monthly, Annual
9. Can upgrade to Conversational AI
10. PDF reports downloadable

---

## 📊 MVP SUCCESS METRICS

### Week 1 Post-Launch

- User Signups: 10-50
- Trial Completions: 50%+ rate
- Paid Conversions: 5-10%
- Error Rate: <1%
- Page Load: <3 seconds

### Month 1 Post-Launch

- Active Users: 100-500
- Revenue: $500-2,000
- Customer Feedback: 10+ detailed reviews
- Top 5 Feature Requests: Documented
- Churn Rate: Monitored

---

## 🚀 LAUNCH CHECKLIST

See [MVP_LAUNCH_GUIDE.md](MVP_LAUNCH_GUIDE.md) for complete checklist.

**Quick Version:**

- [ ] Week 1: Fix all Priority 1 items
- [ ] Week 2: Complete Priority 2 items
- [ ] Test all critical flows
- [ ] Deploy to production
- [ ] Launch! 🎉

---

## 💡 PHILOSOPHY

**Ship Fast, Iterate Faster**

- Launch with core features ✅
- Defer nice-to-haves ✅
- Gather real user feedback
- Build what users actually want
- Don't overbuild

**Current Status: Ready to Launch!** 🚀

Your codebase is 95% ready. Complete Priority 1 & 2 items (4-5 days of work), test thoroughly, and ship it. Build Priority 3 features based on actual user demand, not assumptions.
