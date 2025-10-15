import { generateAssessmentPDF } from "@/lib/pdf/generator";
import prisma from "@/lib/db/prisma";
import {
  checkBudgetAvailable,
  logEmailSent,
} from "@/lib/services/email-budget-service";
import { SESEmailService } from "@/lib/email/ses-email-service";

interface SendPDFEmailParams {
  to: string;
  assessmentId: string;
  userName: string;
}

export async function sendAssessmentPDFEmail({
  to,
  assessmentId,
  userName,
}: SendPDFEmailParams) {
  try {
    // Check budget availability before proceeding
    await checkBudgetAvailable();

    // Fetch assessment to ensure it exists and is completed
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        template: true,
        scores: {
          include: {
            domainTemplate: true,
          },
        },
      },
    });

    if (!assessment || assessment.status !== "COMPLETED") {
      throw new Error("Assessment not found or not completed");
    }

    // Prepare assessment data for PDF generation
    const templateName = assessment.template?.name || "BehaviorIQ Assessment";

    const assessmentData = {
      id: assessment.id,
      subjectName: assessment.subjectName,
      startedAt: assessment.startedAt.toISOString(),
      completedAt: assessment.completedAt?.toISOString() || null,
      status: assessment.status,
      scores: assessment.scores.map((score: any) => ({
        domain:
          score.domainName ||
          score.domainTemplate?.name ||
          score.domain ||
          "Unknown",
        domainName:
          score.domainName ||
          score.domainTemplate?.name ||
          score.domain ||
          "Unknown",
        rawScore: score.rawScore,
        totalPossible: score.totalPossible,
        riskLevel: score.riskLevel,
      })),
      user: {
        name: assessment.user?.name || null,
        email: assessment.user?.email || to,
      },
    };

    // Generate PDF buffer
    const pdfBuffer = await generateAssessmentPDF(assessmentData);

    // Use SES if enabled
    const useSES = process.env.USE_SES === "true";
    if (useSES) {
      console.log("[SendPDF] Using AWS SES for PDF email delivery");
      const result = await SESEmailService.sendAssessmentReport({
        to,
        userName,
        assessmentName: templateName,
        assessmentId: assessment.id,
        pdfBuffer,
      });

      if (result.success) {
        return { success: true, message: "Email sent successfully via SES" };
      } else {
        throw new Error(result.error || "Failed to send email via SES");
      }
    }

    // Fallback to Resend for email sending
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from:
          process.env.EMAIL_FROM || "AI Diagnostic <noreply@yourdomain.com>",
        to,
        subject: `Your ${templateName} Assessment Report`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9fafb; }
                .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Your Assessment Report</h1>
                </div>
                <div class="content">
                  <h2>Hi ${userName},</h2>
                  <p>Your <strong>${assessment.template.name}</strong> assessment report is ready!</p>
                  <p>Your assessment has been completed and the detailed report is attached to this email as a PDF.</p>
                  <p>The report includes:</p>
                  <ul>
                    <li>Your scores across all assessed domains</li>
                    <li>Personalized AI-generated recommendations</li>
                    <li>Visual charts and insights</li>
                  </ul>
                  <p>Thank you for using AI Diagnostic!</p>
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    If you have any questions, feel free to reach out to our support team.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        attachments: [
          {
            filename: `assessment-report-${assessment.id.slice(0, 8)}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      // Log successful email send for budget tracking
      await logEmailSent(1, to, "PDF Report");

      return { success: true, message: "Email sent successfully via Resend" };
    }

    // Fallback if no email service is configured
    console.warn(
      "Email service not configured. Set USE_SES=true and AWS credentials, or set RESEND_API_KEY."
    );
    return {
      success: false,
      message:
        "Email service not configured. Please download the PDF directly.",
    };
  } catch (error) {
    console.error("Failed to send PDF email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
