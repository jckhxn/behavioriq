import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface StartTrialPayload {
  anonymous?: boolean;
  region?: string;
  utm?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartTrialPayload;
    const session = await prisma.snapshotSession.create({
      data: {
        anonymous: Boolean(body.anonymous),
        consented: true,
        region: body.region ?? null,
        utm: body.utm ?? undefined,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("[trial/start] failed", error);
    return NextResponse.json(
      { error: "Unable to start trial session" },
      { status: 500 }
    );
  }
}
