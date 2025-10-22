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
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const scores = await prisma.score.findMany({
      where: { assessmentId },
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
