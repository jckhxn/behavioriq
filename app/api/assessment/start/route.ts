import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";

interface StartAssessmentPayload {
  sessionId: string;
  templateId?: string;
  anonymous: boolean;
  refCode?: string; // Optional affiliate refCode passed from client as fallback to cookie
}

/**
 * POST /api/assessment/start
 * Starts a new trial or full assessment
 * For anonymous users: creates Assessment with mode=TRIAL, no userId, linked by sessionId
 * For logged-in users: creates Assessment with mode=TRIAL, userId set, sessionId optional
 * Captures affiliate refCode from biq_ref cookie if present
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StartAssessmentPayload;
    const { sessionId, templateId, anonymous } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let user = null;

    // Check if user is logged in
    if (!anonymous) {
      user = await getCurrentUserWithRole();
      if (user) {
        userId = user.id;
      }
    }

    // Get affiliate refCode from multiple sources (in priority order):
    // 1. From request body (passed explicitly by client)
    // 2. From biq_ref cookie (set by middleware or trial/start API)
    const cookieStore = await cookies();
    const cookieRefCode = cookieStore.get("biq_ref")?.value || null;
    const requestRefCode = body.refCode || null;

    const affiliateRefCode = requestRefCode || cookieRefCode;

    if (affiliateRefCode) {
      console.log(`[assessment/start] ✅ Found affiliate refCode: ${affiliateRefCode} (${requestRefCode ? 'from request' : 'from cookie'})`);
    } else {
      console.log(`[assessment/start] ⚠️ No affiliate refCode found (no request refCode, no cookie)`);
    }

    // Get the assessment template (default to global regular assessment if not specified)
    let template = null;
    if (templateId) {
      template = await prisma.assessmentTemplate.findUnique({
        where: { id: templateId },
        include: {
          domains: {
            include: {
              domainTemplate: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
    } else {
      // Get global regular assessment from platform settings
      // Both trial and full assessments use the same template
      // The difference is:
      // - TRIAL mode: filters to show only questions marked isTrial=true
      // - FULL mode: shows all questions (both trial and full)
      const platformSettings = await prisma.platformSettings.findFirst({
        include: {
          globalRegularAssessment: {
            include: {
              domains: {
                include: {
                  domainTemplate: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
      template = platformSettings?.globalRegularAssessment;
    }

    if (!template) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Create the assessment record with affiliate refCode if present
    const assessment = await prisma.assessment.create({
      data: {
        ...(userId && { userId }),
        subjectName: "Trial Assessment",
        mode: "TRIAL",
        sessionId: sessionId, // Always set sessionId for trial linking to SnapshotSession
        assessmentTemplateId: template.id,
        status: "IN_PROGRESS",
        ...(affiliateRefCode && { affiliateRefCode }), // Store refCode for later attribution
      },
    });

    if (affiliateRefCode) {
      console.log(`[AssessmentStart] ✅ Assessment created with affiliate refCode: ${affiliateRefCode}`);
    }

    return NextResponse.json({ assessmentId: assessment.id });
  } catch (error) {
    console.error("[assessment/start] failed", error);
    return NextResponse.json(
      { error: "Failed to start assessment" },
      { status: 500 }
    );
  }
}
