import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(request: NextRequest) {
  console.log("[Recommendations] POST request received");
  try {
    const user = await getCurrentUserWithRole();
    console.log("[Recommendations] User authenticated:", {
      userId: user?.id,
      email: user?.email,
    });

    if (!user) {
      console.error("[Recommendations] Unauthorized - no user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json();
    console.log("[Recommendations] POST request body:", requestBody);

    const {
      assessmentId: assessmentIdentifier,
      title,
      content,
      category,
      priority,
    } = requestBody;

    console.log("[Recommendations] Parsed fields:", {
      assessmentIdentifier,
      title,
      content,
      category,
      priority,
      userId: user.id,
    });

    if (!assessmentIdentifier || !title || !content) {
      console.log(
        "Missing required fields. assessmentIdentifier:",
        assessmentIdentifier,
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

    // Resolve shortId to UUID if needed
    console.log(
      "[Recommendations] Resolving assessment ID:",
      assessmentIdentifier
    );
    const assessmentId = await resolveAssessmentId(
      assessmentIdentifier,
      user.id
    );

    if (!assessmentId) {
      console.error("[Recommendations] Assessment not found:", {
        identifier: assessmentIdentifier,
        userId: user.id,
      });
      return NextResponse.json(
        {
          error: "Assessment not found",
          details: `No assessment found with ID: ${assessmentIdentifier}`,
        },
        { status: 404 }
      );
    }

    console.log("[Recommendations] Resolved assessment ID:", {
      original: assessmentIdentifier,
      resolved: assessmentId,
    });

    // Verify the user owns the assessment
    console.log("[Recommendations] Looking up assessment:", {
      assessmentId,
      userId: user.id,
    });

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id,
      },
    });

    console.log("[Recommendations] Assessment lookup result:", {
      assessmentId,
      userId: user.id,
      found: !!assessment,
      assessmentUserId: assessment?.userId,
    });

    if (!assessment) {
      // Check if assessment exists at all
      const anyAssessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: { id: true, userId: true },
      });

      if (!anyAssessment) {
        console.error("Assessment not found in database:", assessmentId);
        return NextResponse.json(
          {
            error: "Assessment not found",
            details: "No assessment exists with this ID",
          },
          { status: 404 }
        );
      } else {
        console.error("Assessment access denied:", {
          assessmentId,
          assessmentUserId: anyAssessment.userId,
          requestUserId: user.id,
        });
        return NextResponse.json(
          {
            error: "Access denied",
            details: "This assessment belongs to a different user",
          },
          { status: 403 }
        );
      }
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

    console.log(
      "[Recommendations] Successfully created recommendation:",
      recommendation.id
    );
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("[Recommendations] Error saving recommendation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[Recommendations] Error stack:", errorStack);

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
    const assessmentIdentifier = searchParams.get("assessmentId");
    const category = searchParams.get("category");

    // Resolve shortId to UUID if assessmentId is provided
    let resolvedAssessmentId = assessmentIdentifier;
    if (assessmentIdentifier) {
      const resolved = await resolveAssessmentId(assessmentIdentifier, user.id);
      if (!resolved) {
        console.warn(
          "[Recommendations] GET - Assessment not found:",
          assessmentIdentifier
        );
        // Return empty array instead of error for GET requests
        return NextResponse.json([]);
      }
      resolvedAssessmentId = resolved;
      console.log("[Recommendations] GET - Resolved assessment ID:", {
        original: assessmentIdentifier,
        resolved: resolvedAssessmentId,
      });
    }

    const whereClause: any = {
      userId: user.id,
      ...(onlyBookmarked ? { isBookmarked: true } : {}),
      ...(resolvedAssessmentId ? { assessmentId: resolvedAssessmentId } : {}),
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
