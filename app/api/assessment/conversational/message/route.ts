import { NextRequest, NextResponse } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
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

    let shouldProgress = false;
    let clarificationNeeded = false;

    // ✅ STRUCTURED DECISION LOGIC (like regular assessment)
    if (extraction.answer !== null && extraction.confidence >= 0.6) {
      // High confidence - record answer and progress
      session.responses[currentQuestion.id] = extraction.answer;
      session.currentQuestionIndex++;
      shouldProgress = true;

      console.log(
        `[Conversational] ✅ Answer recorded: ${extraction.answer} for question ${currentQuestion.id}`
      );
      console.log(
        `[Conversational] → Moving to question ${session.currentQuestionIndex + 1}`
      );
    } else if (extraction.confidence < 0.3) {
      // Very unclear - ask for clarification
      clarificationNeeded = true;
      console.log(
        `[Conversational] ❓ Need clarification (confidence too low: ${extraction.confidence})`
      );
    } else {
      // Medium confidence - ask follow-up to confirm
      clarificationNeeded = true;
      console.log(
        `[Conversational] 🤔 Need confirmation (confidence: ${extraction.confidence})`
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
    sessionStore.set(sessionId, session);

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
    });
  } catch (error) {
    console.error("Error processing conversational message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
