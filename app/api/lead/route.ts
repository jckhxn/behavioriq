import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SESEmailService } from "@/lib/email/ses-email-service";

interface LeadPayload {
  email: string;
  consentMarketing?: boolean;
  sessionId?: string;
  assessmentId?: string;  // NEW: assessment ID
  trialId?: string;       // LEGACY: trial ID
}

interface LeadResponse {
  leadId: string;
  couponCode: string;
  couponExpiresAt: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, consentMarketing = false, sessionId, assessmentId, trialId } = (await request.json()) as LeadPayload;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required for trial leads" },
        { status: 400 }
      );
    }

    const session = await prisma.snapshotSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      console.error(`[lead] SnapshotSession not found for sessionId: ${sessionId}`, {
        email,
        assessmentId,
        trialId,
      });
      return NextResponse.json(
        { error: "Session not found. Please ensure assessment was started with a valid session." },
        { status: 404 }
      );
    }

    // Check for duplicate email globally (case-insensitive)
    const globalDuplicate = await prisma.lead.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (globalDuplicate) {
      console.warn(`[lead] Duplicate email attempt: ${email}`, {
        sessionId,
        existingLeadId: globalDuplicate.id,
        existingSessionId: globalDuplicate.sessionId,
      });
      return NextResponse.json(
        { error: "This email has already been used for lead capture. Please use a different email address." },
        { status: 409 } // Conflict status code
      );
    }

    // Check for duplicate within the current session (for backwards compatibility)
    const sessionDuplicate = await prisma.lead.findFirst({
      where: {
        sessionId,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    const existing = sessionDuplicate;

    const lead = existing
      ? await prisma.lead.update({
          where: { id: existing.id },
          data: { consentMarketing },
        })
      : await prisma.lead.create({
          data: {
            email,
            consentMarketing,
            sessionId,
          },
        });

    // Send snapshot summary if available
    // Try new Assessment flow first, fall back to legacy AssessmentTrial
    let trial: any = null;
    let emailSent = false;

    if (assessmentId) {
      trial = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          scores: {
            select: {
              domainName: true,
              riskLevel: true,
              rawScore: true,
            },
          },
        },
      });
    }

    if (!trial) {
      trial = await prisma.assessmentTrial.findFirst({
        where: { sessionId },
      });
    }

    // Send email if we have assessment data and SES is configured
    if (process.env.SES_FROM_EMAIL) {
      let elevatedDomains: string[] = [];
      let summaryLine = "Assessment completed. Results are ready for review.";

      if (trial?.scoreSnapshot) {
        // Legacy AssessmentTrial format with scoreSnapshot JSON
        const snapshot = trial.scoreSnapshot as any;
        elevatedDomains = (snapshot.domains || [])
          .filter((domain: any) => domain.level === "elevated")
          .map((domain: any) => domain.domain);

        summaryLine = elevatedDomains.length
          ? `${elevatedDomains.length} elevated indicator${elevatedDomains.length > 1 ? "s" : ""} observed${
              elevatedDomains.length ? ` in ${elevatedDomains.join(", ")}` : ""
            }.`
          : "No elevated indicators observed.";
      } else if (trial?.scores && Array.isArray(trial.scores)) {
        // New Assessment format with Score records
        elevatedDomains = trial.scores
          .filter((score: any) => score.riskLevel === "ELEVATED" || score.rawScore >= 70)
          .map((score: any) => score.domainName || "Unknown Domain");

        summaryLine = elevatedDomains.length
          ? `${elevatedDomains.length} elevated indicator${elevatedDomains.length > 1 ? "s" : ""} observed${
              elevatedDomains.length ? ` in ${elevatedDomains.join(", ")}` : ""
            }.`
          : "No elevated indicators observed.";
      }

      // Only send if we have results to share
      if (trial) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://behavioriq.app";

        const emailResult = await SESEmailService.sendEmail({
          to: email,
          subject: "Your behavior snapshot results",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
                  .container { max-width: 600px; margin: 0 auto; background: white; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                  .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                  .content { padding: 40px 30px; background: #ffffff; }
                  .content h2 { color: #333; font-size: 20px; margin-top: 0; }
                  .summary { background: #f0f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
                  .summary-text { font-size: 16px; color: #1e40af; font-weight: 600; margin: 0; }
                  .domains { color: #555; font-size: 14px; margin-top: 10px; }
                  .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
                  .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; background: #f8fafc; }
                  .disclaimer { font-size: 12px; color: #666; margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 4px; border-left: 4px solid #f59e0b; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📊 Your Assessment Results</h1>
                  </div>
                  <div class="content">
                    <h2>Hi there!</h2>
                    <p>Your behavior assessment has been completed and analyzed. Here's what we found:</p>

                    <div class="summary">
                      <p class="summary-text">${summaryLine}</p>
                      ${elevatedDomains.length > 0 ? `<p class="domains"><strong>Areas flagged:</strong> ${elevatedDomains.join(", ")}</p>` : ""}
                    </div>

                    <p>This snapshot provides a quick overview of your assessment results. To get:</p>
                    <ul>
                      <li>Detailed domain breakdowns</li>
                      <li>AI-powered personalized recommendations</li>
                      <li>Professional PDF report for school/clinician</li>
                      <li>Actionable next steps</li>
                    </ul>

                    <a href="${siteUrl}" class="button">View Full Results & Recommendations</a>

                    <div class="disclaimer">
                      <strong>⚠️ Disclaimer:</strong> This is a screening tool, not a diagnosis. Results should be discussed with a qualified professional. AI analysis is for guidance only.
                    </div>

                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                      Questions? Our support team is here to help!
                    </p>
                  </div>
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} BehaviorIQ. All rights reserved.</p>
                    <p style="margin-top: 10px;"><a href="${siteUrl}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • <a href="${siteUrl}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a></p>
                  </div>
                </div>
              </body>
            </html>
          `,
          emailType: "MARKETING",
        });

        if (emailResult.success) {
          console.log(`[lead] ✅ Snapshot email sent to ${email}`, {
            leadId: lead.id,
            messageId: emailResult.messageId,
            sessionId,
          });
          emailSent = true;
        } else {
          console.error(`[lead] ❌ Snapshot email failed for ${email}`, {
            leadId: lead.id,
            sessionId,
            error: emailResult.error,
          });
          // Note: We don't throw here - email failure shouldn't block lead capture
        }
      }
    }

    if (!process.env.SES_FROM_EMAIL) {
      console.warn("[lead] SES_FROM_EMAIL not configured - snapshot email not sent");
    }

    // Generate coupon expiration (48 hours from now)
    const couponExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const couponCode = process.env.STRIPE_FIRST_3_MONTHS_50_COUPON || "REFERRAL_20";

    const response: LeadResponse = {
      leadId: lead.id,
      couponCode,
      couponExpiresAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[lead] failed", error);
    return NextResponse.json({ error: "Unable to capture lead" }, { status: 500 });
  }
}
