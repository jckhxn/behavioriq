import {
  ConversationalAIProvider,
  ConversationalMessage,
  ConversationalSession,
  Question,
  TokenUsage,
  AnswerExtraction,
} from "./types";
import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { SYSTEM_PROMPTS } from "@/lib/config/ai-config";
import { classifyBooleanResponse, ZERO_TOKEN_USAGE } from "./responseClassifier";

/**
 * OpenAI-powered conversational AI for assessments
 * Uses GPT-4o-mini with kid-friendly prompts for natural conversation
 */
export class OpenAIConversationalAI implements ConversationalAIProvider {
  private async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    temperature: number = 0.7
  ): Promise<{ text: string; usage: TokenUsage }> {
    try {
      const { text, usage } = await generateText({
        model: openai("gpt-4o-mini"),
        messages: messages as any,
        temperature,
      });

      // Map Vercel AI SDK v5 property names to our TokenUsage interface
      // SDK uses: inputTokens, outputTokens, totalTokens
      // We use: promptTokens, completionTokens, totalTokens
      const tokenUsage: TokenUsage = {
        promptTokens: (usage as any).inputTokens || 0,
        completionTokens: (usage as any).outputTokens || 0,
        totalTokens: (usage as any).totalTokens || 0,
      };

      return {
        text: text || "I'm having trouble responding right now. Could you try again?",
        usage: tokenUsage,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate response");
    }
  }

  async generateResponse(
    session: ConversationalSession,
    userMessage: string,
    currentQuestion: Question,
    context?: {
      shouldProgress: boolean;
      clarificationNeeded: boolean;
      extractedAnswer: boolean | null;
      confidence: number;
      nextQuestion: Question | null;
    }
  ): Promise<ConversationalMessage> {
    // 🔍 DEBUG: Log the exact question we should be asking
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [AI DEBUG] ASSESSMENT QUESTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (context?.shouldProgress && context?.nextQuestion) {
      console.log('📝 ACTUAL ASSESSMENT QUESTION (from template):');
      console.log(`   "${context.nextQuestion.text}"`);
      console.log(`   Domain: ${(context.nextQuestion as any).domainSlug}`);
      console.log(`   Question ID: ${context.nextQuestion.id}`);
    } else {
      console.log('📝 ACTUAL ASSESSMENT QUESTION (from template):');
      console.log(`   "${currentQuestion.text}"`);
      console.log(`   Domain: ${(currentQuestion as any).domainSlug}`);
      console.log(`   Question ID: ${currentQuestion.id}`);
    }

    console.log('\n📊 Context:', {
      action: context?.shouldProgress ? 'Moving to next question' : context?.clarificationNeeded ? 'Asking for clarification' : 'Asking current question',
      extractedAnswer: context?.extractedAnswer,
      confidence: context?.confidence,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ⚡ OPTIMIZATION: No conversation history needed
    // Each question is independent and we provide all context in the system messages
    // The current userMessage is added separately below

    // Add system prompt for conversational assessment
    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPTS.CONVERSATIONAL_PROMPT,
    };

    let questionContext = "";

    // ✅ STRUCTURED CONTEXT (like regular assessment handleStructuredAnswer)
    if (context?.clarificationNeeded) {
      questionContext = `The user's response was unclear (confidence: ${context.confidence}).

ASK FOR YES/NO CLARIFICATION about this assessment question:
ORIGINAL QUESTION: "${currentQuestion.text}"

Rephrase at THIRD-GRADE LEVEL. Use simple words. Keep it about the same topic.
Format: [Short acknowledgment]. [Simple yes/no question]

Example: "I hear you. 😊 So is that a yes or a no?"`;
    } else if (context?.shouldProgress && context?.nextQuestion) {
      questionContext = `The user answered: ${context.extractedAnswer ? "YES" : "NO"}.

NOW ASK THE NEXT ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${context.nextQuestion.text}"
DOMAIN: ${(context.nextQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL: simple words, short sentences (under 12 words).
Keep the same meaning but make it easy for an 8-10 year old to understand.

Format: [Short acknowledgment]. [Simple question]

Example: "Thanks! 💙 [Ask about this topic using simple words]"

IMPORTANT: Stay on THIS topic. Use small words. Keep it short.`;
    } else if (context?.shouldProgress && !context?.nextQuestion) {
      questionContext = `The user just answered the FINAL question!
Thank them warmly for completing all questions. Use simple, positive words.

Example: "You did it! 🎉 Thanks for talking with me. Let me get your results ready!"`;
    } else if (!userMessage || session.messages.length === 0) {
      // Initial greeting
      questionContext = `This is the FIRST interaction.

ASK THIS ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${currentQuestion.text}"
DOMAIN: ${(currentQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL: simple words a 3rd grader knows.
Keep it friendly and short. Max 10-12 words per sentence.

Format: [Short, warm greeting]. [Simple question]

Example: "Hi! 😊 I'm going to ask you some questions. [Ask about this topic using simple words]"`;
    } else {
      // Fallback - just ask the current question
      questionContext = `ASK THIS ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${currentQuestion.text}"
DOMAIN: ${(currentQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL. Use simple words. Keep it about the same topic.`;
    }

    const messages = [
      systemMessage,
      { role: "system", content: questionContext },
    ];

    // Add user message if present
    if (userMessage && userMessage.trim()) {
      messages.push({
        role: "user",
        content: userMessage,
      });
    }

    try {
      // Generate AI response
      const { text: aiContent, usage } = await this.callOpenAI(messages, 0.7);

      // 🔍 DEBUG: Log what the AI actually generated
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💬 [AI DEBUG] AI GENERATED RESPONSE (what child sees):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   "${aiContent}"`);
      console.log('\n📊 Token Usage:', usage);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "ai",
        content: aiContent,
        timestamp: new Date(),
        metadata: {
          questionId: currentQuestion.id,
          domainSlug: (currentQuestion as any).domainSlug || "unknown",
          confidence: context?.confidence || 0.85,
          tokenUsage: usage,
        },
      };
    } catch (error) {
      console.error("Error generating AI response:", error);
      return {
        id: `ai_error_${Date.now()}`,
        role: "ai",
        content:
          "I'm having trouble right now. Could you try answering that again? 😊",
        timestamp: new Date(),
        metadata: { questionId: currentQuestion.id },
      };
    }
  }

  /**
   * Generate a streaming response for conversational assessment
   * Returns a streamText result that can be converted to a streaming response
   */
  async generateStreamingResponse(
    session: ConversationalSession,
    userMessage: string,
    currentQuestion: Question,
    context?: {
      shouldProgress: boolean;
      clarificationNeeded: boolean;
      extractedAnswer: boolean | null;
      confidence: number;
      nextQuestion: Question | null;
    }
  ) {
    // 🔍 DEBUG: Log the exact question we should be asking
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [AI DEBUG] ASSESSMENT QUESTION (STREAMING)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (context?.shouldProgress && context?.nextQuestion) {
      console.log('📝 ACTUAL ASSESSMENT QUESTION (from template):');
      console.log(`   "${context.nextQuestion.text}"`);
      console.log(`   Domain: ${(context.nextQuestion as any).domainSlug}`);
      console.log(`   Question ID: ${context.nextQuestion.id}`);
    } else {
      console.log('📝 ACTUAL ASSESSMENT QUESTION (from template):');
      console.log(`   "${currentQuestion.text}"`);
      console.log(`   Domain: ${(currentQuestion as any).domainSlug}`);
      console.log(`   Question ID: ${currentQuestion.id}`);
    }

    console.log('\n📊 Context:', {
      action: context?.shouldProgress ? 'Moving to next question' : context?.clarificationNeeded ? 'Asking for clarification' : 'Asking current question',
      extractedAnswer: context?.extractedAnswer,
      confidence: context?.confidence,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Add system prompt for conversational assessment
    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPTS.CONVERSATIONAL_PROMPT,
    };

    let questionContext = "";

    // ✅ STRUCTURED CONTEXT (like regular assessment handleStructuredAnswer)
    if (context?.clarificationNeeded) {
      questionContext = `The user's response was unclear (confidence: ${context.confidence}).

ASK FOR YES/NO CLARIFICATION about this assessment question:
ORIGINAL QUESTION: "${currentQuestion.text}"

Rephrase at THIRD-GRADE LEVEL. Use simple words. Keep it about the same topic.
Format: [Short acknowledgment]. [Simple yes/no question]

Example: "I hear you. 😊 So is that a yes or a no?"`;
    } else if (context?.shouldProgress && context?.nextQuestion) {
      questionContext = `The user answered: ${context.extractedAnswer ? "YES" : "NO"}.

NOW ASK THE NEXT ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${context.nextQuestion.text}"
DOMAIN: ${(context.nextQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL: simple words, short sentences (under 12 words).
Keep the same meaning but make it easy for an 8-10 year old to understand.

Format: [Short acknowledgment]. [Simple question]

Example: "Thanks! 💙 [Ask about this topic using simple words]"

IMPORTANT: Stay on THIS topic. Use small words. Keep it short.`;
    } else if (context?.shouldProgress && !context?.nextQuestion) {
      questionContext = `The user just answered the FINAL question!
Thank them warmly for completing all questions. Use simple, positive words.

Example: "You did it! 🎉 Thanks for talking with me. Let me get your results ready!"`;
    } else if (!userMessage || session.messages.length === 0) {
      // Initial greeting
      questionContext = `This is the FIRST interaction.

ASK THIS ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${currentQuestion.text}"
DOMAIN: ${(currentQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL: simple words a 3rd grader knows.
Keep it friendly and short. Max 10-12 words per sentence.

Format: [Short, warm greeting]. [Simple question]

Example: "Hi! 😊 I'm going to ask you some questions. [Ask about this topic using simple words]"`;
    } else {
      // Fallback - just ask the current question
      questionContext = `ASK THIS ASSESSMENT QUESTION:
ORIGINAL QUESTION: "${currentQuestion.text}"
DOMAIN: ${(currentQuestion as any).domainSlug}

Rephrase at THIRD-GRADE LEVEL. Use simple words. Keep it about the same topic.`;
    }

    const messages = [
      systemMessage,
      { role: "system", content: questionContext },
    ];

    // Add user message if present
    if (userMessage && userMessage.trim()) {
      messages.push({
        role: "user",
        content: userMessage,
      });
    }

    // Return the streamText result directly
    return streamText({
      model: openai("gpt-4o-mini"),
      messages: messages as any,
      temperature: 0.7,
    });
  }

  async extractAnswer(
    userMessage: string,
    question: Question
  ): Promise<AnswerExtraction> {
    const trimmed = userMessage?.trim();
    if (!trimmed) {
      return { answer: null, confidence: 0, tokenUsage: ZERO_TOKEN_USAGE };
    }

    const heuristic = classifyBooleanResponse(trimmed);
    if (heuristic) {
      return heuristic;
    }

    // Use OpenAI to analyze the user's response and extract yes/no with confidence
    const analysisPrompt = `Analyze this response to extract YES or NO.

Question: "${question.text}"
User Response: "${userMessage}"

AFFIRMATIVE (YES) responses include:
- "yes", "yeah", "yep", "yup", "uh-huh", "sure", "okay", "ok", "definitely", "always", "all the time"
- "I do", "I am", "I have", "I get", "I feel", "that's me"
- "sometimes", "kind of", "sort of", "a little", "often" = YES (behavior present even if not constant)

NEGATIVE (NO) responses include:
- "no", "nope", "nah", "no way", "not really", "never", "rarely", "hardly ever"
- "I don't", "I'm not", "I haven't", "not at all"

UNCLEAR responses:
- "maybe", "I don't know", "I'm not sure", "unclear", "what do you mean?"
- Completely off-topic or nonsensical responses

Confidence levels:
- 0.9-1.0: Crystal clear (explicit yes/no)
- 0.7-0.9: Very clear (common affirmative/negative phrases)
- 0.5-0.7: Moderately clear (implied yes/no)
- 0.3-0.5: Unclear (ambiguous, vague)
- 0.0-0.3: Very unclear (confused, off-topic)

Output format:
ANSWER: [YES/NO/UNCLEAR]
CONFIDENCE: [0.0-1.0]`;

    try {
      const { text: response, usage } = await this.callOpenAI(
        [
          {
            role: "system",
            content: "Analyze child responses to behavioral questions. Extract YES/NO with confidence.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        0.1 // Low temperature for consistent analysis
      );

      // 🔍 DEBUG: Log the raw extraction response
      console.log('🔍 [EXTRACTION DEBUG] Raw AI Response:');
      console.log(response);
      console.log('');

      // Parse the structured response
      const lines = response.trim().split("\n");
      let answer: boolean | null = null;
      let confidence = 0.5;

      for (const line of lines) {
        if (line.toUpperCase().startsWith("ANSWER:")) {
          const answerText = line.split(":")[1].trim().toUpperCase();
          if (answerText === "YES") {
            answer = true;
          } else if (answerText === "NO") {
            answer = false;
          } else {
            answer = null;
          }
        } else if (line.toUpperCase().startsWith("CONFIDENCE:")) {
          const confidenceText = line.split(":")[1].trim();
          confidence = parseFloat(confidenceText) || 0.5;
        }
      }

      // 🔍 DEBUG: Log parsed result
      console.log('🔍 [EXTRACTION DEBUG] Parsed Result:', { answer, confidence });
      console.log('');

      return { answer, confidence, tokenUsage: usage };
    } catch (error) {
      console.error("Error extracting answer:", error);
      return { answer: null, confidence: 0, tokenUsage: ZERO_TOKEN_USAGE };
    }
  }

  async generateInitialMessage(
    session: ConversationalSession
  ): Promise<ConversationalMessage> {
    const firstQuestion = session.questions[0];
    return this.generateResponse(session, "", firstQuestion);
  }

  async generateSummary(
    session: ConversationalSession,
    scores: Record<string, number>
  ): Promise<string> {
    // Use CONVERSATIONAL_ANALYSIS prompt for kid-friendly results
    const domainInfo = Object.entries(scores)
      .map(([domain, score]) => {
        const domainName = domain
          .split("_")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
        return `${domainName}: ${score}`;
      })
      .join("\n");

    const summaryPrompt = `Generate a kid-friendly summary of these assessment results:

${domainInfo}

Use the exact domain names provided above.
Follow the CONVERSATIONAL_ANALYSIS guidelines to create an encouraging, easy-to-understand explanation.`;

    try {
      const { text: response } = await this.callOpenAI(
        [
          {
            role: "system",
            content: SYSTEM_PROMPTS.CONVERSATIONAL_ANALYSIS,
          },
          {
            role: "user",
            content: summaryPrompt,
          },
        ],
        0.5
      );

      return response;
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Thanks for completing the assessment! Your results are being prepared.";
    }
  }
}
