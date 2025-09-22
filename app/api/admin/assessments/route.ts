/**
 * Assessment Management API
 *
 * CRUD operations for managing assessment configurations
 * through the admin interface
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AssessmentDomain } from "@prisma/client";

/**
 * GET /api/admin/assessments
 * Returns all assessment configurations for admin management
 */
export async function GET() {
  try {
    const questionSets = await prisma.questionSet.findMany({
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        terminationRules: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(questionSets);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/assessments
 * Create a new assessment configuration
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Start a transaction to create question set with questions and rules
    const result = await prisma.$transaction(async (tx) => {
      // Create the question set
      const questionSet = await tx.questionSet.create({
        data: {
          domain: data.domain,
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          order: data.order,
          totalPossibleScore: data.totalPossibleScore,
          clinicallySignificantScore: data.clinicallySignificantScore,
          skipConditions: data.skipConditions,
          prerequisites: data.prerequisites,
          multiPartLogic: data.multiPartLogic,
          isActive: true,
        },
      });

      // Create questions if provided
      if (data.questions && data.questions.length > 0) {
        await tx.question.createMany({
          data: data.questions.map((q: any) => ({
            questionSetId: questionSet.id,
            text: q.text,
            order: q.order,
            isGatingQuestion: q.isGatingQuestion || false,
            weight: q.weight || 1,
            isActive: true,
          })),
        });
      }

      // Create termination rules if provided
      if (data.terminationRules && data.terminationRules.length > 0) {
        await tx.terminationRule.createMany({
          data: data.terminationRules.map((rule: any) => ({
            questionSetId: questionSet.id,
            name: rule.name,
            description: rule.description,
            minimumYesToContinue: rule.minimumYesToContinue,
            checkAfterQuestion: rule.checkAfterQuestion,
            isActive: true,
          })),
        });
      }

      // Return the complete question set with relations
      return await tx.questionSet.findUnique({
        where: { id: questionSet.id },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          terminationRules: {
            orderBy: { checkAfterQuestion: "asc" },
          },
          _count: {
            select: {
              questions: true,
              terminationRules: true,
            },
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/assessments/[id]
 * Update an assessment configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const questionSet = await prisma.questionSet.update({
      where: { id },
      data: updateData,
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
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
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
