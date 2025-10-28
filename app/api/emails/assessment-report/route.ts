/**
 * Email API Endpoint
 *
 * Handles sending assessment reports and notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { EmailService } from "@/lib/email/email-service";
import prisma from "@/lib/db/prisma";
import { getAssessmentByIdentifier } from "@/lib/utils/assessmentResolver";
import { generateAssessmentPDF } from "@/lib/pdf/generator";

export const runtime = "nodejs"; // Force Node.js runtime for Prisma

// POST /api/emails/assessment-report - Send assessment report via email
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, recipientEmail, includePdf } = body;

    console.log("[Email Report] Request received:", {
      assessmentId,
      recipientEmail,
      includePdf,
    });

    if (!assessmentId || !recipientEmail) {
      return NextResponse.json(
        { error: "Assessment ID and recipient email are required" },
        { status: 400 }
      );
    }

    // Get assessment details - handle both UUID and shortId
    console.log("[Email Report] Fetching assessment:", assessmentId);
    const assessment = await getAssessmentByIdentifier(assessmentId, user.id);

    console.log("[Email Report] Assessment found:", assessment ? "yes" : "no");

    if (!assessment) {
      console.error(
        "[Email Report] Assessment not found for ID:",
        assessmentId
      );
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // For super admins, we need to fetch the user and scores separately
    const assessmentWithDetails = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        scores: true,
      },
    });

    // Calculate overall risk level
    const overallScore =
      assessmentWithDetails && assessmentWithDetails.scores.length > 0
        ? assessmentWithDetails.scores.reduce(
            (sum: number, score: any) => sum + score.value,
            0
          ) / assessmentWithDetails.scores.length
        : 0;

    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

    if (overallScore >= 80) riskLevel = "VERY_HIGH";
    else if (overallScore >= 60) riskLevel = "HIGH";
    else if (overallScore >= 40) riskLevel = "MODERATE";
    else riskLevel = "LOW";

    // Generate summary
    const scoresCount = assessmentWithDetails?.scores.length || 0;
    const summary = `Based on the assessment analysis, the overall risk level has been determined as ${riskLevel}. The assessment evaluated ${scoresCount} categories with an average score of ${overallScore.toFixed(1)}.`;

    // Generate PDF if requested
    let reportPdf: Buffer | undefined;
    if (includePdf) {
      try {
        console.log(
          "[Email Report] Generating PDF for assessment:",
          assessmentId
        );

        // Prepare assessment data for PDF generation
        const assessmentData = {
          id: assessment.id,
          subjectName: assessment.subjectName,
          startedAt: assessment.startedAt.toISOString(),
          completedAt: assessment.completedAt?.toISOString() || null,
          status: assessment.status,
          scores:
            assessmentWithDetails?.scores.map((score: any) => ({
              domain: score.domain || "Unknown",
              domainName: score.domainName || score.domain || "Unknown",
              rawScore: score.rawScore,
              totalPossible: score.totalPossible,
              riskLevel: score.riskLevel,
            })) || [],
          user:
            assessmentWithDetails?.user &&
            assessmentWithDetails.user.email != null
              ? {
                  name: assessmentWithDetails.user.name,
                  email: assessmentWithDetails.user.email,
                }
              : { name: assessment.subjectName, email: "" },
        };

        reportPdf = await generateAssessmentPDF(assessmentData);
        console.log(
          "[Email Report] PDF generated successfully, size:",
          reportPdf.length,
          "bytes"
        );
      } catch (error) {
        console.error("[Email Report] PDF generation failed:", error);
        // Continue without PDF if generation fails
      }
    }

    // Send email using SES-optimized format
    const useSES = process.env.USE_SES === "true";
    let result;

    if (useSES) {
      // Use SES direct method for better integration
      const { SESEmailService } = await import("@/lib/email/ses-email-service");
      result = await SESEmailService.sendAssessmentReport({
        to: recipientEmail,
        userName:
          assessmentWithDetails?.user?.name || assessment.subjectName || "User",
        assessmentName: `Assessment for ${assessment.subjectName}`,
        assessmentId: assessment.id,
        pdfBuffer: reportPdf,
        userId: user.id,
      });
    } else {
      // Fallback to legacy EmailService
      result = await EmailService.sendAssessmentReport({
        recipientName:
          assessmentWithDetails?.user?.name || assessment.subjectName || "User",
        recipientEmail,
        assessmentTitle: `Assessment for ${assessment.subjectName}`,
        riskLevel,
        completedDate: assessment.startedAt,
        reportPdf,
        summary,
      });
    }

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
