/**
 * Notification Service
 *
 * Handles sending notifications to users based on their preferences.
 * Integrates with SES email service and respects user notification settings.
 */

import prisma from "@/lib/db/prisma";
import { SESEmailService } from "@/lib/email/ses-email-service";

export type NotificationType =
  | "ASSESSMENT_COMPLETE"
  | "ASSESSMENT_SHARED"
  | "LICENSE_EXPIRING"
  | "LICENSE_RENEWED"
  | "NEW_RECOMMENDATION"
  | "WEEKLY_SUMMARY"
  | "MONTHLY_SUMMARY"
  | "ACCOUNT_UPDATE"
  | "SECURITY_ALERT"
  | "PRODUCT_UPDATE"
  | "MARKETING";

interface NotificationData {
  userId: string;
  type: NotificationType;
  data: any; // Specific data for each notification type
}

export class NotificationService {
  /**
   * Send notification if user has enabled it
   */
  static async send(notification: NotificationData): Promise<boolean> {
    const { userId, type, data } = notification;

    try {
      // Get user and their notification preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPreferences: true },
      });

      if (!user || !user.email) {
        console.warn(
          `[Notification] User ${userId} not found or has no email`
        );
        return false;
      }

      // Check if user has enabled this notification type
      const isEnabled = await this.isNotificationEnabled(
        userId,
        type,
        user.notificationPreferences
      );

      if (!isEnabled) {
        console.log(
          `[Notification] Skipping ${type} for ${user.email} (disabled by user)`
        );
        return false;
      }

