import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface UpgradePayload {
  assessmentId: string;
  orderId?: string;
  email?: string;
}

/**
 * POST /api/assessment/:id/upgrade
 * Called after successful payment to flip assessment mode from TRIAL to FULL
 * Does NOT create a new assessment - updates the existing one
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;
    const body = (await request.json()) as UpgradePayload;
    const { orderId, email } = body;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.mode !== "TRIAL") {
      return NextResponse.json(
        { error: "Assessment is not in TRIAL mode" },
        { status: 400 }
      );
    }

    // Flip the assessment mode from TRIAL to FULL
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        mode: "FULL",
        paidAt: new Date(),
      },
    });

    // Note: Lead creation would require linking to SnapshotSession
    // This is skipped for now as assessment.sessionId may not correspond to SnapshotSession

    return NextResponse.json({
      ok: true,
      assessmentId: updatedAssessment.id,
      mode: updatedAssessment.mode,
    });
  } catch (error) {
    console.error("[assessment/[id]/upgrade] failed", error);
    return NextResponse.json(
      { error: "Failed to upgrade assessment" },
      { status: 500 }
    );
  }
}
