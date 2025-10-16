import { NextRequest, NextResponse } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    // Get session from database
    let session = await databaseSessionStore.get(sessionId);
    if (!session) {
      session = sessionStore.get(sessionId);
    }
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isTrialSession = session.isTrial;

    // 🛡️ RATE LIMITING: Prevent rapid-fire submissions (min 2 seconds between submissions)
    if (!isTrialSession) {
      const isRateLimited = await databaseSessionStore.isRateLimited(sessionId, 2);
      if (isRateLimited) {
        console.log(`[Conversational] ⚠️ Rate limit exceeded for session ${sessionId}`);
        return NextResponse.json(
          { error: "Please wait a moment before submitting again" },
          { status: 429 }
        );
      }

      // 🛡️ ABUSE DETECTION: Check submission count
      const submissionCount = await databaseSessionStore.getSubmissionCount(sessionId);
      if (submissionCount > 300) {
        // 300 submissions should be enough for 94 questions even with clarifications
        console.log(`[Conversational] ⚠️ Suspicious activity: ${submissionCount} submissions for session ${sessionId}`);
        return NextResponse.json(
          { error: "Too many submissions. Please contact support if you need assistance." },
          { status: 429 }
        );
      }
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "No current question available" },
        { status: 400 }
      );
    }

    const ai = ConversationalAIFactory.create(session.isTrial);

    // Add user message to session
    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    // Extract answer with confidence scoring
    const extraction = await ai.extractAnswer(message, currentQuestion);

    console.log(
      `[Conversational] Question ${session.currentQuestionIndex + 1}/${session.questions.length}: "${currentQuestion.text}"`
    );
    console.log(`[Conversational] User: "${message}"`);
    console.log(
      `[Conversational] Extracted: ${extraction.answer} (confidence: ${extraction.confidence})`
    );

    // 🛡️ IDEMPOTENCY: Try to record this submission
    // If this exact submission already exists, recordSubmission returns false
    const isNewSubmission = isTrialSession
      ? true
      : await databaseSessionStore.recordSubmission(
          sessionId,
          currentQuestion.id,
          session.currentQuestionIndex,
          message,
          extraction.answer,
          extraction.confidence,
          false, // Will update this below if answer is recorded
          extraction.tokenUsage
        );

    if (!isTrialSession && !isNewSubmission) {
      console.log(`[Conversational] ⚠️ Duplicate submission detected - ignoring`);
      // Return the current state without making any changes
      return NextResponse.json({
        message: session.messages[session.messages.length - 1],
        isComplete: session.isComplete,
        progress: {
          answered: Object.keys(session.responses).length,
          total: session.questions.length,
          currentIndex: session.currentQuestionIndex,
          percentage:
            (Object.keys(session.responses).length / session.questions.length) * 100,
        },
        extraction: {
          answer: extraction.answer,
          confidence: extraction.confidence,
          shouldProgress: false,
          clarificationNeeded: true,
        },
        tokenUsage: {
          session: session.totalTokenUsage,
          lastMessage: null,
          extraction: null,
        },
        isDuplicate: true,
      });
    }

    let shouldProgress = false;
    let clarificationNeeded = false;

    // Initialize clarification attempts counter if needed
    if (!session.clarificationAttempts) {
      session.clarificationAttempts = 0;
    }

    // ✅ STRUCTURED DECISION LOGIC (like regular assessment)
    if (extraction.answer !== null && extraction.confidence >= 0.6) {
      // High confidence - record answer and progress
      session.responses[currentQuestion.id] = extraction.answer;
      session.currentQuestionIndex++;
      session.clarificationAttempts = 0; // Reset counter for next question
      shouldProgress = true;

      console.log(
        `[Conversational] ✅ Answer recorded: ${extraction.answer} for question ${currentQuestion.id}`
      );
      console.log(
        `[Conversational] → Moving to question ${session.currentQuestionIndex + 1}`
      );
    } else if (session.clarificationAttempts >= 3) {
      // Too many clarification attempts - force progression with "no" (conservative approach)
      console.log(
        `[Conversational] ⚠️ Max clarification attempts reached (${session.clarificationAttempts}). Forcing progression with "no" answer.`
      );
      session.responses[currentQuestion.id] = false; // Default to "no" when unclear
      session.currentQuestionIndex++;
      session.clarificationAttempts = 0; // Reset counter
      shouldProgress = true;
    } else if (extraction.confidence < 0.3) {
      // Very unclear - ask for clarification
      session.clarificationAttempts++;
      clarificationNeeded = true;
      console.log(
        `[Conversational] ❓ Need clarification (confidence too low: ${extraction.confidence}) - Attempt ${session.clarificationAttempts}/3`
      );
    } else {
      // Medium confidence - ask follow-up to confirm
      session.clarificationAttempts++;
      clarificationNeeded = true;
      console.log(
        `[Conversational] 🤔 Need confirmation (confidence: ${extraction.confidence}) - Attempt ${session.clarificationAttempts}/3`
      );
    }

    // Check if assessment is complete
    if (session.currentQuestionIndex >= session.questions.length) {
      session.isComplete = true;
      console.log(`[Conversational] ✅ Assessment complete!`);
    }

    // Get next question if progressing
    const nextQuestion =
      shouldProgress && !session.isComplete
        ? session.questions[session.currentQuestionIndex]
        : null;

    // Generate appropriate AI response based on progression state
    const aiMessage = await ai.generateResponse(
      session,
      message,
      currentQuestion,
      {
        shouldProgress,
        clarificationNeeded,
        extractedAnswer: extraction.answer,
        confidence: extraction.confidence,
        nextQuestion,
      }
    );

    session.messages.push(aiMessage);

    // Track cumulative token usage
    if (aiMessage.metadata?.tokenUsage) {
      if (!session.totalTokenUsage) {
        session.totalTokenUsage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
      }
      session.totalTokenUsage.promptTokens += aiMessage.metadata.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens += aiMessage.metadata.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens += aiMessage.metadata.tokenUsage.totalTokens;
    }

    // Add token usage from extraction if available
    if (extraction.tokenUsage) {
      if (!session.totalTokenUsage) {
        session.totalTokenUsage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };
      }
      session.totalTokenUsage.promptTokens += extraction.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens += extraction.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens += extraction.tokenUsage.totalTokens;
    }

    // Save session to database
    if (isTrialSession) {
      sessionStore.set(sessionId, session);
    } else {
      await databaseSessionStore.set(sessionId, session);
    }

    return NextResponse.json({
      message: aiMessage,
      isComplete: session.isComplete,
      progress: {
        answered: Object.keys(session.responses).length,
        total: session.questions.length,
        currentIndex: session.currentQuestionIndex,
        percentage:
          (Object.keys(session.responses).length / session.questions.length) *
          100,
      },
      extraction: {
        answer: extraction.answer,
        confidence: extraction.confidence,
        shouldProgress,
        clarificationNeeded,
      },
      tokenUsage: {
        session: session.totalTokenUsage,
        lastMessage: aiMessage.metadata?.tokenUsage,
        extraction: extraction.tokenUsage,
      },
    });
  } catch (error) {
    console.error("Error processing conversational message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
