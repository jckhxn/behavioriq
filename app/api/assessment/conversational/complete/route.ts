import { NextRequest, NextResponse } from "next/server";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { AssessmentDomain } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.isComplete) {
      return NextResponse.json(
        { error: "Assessment not complete" },
        { status: 400 }
      );
    }

    // Convert responses to the format expected by the scoring system
    const responses = Object.entries(session.responses).map(
      ([questionId, answer]) => ({
        questionId,
        response: answer,
      })
    );

    // Calculate scores by domain (same logic as regular trial assessment)
    const scoresByDomain: Record<string, { score: number; total: number }> = {};

    session.questions.forEach((question) => {
      const domainSlug = question.domainSlug || "unknown";
      const response = session.responses[question.id];

      if (!scoresByDomain[domainSlug]) {
        scoresByDomain[domainSlug] = { score: 0, total: 0 };
      }

      if (response !== undefined) {
        const weight = question.weight || 1;
        scoresByDomain[domainSlug].score += response ? weight : 0;
        scoresByDomain[domainSlug].total += weight;
      }
    });

    // Convert to percentage scores for summary
    const scores: Record<string, number> = {};
    Object.entries(scoresByDomain).forEach(([domain, data]) => {
      scores[domain] = data.total > 0 ? (data.score / data.total) * 100 : 0;
    });

    // Generate kid-friendly summary using CONVERSATIONAL_ANALYSIS prompt
    const aiProvider = ConversationalAIFactory.create(session.isTrial || false);
    let summary = "";

    try {
      if (aiProvider.generateSummary) {
        summary = await aiProvider.generateSummary(session, scores);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      summary =
        "Thanks for completing the assessment! Your results show areas where you're doing well and some that might need a little extra attention. 😊";
    }

    // Clean up session
    sessionStore.delete(sessionId);

    return NextResponse.json({
      responses,
      scores,
      scoresByDomain,
      summary, // Kid-friendly markdown-formatted results
      totalQuestions: session.questions.length,
      answeredQuestions: Object.keys(session.responses).length,
    });
  } catch (error) {
    console.error("Error completing conversational assessment:", error);
    return NextResponse.json(
      { error: "Failed to complete assessment" },
      { status: 500 }
    );
  }
}
