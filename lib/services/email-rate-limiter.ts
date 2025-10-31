/**
 * Email Rate Limiter Service
 *
 * Multi-layered rate limiting and abuse prevention for email sending:
 * - Per-user limits (hourly & daily)
 * - Per-recipient limits (prevent spam to same address)
 * - Global platform limits (cost control)
 * - Duplicate prevention (same email within cooldown period)
 *
 * Critical for:
 * - Preventing AWS SES cost overruns
 * - Avoiding AWS account suspension (bounce/complaint rates)
 * - Protecting against abuse and API spam
 */

import prisma from "@/lib/db/prisma";

export type EmailType =
  | "WELCOME"
  | "PASSWORD_RESET"
  | "MAGIC_LINK"
  | "EMAIL_VERIFICATION"
  | "EMAIL_CHANGE"
  | "ASSESSMENT_REPORT"
  | "LICENSE_NOTIFICATION"
  | "LICENSE_RENEWED"
  | "PDF_REPORT"
  | "SYSTEM"
  | "GENERIC"
  | "MARKETING";

export type EmailStatus = "SENT" | "FAILED" | "BOUNCED" | "COMPLAINED";

export interface RateLimitCheck {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds until next attempt
}

export class EmailRateLimiter {
  // Rate limit thresholds
  private static readonly LIMITS = {
    USER_HOURLY: 5, // Max 5 emails per hour per user
    USER_DAILY: 20, // Max 20 emails per day per user
    RECIPIENT_HOURLY: 10, // Max 10 emails to same address per hour
    DUPLICATE_COOLDOWN_MINUTES: 5, // Prevent same email type within 5 minutes
    GLOBAL_DAILY: 5000, // Platform-wide daily limit
    GLOBAL_WARNING_THRESHOLD: 4000, // Warn when approaching limit
  };

