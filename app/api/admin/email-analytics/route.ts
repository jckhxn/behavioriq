import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { EmailRateLimiter } from "@/lib/services/email-rate-limiter";

/**
 * GET /api/admin/email-analytics
 *
 * Returns email analytics and rate limiting statistics for super admins
 */
export async function GET(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Super Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    // Get email statistics
    const stats = await EmailRateLimiter.getStats(days);

    // Get recent failures
    const recentFailures = await EmailRateLimiter.getRecentFailures(20);

    // Calculate success rate
    const totalAttempts = stats.totalSent + stats.totalFailed;
    const successRate =
      totalAttempts > 0 ? (stats.totalSent / totalAttempts) * 100 : 100;

    // Calculate daily usage percentage
    const dailyUsagePercentage =
      (stats.todayCount / stats.dailyLimit) * 100;

    // Warning status
    const isApproachingLimit = stats.todayCount >= stats.warningThreshold;
    const isAtLimit = stats.todayCount >= stats.dailyLimit;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSent: stats.totalSent,
          totalFailed: stats.totalFailed,
          successRate: successRate.toFixed(2),
          todayCount: stats.todayCount,
          dailyLimit: stats.dailyLimit,
          dailyRemaining: Math.max(0, stats.dailyLimit - stats.todayCount),
          dailyUsagePercentage: dailyUsagePercentage.toFixed(2),
          isApproachingLimit,
          isAtLimit,
          warningThreshold: stats.warningThreshold,
        },
        byType: stats.stats.map((stat) => ({
          emailType: stat.emailType,
          status: stat.status,
          count: stat._count,
        })),
        topRecipients: stats.topRecipients.map((recipient) => ({
          email: recipient.recipientEmail,
          count: recipient._count,
        })),
        recentFailures: recentFailures.map((failure) => ({
          id: failure.id,
          recipientEmail: failure.recipientEmail,
          emailType: failure.emailType,
          subject: failure.subject,
          status: failure.status,
          errorMessage: failure.errorMessage,
          sentAt: failure.sentAt,
          user: failure.user
            ? {
                id: failure.user.id,
                email: failure.user.email,
                name: failure.user.name,
              }
            : null,
        })),
        timeframe: {
          days,
          startDate: new Date(
            Date.now() - days * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("[Admin] Error fetching email analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch email analytics",
      },
      { status: 500 }
    );
  }
}
