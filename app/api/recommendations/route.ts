import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    console.log("POST /api/recommendations request body:", requestBody);

    const { assessmentId, title, content, category, priority } = requestBody;

    console.log("Parsed fields:", {
      assessmentId,
      title,
      content,
      category,
      priority,
    });

    if (!assessmentId || !title || !content) {
      console.log(
        "Missing required fields. assessmentId:",
        assessmentId,
        "title:",
        title,
        "content:",
        content
      );
      return NextResponse.json(
        { error: "Missing required fields: assessmentId, title, content" },
        { status: 400 }
      );
    }

    // Verify the user owns the assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // @ts-ignore - Temporary workaround for Prisma type issue
    const recommendation = await prisma.recommendation.create({
      data: {
        assessmentId,
        userId: user.id,
        title,
        content,
        category: category || null,
        priority: priority || 1,
      },
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error saving recommendation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save recommendation", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const onlyBookmarked = searchParams.get("bookmarked") === "true";
    const assessmentId = searchParams.get("assessmentId");
    const category = searchParams.get("category");

    const whereClause: any = {
      userId: user.id,
      ...(onlyBookmarked ? { isBookmarked: true } : {}),
      ...(assessmentId ? { assessmentId } : {}),
      ...(category ? { category } : {}),
    };

    // @ts-ignore - Temporary workaround for Prisma type issue
    const recommendations = await prisma.recommendation.findMany({
      where: whereClause,
      include: {
        assessment: {
          select: {
            id: true,
            subjectName: true,
            completedAt: true,
            scores: {
              select: {
                domain: true,
                riskLevel: true,
                rawScore: true,
                totalPossible: true,
              },
              orderBy: {
                rawScore: "desc",
              },
              take: 5, // Limit to top 5 scores for sidebar display
            },
          },
        },
      },
      orderBy: [
        { isBookmarked: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
