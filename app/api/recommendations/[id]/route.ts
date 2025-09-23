import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/recommendations/[id] - Get a specific recommendation with optional assessment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeAssessment = searchParams.get("includeAssessment") === "true";

    // @ts-ignore - Temporary workaround for Prisma type issue
    const recommendation = await prisma.recommendation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: includeAssessment
        ? {
            assessment: {
              include: {
                scores: true,
              },
            },
          }
        : undefined,
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendation" },
      { status: 500 }
    );
  }
}

// PUT /api/recommendations/[id] - Update a recommendation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate required fields and prepare update data
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.isBookmarked !== undefined)
      updateData.isBookmarked = body.isBookmarked;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Verify the user owns the recommendation
    // @ts-ignore - Temporary workaround for Prisma type issue
    const existing = await prisma.recommendation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Recommendation not found or access denied" },
        { status: 404 }
      );
    }

    // @ts-ignore - Temporary workaround for Prisma type issue
    const recommendation = await prisma.recommendation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}

// DELETE /api/recommendations/[id] - Delete a recommendation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify the user owns the recommendation
    // @ts-ignore - Temporary workaround for Prisma type issue
    const existing = await prisma.recommendation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Recommendation not found or access denied" },
        { status: 404 }
      );
    }

    // @ts-ignore - Temporary workaround for Prisma type issue
    await prisma.recommendation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    return NextResponse.json(
      { error: "Failed to delete recommendation" },
      { status: 500 }
    );
  }
}
