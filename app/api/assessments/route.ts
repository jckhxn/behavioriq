import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { AssessmentAI } from "@/lib/ai/AssessmentAI";
import { getDynamicDomainNames } from "@/lib/utils/domainNames";
import { assessmentCreditsService } from "@/lib/services/assessment-credits-service";
import { z } from "zod";

const createAssessmentSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
  assessmentTemplateId: z.string().optional(), // Optional, will use active template if not provided
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { subjectName, assessmentTemplateId } = validation.data;

    // Check if user has available assessment credits
    const credits = await assessmentCreditsService.checkUserCredits(user.id);

    if (!credits.hasCredits) {
      return NextResponse.json(
        {
          error: "NO_CREDITS",
          message: "No assessment credits available",
          credits: credits,
        },
        { status: 403 }
      );
    }

    // If no template specified, get the active template
    let templateId = assessmentTemplateId;
    if (!templateId) {
      const activeTemplate = await prisma.assessmentTemplate.findFirst({
        where: { isActive: true },
        select: { id: true },
      });

      if (!activeTemplate) {
        return NextResponse.json(
          { error: "No active assessment template available" },
          { status: 400 }
        );
      }

      templateId = activeTemplate.id;
    }

    // Create new assessment
    const assessment = await AssessmentAI.createNewAssessment(
      user.id,
      subjectName,
      templateId
    );

    // Use one credit (decrement available credits)
    await assessmentCreditsService.useCredit(user.id);

    return NextResponse.json({
      id: assessment.shortId, // Return shortId as the primary ID
      shortId: assessment.shortId,
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Create assessment error:", error);

    // Handle specific credit errors
    if (
      error instanceof Error &&
      error.message === "No assessment credits available"
    ) {
      return NextResponse.json(
        {
          error: "NO_CREDITS",
          message: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Super admins can see all assessments, regular users only see their own
    const whereClause =
      user.role === "SUPER_ADMIN"
        ? {} // No filter - show all assessments
        : { userId: user.id }; // Filter to user's assessments only

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        startedAt: true,
        completedAt: true,
        isConversational: true,
        hasEnhancedReport: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scores: {
          select: {
            domain: true,
            domainName: true,
            rawScore: true,
            totalPossible: true,
            riskLevel: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" }, // Latest scores first
        },
        _count: {
          select: {
            messages: true,
            scores: true,
          },
        },
      },
    });

    // Get dynamic domain names from assessment configurations
    const domainNames = await getDynamicDomainNames();

    return NextResponse.json(
      assessments.map((assessment) => ({
        ...assessment,
        id: assessment.shortId || assessment.id, // Use shortId as primary ID, fallback to UUID
        scores: assessment.scores.map((score) => ({
          ...score,
          domainDisplayName:
            score.domainName || // Use stored domainName if available
            (score.domain ? domainNames[score.domain] : undefined) || // Look up by domain enum
            score.domain || // Fallback to domain enum
            "Unknown Domain",
        })),
      }))
    );
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}
