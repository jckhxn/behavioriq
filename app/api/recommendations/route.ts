import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(request: NextRequest) {
  console.log("[Recommendations] POST request received");
  try {
    // Auth is optional - support both authenticated and anonymous users
    const user = await getCurrentUserWithRole();
    const userId = user?.id;

    console.log("[Recommendations] User authenticated:", {
      userId,
      email: user?.email,
    });

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
      userId,
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
      userId || undefined
    );

    if (!assessmentId) {
      console.error("[Recommendations] Assessment not found:", {
        identifier: assessmentIdentifier,
        userId,
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

    // Build conditional where clause based on auth status
    // If authenticated: require ownership (userId must match)
    // If anonymous: only allow assessments with userId: null AND mode: FULL (paid assessments)
    const whereClause = userId
      ? { id: assessmentId, userId }
      : { id: assessmentId, userId: null, mode: "FULL" };

    console.log("[Recommendations] Looking up assessment:", {
      assessmentId,
      userId,
      whereClause,
    });

    const assessment = await prisma.assessment.findFirst({
      where: whereClause,
    });

    console.log("[Recommendations] Assessment lookup result:", {
      assessmentId,
      userId,
      found: !!assessment,
      assessmentUserId: assessment?.userId,
      assessmentMode: assessment?.mode,
    });

    if (!assessment) {
      // Check if assessment exists at all
      const anyAssessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: { id: true, userId: true, mode: true },
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
      } else if (userId && anyAssessment.userId !== userId) {
        // Authenticated user trying to access another user's assessment
        console.error("Assessment access denied:", {
          assessmentId,
          assessmentUserId: anyAssessment.userId,
          requestUserId: userId,
        });
        return NextResponse.json(
          {
            error: "Access denied",
            details: "This assessment belongs to a different user",
          },
          { status: 403 }
        );
      } else if (!userId && (anyAssessment.userId || anyAssessment.mode !== "FULL")) {
        // Anonymous user trying to access authenticated assessment or non-FULL assessment
        console.error("Assessment access denied for anonymous user:", {
          assessmentId,
          assessmentUserId: anyAssessment.userId,
          assessmentMode: anyAssessment.mode,
        });
        return NextResponse.json(
          {
            error: "Access denied",
            details: "Anonymous users can only generate recommendations for paid (FULL) assessments",
          },
          { status: 403 }
        );
      }
    }

    // Create recommendation with optional userId
    const recommendation = await prisma.recommendation.create({
      data: {
        assessmentId,
        userId: userId || null, // null for anonymous, user id for authenticated
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
