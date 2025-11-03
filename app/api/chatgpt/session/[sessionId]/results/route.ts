import { NextRequest, NextResponse } from "next/server";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";

/**
 * GET /api/chatgpt/session/[sessionId]/results
 *
 * Get results for a completed session
 * Adapter that retrieves assessment results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    console.log("[ChatGPT Session] Getting results for session:", sessionId);

    // Get session
    let session = await databaseSessionStore.get(sessionId);
    if (!session) {
      session = sessionStore.get(sessionId);
    }

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (!session.isComplete) {
      return NextResponse.json(
        { error: "Assessment not yet complete" },
        { status: 400 }
      );
    }

    // Get assessment results
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/assessment/${session.assessmentId}/results`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch assessment results");
    }

    const results = await response.json();

    return NextResponse.json({
      sessionId,
      assessmentId: session.assessmentId,
      results,
      completedAt: results.completedAt,
      domains: results.domains,
      flags: results.flags,
      isComplete: true,
    });
  } catch (error) {
    console.error("[ChatGPT Session] Error getting results:", error);
    return NextResponse.json(
      {
        error: "Failed to get results",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
