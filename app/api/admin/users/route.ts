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

    const whereClause = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

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
          licenses: {
            where: { isActive: true },
            select: {
              id: true,
              assessmentsAllowed: true,
              assessmentsUsed: true,
              conversationalAssessmentsAllowed: true,
              conversationalAssessmentsUsed: true,
              isActive: true,
              license: {
                select: {
                  type: true,
                  maxAssessments: true,
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
      return {
        ...user,
        activeLicense: activeLicense
          ? {
              ...activeLicense,
              creditsRemaining:
                activeLicense.assessmentsAllowed - activeLicense.assessmentsUsed,
              conversationalCreditsRemaining:
                activeLicense.conversationalAssessmentsAllowed -
                activeLicense.conversationalAssessmentsUsed,
            }
          : null,
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
