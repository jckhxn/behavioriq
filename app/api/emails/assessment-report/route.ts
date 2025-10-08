/**
 * Email API Endpoint
 *
 * Handles sending assessment reports and notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { EmailService } from "@/lib/email/email-service";
import { prisma } from "@/lib/db/prisma";

// POST /api/emails/assessment-report - Send assessment report via email
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, recipientEmail, includePdf } = body;

    if (!assessmentId || !recipientEmail) {
      return NextResponse.json(
        { error: "Assessment ID and recipient email are required" },
        { status: 400 }
      );
    }

    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        scores: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this assessment or is admin
    if (assessment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Calculate overall risk level
    const overallScore =
      assessment.scores.length > 0
        ? assessment.scores.reduce(
            (sum: number, score: any) => sum + score.value,
            0
          ) / assessment.scores.length
        : 0;

    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

    if (overallScore >= 80) riskLevel = "VERY_HIGH";
    else if (overallScore >= 60) riskLevel = "HIGH";
    else if (overallScore >= 40) riskLevel = "MODERATE";
    else riskLevel = "LOW";

    // Generate summary
    const summary = `Based on the assessment analysis, the overall risk level has been determined as ${riskLevel}. The assessment evaluated ${assessment.scores.length} categories with an average score of ${overallScore.toFixed(1)}.`;

    // Generate PDF if requested (we'll integrate with our existing PDF generator)
    let reportPdf: Buffer | undefined;
    if (includePdf) {
      try {
        // This would integrate with your existing PDF generation
        // For now, we'll skip PDF attachment to avoid complexity
        console.log("PDF generation requested for assessment:", assessmentId);
      } catch (error) {
        console.error("PDF generation failed:", error);
      }
    }

    // Send email
    const result = await EmailService.sendAssessmentReport({
      recipientName: assessment.user.name || "User",
      recipientEmail,
      assessmentTitle: `Assessment for ${assessment.subjectName}`,
      riskLevel,
      completedDate: assessment.startedAt,
      reportPdf,
      summary,
    });

    if (result.success) {
      return NextResponse.json({
        message: "Assessment report sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send assessment report" },
      { status: 500 }
    );
  }
}
