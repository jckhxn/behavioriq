import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const event = body?.event as string | undefined;
    if (!event) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    const metadata = {
      ...body,
      event: undefined,
    };

    await prisma.telemetryEvent.create({
      data: {
        event,
        metadata,
        userId: user?.id ?? null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[telemetry] POST error", error);
    return NextResponse.json(
      { error: "Failed to record telemetry" },
      { status: 500 }
    );
  }
}
