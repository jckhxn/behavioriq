import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { MOCK_RECOMMENDATIONS } from "@/lib/config/ai-config";
import { checkAIRateLimit, recordAICall } from "@/lib/ai/rateLimiter";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limits before proceeding
    const rateLimitResult = checkAIRateLimit(user.id);
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

    const identifier = (await params).id;

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Fetch assessment with scores
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
        userId: user.id,
      },
      include: {
        scores: {
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
    const result = await streamRecommendations(assessment, user.id);

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

async function streamRecommendations(assessment: any, userId: string) {
  console.log("streamRecommendations called");
  const scores = assessment.scores;

  // Prepare score summary for AI
  const scoreSummary = scores.map((score: any) => ({
    domain: score.domain,
    rawScore: score.rawScore,
    totalPossible: score.totalPossible,
    percentage: ((score.rawScore / score.totalPossible) * 100).toFixed(1),
    riskLevel: score.riskLevel,
    confidence: score.confidence,
    questionsAnswered: score.questionsAnswered,
    wasTerminatedEarly: score.wasTerminatedEarly,
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

  // Record the AI call for rate limiting and cost tracking
  recordAICall(userId);

  const domainAnalysis = scoreSummary
    .map(
      (score: any) =>
        `${score.domain}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel} risk, ${(score.confidence * 100).toFixed(0)}% confidence)`
    )
    .join("\n");

  return streamText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content: `You are a behavioral assessment specialist. Generate comprehensive recommendations based on assessment scores. Include specific, actionable guidance and relevant professional resources with clickable links in [Title](URL) format.

Format your response with:
# 📊 Assessment Overview
# 🔗 Domain Interactions  
# 📚 Trusted Resources
# ⚠️ Important Disclaimer

Make the response engaging with emojis and clear sections. Include real, working URLs for resources.`,
      },
      {
        role: "user",
        content: `Generate recommendations for assessment of ${assessment.subjectName}:

Domain Scores:
${domainAnalysis}

Include specific resources with clickable links in [Title](URL) format.`,
      },
    ],
    temperature: 0.7,
  });
  const systemMessage = `You are a professional behavioral assessment specialist providing detailed, evidence-based recommendations. 

Your response should include embedded resources and citations in this format:
- For resources, use: **Resource:** [Title](URL) - Description
- Organize your response with clear headings and actionable bullet points
- Include both interventions and helpful resources throughout your recommendations`;

  const userPrompt = `Based on the following assessment results for "${assessment.subjectName}", provide detailed, actionable recommendations for intervention, support, and monitoring.

Assessment Results:
${scoreSummary
  .map(
    (score: any) => `
- ${score.domain} Domain:
  * Score: ${score.rawScore}/${score.totalPossible} (${score.percentage}%)
  * Risk Level: ${score.riskLevel.replace("_", " ")}
  * Questions Answered: ${score.questionsAnswered}
  * Assessment Confidence: ${(score.confidence * 100).toFixed(0)}%
  ${score.wasTerminatedEarly ? "* Note: Assessment was terminated early due to low risk indicators" : ""}
`
  )
  .join("")}

Please provide comprehensive recommendations with embedded resources:

1. **Overall Risk Assessment**: Summary of key findings and overall risk profile
2. **Priority Areas**: Which domains require immediate attention with relevant resources
3. **Specific Interventions**: Detailed, actionable interventions for each high-risk domain with supporting resources
4. **Monitoring Plan**: How to track progress and when to reassess with tracking tools/resources
5. **Professional Support**: Types of professional support or programs with specific resource recommendations
6. **Family/Caregiver Guidance**: Practical advice for daily management with helpful resources

Include relevant resources throughout each section such as:
- Professional organizations (APA, AACAP, etc.)
- Evidence-based therapy approaches with links to information
- Assessment tools and tracking resources
- Educational materials and support groups
- Crisis resources if applicable

Keep recommendations professional, evidence-based, and actionable while embedding helpful resources throughout.`;

  return streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
  });
}