      // Send notification based on type
      switch (type) {
        case "ASSESSMENT_COMPLETE":
          return await this.sendAssessmentComplete(user, data);

        case "LICENSE_EXPIRING":
          return await this.sendLicenseExpiring(user, data);

        case "LICENSE_RENEWED":
          return await this.sendLicenseRenewed(user, data);

        case "NEW_RECOMMENDATION":
          return await this.sendNewRecommendation(user, data);

        case "SECURITY_ALERT":
          return await this.sendSecurityAlert(user, data);

        case "ACCOUNT_UPDATE":
          return await this.sendAccountUpdate(user, data);

        default:
          console.warn(`[Notification] Unknown notification type: ${type}`);
          return false;
      }
    } catch (error) {
      console.error(`[Notification] Error sending ${type}:`, error);
      return false;
    }
  }

  /**
   * Check if user has enabled a specific notification type
   */
  private static async isNotificationEnabled(
    userId: string,
    type: NotificationType,
    preferences?: any
  ): Promise<boolean> {
    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    // Security alerts are always sent (critical)
    if (type === "SECURITY_ALERT") {
      return true;
    }

    // Map notification type to preference field
    const preferenceMap: Record<NotificationType, keyof typeof preferences> = {
      ASSESSMENT_COMPLETE: "assessmentComplete",
      ASSESSMENT_SHARED: "assessmentShared",
      LICENSE_EXPIRING: "licenseExpiring",
      LICENSE_RENEWED: "licenseRenewed",
      NEW_RECOMMENDATION: "newRecommendation",
      WEEKLY_SUMMARY: "weeklySummary",
      MONTHLY_SUMMARY: "monthlySummary",
      ACCOUNT_UPDATE: "accountUpdate",
      SECURITY_ALERT: "securityAlert",
      PRODUCT_UPDATE: "productUpdates",
      MARKETING: "marketingEmails",
    };

    const preferenceKey = preferenceMap[type];
    return preferences[preferenceKey] === true;
  }

  /**
   * Send assessment completion notification
   */
  private static async sendAssessmentComplete(user: any, data: any) {
    const { assessmentName, assessmentId, completedDate } = data;

    const result = await SESEmailService.sendEmail({
      to: user.email,
      subject: `Assessment Complete: ${assessmentName}`,
      html: `
        <h1>Assessment Completed</h1>
        <p>Hi ${user.name || "there"},</p>
        <p>Your <strong>${assessmentName}</strong> assessment has been completed successfully.</p>
        <p>Completed on: ${new Date(completedDate).toLocaleDateString()}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/assessment/${assessmentId}">View Results</a></p>
      `,
      userId: user.id,
      emailType: "ASSESSMENT_REPORT",
    });

    return result.success;
  }

  /**
   * Send license expiration notification
   */
  private static async sendLicenseExpiring(user: any, data: any) {
    const { licenseType, expiryDate, daysRemaining } = data;

    const result = await SESEmailService.sendLicenseExpirationNotification({
      to: user.email,
      userName: user.name || "User",
      licenseType,
      expiryDate: new Date(expiryDate),
      userId: user.id,
    });

    return result.success;
  }

  /**
   * Send license renewal confirmation
   */
  private static async sendLicenseRenewed(user: any, data: any) {
    const { licenseType, newExpiryDate } = data;

    const result = await SESEmailService.sendEmail({
      to: user.email,
      subject: `License Renewed: ${licenseType}`,
      html: `
        <h1>License Renewed Successfully</h1>
        <p>Hi ${user.name || "there"},</p>
        <p>Your <strong>${licenseType}</strong> license has been renewed.</p>
        <p>New expiry date: ${new Date(newExpiryDate).toLocaleDateString()}</p>
        <p>Thank you for continuing to use AI Diagnostic!</p>
      `,
      userId: user.id,
      emailType: "LICENSE_RENEWED",
    });

    return result.success;
  }

  /**
   * Send new recommendation notification
   */
  private static async sendNewRecommendation(user: any, data: any) {
    const { assessmentId, recommendationCount } = data;

    const result = await SESEmailService.sendEmail({
      to: user.email,
      subject: `New AI Recommendations Available`,
      html: `
        <h1>New Recommendations</h1>
        <p>Hi ${user.name || "there"},</p>
        <p>We've generated <strong>${recommendationCount} new AI-powered recommendations</strong> for your assessment.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/assessment/${assessmentId}">View Recommendations</a></p>
      `,
      userId: user.id,
      emailType: "GENERIC",
    });

    return result.success;
  }

  /**
   * Send security alert (always sent, regardless of preferences)
   */
  private static async sendSecurityAlert(user: any, data: any) {
    const { alertType, message, actionUrl } = data;

    const result = await SESEmailService.sendEmail({
      to: user.email,
      subject: `🔒 Security Alert: ${alertType}`,
      html: `
        <h1 style="color: #ef4444;">Security Alert</h1>
        <p>Hi ${user.name || "there"},</p>
        <p><strong>${message}</strong></p>
        ${actionUrl ? `<p><a href="${actionUrl}">Take Action</a></p>` : ""}
        <p style="color: #666; font-size: 14px;">If you didn't perform this action, please contact support immediately.</p>
      `,
      userId: user.id,
      emailType: "SYSTEM",
    });

    return result.success;
  }

  /**
   * Send account update notification
   */
  private static async sendAccountUpdate(user: any, data: any) {
    const { updateType, message } = data;

    const result = await SESEmailService.sendEmail({
      to: user.email,
      subject: `Account Update: ${updateType}`,
      html: `
        <h1>Account Updated</h1>
        <p>Hi ${user.name || "there"},</p>
        <p>${message}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings">Manage Account Settings</a></p>
      `,
      userId: user.id,
      emailType: "SYSTEM",
    });

    return result.success;
  }

  /**
   * Get or create user's notification preferences
   */
  static async getPreferences(userId: string) {
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user's notification preferences
   */
  static async updatePreferences(
    userId: string,
    updates: Partial<{
      assessmentComplete: boolean;
      assessmentShared: boolean;
      licenseExpiring: boolean;
      licenseRenewed: boolean;
      newRecommendation: boolean;
      weeklySummary: boolean;
      monthlySummary: boolean;
      accountUpdate: boolean;
      securityAlert: boolean;
      productUpdates: boolean;
      marketingEmails: boolean;
    }>
  ) {
    // Ensure preferences exist first
    await this.getPreferences(userId);

    // Update preferences
    return await prisma.notificationPreferences.update({
      where: { userId },
      data: updates,
    });
  }
}
