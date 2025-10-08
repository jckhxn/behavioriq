import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

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

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { assessmentId: internalAssessmentId },
      orderBy: { timestamp: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        timestamp: true,
      },
    });

    // Get assessment status
    const assessment = await prisma.assessment.findUnique({
      where: { id: internalAssessmentId },
      select: { status: true },
    });

    return NextResponse.json({
      messages,
      status: assessment?.status,
    });
  } catch (error) {
    console.error("Get assessment messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
