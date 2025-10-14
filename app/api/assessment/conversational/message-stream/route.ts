import { NextRequest } from "next/server";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";

/**
 * Streaming endpoint for conversational assessment messages
 * Returns a text stream with metadata in custom headers
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    // Get session from database
    const session = await databaseSessionStore.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🛡️ RATE LIMITING: Prevent rapid-fire submissions (min 2 seconds between submissions)
    const isRateLimited = await databaseSessionStore.isRateLimited(sessionId, 2);
    if (isRateLimited) {
      console.log(`[Conversational] ⚠️ Rate limit exceeded for session ${sessionId}`);
      return new Response(
        JSON.stringify({ error: "Please wait a moment before submitting again" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🛡️ ABUSE DETECTION: Check submission count
    const submissionCount = await databaseSessionStore.getSubmissionCount(sessionId);
    if (submissionCount > 300) {
      console.log(`[Conversational] ⚠️ Suspicious activity: ${submissionCount} submissions for session ${sessionId}`);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please contact support if you need assistance." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return new Response(
        JSON.stringify({ error: "No current question available" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    // Extract answer with confidence scoring (non-streaming)
    const extraction = await ai.extractAnswer(message, currentQuestion);

    console.log(
      `[Conversational] Question ${session.currentQuestionIndex + 1}/${session.questions.length}: "${currentQuestion.text}"`
    );
    console.log(`[Conversational] User: "${message}"`);
    console.log(
      `[Conversational] Extracted: ${extraction.answer} (confidence: ${extraction.confidence})`
    );

    // 🛡️ IDEMPOTENCY: Try to record this submission
    const isNewSubmission = await databaseSessionStore.recordSubmission(
      sessionId,
      currentQuestion.id,
      session.currentQuestionIndex,
      message,
      extraction.answer,
      extraction.confidence,
      false,
      extraction.tokenUsage
    );

    if (!isNewSubmission) {
      console.log(`[Conversational] ⚠️ Duplicate submission detected - ignoring`);
      return new Response(
        JSON.stringify({
          error: "Duplicate submission",
          message: session.messages[session.messages.length - 1],
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    let shouldProgress = false;
    let clarificationNeeded = false;

    // Initialize clarification attempts counter if needed
    if (!session.clarificationAttempts) {
      session.clarificationAttempts = 0;
    }

    // ✅ STRUCTURED DECISION LOGIC
    if (extraction.answer !== null && extraction.confidence >= 0.6) {
      session.responses[currentQuestion.id] = extraction.answer;
      session.currentQuestionIndex++;
      session.clarificationAttempts = 0;
      shouldProgress = true;

      console.log(
        `[Conversational] ✅ Answer recorded: ${extraction.answer} for question ${currentQuestion.id}`
      );
      console.log(
        `[Conversational] → Moving to question ${session.currentQuestionIndex + 1}`
      );
    } else if (session.clarificationAttempts >= 3) {
      console.log(
        `[Conversational] ⚠️ Max clarification attempts reached (${session.clarificationAttempts}). Forcing progression with "no" answer.`
      );
      session.responses[currentQuestion.id] = false;
      session.currentQuestionIndex++;
      session.clarificationAttempts = 0;
      shouldProgress = true;
    } else if (extraction.confidence < 0.3) {
      session.clarificationAttempts++;
      clarificationNeeded = true;
      console.log(
        `[Conversational] ❓ Need clarification (confidence too low: ${extraction.confidence}) - Attempt ${session.clarificationAttempts}/3`
      );
    } else {
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

    // Generate streaming AI response
    const streamResult = await ai.generateStreamingResponse(
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

    // Create a transform stream to capture the full text for saving
    let fullText = "";
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const captureStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullText += text;
        controller.enqueue(chunk);
      },
      async flush() {
        // After streaming is complete, save the message and session
        const aiMessage = {
          id: messageId,
          role: "ai" as const,
          content: fullText,
          timestamp: new Date(),
          metadata: {
            questionId: currentQuestion.id,
            domainSlug: (currentQuestion as any).domainSlug || "unknown",
            confidence: extraction.confidence,
            tokenUsage: {
              promptTokens: 0, // We'll get this from the stream if available
              completionTokens: 0,
              totalTokens: 0,
            },
          },
        };

        session.messages.push(aiMessage);

        // Track token usage from extraction
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
        await databaseSessionStore.set(sessionId, session);

        console.log(`[Conversational] 💾 Saved message ${messageId} with ${fullText.length} characters`);
      },
    });

    // Convert to text stream and pipe through capture stream
    const textStream = streamResult.toTextStreamResponse();
    const body = textStream.body;

    if (!body) {
      throw new Error("Failed to create stream");
    }

    const capturedBody = body.pipeThrough(captureStream);

    // Return streaming response with metadata in headers
    return new Response(capturedBody, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Message-Id": messageId,
        "X-Is-Complete": session.isComplete ? "true" : "false",
        "X-Progress-Answered": Object.keys(session.responses).length.toString(),
        "X-Progress-Total": session.questions.length.toString(),
        "X-Should-Progress": shouldProgress ? "true" : "false",
        "X-Clarification-Needed": clarificationNeeded ? "true" : "false",
        "X-Extracted-Answer": extraction.answer !== null ? extraction.answer.toString() : "null",
        "X-Confidence": extraction.confidence.toString(),
      },
    });
  } catch (error) {
    console.error("Error processing conversational message:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
