/**
 * Individual Assessment Management API
 *
 * Operations for specific assessment configurations including
 * export, detailed fetch, and individual updates
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/assessments/[id]
 * Returns detailed assessment configuration for editing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const questionSet = await prisma.questionSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        terminationRules: {
          orderBy: { checkAfterQuestion: "asc" },
        },
      },
    });

    if (!questionSet) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(questionSet);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/assessments/[id]
 * Update an assessment configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const questionSet = await prisma.questionSet.update({
      where: { id },
      data: {
        domain: data.domain,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        order: data.order,
        isActive: data.isActive,
        totalPossibleScore: data.totalPossibleScore,
        clinicallySignificantScore: data.clinicallySignificantScore,
        skipConditions: data.skipConditions,
        prerequisites: data.prerequisites,
        multiPartLogic: data.multiPartLogic,
      },
      include: {
        questions: true,
        terminationRules: true,
      },
    });

    return NextResponse.json(questionSet);
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/assessments/[id]
 * Delete an assessment configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if assessment is being used in active assessments
    const activeAssessments = await prisma.assessment.findMany({
      where: {
        status: "IN_PROGRESS",
      },
      include: {
        responses: {
          include: {
            // We can't directly join questions, so we'll check by domain
          },
        },
      },
    });

    const questionSet = await prisma.questionSet.findUnique({
      where: { id },
      select: { domain: true, name: true },
    });

    if (!questionSet) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if any active assessments are using this domain
    const isInUse = activeAssessments.some(
      (assessment) => assessment.currentDomain === questionSet.domain
    );

    if (isInUse) {
      return NextResponse.json(
        {
          error:
            "Cannot delete assessment while it's being used in active assessments",
        },
        { status: 400 }
      );
    }

    await prisma.questionSet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
