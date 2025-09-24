import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessmentId = (await params).id;

    // Resolve and verify assessment belongs to user
    const internalAssessmentId = await resolveAssessmentId(
      assessmentId,
      session.user.id
    );

    if (!internalAssessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get all scores
    const scores = await prisma.score.findMany({
      where: { assessmentId: internalAssessmentId },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        domain: true,
        rawScore: true,
        totalPossible: true,
        questionsAnswered: true,
        riskLevel: true,
        confidence: true,
        wasTerminatedEarly: true,
        timestamp: true,
      },
    });

    // Get message count
    const messageCount = await prisma.chatMessage.count({
      where: {
        assessmentId: internalAssessmentId,
        role: "USER",
      },
    });

    // Get assessment status
    const assessment = await prisma.assessment.findUnique({
      where: { id: internalAssessmentId },
      select: { status: true },
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
