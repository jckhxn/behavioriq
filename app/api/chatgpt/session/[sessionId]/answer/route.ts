import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chatgpt/session/[sessionId]/answer
 *
 * Submit an answer for conversational assessment
 * Adapter that calls existing conversational/message API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { message, questionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    console.log("[ChatGPT Session] Submitting answer:", {
      sessionId,
      questionId,
      message: message.substring(0, 50),
    });

    // Call existing conversational/message API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/assessment/conversational/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass auth headers if available
        ...(request.headers.get("Authorization")
          ? { Authorization: request.headers.get("Authorization")! }
          : {}),
      },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to submit answer");
    }

    const data = await response.json();

    // Transform response for ChatGPT widget
    return NextResponse.json({
      success: true,
      sessionId,
      aiResponse: data.response,
      nextQuestion: data.nextQuestion || null,
      progress: data.progress || {
        answered: data.answeredCount || 0,
        total: data.totalQuestions || 0,
        currentIndex: data.currentQuestionIndex || 0,
      },
      isComplete: data.sessionComplete || false,
      messages: data.transactionalMessages || data.messages || [],
    });
  } catch (error) {
    console.error("[ChatGPT Session] Error submitting answer:", error);
    return NextResponse.json(
      {
        error: "Failed to submit answer",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
