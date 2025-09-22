/**
 * Assessment Export API
 *
 * Exports assessment configuration as JSON for backup or sharing
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/admin/assessments/[id]/export
 * Export assessment configuration as JSON
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const questionSet = await prisma.questionSet.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            text: true,
            order: true,
            isGatingQuestion: true,
            weight: true,
          },
        },
        terminationRules: {
          orderBy: { checkAfterQuestion: "asc" },
          select: {
            name: true,
            description: true,
            minimumYesToContinue: true,
            checkAfterQuestion: true,
          },
        },
      },
    });

    if (!questionSet) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Format as a clean configuration object
    const exportConfig = {
      domain: questionSet.domain,
      name: questionSet.name,
      displayName: questionSet.displayName,
      description: questionSet.description,
      order: questionSet.order,
      totalPossibleScore: questionSet.totalPossibleScore,
      clinicallySignificantScore: questionSet.clinicallySignificantScore,
      skipConditions: questionSet.skipConditions,
      prerequisites: questionSet.prerequisites,
      multiPartLogic: questionSet.multiPartLogic,
      questions: questionSet.questions,
      terminationRules: questionSet.terminationRules,
      exportedAt: new Date().toISOString(),
      exportedFrom: "AI Diagnostic System",
    };

    return NextResponse.json(exportConfig);
  } catch (error) {
    console.error("Error exporting assessment:", error);
    return NextResponse.json(
      { error: "Failed to export assessment" },
      { status: 500 }
    );
  }
}
