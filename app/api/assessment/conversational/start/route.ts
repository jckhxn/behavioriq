import { NextRequest, NextResponse } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { prisma } from "@/lib/db/prisma";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { getMaxConversationalSessionsPerUser } from "@/lib/platform/settings";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";
import { getMockConversationalTrial } from "@/lib/assessment/mock-conversational-trial";

export async function POST(request: NextRequest) {
  try {
    const { isTrial, assessmentTemplateId, subjectName, assessmentId } =
      await request.json();

    // Get authenticated user if available
    const user = await getCurrentUserWithRole();
    const userId = user?.id;

    // 🔄 SESSION RESUMPTION: Check if an existing session exists for this assessment
    if (assessmentId) {
      const existingSession =
        await databaseSessionStore.getByAssessmentId(assessmentId);

      if (existingSession && !existingSession.isComplete) {
        console.log(
          `[Conversational] 🔄 Resuming existing session ${existingSession.id} for assessment ${assessmentId}`
        );
        console.log(
          `[Conversational] Progress: ${Object.keys(existingSession.responses).length}/${existingSession.questions.length} questions answered`
        );

        // Return existing session - user can continue from where they left off
        return NextResponse.json({
          sessionId: existingSession.id,
          message:
            existingSession.messages[existingSession.messages.length - 1], // Last message
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
          transactionalMessages: existingSession.messages,
          totalQuestions: existingSession.questions.length,
          sessionComplete: existingSession.isComplete,
        });
      }
    }

    let assessmentTemplate: any;
    let actualAssessmentId: string | null = assessmentId || null;
    let existingAssessment: any = null;
    let resolvedAssessmentTemplateId = assessmentTemplateId || null;
    let resolvedSubjectName = subjectName || null;

    if (!isTrial && !assessmentId && user && subjectName) {
      // Check for existing IN_PROGRESS conversational assessment for this user and subject
      const existingInProgress = await prisma.assessment.findFirst({
        where: {
          userId: user.id,
          subjectName: subjectName,
          status: "IN_PROGRESS",
          isConversational: true,
        },
        orderBy: { startedAt: "desc" },
      });

      if (existingInProgress) {
        existingAssessment = existingInProgress;
        actualAssessmentId = existingAssessment.id;
        resolvedAssessmentTemplateId =
          resolvedAssessmentTemplateId ||
          existingAssessment.assessmentTemplateId ||
          null;
        resolvedSubjectName =
          resolvedSubjectName || existingAssessment.subjectName || null;
        if (
          !existingAssessment.assessmentTemplateId &&
          resolvedAssessmentTemplateId
        ) {
          existingAssessment = await prisma.assessment.update({
            where: { id: existingAssessment.id },
            data: { assessmentTemplateId: resolvedAssessmentTemplateId },
          });
        }
        console.log(
          `[Conversational] ♻️ Found existing IN_PROGRESS assessment ${actualAssessmentId} for user ${user.id} and subject ${subjectName}`
        );
      } else {
        // Reactivate the most recent abandoned conversational assessment instead of creating a duplicate
        const abandonedAssessment = await prisma.assessment.findFirst({
          where: {
            userId: user.id,
            subjectName: subjectName,
            status: "ABANDONED",
            isConversational: true,
          },
          orderBy: { startedAt: "desc" },
        });

        if (abandonedAssessment) {
          existingAssessment = await prisma.assessment.update({
            where: { id: abandonedAssessment.id },
            data: {
              status: "IN_PROGRESS",
              startedAt: new Date(),
              completedAt: null,
              ...(resolvedAssessmentTemplateId
                ? { assessmentTemplateId: resolvedAssessmentTemplateId }
                : {}),
            },
          });
          actualAssessmentId = existingAssessment.id;
          resolvedAssessmentTemplateId =
            resolvedAssessmentTemplateId ||
            existingAssessment.assessmentTemplateId ||
            null;
          resolvedSubjectName =
            resolvedSubjectName || existingAssessment.subjectName || null;
          console.log(
            `[Conversational] 🔁 Reactivated abandoned assessment ${actualAssessmentId} for user ${user.id} and subject ${existingAssessment.subjectName}`
          );
        }
      }
    }

    if (isTrial) {
      let useMockTrial = false;
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

      const trialAssessmentsEnabled =
        platformSettings?.trialAssessmentsEnabled ?? true;
      const trialTemplate = platformSettings?.globalTrialAssessment;

      if (
        !trialAssessmentsEnabled ||
        !trialTemplate ||
        trialTemplate.isActive === false
      ) {
        console.warn(
          "[Conversational] No active trial assessment configured – using mock template"
        );
        assessmentTemplate = getMockConversationalTrial();
        useMockTrial = true;
      } else {
        assessmentTemplate = trialTemplate;
      }

      if (useMockTrial) {
        console.log(
          "[Conversational] Mock conversational trial template loaded for anonymous user"
        );
      }
    } else {
      // Handle regular assessment (authenticated users)
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Check if we're resuming an existing assessment
      if (actualAssessmentId) {
        // Resuming or reusing existing assessment
        let assessmentToResume = await prisma.assessment.findUnique({
          where: { id: actualAssessmentId },
          select: {
            id: true,
            userId: true,
            status: true,
            isConversational: true,
            subjectName: true,
            assessmentTemplateId: true,
          },
        });

        if (!assessmentToResume) {
          return NextResponse.json(
            { error: "Assessment not found" },
            { status: 404 }
          );
        }

        if (assessmentToResume.userId !== user.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (assessmentToResume.status === "ABANDONED") {
          assessmentToResume = await prisma.assessment.update({
            where: { id: actualAssessmentId },
            data: {
              status: "IN_PROGRESS",
              startedAt: new Date(),
              completedAt: null,
              ...(resolvedAssessmentTemplateId
                ? { assessmentTemplateId: resolvedAssessmentTemplateId }
                : {}),
            },
            select: {
              id: true,
              userId: true,
              status: true,
              isConversational: true,
              subjectName: true,
              assessmentTemplateId: true,
            },
          });
        }

        resolvedAssessmentTemplateId =
          resolvedAssessmentTemplateId ||
          assessmentToResume.assessmentTemplateId ||
          null;
        resolvedSubjectName =
          resolvedSubjectName || assessmentToResume.subjectName || null;
        if (
          !assessmentToResume.assessmentTemplateId &&
          resolvedAssessmentTemplateId
        ) {
          await prisma.assessment.update({
            where: { id: actualAssessmentId },
            data: { assessmentTemplateId: resolvedAssessmentTemplateId },
          });
        }

        if (assessmentToResume.status === "COMPLETED") {
          return NextResponse.json(
            { error: "Assessment is already completed" },
            { status: 400 }
          );
        }

        // Reuse the existing assessment
        actualAssessmentId = assessmentToResume.id;
        console.log(
          `[Conversational] ♻️ Reusing existing assessment ${actualAssessmentId} for resume or prevention of duplicate`
        );
      } else {
        if (!resolvedAssessmentTemplateId) {
          return NextResponse.json(
            { error: "Assessment template ID is required" },
            { status: 400 }
          );
        }

        if (!resolvedSubjectName) {
          return NextResponse.json(
            { error: "Subject name is required" },
            { status: 400 }
          );
        }

        const maxConversationalSessions =
          await getMaxConversationalSessionsPerUser();
        if (maxConversationalSessions >= 0) {
          const completedConversationalAssessments =
            await prisma.assessment.count({
              where: {
                userId: user.id,
                isConversational: true,
                status: "COMPLETED",
              },
            });

          if (completedConversationalAssessments >= maxConversationalSessions) {
            return NextResponse.json(
              {
                error: `You have reached the maximum of ${maxConversationalSessions} conversational assessments. Please contact support to request additional access.`,
                currentCount: completedConversationalAssessments,
                maxAllowed: maxConversationalSessions,
              },
              { status: 403 }
            );
          }
        }

        // Creating new assessment
        const assessment = await prisma.assessment.create({
          data: {
            userId: user.id,
            subjectName: resolvedSubjectName,
            status: "IN_PROGRESS",
            startedAt: new Date(),
            isConversational: true,
            hasEnhancedReport: false,
            currentDomain: null,
            currentQuestionOrder: null,
            assessmentTemplateId: resolvedAssessmentTemplateId,
          },
        });

        actualAssessmentId = assessment.id;
        console.log(
          `[Conversational] ✨ Created new assessment ${actualAssessmentId}`
        );
      }

      if (!resolvedAssessmentTemplateId) {
        return NextResponse.json(
          { error: "Assessment template ID is required" },
          { status: 400 }
        );
      }

      if (!resolvedSubjectName) {
        return NextResponse.json(
          { error: "Subject name is required" },
          { status: 400 }
        );
      }

      // Get the assessment template
      assessmentTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: resolvedAssessmentTemplateId },
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
      if (!session.totalTokenUsage) {
        session.totalTokenUsage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
      }
      session.totalTokenUsage.promptTokens +=
        initialMessage.metadata.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens +=
        initialMessage.metadata.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens +=
        initialMessage.metadata.tokenUsage.totalTokens;
    }

    // Persist session (database for paid assessments, in-memory for trial)
    if (session.isTrial) {
      sessionStore.set(session.id, session);
    } else {
      await databaseSessionStore.set(session.id, session);
    }

    console.log(
      `[Conversational] ✅ New session ${session.id} created for assessment ${actualAssessmentId}`
    );

    return NextResponse.json({
      sessionId: session.id,
      message: initialMessage,
      assessmentId: actualAssessmentId, // Include the actual assessment ID for client
      tokenUsage: {
        session: session.totalTokenUsage,
        initialMessage: initialMessage.metadata?.tokenUsage,
      },
      isResumed: false,
      progress: {
        answered: 0,
        total: allQuestions.length,
        currentIndex: 0,
      },
      sessionComplete: session.isComplete,
      totalQuestions: allQuestions.length,
    });
  } catch (error) {
    console.error("Error starting conversational session:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
