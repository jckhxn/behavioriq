import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { MOCK_RECOMMENDATIONS, AI_PARAMETERS, SYSTEM_PROMPTS } from "@/lib/config/ai-config";
import { checkAIRateLimit, recordAICall } from "@/lib/ai/rateLimiter";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth is optional - support both authenticated and anonymous users
    const user = await getCurrentUserWithRole();
    const userId = user?.id;

    // Check rate limits if user is authenticated
    if (userId) {
      const rateLimitResult = checkAIRateLimit(userId);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            reason: rateLimitResult.reason,
            resetTime: rateLimitResult.resetTime,
          },
          { status: 429 }
        );
      }
    }

    const identifier = (await params).id;

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, userId || undefined);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Build conditional where clause based on auth status
    // If authenticated: require ownership (userId must match)
    // If anonymous: only allow assessments with userId: null AND mode: FULL (paid assessments)
    const whereClause = userId
      ? { id: assessmentId, userId }
      : { id: assessmentId, userId: null, mode: "FULL" };

    // Fetch assessment with scores and domain template data
    const assessment = await prisma.assessment.findFirst({
      where: whereClause as any,
      include: {
        scores: {
          include: {
            domainTemplate: {
              select: {
                name: true,
                resources: true,
              },
            },
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed to generate recommendations" },
        { status: 400 }
      );
    }

    // Check if AI recommendations already exist for this assessment
    const existingRecommendation = await prisma.recommendation.findFirst({
      where: {
        assessmentId: assessmentId,
        category: "AI Generated",
      },
      orderBy: { createdAt: "desc" },
    });

    // If recommendations already exist, return them instead of generating new ones
    if (existingRecommendation) {
      console.log("Found existing AI recommendations, returning saved content");

      // Create a streaming response from the saved content
      const savedContent = existingRecommendation.content;
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          let index = 0;

          const streamChunk = () => {
            if (index < savedContent.length) {
              // Stream character by character for consistent UX
              const chunk = savedContent[index];
              controller.enqueue(encoder.encode(chunk));
              index++;
              setTimeout(streamChunk, 10); // Faster replay of saved content
            } else {
              controller.close();
              console.log("Saved recommendations stream completed");
            }
          };

          streamChunk();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-AI-Report-Status": "existing", // Header to indicate this is saved content
        },
      });
    }

    // Generate streaming AI recommendations based on scores (first time only)
    console.log("No existing AI recommendations found, generating new ones");
    const result = await streamRecommendations(assessment, userId);

    // If it's already a Response (mock), return it directly
    if (result instanceof Response) {
      return result;
    }

    // Otherwise it's a streamText result, convert it to streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

async function streamRecommendations(assessment: any, userId: string | undefined) {
  console.log("streamRecommendations called");
  const scores = assessment.scores;

  // Prepare score summary for AI with domain names and resources
  if (!scores.length) {
    return NextResponse.json(
      { error: "No domain scores available yet" },
      { status: 409 }
    );
  }

  const scoreSummary = scores.map((score: any) => ({
    domain: score.domain, // Keep enum for backwards compatibility
    domainName:
      score.domainName ||
      score.domainTemplate?.name ||
      score.domain ||
      "Behavior",
    rawScore: score.rawScore,
    totalPossible: score.totalPossible,
    percentage:
      score.totalPossible > 0
        ? ((score.rawScore / score.totalPossible) * 100).toFixed(1)
        : "0.0",
    riskLevel: score.riskLevel,
    confidence: score.confidence,
    questionsAnswered: score.questionsAnswered,
    wasTerminatedEarly: score.wasTerminatedEarly,
    resources: score.domainTemplate?.resources || [], // Domain-specific resources
  }));

  console.log("MOCK_RECOMMENDATIONS.ENABLED:", MOCK_RECOMMENDATIONS.ENABLED);

  // Use mock response if enabled - stream without OpenAI API
  if (MOCK_RECOMMENDATIONS.ENABLED) {
    console.log("Mock recommendations enabled, creating custom stream...");
    const mockResponse =
      MOCK_RECOMMENDATIONS.generateMockResponse(scoreSummary);
    console.log(
      "Generated mock response:",
      mockResponse.substring(0, 100) + "..."
    );

    // Create a custom streaming response that mimics AI SDK format
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let index = 0;

        const streamChunk = () => {
          if (index < mockResponse.length) {
            // Stream character by character for realistic effect
            const chunk = mockResponse[index];
            controller.enqueue(encoder.encode(chunk));
            index++;
            setTimeout(streamChunk, 20); // 20ms delay between characters
          } else {
            controller.close();
            console.log("Mock stream completed");
          }
        };

        streamChunk();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Real AI streaming logic for when mock is disabled
  console.log("Using real AI streaming with OpenAI...");

  // Record the AI call for rate limiting and cost tracking (only for authenticated users)
  if (userId) {
    recordAICall(userId);
  }

  // Format domain analysis with names and resources
  const domainAnalysis = scoreSummary
    .map((score: any) => {
      const resourceInfo = score.resources && score.resources.length > 0
        ? `\n  Resources available: ${score.resources.map((r: any) => r.title || r.category).join(", ")}`
        : "";
      return `- **${score.domainName}**: ${score.rawScore}/${score.totalPossible} (${score.percentage}%, ${score.riskLevel.replace("_", " ")} risk)${resourceInfo}`;
    })
    .join("\n");

  // Include resources as structured data for AI
  const domainResources = scoreSummary
    .filter((score: any) => score.resources && score.resources.length > 0)
    .map((score: any) => ({
      domain: score.domainName,
      resources: score.resources,
    }));

  const userPrompt = `Generate recommendations for assessment of ${assessment.subjectName}:

Domain Scores:
${domainAnalysis}

${domainResources.length > 0 ? `\nAvailable Resources by Domain:
${domainResources.map((d: any) =>
  `${d.domain}:\n${d.resources.map((r: any) =>
    `  - ${r.title}: ${r.description}${r.url ? ` (${r.url})` : ""}`
  ).join("\n")}`
).join("\n\n")}` : ""}`;

  return streamText({
    model: openai(AI_PARAMETERS.ASSESSMENT.MODEL),
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPTS.ASSESSMENT_ANALYSIS,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: AI_PARAMETERS.ASSESSMENT.TEMPERATURE,
    // Note: maxTokens is controlled by the model configuration and system prompt
  });
}
