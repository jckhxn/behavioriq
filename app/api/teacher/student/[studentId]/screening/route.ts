import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { isFeatureEnabled } from "@/lib/district/feature-flags";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher access
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
    }

    // Check feature flags
    const showScores = await isFeatureEnabled("teacher_numeric_scores", {
      userId: user.id,
      role: "TEACHER",
    });

    const showAIRecommendations = await isFeatureEnabled("ai_recommendations", {
      userId: user.id,
      role: "TEACHER",
    });

    // Get assessment with domain indicators
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        studentAssessment: {
          studentId: studentId,
          student: {
            classrooms: {
              some: {
                classroom: {
                  teachers: {
                    some: {
                      teacherId: teacher.id,
                    },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        studentAssessment: {
          include: {
            student: {
              select: {
                anonymousId: true,
                firstName: true,
                lastName: true,
                gradeLevel: true,
              },
            },
          },
        },
        domainIndicators: {
          orderBy: {
            domainName: "asc",
          },
        },
        recommendations: showAIRecommendations
          ? {
              orderBy: {
                createdAt: "desc",
              },
              take: 5,
            }
          : false,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        status: assessment.status,
        completedAt: assessment.completedAt,
        student: assessment.studentAssessment?.student,
        domainIndicators: assessment.domainIndicators.map((d) => ({
          domainName: d.domainName,
          flagged: d.flagged,
          ...(showScores && {
            rawScore: d.rawScore,
            percentile: d.percentile,
          }),
        })),
        ...(showAIRecommendations && {
          recommendations: assessment.recommendations,
        }),
      },
      featureFlags: {
        showScores,
        showAIRecommendations,
      },
    });
  } catch (error) {
    console.error("Screening summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch screening summary" },
      { status: 500 }
    );
  }
}
