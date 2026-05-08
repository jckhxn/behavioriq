import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const notificationsEnabled = searchParams.get("notificationsEnabled") === "true";
    const iosActive = searchParams.get("iosActive") === "true";
    // "Recently active" = iOS app seen within the last 7 days
    const IOS_ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

    const whereClause: Record<string, unknown> = {};
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ];
    }
    if (notificationsEnabled) {
      whereClause.notificationPreferences = {
        OR: [
          { assessmentComplete: true },
          { assessmentShared: true },
          { licenseExpiring: true },
          { licenseRenewed: true },
          { newRecommendation: true },
          { weeklySummary: true },
          { monthlySummary: true },
          { accountUpdate: true },
          { productUpdates: true },
          { marketingEmails: true },
        ],
      };
    }
    if (iosActive) {
      whereClause.iosAppLastSeen = {
        gte: new Date(Date.now() - IOS_ACTIVE_WINDOW_MS),
      };
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          iosAppLastSeen: true,
          licenses: {
            where: { isActive: true },
            select: {
              id: true,
              assessmentsAllowed: true,
              assessmentsUsed: true,
              conversationalReportsAllowed: true,
              conversationalReportsUsed: true,
              isActive: true,
              license: {
                select: {
                  type: true,
                  maxAssessments: true,
                  maxConversationalReports: true,
                },
              },
            },
          },
          _count: {
            select: {
              documents: true,
              assessments: true,
              chatSessions: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedUsers = users.map((user) => {
      const activeLicense = user.licenses[0];

      if (!activeLicense) {
        return {
          ...user,
          activeLicense: null,
          totalDocuments: user._count.documents,
          totalAssessments: user._count.assessments,
          totalChatSessions: user._count.chatSessions,
        };
      }

      const assessmentsAllowed = activeLicense.assessmentsAllowed ?? 0;
      const assessmentsUsed = activeLicense.assessmentsUsed ?? 0;
      const conversationalReportsAllowed =
        activeLicense.conversationalReportsAllowed ?? 0;
      const conversationalReportsUsed =
        activeLicense.conversationalReportsUsed ?? 0;
      const hasManualReportLimit = conversationalReportsAllowed > 0;
      const licenseReportLimit =
        activeLicense.license.maxConversationalReports;
      let conversationalReportLimit: number | null;
      if (hasManualReportLimit) {
        conversationalReportLimit = conversationalReportsAllowed;
      } else if (licenseReportLimit === null) {
        conversationalReportLimit = null;
      } else if (typeof licenseReportLimit === "number") {
        conversationalReportLimit = licenseReportLimit;
      } else {
        conversationalReportLimit = 0;
      }
      const hasUnlimitedConversationalReports =
        conversationalReportLimit === null;
      const conversationalReportCreditsRemaining =
        conversationalReportLimit === null
          ? null
          : Math.max(
              0,
              (conversationalReportLimit ?? 0) - conversationalReportsUsed
            );

      return {
        ...user,
        activeLicense: {
          ...activeLicense,
          assessmentsAllowed,
          assessmentsUsed,
          conversationalReportsAllowed,
          conversationalReportsUsed,
          creditsRemaining: assessmentsAllowed - assessmentsUsed,
          conversationalCreditsRemaining:
            conversationalReportsAllowed - conversationalReportsUsed,
          conversationalReportLimit,
          hasUnlimitedConversationalReports,
          conversationalReportCreditsRemaining,
        },
        totalDocuments: user._count.documents,
        totalAssessments: user._count.assessments,
        totalChatSessions: user._count.chatSessions,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
