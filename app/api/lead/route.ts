import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SESEmailService } from "@/lib/email/ses-email-service";

interface LeadPayload {
  email: string;
  consentMarketing?: boolean;
  sessionId?: string;
  trialId?: string;
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
    const { email, consentMarketing = false, sessionId } = (await request.json()) as LeadPayload;

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
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const existing = await prisma.lead.findFirst({
      where: {
        sessionId,
        email,
      },
    });

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
    const trial = await prisma.assessmentTrial.findFirst({
      where: { sessionId },
    });

    if (trial?.scoreSnapshot && process.env.SES_FROM_EMAIL) {
      const snapshot = trial.scoreSnapshot as any;
      const elevatedDomains = (snapshot.domains || [])
        .filter((domain: any) => domain.level === "elevated")
        .map((domain: any) => domain.domain);

      const summaryLine = elevatedDomains.length
        ? `${elevatedDomains.length} elevated indicator${elevatedDomains.length > 1 ? "s" : ""} observed${
            elevatedDomains.length ? ` in ${elevatedDomains.join(", ")}` : ""
          }.`
        : "No elevated indicators observed.";

      await SESEmailService.sendEmail({
        to: email,
        subject: "Your behavior snapshot results",
        html: `
          <h1>Your Snapshot + What It Means</h1>
          <p>${summaryLine}</p>
          <p>${snapshot.recommendationPreview}</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://"}">Unlock Full Report — $97 (Instant PDF)</a></p>
        `,
        emailType: "MARKETING",
      }).catch((error) => {
        console.error("[lead] email send failed", error);
      });
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
