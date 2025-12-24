/**
 * POST /api/district/recommendations/generate
 * Generate AI recommendations for a completed assessment
 */

import { NextRequest, NextResponse } from "next/server";
import { withDistrictAuth } from "@/lib/district/access-control";
import {
  generateRecommendations,
  saveRecommendations,
  determineRiskTier,
} from "@/lib/district/ai-recommendations";
import { prisma } from "@/lib/db/prisma";
import { AuditLogService } from "@/lib/district/audit-log-service";

export const POST = withDistrictAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { studentId, assessmentId } = body;

    if (!studentId || !assessmentId) {
      return NextResponse.json(
        { error: "studentId and assessmentId are required" },
        { status: 400 }
      );
    }

    // Get assessment with scores
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: true,
        studentAssessment: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Only generate for full assessments
    if (assessment.mode !== "FULL") {
      return NextResponse.json(
        { error: "Recommendations only available for full assessments" },
        { status: 400 }
      );
    }

    // Prepare domain scores
    const domainScores = assessment.scores.map((score) => ({
      domain: score.domainName || score.domain || "Unknown",
      rawScore: score.rawScore,
      riskLevel: score.riskLevel,
      totalPossible: score.totalPossible,
    }));

    const riskTier = determineRiskTier(domainScores);
    const student = assessment.studentAssessment?.student;

    // Generate recommendations
    const recommendations = await generateRecommendations({
      domainScores,
      gradeLevel: student?.gradeLevel || undefined,
      ageBand: student?.gradeLevel || undefined,
      riskTier,
    });

    // Save to database
    await saveRecommendations(studentId, assessmentId, recommendations);

    // Log action
    await AuditLogService.log({
      studentId,
      userId: user.id,
      action: "GENERATE_RECOMMENDATIONS",
      resourceId: assessmentId,
      metadata: { riskTier },
    });

    return NextResponse.json({
      success: true,
      recommendations,
      riskTier,
    });
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}, "TEACHER");
