import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";
import { DOMAIN_LABELS } from "@/lib/constants/domains";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessmentId = (await params).id;

    // Resolve and verify assessment belongs to user
    const internalAssessmentId = await resolveAssessmentId(
      assessmentId,
      user.id
    );

    if (!internalAssessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get assessment status
    const assessment = await prisma.assessment.findUnique({
      where: { id: internalAssessmentId },
      select: { status: true },
    });

    // Get all scores with domain template names
    const rawScores = await (prisma.score as any).findMany({
      where: { assessmentId: internalAssessmentId },
      orderBy: { timestamp: "desc" },
      include: {
        domainTemplate: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Map scores to response format
    const scores = rawScores.map((score: any) => ({
      id: score.id,
      domain: score.domain,
      // Use domainName if stored, otherwise use template name, fallback to enum label
      domainName:
        score.domainName ||
        score.domainTemplate?.name ||
        (score.domain ? (DOMAIN_LABELS as any)[score.domain] : "Unknown"),
      rawScore: score.rawScore,
      totalPossible: score.totalPossible,
      questionsAnswered: score.questionsAnswered,
      riskLevel: score.riskLevel,
      confidence: score.confidence,
      wasTerminatedEarly: score.wasTerminatedEarly,
      timestamp: score.timestamp,
    }));

    // Get message count
    const messageCount = await prisma.chatMessage.count({
      where: {
        assessmentId: internalAssessmentId,
        role: "USER",
      },
    });

    return NextResponse.json({
      scores,
      status: assessment?.status,
      messageCount,
    });
  } catch (error) {
    console.error("Get assessment scores error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
