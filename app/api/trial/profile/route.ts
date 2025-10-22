import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface ProfilePayload {
  sessionId: string;
  childFirstName?: string;
  ageBand?: string | null;
  gradeBand?: string | null;
  region?: string | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProfilePayload;
    const { sessionId, ageBand, gradeBand } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = await prisma.snapshotSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Trial session not found" },
        { status: 404 }
      );
    }

    await prisma.snapshotSession.update({
      where: { id: sessionId },
      data: {
        region: body.region ?? session.region,
      },
    });

    const existingTrial = await prisma.assessmentTrial.findFirst({
      where: { sessionId },
    });

    if (existingTrial) {
      await prisma.assessmentTrial.update({
        where: { id: existingTrial.id },
        data: {
          childFirstName: body.childFirstName ?? null,
          ageBand: ageBand ?? existingTrial.ageBand ?? null,
          gradeBand: gradeBand ?? existingTrial.gradeBand ?? null,
          region: body.region ?? existingTrial.region ?? null,
        },
      });
    } else {
      await prisma.assessmentTrial.create({
        data: {
          sessionId,
          childFirstName: body.childFirstName ?? null,
          ageBand: ageBand ?? null,
          gradeBand: gradeBand ?? null,
          region: body.region ?? session.region ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[trial/profile] failed", error);
    return NextResponse.json(
      { error: "Unable to save trial profile" },
      { status: 500 }
    );
  }
}
