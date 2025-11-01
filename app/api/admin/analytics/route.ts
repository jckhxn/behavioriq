import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { Role, AssessmentDomain, RiskLevel } from "@prisma/client";

/**
 * GET /api/admin/analytics
 * Returns comprehensive system analytics for administrators
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get total assessments
    const totalAssessments = await prisma.assessment.count({
      where: {
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get completed assessments
    const completedAssessments = await prisma.assessment.count({
      where: {
        status: "COMPLETED",
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get active users (users who have created assessments in the time range)
    const activeUsers = await prisma.user.count({
      where: {
        assessments: {
          some: {
            startedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    // Get average scores by domain
    const scoresByDomain = await prisma.score.groupBy({
      by: ["domain"],
      _avg: {
        rawScore: true,
      },
      _count: {
        assessmentId: true,
      },
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get total possible scores for each domain from question sets
    const questionSets = await prisma.questionSet.findMany({
      where: { isActive: true },
      select: {
        domain: true,
        totalPossibleScore: true,
      },
    });

    const avgScoresByDomain = scoresByDomain.map((score) => {
      const questionSet = questionSets.find((qs) => qs.domain === score.domain);
      return {
        domain: score.domain,
        avgScore: score._avg.rawScore || 0,
        totalPossible: questionSet?.totalPossibleScore || 10,
        assessmentCount: score._count.assessmentId,
      };
    });

    // Get risk distribution
    const riskDistribution = await prisma.score.groupBy({
      by: ["riskLevel"],
      _count: {
        id: true,
      },
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const riskDistributionFormatted = riskDistribution.map((risk) => ({
      riskLevel: risk.riskLevel,
      count: risk._count.id,
    }));

    // Get assessment trends (daily counts)
    const assessmentTrends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dailyAssessments = await prisma.assessment.count({
        where: {
          startedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      const dailyCompleted = await prisma.assessment.count({
        where: {
          status: "COMPLETED",
          startedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      assessmentTrends.unshift({
        date: date.toISOString().split("T")[0],
        assessments: dailyAssessments,
        completed: dailyCompleted,
      });
    }

    const analyticsData = {
      totalAssessments,
      completedAssessments,
      activeUsers,
      avgScoresByDomain,
      riskDistribution: riskDistributionFormatted,
      assessmentTrends,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
