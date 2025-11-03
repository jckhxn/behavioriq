import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/chatgpt/session
 *
 * Create/initialize a ChatGPT session for assessments
 * Adapter that calls existing APIs internally
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionType, templateId, subjectName, source = "chatgpt" } = body;

    console.log("[ChatGPT Session] Creating session:", {
      sessionType,
      templateId,
      subjectName,
    });

    // Get authenticated user if available
    const user = await getCurrentUserWithRole();

    // Handle trial session
    if (sessionType === "trial") {
      // Call existing trial/start API
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/trial/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymous: true,
          utm: {
            source,
            medium: "app",
            campaign: "chatgpt_trial",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start trial session");
      }

      const data = await response.json();

      return NextResponse.json({
        sessionId: data.sessionId,
        sessionType: "trial",
        initialState: {
          currentQuestionIndex: 0,
          totalQuestions: null, // Will be determined by trial system
          progress: 0,
        },
      });
    }

    // Handle assessment session
    if (sessionType === "assessment") {
      // Check authentication
      if (!user) {
        return NextResponse.json(
          {
            requiresAuth: true,
            message: "Authentication required for full assessments",
          },
          { status: 401 }
        );
      }

      if (!subjectName) {
        return NextResponse.json(
          { error: "subjectName is required for assessments" },
          { status: 400 }
        );
      }

      // Call existing conversational/start API
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/assessment/conversational/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass auth headers if available
          ...(request.headers.get("Authorization")
            ? { Authorization: request.headers.get("Authorization")! }
            : {}),
        },
        body: JSON.stringify({
          isTrial: false,
          assessmentTemplateId: templateId,
          subjectName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start assessment session");
      }

      const data = await response.json();

      return NextResponse.json({
        sessionId: data.sessionId,
        assessmentId: data.assessmentId,
        sessionType: "assessment",
        initialState: {
          currentQuestionIndex: data.progress?.currentIndex || 0,
          totalQuestions: data.totalQuestions || data.progress?.total,
          progress: data.progress?.answered || 0,
          answeredCount: data.progress?.answered || 0,
        },
        message: data.message,
        isResumed: data.isResumed || false,
      });
    }

    return NextResponse.json(
      { error: "Invalid sessionType. Must be 'trial' or 'assessment'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[ChatGPT Session] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create session",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
