/**
 * Quick Test Script: Test Token Tracking (First 5 Questions Only)
 *
 * This script runs through just the first 5 questions to quickly verify
 * that token tracking and cost calculation are working properly.
 *
 * Usage: npx tsx scripts/test-conversational-quick.ts
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from project root
config({ path: resolve(process.cwd(), ".env.local") });

// Verify OpenAI key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY not found in environment variables");
  console.error("Make sure .env.local exists in the project root with OPENAI_API_KEY set");
  process.exit(1);
}

import { ConversationalAIFactory } from "../lib/ai/conversational/ConversationalAIFactory";
import { ConversationalSession, Question, TokenUsage } from "../lib/ai/conversational/types";
import { prisma } from "../lib/db/prisma";

// Simulated user responses (mix of yes/no/unclear)
const SIMULATED_RESPONSES = [
  "Yes, I do",
  "Sometimes",
  "No, not really",
  "Yeah",
  "I don't know, maybe",
];

async function testQuickConversation() {
  console.log("🚀 Starting QUICK Token Test (5 Questions)\n");
  console.log("=" .repeat(60));

  try {
    // 1. Get first active assessment template
    console.log("\n📋 Loading assessment template...");

    const allTemplates = await prisma.assessmentTemplate.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    if (allTemplates.length === 0) {
      throw new Error("No active assessment templates found");
    }

    const assessmentTemplate = await prisma.assessmentTemplate.findUnique({
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

    console.log(`✅ Loaded: ${assessmentTemplate!.name}`);

    // 2. Flatten questions and take first 5
    const allQuestions = assessmentTemplate!.domains.flatMap(
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
    ).slice(0, 5); // ONLY FIRST 5 QUESTIONS

    console.log(`✅ Testing with ${allQuestions.length} questions\n`);
    console.log("=" .repeat(60));

    // 3. Create session
    const session: ConversationalSession = {
      id: `test_${Date.now()}`,
      assessmentId: assessmentTemplate!.id,
      userId: null,
      currentQuestionIndex: 0,
      responses: {},
      messages: [],
      isComplete: false,
      isTrial: false,
      questions: allQuestions,
      totalTokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };

    const ai = ConversationalAIFactory.create(false);

    // 4. Generate initial greeting
    console.log("\n🤖 INITIAL GREETING:");
    console.log("-" .repeat(60));
    const initialMessage = await ai.generateResponse(
      session,
      "",
      allQuestions[0]
    );
    session.messages.push(initialMessage);

    if (initialMessage.metadata?.tokenUsage) {
      session.totalTokenUsage.promptTokens += initialMessage.metadata.tokenUsage.promptTokens;
      session.totalTokenUsage.completionTokens += initialMessage.metadata.tokenUsage.completionTokens;
      session.totalTokenUsage.totalTokens += initialMessage.metadata.tokenUsage.totalTokens;
    }

    console.log(`AI: ${initialMessage.content}`);
    console.log(`Tokens: ${JSON.stringify(initialMessage.metadata?.tokenUsage)}`);

    // 5. Go through all questions
    let questionIndex = 0;
    let clarificationAttempts = 0;
    const MAX_CLARIFICATION_ATTEMPTS = 3;

    const extractionCache = new Map<string, { answer: boolean | null; confidence: number; tokenUsage?: TokenUsage }>();

    while (questionIndex < allQuestions.length) {
      const currentQuestion = allQuestions[questionIndex];
      const userResponse = SIMULATED_RESPONSES[questionIndex % SIMULATED_RESPONSES.length];

      console.log("\n" + "=" .repeat(60));
      console.log(`\n📝 QUESTION ${questionIndex + 1}/${allQuestions.length}`);
      console.log(`Question: "${currentQuestion.text}"`);
      console.log("-" .repeat(60));
      console.log(`👤 USER: ${userResponse}`);

      const userMessage = {
        id: `user_${Date.now()}_${questionIndex}`,
        role: "user" as const,
        content: userResponse,
        timestamp: new Date(),
      };
      session.messages.push(userMessage);

      // Check cache first
      const cacheKey = `${currentQuestion.id}:${userResponse}`;
      let extraction;

      if (extractionCache.has(cacheKey)) {
        extraction = extractionCache.get(cacheKey)!;
        console.log(`📦 Using cached extraction`);
      } else {
        extraction = await ai.extractAnswer(userResponse, currentQuestion);
        extractionCache.set(cacheKey, extraction);
      }

      console.log(`📊 Extracted: ${extraction.answer} (confidence: ${extraction.confidence.toFixed(2)})`);

      if (extraction.tokenUsage) {
        session.totalTokenUsage.promptTokens += extraction.tokenUsage.promptTokens;
        session.totalTokenUsage.completionTokens += extraction.tokenUsage.completionTokens;
        session.totalTokenUsage.totalTokens += extraction.tokenUsage.totalTokens;
      }

      let shouldProgress = false;
      let clarificationNeeded = false;

      if (extraction.answer !== null && extraction.confidence >= 0.6) {
        session.responses[currentQuestion.id] = extraction.answer;
        questionIndex++;
        clarificationAttempts = 0;
        shouldProgress = true;
      } else if (clarificationAttempts >= MAX_CLARIFICATION_ATTEMPTS) {
        console.log(`⚠️ Max clarification attempts. Forcing progression with "no".`);
        session.responses[currentQuestion.id] = false;
        questionIndex++;
        clarificationAttempts = 0;
        shouldProgress = true;
      } else {
        clarificationAttempts++;
        clarificationNeeded = true;
        console.log(`🤔 Clarification attempt ${clarificationAttempts}/${MAX_CLARIFICATION_ATTEMPTS}`);
      }

      const nextQuestion = shouldProgress && questionIndex < allQuestions.length
        ? allQuestions[questionIndex]
        : null;

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

      if (aiMessage.metadata?.tokenUsage) {
        session.totalTokenUsage.promptTokens += aiMessage.metadata.tokenUsage.promptTokens;
        session.totalTokenUsage.completionTokens += aiMessage.metadata.tokenUsage.completionTokens;
        session.totalTokenUsage.totalTokens += aiMessage.metadata.tokenUsage.totalTokens;
      }

      console.log("-" .repeat(60));
      console.log(`🤖 AI: ${aiMessage.content}`);
      console.log(`Tokens: ${JSON.stringify(aiMessage.metadata?.tokenUsage)}`);
    }

    // 6. Token Summary
    console.log("\n" + "=" .repeat(60));
    console.log("\n💰 TOKEN USAGE SUMMARY:");
    console.log("=" .repeat(60));
    console.log(`Prompt Tokens:     ${session.totalTokenUsage.promptTokens.toLocaleString()}`);
    console.log(`Completion Tokens: ${session.totalTokenUsage.completionTokens.toLocaleString()}`);
    console.log(`Total Tokens:      ${session.totalTokenUsage.totalTokens.toLocaleString()}`);

    // Calculate cost (gpt-4o-mini pricing)
    const inputCost = (session.totalTokenUsage.promptTokens / 1_000_000) * 0.150;
    const outputCost = (session.totalTokenUsage.completionTokens / 1_000_000) * 0.600;
    const totalCost = inputCost + outputCost;

    console.log("\nEstimated Cost (GPT-4o-mini):");
    console.log(`Input:  $${inputCost.toFixed(6)}`);
    console.log(`Output: $${outputCost.toFixed(6)}`);
    console.log(`Total:  $${totalCost.toFixed(6)}`);

    // Extrapolate to full 94 questions
    const questionsRatio = 94 / allQuestions.length;
    const estimatedFullCost = totalCost * questionsRatio;
    console.log(`\nEstimated Full Assessment (94 questions): $${estimatedFullCost.toFixed(4)}`);

    console.log("\n" + "=" .repeat(60));
    console.log("\n✅ Quick Test Complete!\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testQuickConversation().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
