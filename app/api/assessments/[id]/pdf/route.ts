import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { generateAssessmentPDF } from "@/lib/pdf/generator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await params;

    // Get assessment with all related data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id, // Ensure user owns this assessment
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
      ...assessment,
      startedAt: assessment.startedAt.toISOString(),
      completedAt: assessment.completedAt?.toISOString() || null,
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
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
