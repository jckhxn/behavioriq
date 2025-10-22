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
  childProfileId: z.string().min(1).optional(),
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

    const { subjectName, assessmentTemplateId, childProfileId } =
      validation.data;

    if (childProfileId) {
      const childProfile = await prisma.childProfile.findFirst({
        where: {
          id: childProfileId,
          userid: user.id,
        },
        select: { id: true },
      });

      if (!childProfile) {
        return NextResponse.json(
          { error: "Child profile not found" },
          { status: 404 }
        );
      }
    }

    // Check concurrent IN_PROGRESS assessments to prevent abuse
    const inProgressCount = await prisma.assessment.count({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    const MAX_CONCURRENT = 5;
    if (inProgressCount >= MAX_CONCURRENT) {
      return NextResponse.json(
        {
          error: "TOO_MANY_IN_PROGRESS",
          message: `You have ${inProgressCount} assessments in progress. Please complete or delete some before starting a new one.`,
        },
        { status: 400 }
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

    // Create new assessment (NO CREDIT CHARGE - charge on completion instead)
    const assessment = await AssessmentAI.createNewAssessment(
      user.id,
      subjectName,
      templateId,
      childProfileId
    );

    console.log(
      `[Assessment] ✨ Created assessment ${assessment.id} - credit will be charged on completion`
    );

    return NextResponse.json({
      id: assessment.shortId, // Return shortId as the primary ID
      shortId: assessment.shortId,
      childProfileId: childProfileId ?? null,
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
    const childIdParam = searchParams.get("childId");
    const childProfileFilter =
      childIdParam && childIdParam !== "all" ? childIdParam : null;

    // Super admins can see all assessments, regular users only see their own
    const baseWhere: any =
      user.role === "SUPER_ADMIN"
        ? {}
        : {
            userId: user.id,
          };

    if (childProfileFilter) {
      baseWhere.childprofileid = childProfileFilter;
    }

    const assessments = await prisma.assessment.findMany({
      where: baseWhere,
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
        childprofileid: true,
        childProfile: {
          select: {
            id: true,
            name: true,
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
