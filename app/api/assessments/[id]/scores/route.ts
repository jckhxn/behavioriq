import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";
import { AssessmentDomain } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identifier = (await params).id;
    const user = await getCurrentUserWithRole();

    let assessmentId: string | null = null;
    let assessment;

    if (user) {
      // Authenticated user - use standard lookup with ownership check
      assessmentId = await resolveAssessmentId(identifier, user.id);
      if (!assessmentId) {
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      assessment = await prisma.assessment.findFirst({
        where: {
          id: assessmentId,
          userId: user.id,
        },
        select: { id: true, mode: true, status: true },
      });
    } else {
      // Anonymous user - only allow viewing scores for assessments WITHOUT userId (anonymous paid users)
      // and only if they're in FULL mode (they paid for it)
      assessment = await prisma.assessment.findFirst({
        where: {
          id: identifier,
          userId: null, // Must be an anonymous assessment
          mode: "FULL", // Must be paid (FULL mode)
        },
        select: { id: true, mode: true, status: true },
      });
      assessmentId = assessment?.id || null;
    }

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const scores = await prisma.score.findMany({
      where: { assessmentId: assessment.id },
      include: {
        domainTemplate: {
          select: {
            name: true,
            resources: true,
          },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    const payload = scores.map((score) => {
      const domainName =
        score.domainName ??
        score.domainTemplate?.name ??
        score.domain ??
        "Behavior";
      const fallbackDomain = score.domain ?? AssessmentDomain.ANTISOCIAL;

      return {
        id: score.id,
        domain: fallbackDomain,
        domainName,
        rawScore: score.rawScore,
        totalPossible: score.totalPossible,
        riskLevel: score.riskLevel,
        confidence: score.confidence,
        timestamp: score.timestamp,
        questionsAnswered: score.questionsAnswered,
        wasTerminatedEarly: score.wasTerminatedEarly,
        resources: score.domainTemplate?.resources ?? [],
      };
    });

    return NextResponse.json({ scores: payload });
  } catch (error) {
    console.error("[scores] failed to load assessment scores", error);
    return NextResponse.json(
      { error: "Failed to load assessment scores" },
      { status: 500 }
    );
  }
}
