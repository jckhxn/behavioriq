import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { generateAssessmentPDF } from "@/lib/pdf/generator";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get assessment with all related data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id, // Ensure user owns this assessment
      },
      include: {
        scores: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment not completed" },
        { status: 400 }
      );
    }

    // Generate PDF
    const assessmentData = {
      id: assessment.id,
      subjectName: assessment.subjectName,
      startedAt: assessment.startedAt.toISOString(),
      completedAt: assessment.completedAt?.toISOString() || null,
      status: assessment.status,
      scores: assessment.scores.map((score: any) => ({
        domain: score.domain || "Unknown",
        domainName: score.domainName || score.domain || "Unknown", // Human-readable name for Tailwind PDF
        rawScore: score.rawScore,
        totalPossible: score.totalPossible,
        riskLevel: score.riskLevel,
      })),
      user: assessment.user,
    };
    const pdfBuffer = await generateAssessmentPDF(assessmentData);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="assessment-${assessment.subjectName}-${assessment.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: errorMessage,
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
