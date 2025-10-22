import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTrialTemplate } from "@/lib/trial/get-trial-template";

interface AnswerPayload {
  sessionId: string;
  qid: string;
  value: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnswerPayload;
    const { sessionId, qid, value } = body;

    if (!sessionId || !qid || typeof value !== "number") {
      return NextResponse.json(
        { error: "sessionId, qid, and numeric value are required" },
        { status: 400 }
      );
    }

    if (value < 0 || value > 4) {
      return NextResponse.json(
        { error: "Value must be between 0 and 4" },
        { status: 422 }
      );
    }

    const [session, template] = await Promise.all([
      prisma.snapshotSession.findUnique({ where: { id: sessionId } }),
      getTrialTemplate(),
    ]);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!template) {
      return NextResponse.json(
        { error: "Trial assessment is not available" },
        { status: 503 }
      );
    }

    const questionIds = new Set(template.questions.map((q) => q.id));
    if (!questionIds.has(qid)) {
      return NextResponse.json(
        { error: "Invalid question identifier" },
        { status: 400 }
      );
    }

    const trialRecord = await prisma.assessmentTrial.findFirst({
      where: { sessionId },
    });

    if (!trialRecord) {
      return NextResponse.json(
        { error: "Trial profile not found" },
        { status: 404 }
      );
    }

    const responses = {
      ...(trialRecord.responses as Record<string, number> | null | undefined),
      [qid]: value,
    };

    await prisma.assessmentTrial.update({
      where: { id: trialRecord.id },
      data: {
        responses,
      },
    });

    const answeredCount = Object.keys(responses).length;
    const progress = Math.min(
      1,
      answeredCount / Math.max(template.questions.length, 1)
    );

    return NextResponse.json({ ok: true, progress });
  } catch (error) {
    console.error("[trial/answer] failed", error);
    return NextResponse.json(
      { error: "Unable to save trial answer" },
      { status: 500 }
    );
  }
}
