import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTrialTemplate } from "@/lib/trial/get-trial-template";
import { scoreTrialSnapshot } from "@/lib/trial/score-trial";

interface ScorePayload {
  sessionId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScorePayload;
    if (!body.sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const [trialRecord, template] = await Promise.all([
      prisma.assessmentTrial.findFirst({
        where: { sessionId: body.sessionId },
      }),
      getTrialTemplate(),
    ]);

    if (!trialRecord) {
      return NextResponse.json(
        { error: "Trial session not found" },
        { status: 404 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: "Trial assessment is not available" },
        { status: 503 }
      );
    }

    const responses =
      (trialRecord.responses as Record<string, number> | null) ?? {};
    const snapshot = scoreTrialSnapshot({ responses, template });

    const updated = await prisma.assessmentTrial.update({
      where: { id: trialRecord.id },
      data: {
        scoreSnapshot: JSON.stringify(snapshot),
      },
    });

    return NextResponse.json({ snapshot, trialId: updated.id });
  } catch (error) {
    console.error("[trial/score] failed", error);
    return NextResponse.json(
      { error: "Unable to score trial assessment" },
      { status: 500 }
    );
  }
}
