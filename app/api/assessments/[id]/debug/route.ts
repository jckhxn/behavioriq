import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const responses = await prisma.questionResponse.findMany({
      where: { assessmentId },
      select: { questionId: true, response: true, score: true },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("[debug] failed", error);
    return NextResponse.json({ error: "Failed to load debug data" }, { status: 500 });
  }
}
