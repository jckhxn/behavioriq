import { NextRequest, NextResponse } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { prisma } from "@/lib/db/prisma";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const { isTrial } = await request.json();

    // Get authenticated user if available
    const user = await getCurrentUserWithRole();
    const userId = user?.id;

    // Get platform settings to find the global trial assessment
    const platformSettings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
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

    // Validate trial assessment is available
    if (!platformSettings?.globalTrialAssessment) {
      return NextResponse.json(
        { error: "No trial assessment is currently configured" },
        { status: 404 }
      );
    }

    const trialAssessment = platformSettings.globalTrialAssessment;

    if (!trialAssessment.isActive) {
      return NextResponse.json(
        { error: "Trial assessment is currently inactive" },
        { status: 403 }
      );
    }

    // Flatten all questions from all domains - same as regular trial
    const allQuestions = trialAssessment.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          text: question.text,
          order: domainIndex * 100 + questionIndex,
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          weight: question.weight || 1,
          required: question.required !== false,
        }));
      }
    );

    // Create new conversational session
    const session: ConversationalSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assessmentId: trialAssessment.id,
      userId: userId, // Set from auth session
      currentQuestionIndex: 0,
      responses: {},
      messages: [],
      isComplete: false,
      isTrial: isTrial || false,
      questions: allQuestions,
    };

    // Get AI provider
    const aiProvider = ConversationalAIFactory.create(isTrial || false);

    // Generate initial AI greeting
    const initialMessage = await aiProvider.generateResponse(
      session,
      "", // Empty user message for greeting
      allQuestions[0]
    );
    session.messages.push(initialMessage);

    // Store session
    sessionStore.set(session.id, session);

    return NextResponse.json({
      sessionId: session.id,
      message: initialMessage,
    });
  } catch (error) {
    console.error("Error starting conversational session:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
