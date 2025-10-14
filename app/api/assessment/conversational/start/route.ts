import { NextRequest, NextResponse } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { prisma } from "@/lib/db/prisma";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const { isTrial, assessmentTemplateId, subjectName, assessmentId } = await request.json();

    // Get authenticated user if available
    const user = await getCurrentUserWithRole();
    const userId = user?.id;

    // 🔄 SESSION RESUMPTION: Check if an existing session exists for this assessment
    if (assessmentId) {
      const existingSession = await databaseSessionStore.getByAssessmentId(assessmentId);

      if (existingSession && !existingSession.isComplete) {
        console.log(`[Conversational] 🔄 Resuming existing session ${existingSession.id} for assessment ${assessmentId}`);
        console.log(`[Conversational] Progress: ${Object.keys(existingSession.responses).length}/${existingSession.questions.length} questions answered`);

        // Return existing session - user can continue from where they left off
        return NextResponse.json({
          sessionId: existingSession.id,
          message: existingSession.messages[existingSession.messages.length - 1], // Last message
          assessmentId: assessmentId,
          tokenUsage: {
            session: existingSession.totalTokenUsage,
            initialMessage: null,
          },
          isResumed: true,
          progress: {
            answered: Object.keys(existingSession.responses).length,
            total: existingSession.questions.length,
            currentIndex: existingSession.currentQuestionIndex,
          },
        });
      }
    }

    let assessmentTemplate: any;
    let actualAssessmentId: string | null = assessmentId || null;

    if (isTrial) {
      // Handle trial assessment (anonymous users)
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

      // Check if trial assessments are enabled
      if (platformSettings && !platformSettings.trialAssessmentsEnabled) {
        return NextResponse.json(
          { error: "Trial assessments are currently disabled" },
          { status: 403 }
        );
      }

      if (!platformSettings?.globalTrialAssessment) {
        return NextResponse.json(
          { error: "No trial assessment is currently configured" },
          { status: 404 }
        );
      }

      assessmentTemplate = platformSettings.globalTrialAssessment;

      if (!assessmentTemplate.isActive) {
        return NextResponse.json(
          { error: "Trial assessment is currently inactive" },
          { status: 403 }
        );
      }
    } else {
      // Handle regular assessment (authenticated users)
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      if (!assessmentTemplateId) {
        return NextResponse.json(
          { error: "Assessment template ID is required" },
          { status: 400 }
        );
      }

      if (!subjectName) {
        return NextResponse.json(
          { error: "Subject name is required" },
          { status: 400 }
        );
      }

      // Get the assessment template
      assessmentTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: assessmentTemplateId },
        include: {
          domains: {
            include: {
              domainTemplate: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!assessmentTemplate) {
        return NextResponse.json(
          { error: "Assessment template not found" },
          { status: 404 }
        );
      }

      if (!assessmentTemplate.isActive) {
        return NextResponse.json(
          { error: "Assessment template is not active" },
          { status: 403 }
        );
      }

      // Check if we're resuming an existing assessment
      if (assessmentId) {
        // Resuming - verify the assessment exists and belongs to the user
        const existingAssessment = await prisma.assessment.findUnique({
          where: { id: assessmentId },
          select: { id: true, userId: true, status: true, isConversational: true },
        });

        if (!existingAssessment) {
          return NextResponse.json(
            { error: "Assessment not found" },
            { status: 404 }
          );
        }

        if (existingAssessment.userId !== user.id) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }

        if (existingAssessment.status === "COMPLETED") {
          return NextResponse.json(
            { error: "Assessment is already completed" },
            { status: 400 }
          );
        }

        // Reuse the existing assessment
        actualAssessmentId = assessmentId;
        console.log(`[Conversational] ♻️ Reusing existing assessment ${assessmentId} for resume`);
      } else {
        // Creating new assessment
        const assessment = await prisma.assessment.create({
          data: {
            userId: user.id,
            subjectName: subjectName,
            status: "IN_PROGRESS",
            startedAt: new Date(),
            isConversational: true,
            hasEnhancedReport: false,
            currentDomain: null,
            currentQuestionOrder: null,
          },
        });

        actualAssessmentId = assessment.id;
        console.log(`[Conversational] ✨ Created new assessment ${actualAssessmentId}`);
      }
    }

    // Flatten all questions from all domains
    const allQuestions = assessmentTemplate.domains.flatMap(
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
      assessmentId: actualAssessmentId || assessmentTemplate.id, // Use actual assessment ID for real assessments
      userId: userId,
      currentQuestionIndex: 0,
      responses: {},
      messages: [],
      isComplete: false,
      isTrial: isTrial || false,
      questions: allQuestions,
      totalTokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
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

    // Track initial message token usage
    if (initialMessage.metadata?.tokenUsage) {
      session.totalTokenUsage.promptTokens += initialMessage.metadata.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens += initialMessage.metadata.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens += initialMessage.metadata.tokenUsage.totalTokens;
    }

    // Store session in database
    await databaseSessionStore.set(session.id, session);

    console.log(`[Conversational] ✅ New session ${session.id} created for assessment ${actualAssessmentId}`);

    return NextResponse.json({
      sessionId: session.id,
      message: initialMessage,
      assessmentId: actualAssessmentId, // Include the actual assessment ID for client
      tokenUsage: {
        session: session.totalTokenUsage,
        initialMessage: initialMessage.metadata?.tokenUsage,
      },
      isResumed: false,
    });
  } catch (error) {
    console.error("Error starting conversational session:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