  /**
   * Check if user can send an email based on rate limits
   */
  static async checkUserLimit(
    userId: string,
    emailType: EmailType
  ): Promise<RateLimitCheck> {

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      // Rule 1: Max emails per hour per user
      const emailsLastHour = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneHourAgo },
          status: "SENT",
        },
      });

      if (emailsLastHour >= this.LIMITS.USER_HOURLY) {
        console.warn(
          `[RateLimit] User ${userId} hit hourly limit (${emailsLastHour}/${this.LIMITS.USER_HOURLY})`
        );
        return {
          allowed: false,
          reason:
            "Too many emails sent in the last hour. Please try again later.",
          retryAfter: 3600,
        };
      }

      // Rule 2: Max emails per day per user
      const emailsLastDay = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
      });

      if (emailsLastDay >= this.LIMITS.USER_DAILY) {
        console.warn(
          `[RateLimit] User ${userId} hit daily limit (${emailsLastDay}/${this.LIMITS.USER_DAILY})`
        );
        return {
          allowed: false,
          reason: "Daily email limit reached. Please try again tomorrow.",
          retryAfter: 86400,
        };
      }

      // Rule 3: Prevent duplicate emails (same type within cooldown)
      const cooldownMinutesAgo = new Date(
        now.getTime() - this.LIMITS.DUPLICATE_COOLDOWN_MINUTES * 60 * 1000
      );

      const recentDuplicate = await prisma.emailLog.findFirst({
        where: {
          userId,
          emailType,
          sentAt: { gte: cooldownMinutesAgo },
          status: "SENT",
        },
        orderBy: {
          sentAt: "desc",
        },
      });

      if (recentDuplicate) {
        const minutesSince = Math.floor(
          (now.getTime() - new Date(recentDuplicate.sentAt).getTime()) /
            (60 * 1000)
        );
        console.warn(
          `[RateLimit] Duplicate ${emailType} for user ${userId} (sent ${minutesSince} mins ago)`
        );
        return {
          allowed: false,
          reason: `This email was recently sent. Please wait ${this.LIMITS.DUPLICATE_COOLDOWN_MINUTES - minutesSince} more minute(s).`,
          retryAfter:
            (this.LIMITS.DUPLICATE_COOLDOWN_MINUTES - minutesSince) * 60,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("[RateLimit] Error checking user limit:", error);
      // Fail open - don't block emails if rate limiter has issues
      return { allowed: true };
    }
  }

  /**
   * Check global rate limits (all users combined)
   */
  static async checkGlobalLimit(): Promise<RateLimitCheck> {

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const emailsToday = await prisma.emailLog.count({
        where: {
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
      });

      // Hard stop at global limit
      if (emailsToday >= this.LIMITS.GLOBAL_DAILY) {
        console.error(
          `[RateLimit] 🚨 GLOBAL DAILY LIMIT REACHED! ${emailsToday}/${this.LIMITS.GLOBAL_DAILY}`
        );
        return {
          allowed: false,
          reason:
            "System email capacity reached. Please try again tomorrow. If urgent, contact support.",
        };
      }

      // Warning threshold
      if (emailsToday >= this.LIMITS.GLOBAL_WARNING_THRESHOLD) {
        console.warn(
          `[RateLimit] ⚠️ WARNING: Approaching global limit ${emailsToday}/${this.LIMITS.GLOBAL_DAILY}`
        );
      }

      return { allowed: true };
    } catch (error) {
      console.error("[RateLimit] Error checking global limit:", error);
      // Fail open
      return { allowed: true };
    }
  }

  /**
   * Check if recipient email is on cooldown (prevent spam to same address)
   */
  static async checkRecipientLimit(
    recipientEmail: string
  ): Promise<RateLimitCheck> {

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      const emailsToRecipient = await prisma.emailLog.count({
        where: {
          recipientEmail: recipientEmail.toLowerCase(),
          sentAt: { gte: oneHourAgo },
          status: "SENT",
        },
      });

      if (emailsToRecipient >= this.LIMITS.RECIPIENT_HOURLY) {
        console.warn(
          `[RateLimit] Recipient ${recipientEmail} hit hourly limit (${emailsToRecipient}/${this.LIMITS.RECIPIENT_HOURLY})`
        );
        return {
          allowed: false,
          reason:
            "This email address has received too many emails recently. Please try again later.",
          retryAfter: 3600,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error("[RateLimit] Error checking recipient limit:", error);
      // Fail open
      return { allowed: true };
    }
  }

  /**
   * Log email send attempt
   */
  static async logEmail(data: {
    userId?: string;
    recipientEmail: string;
    emailType: EmailType;
    subject: string;
    status: EmailStatus;
    messageId?: string;
    errorMessage?: string;
  }): Promise<void> {
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

      console.log(
        `[EmailLog] Logged ${data.status} ${data.emailType} to ${data.recipientEmail}`
      );
    } catch (error) {
      console.error("[EmailLog] Failed to log email:", error);
      // Don't throw - logging failure shouldn't stop email sending
    }
  }

  /**
   * Get email statistics for admin dashboard
   */
  static async getStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Group by email type and status
      const stats = await prisma.emailLog.groupBy({
        by: ["emailType", "status"],
        where: { sentAt: { gte: startDate } },
        _count: true,
      });

      // Total emails sent successfully
      const totalSent = await prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate },
          status: "SENT",
        },
      });

      // Total emails failed
      const totalFailed = await prisma.emailLog.count({
        where: {
          sentAt: { gte: startDate },
          status: "FAILED",
        },
      });

      // Today's email count (for rate limiting UI)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await prisma.emailLog.count({
        where: {
          sentAt: { gte: today },
          status: "SENT",
        },
      });

      // Top recipients (potential abuse detection)
      const topRecipients = await prisma.emailLog.groupBy({
        by: ["recipientEmail"],
        where: { sentAt: { gte: startDate }, status: "SENT" },
        _count: true,
        orderBy: { _count: { recipientEmail: "desc" } },
        take: 10,
      });

      return {
        stats,
        totalSent,
        totalFailed,
        todayCount,
        dailyLimit: this.LIMITS.GLOBAL_DAILY,
        warningThreshold: this.LIMITS.GLOBAL_WARNING_THRESHOLD,
        topRecipients,
      };
    } catch (error) {
      console.error("[RateLimit] Error getting stats:", error);
      return {
        stats: [],
        totalSent: 0,
        totalFailed: 0,
        todayCount: 0,
        dailyLimit: this.LIMITS.GLOBAL_DAILY,
        warningThreshold: this.LIMITS.GLOBAL_WARNING_THRESHOLD,
        topRecipients: [],
      };
    }
  }

  /**
   * Get recent failed emails for troubleshooting
   */
  static async getRecentFailures(limit: number = 10) {
    try {
      return await prisma.emailLog.findMany({
        where: {
          status: { in: ["FAILED", "BOUNCED"] },
        },
        orderBy: {
          sentAt: "desc",
        },
        take: limit,
        select: {
          id: true,
          recipientEmail: true,
          emailType: true,
          subject: true,
          status: true,
          errorMessage: true,
          sentAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("[RateLimit] Error getting failures:", error);
      return [];
    }
  }

  /**
   * Check if email address has high bounce/complaint rate
   */
  static async isProblematicRecipient(
    recipientEmail: string
  ): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const recentEmails = await prisma.emailLog.findMany({
        where: {
          recipientEmail: recipientEmail.toLowerCase(),
          sentAt: { gte: thirtyDaysAgo },
        },
        select: {
          status: true,
        },
      });

      if (recentEmails.length === 0) return false;

      const bounceCount = recentEmails.filter(
        (e) => e.status === "BOUNCED" || e.status === "COMPLAINED"
      ).length;

      const bounceRate = bounceCount / recentEmails.length;

      // If bounce/complaint rate > 50%, mark as problematic
      if (bounceRate > 0.5) {
        console.warn(
          `[RateLimit] Problematic recipient: ${recipientEmail} (${(bounceRate * 100).toFixed(1)}% bounce/complaint rate)`
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("[RateLimit] Error checking recipient history:", error);
      return false;
    }
  }

  /**
   * Get current rate limit status for a user
   */
  static async getUserStatus(userId: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const hourlyCount = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneHourAgo },
          status: "SENT",
        },
      });

      const dailyCount = await prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: oneDayAgo },
          status: "SENT",
        },
      });

      return {
        hourly: {
          count: hourlyCount,
          limit: this.LIMITS.USER_HOURLY,
          remaining: Math.max(0, this.LIMITS.USER_HOURLY - hourlyCount),
          percentage: (hourlyCount / this.LIMITS.USER_HOURLY) * 100,
        },
        daily: {
          count: dailyCount,
          limit: this.LIMITS.USER_DAILY,
          remaining: Math.max(0, this.LIMITS.USER_DAILY - dailyCount),
          percentage: (dailyCount / this.LIMITS.USER_DAILY) * 100,
        },
      };
    } catch (error) {
      console.error("[RateLimit] Error getting user status:", error);
      return null;
    }
  }
}
