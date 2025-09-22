/**
 * Email Job Scheduler
 *
 * Handles scheduled email notifications for license expiration and other alerts
 */

import { EmailService } from "./email-service";
import { LicensingService } from "../licensing/licensing-service";
import { prisma } from "../db/prisma";

export class EmailJobScheduler {
  /**
   * Check for expiring licenses and send notifications
   */
  static async checkLicenseExpirations(): Promise<void> {
    try {
      console.log("Checking for expiring licenses...");

      const expiringLicenses = await LicensingService.checkExpiringLicenses();

      for (const license of expiringLicenses) {
        // Calculate days until expiration
        const daysUntilExpiration = Math.ceil(
          (new Date(license.validUntil!).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Send notifications to all active users on the license
        for (const userLicense of license.users) {
          if (userLicense.isActive && userLicense.user.email) {
            console.log(
              `Sending expiration notice to ${userLicense.user.email} (${daysUntilExpiration} days)`
            );

            await EmailService.sendLicenseExpirationNotification({
              recipientName: userLicense.user.name || "User",
              recipientEmail: userLicense.user.email,
              licenseType: license.type,
              expirationDate: new Date(license.validUntil!),
              daysUntilExpiration,
              renewalUrl: process.env.NEXT_PUBLIC_APP_URL
                ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
                : undefined,
            });

            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      console.log(`Processed ${expiringLicenses.length} expiring licenses`);
    } catch (error) {
      console.error("License expiration check failed:", error);
    }
  }

  /**
   * Send welcome email when a new user is assigned a license
   */
  static async sendNewUserWelcome(
    userId: string,
    licenseType: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (!user || !user.email) {
        console.warn("User not found or no email address for welcome email");
        return;
      }

      await EmailService.sendWelcomeEmail({
        recipientName: user.name || "User",
        recipientEmail: user.email,
        licenseType,
        loginUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      });

      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error("Welcome email failed:", error);
    }
  }

  /**
   * Send daily digest of system activities (for admins)
   */
  static async sendDailyDigest(): Promise<void> {
    try {
      console.log("Generating daily digest...");

      // Get admin users
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          isActive: true,
        },
        select: { name: true, email: true },
      });

      // Filter out users without email
      const adminsWithEmail = admins.filter((admin) => admin.email);

      if (adminsWithEmail.length === 0) {
        console.log("No admin users found for daily digest");
        return;
      }

      // Get yesterday's stats
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await Promise.all([
        // New assessments
        prisma.assessment.count({
          where: {
            startedAt: {
              gte: yesterday,
              lt: today,
            },
          },
        }),
        // Completed assessments
        prisma.assessment.count({
          where: {
            completedAt: {
              gte: yesterday,
              lt: today,
            },
          },
        }),
        // New users
        prisma.user.count({
          where: {
            createdAt: {
              gte: yesterday,
              lt: today,
            },
          },
        }),
        // Active licenses count
        prisma.license.count({
          where: {
            status: "ACTIVE",
          },
        }),
      ]);

      const digestData = {
        date: yesterday.toLocaleDateString(),
        newAssessments: stats[0],
        completedAssessments: stats[1],
        newUsers: stats[2],
        activeLicenses: stats[3],
      };

      // Send to all admins
      for (const admin of adminsWithEmail) {
        if (admin.email) {
          await this.sendDigestEmail(
            admin as { name: string | null; email: string },
            digestData
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `Daily digest sent to ${adminsWithEmail.length} administrators`
      );
    } catch (error) {
      console.error("Daily digest failed:", error);
    }
  }

  /**
   * Send digest email to admin
   */
  private static async sendDigestEmail(
    admin: { name: string | null; email: string },
    data: {
      date: string;
      newAssessments: number;
      completedAssessments: number;
      newUsers: number;
      activeLicenses: number;
    }
  ): Promise<void> {
    const subject = `Daily Digest - ${data.date}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .stat { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Digest</h1>
            <p>System Activity for ${data.date}</p>
        </div>
        
        <div class="content">
            <h2>Hello ${admin.name || "Administrator"},</h2>
            
            <p>Here's your daily summary of platform activity:</p>
            
            <div class="stat">
                <span>New Assessments Started</span>
                <span class="stat-value">${data.newAssessments}</span>
            </div>
            
            <div class="stat">
                <span>Assessments Completed</span>
                <span class="stat-value">${data.completedAssessments}</span>
            </div>
            
            <div class="stat">
                <span>New Users Registered</span>
                <span class="stat-value">${data.newUsers}</span>
            </div>
            
            <div class="stat">
                <span>Active Licenses</span>
                <span class="stat-value">${data.activeLicenses}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>AI Diagnostic Platform - Admin Dashboard<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">View Full Dashboard</a></p>
        </div>
    </div>
</body>
</html>`;

    const text = `
Daily Digest - ${data.date}

Hello ${admin.name || "Administrator"},

Here's your daily summary of platform activity:

- New Assessments Started: ${data.newAssessments}
- Assessments Completed: ${data.completedAssessments}  
- New Users Registered: ${data.newUsers}
- Active Licenses: ${data.activeLicenses}

View Full Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin

---
AI Diagnostic Platform
`;

    await EmailService.sendEmail({
      to: admin.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Run all scheduled email jobs
   */
  static async runScheduledJobs(): Promise<void> {
    console.log("Running scheduled email jobs...");

    try {
      // Check for license expirations daily
      await this.checkLicenseExpirations();

      // Send daily digest (you might want to run this only once per day)
      const hour = new Date().getHours();
      if (hour === 8) {
        // Send at 8 AM
        await this.sendDailyDigest();
      }

      console.log("Scheduled email jobs completed");
    } catch (error) {
      console.error("Scheduled email jobs failed:", error);
    }
  }
}
