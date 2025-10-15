// @ts-nocheck
/**
 * Test Script: Generate Full Conversational Assessment
 *
 * This script simulates a complete conversational assessment by:
 * 1. Loading a FULL assessment template (not trial)
 * 2. Automatically answering all questions with simulated responses
 * 3. Tracking total token usage across the entire conversation
 * 4. Outputting the complete conversation flow
 *
 * Usage: npx tsx scripts/test-conversational-full.ts [assessmentTemplateId]
 * Example: npx tsx scripts/test-conversational-full.ts cm123abc
 *
 * If no ID provided, will list available templates and use the first active one.
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });

// Verify OpenAI key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY not found in environment variables");
  console.error(
    "Make sure .env.local exists in the project root with OPENAI_API_KEY set"
  );
  process.exit(1);
}

import { ConversationalAIFactory } from "../lib/ai/conversational/ConversationalAIFactory";
import {
  ConversationalSession,
  Question,
} from "../lib/ai/conversational/types";
import { prisma } from "../lib/db/prisma";

// Simulated user responses (mix of yes/no/unclear)
const SIMULATED_RESPONSES = [
  "Yes, I do",
  "Sometimes",
  "No, not really",
  "Yeah",
  "I don't know, maybe",
  "Nope",
  "Yes",
  "Kind of",
  "No",
  "Yes, all the time",
  "Not really",
  "I think so",
  "No way",
  "Yeah, sometimes",
  "Yes",
  "Yep",
  "Not at all",
  "I guess so",
  "Definitely",
  "No",
];

async function testFullConversation() {
  console.log("🚀 Starting FULL Conversational Assessment Test\n");
  console.log("=".repeat(60));

  try {
    // 1. Get assessment template ID from command line or use first active
    const templateIdArg = process.argv[2];
    let assessmentTemplate: any;

    if (templateIdArg) {
      console.log(`\n📋 Loading assessment template: ${templateIdArg}...`);
      assessmentTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: templateIdArg },
        include: {
          domains: {
            include: {
              domainTemplate: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!assessmentTemplate) {
        throw new Error(`Assessment template not found: ${templateIdArg}`);
      }
    } else {
      console.log(
        "\n📋 No template ID provided, finding first active template..."
      );

      // List all active templates
      const allTemplates = await prisma.assessmentTemplate.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
        },
      });

      if (allTemplates.length === 0) {
        throw new Error("No active assessment templates found");
      }

      console.log("\n📚 Available Templates:");
      allTemplates.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} (${t.slug})`);
        console.log(`     ID: ${t.id}`);
        if (t.description) console.log(`     ${t.description}`);
      });

      // Use the first one
      assessmentTemplate = await prisma.assessmentTemplate.findUnique({
        where: { id: allTemplates[0].id },
        include: {
          domains: {
            include: {
              domainTemplate: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      console.log(`\n✅ Using: ${assessmentTemplate.name}`);
    }

    console.log(`✅ Loaded: ${assessmentTemplate.name}`);

    // 2. Flatten all questions
    const allQuestions = assessmentTemplate.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          text: question.text,
          order: domainIndex * 100 + questionIndex,
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          weight: question.weight || 1,
          required: question.required !== false,
        }));
      }
    );

    console.log(`✅ Found ${allQuestions.length} questions\n`);
    console.log("=".repeat(60));

    // 3. Create session (FULL assessment, not trial)
    const session: ConversationalSession = {
      id: `test_${Date.now()}`,
      assessmentId: assessmentTemplate.id,
      userId: null,
      currentQuestionIndex: 0,
      responses: {},
      messages: [],
      isComplete: false,
      isTrial: false, // FULL assessment
      questions: allQuestions,
      totalTokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };

    const ai = ConversationalAIFactory.create(false); // Use FULL AI (not trial)

    // 4. Generate initial greeting
    console.log("\n🤖 INITIAL GREETING:");
    console.log("-".repeat(60));
    const initialMessage = await ai.generateResponse(
      session,
      "",
      allQuestions[0]
    );
    session.messages.push(initialMessage);

    // Track tokens
    if (initialMessage.metadata?.tokenUsage) {
      session.totalTokenUsage.promptTokens +=
        initialMessage.metadata.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens +=
        initialMessage.metadata.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens +=
        initialMessage.metadata.tokenUsage.totalTokens;
    }

    console.log(`AI: ${initialMessage.content}`);
    console.log(
      `Tokens: ${initialMessage.metadata?.tokenUsage?.totalTokens || 0}`
    );

    // 5. Go through all questions
    let questionIndex = 0;
    let lastDomain = "";
    let clarificationAttempts = 0;
    const MAX_CLARIFICATION_ATTEMPTS = 3;

    // Simple cache to avoid duplicate API calls for same input
    const extractionCache = new Map<
      string,
      { answer: boolean | null; confidence: number; tokenUsage?: TokenUsage }
    >();

    while (questionIndex < allQuestions.length) {
      const currentQuestion = allQuestions[questionIndex];
      const userResponse =
        SIMULATED_RESPONSES[questionIndex % SIMULATED_RESPONSES.length];

      // Show domain header when switching domains
      if (currentQuestion.domainSlug !== lastDomain) {
        console.log("\n" + "█".repeat(60));
        console.log(
          `🏷️  DOMAIN: ${currentQuestion.domain.toUpperCase()} (${currentQuestion.domainSlug})`
        );
        console.log("█".repeat(60));
        lastDomain = currentQuestion.domainSlug;
      }

      console.log("\n" + "=".repeat(60));
      console.log(`\n📝 QUESTION ${questionIndex + 1}/${allQuestions.length}`);
      console.log(`Original Question: "${currentQuestion.text}"`);
      console.log("-".repeat(60));
      console.log(`👤 USER: ${userResponse}`);

      // Add user message
      const userMessage = {
        id: `user_${Date.now()}_${questionIndex}`,
        role: "user" as const,
        content: userResponse,
        timestamp: new Date(),
      };
      session.messages.push(userMessage);

      // Check cache first to avoid duplicate API calls
      const cacheKey = `${currentQuestion.id}:${userResponse}`;
      let extraction;

      if (extractionCache.has(cacheKey)) {
        extraction = extractionCache.get(cacheKey)!;
        console.log(`📦 Using cached extraction for: "${userResponse}"`);
      } else {
        // Extract answer from OpenAI
        extraction = await ai.extractAnswer(userResponse, currentQuestion);
        extractionCache.set(cacheKey, extraction);
      }

      console.log(
        `📊 Extracted: ${extraction.answer} (confidence: ${extraction.confidence.toFixed(2)})`
      );

      // Track extraction tokens (only if not from cache)
      if (extraction.tokenUsage) {
        session.totalTokenUsage.promptTokens +=
          extraction.tokenUsage.promptTokens;
        session.totalTokenUsage.completionTokens +=
          extraction.tokenUsage.completionTokens;
        session.totalTokenUsage.totalTokens +=
          extraction.tokenUsage.totalTokens;
      }

      // Determine if we should progress (same logic as API route)
      let shouldProgress = false;
      let clarificationNeeded = false;

      if (extraction.answer !== null && extraction.confidence >= 0.6) {
        // High confidence - record answer and progress
        session.responses[currentQuestion.id] = extraction.answer;
        questionIndex++;
        clarificationAttempts = 0; // Reset counter for next question
        shouldProgress = true;
        console.log(
          `✅ Answer recorded: ${extraction.answer} for question ${currentQuestion.id}`
        );
        console.log(`→ Moving to question ${questionIndex + 1}`);
      } else if (clarificationAttempts >= MAX_CLARIFICATION_ATTEMPTS) {
        // Too many clarification attempts - force progression with "no" (conservative approach)
        console.log(
          `⚠️ Max clarification attempts reached (${clarificationAttempts}). Forcing progression with "no" answer.`
        );
        session.responses[currentQuestion.id] = false;
        questionIndex++;
        clarificationAttempts = 0; // Reset counter
        shouldProgress = true;
      } else if (extraction.confidence < 0.3) {
        // Very unclear - ask for clarification
        clarificationAttempts++;
        clarificationNeeded = true;
        console.log(
          `❓ Need clarification (confidence too low: ${extraction.confidence}) - Attempt ${clarificationAttempts}/${MAX_CLARIFICATION_ATTEMPTS}`
        );
      } else {
        // Medium confidence - ask follow-up to confirm
        clarificationAttempts++;
        clarificationNeeded = true;
        console.log(
          `🤔 Need confirmation (confidence: ${extraction.confidence}) - Attempt ${clarificationAttempts}/${MAX_CLARIFICATION_ATTEMPTS}`
        );
      }

      // Get next question
      const nextQuestion =
        shouldProgress && questionIndex < allQuestions.length
          ? allQuestions[questionIndex]
          : null;

      // Generate AI response
      const aiMessage = await ai.generateResponse(
        session,
        userResponse,
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

      // Track tokens
      if (aiMessage.metadata?.tokenUsage) {
        session.totalTokenUsage.promptTokens +=
          aiMessage.metadata.tokenUsage.promptTokens;
        session.totalTokenUsage.completionTokens +=
          aiMessage.metadata.tokenUsage.completionTokens;
        session.totalTokenUsage.totalTokens +=
          aiMessage.metadata.tokenUsage.totalTokens;
      }

      console.log("-".repeat(60));
      console.log(`🤖 AI: ${aiMessage.content}`);
      console.log(
        `Tokens (this exchange): ${aiMessage.metadata?.tokenUsage?.totalTokens || 0}`
      );
    }

    // 6. Calculate scores
    console.log("\n" + "=".repeat(60));
    console.log("\n📊 FINAL RESULTS:");
    console.log("=".repeat(60));

    const domainScores: Record<string, { yes: number; total: number }> = {};

    allQuestions.forEach((question: Question) => {
      const domain = (question as any).domainSlug;
      if (!domainScores[domain]) {
        domainScores[domain] = { yes: 0, total: 0 };
      }

      domainScores[domain].total++;
      if (session.responses[question.id] === true) {
        domainScores[domain].yes++;
      }
    });

    console.log("\nDomain Scores:");
    Object.entries(domainScores).forEach(([domain, score]) => {
      const percentage = ((score.yes / score.total) * 100).toFixed(1);
      console.log(`  ${domain}: ${score.yes}/${score.total} (${percentage}%)`);
    });

    // 7. Token Summary
    console.log("\n" + "=".repeat(60));
    console.log("\n💰 TOKEN USAGE SUMMARY:");
    console.log("=".repeat(60));
    console.log(
      `Prompt Tokens:     ${session.totalTokenUsage.promptTokens.toLocaleString()}`
    );
    console.log(
      `Completion Tokens: ${session.totalTokenUsage.completionTokens.toLocaleString()}`
    );
    console.log(
      `Total Tokens:      ${session.totalTokenUsage.totalTokens.toLocaleString()}`
    );

    // Calculate cost (gpt-4o-mini pricing)
    const inputCost = (session.totalTokenUsage.promptTokens / 1_000_000) * 0.15;
    const outputCost =
      (session.totalTokenUsage.completionTokens / 1_000_000) * 0.6;
    const totalCost = inputCost + outputCost;

    console.log("\nEstimated Cost (GPT-4o-mini):");
    console.log(`Input:  $${inputCost.toFixed(4)}`);
    console.log(`Output: $${outputCost.toFixed(4)}`);
    console.log(`Total:  $${totalCost.toFixed(4)}`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Test Complete!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFullConversation().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
