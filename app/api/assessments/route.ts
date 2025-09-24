import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { AssessmentAI } from "@/lib/ai/AssessmentAI";
import { getDynamicDomainNames } from "@/lib/utils/domainNames";
import { z } from "zod";

const createAssessmentSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    const { subjectName } = validation.data;

    // Create new assessment
    const assessment = await AssessmentAI.createNewAssessment(
      session.user.id,
      subjectName
    );

    return NextResponse.json({
      id: assessment.shortId, // Return shortId as the primary ID
      shortId: assessment.shortId,
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Create assessment error:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const assessments = await prisma.assessment.findMany({
      where: { userId: session.user.id },
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
        scores: {
          select: {
            domain: true,
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
          domainDisplayName: domainNames[score.domain] || score.domain,
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
