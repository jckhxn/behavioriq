import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date for monthly activity
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User statistics
    const [totalUsers, adminUsers, activeThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({
        where: {
          OR: [
            { assessments: { some: { startedAt: { gte: startOfMonth } } } },
            { chatSessions: { some: { createdAt: { gte: startOfMonth } } } },
          ],
        },
      }),
    ]);

    // Document statistics
    const [documents, documentCategories] = await Promise.all([
      prisma.document.aggregate({
        _count: true,
        _sum: { fileSize: true },
      }),
      prisma.document.groupBy({
        by: ["category"],
        _count: true,
      }),
    ]);

    // Assessment statistics
    const [totalAssessments, completedAssessments, assessmentMessages] =
      await Promise.all([
        prisma.assessment.count(),
        prisma.assessment.count({ where: { status: "COMPLETED" } }),
        prisma.chatMessage.aggregate({
          where: { assessmentId: { not: null } },
          _count: true,
        }),
      ]);

    // Chat session statistics
    const [totalChatSessions, knowledgeSessions, chatMessages] =
      await Promise.all([
        prisma.chatSession.count(),
        prisma.chatSession.count({ where: { type: "KNOWLEDGE" } }),
        prisma.chatMessage.aggregate({
          where: { sessionId: { not: null } },
          _count: true,
        }),
      ]);

    // Calculate derived statistics
    const inProgressAssessments = totalAssessments - completedAssessments;
    const averageCompletion =
      totalAssessments > 0
        ? (completedAssessments / totalAssessments) * 100
        : 0;

    const averageMessagesPerSession =
      totalChatSessions > 0 ? chatMessages._count / totalChatSessions : 0;

    const totalStorage = documents._sum.fileSize || 0;
    const storageLimit = 1024 * 1024 * 1024 * 10; // 10GB limit

    const categoryStats = documentCategories.reduce(
      (acc, cat) => {
        acc[cat.category] = cat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      users: {
        total: totalUsers,
        admins: adminUsers,
        activeThisMonth,
      },
      documents: {
        total: documents._count,
        totalSize: totalStorage,
        categories: categoryStats,
      },
      assessments: {
        total: totalAssessments,
        completed: completedAssessments,
        inProgress: inProgressAssessments,
        averageCompletion,
      },
      chatSessions: {
        total: totalChatSessions,
        knowledge: knowledgeSessions,
        averageMessagesPerSession,
      },
      storage: {
        used: totalStorage,
        limit: storageLimit,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
