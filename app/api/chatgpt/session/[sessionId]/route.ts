import { NextRequest, NextResponse } from "next/server";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";

/**
 * GET /api/chatgpt/session/[sessionId]
 *
 * Retrieve session state for ChatGPT widgets
 * Supports both trial (in-memory) and full assessment (database) sessions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log("[ChatGPT Session] Retrieving session:", sessionId);

    // Try database first (for full assessments)
    let session = await databaseSessionStore.get(sessionId);

    // If not found in database, try in-memory store (for trials)
    if (!session) {
      session = sessionStore.get(sessionId);
    }

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get current question
    const currentQuestion =
      session.currentQuestionIndex < session.questions.length
        ? session.questions[session.currentQuestionIndex]
        : null;

    // Calculate progress
    const answeredCount = Object.keys(session.responses).length;
    const totalQuestions = session.questions.length;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    return NextResponse.json({
      sessionId: session.id,
      assessmentId: session.assessmentId,
      currentQuestion,
      currentQuestionIndex: session.currentQuestionIndex,
      answeredCount,
      totalQuestions,
      progress: Math.round(progress),
      isComplete: session.isComplete,
      isTrial: session.isTrial,
      messages: session.messages,
    });
  } catch (error) {
    console.error("[ChatGPT Session] Error retrieving session:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve session",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
