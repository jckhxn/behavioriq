import {
  ConversationalAIProvider,
  ConversationalMessage,
  ConversationalSession,
  Question,
} from "./types";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { SYSTEM_PROMPTS } from "@/lib/config/ai-config";

/**
 * OpenAI-powered conversational AI for assessments
 * Uses GPT-4o-mini with kid-friendly prompts for natural conversation
 */
export class OpenAIConversationalAI implements ConversationalAIProvider {
  private async callOpenAI(
    messages: Array<{ role: string; content: string }>,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        messages: messages as any,
        temperature,
      });

      return (
        text || "I'm having trouble responding right now. Could you try again?"
      );
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
    // Build conversation context
    const conversationHistory = session.messages.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    }));

    // Add system prompt for conversational assessment
    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPTS.CONVERSATIONAL_PROMPT,
    };

    let questionContext = "";

    // ✅ STRUCTURED CONTEXT (like regular assessment handleStructuredAnswer)
    if (context?.clarificationNeeded) {
      questionContext = `The user's response was unclear or ambiguous (confidence: ${context.confidence}).
GENTLY ask them to clarify with a yes or no about: "${currentQuestion.text}"

Keep it friendly and brief. Example: "I want to make sure I understand - would you say that's mostly a yes or a no? 😊"`;
    } else if (context?.shouldProgress && context?.nextQuestion) {
      questionContext = `The user answered the previous question with ${context.extractedAnswer ? "YES" : "NO"}.
BRIEFLY acknowledge (1 short sentence max), then immediately ask the next question:

"${context.nextQuestion.text}"

Example format: "Got it, thanks! 👍 [Next question naturally phrased]"`;
    } else if (context?.shouldProgress && !context?.nextQuestion) {
      questionContext = `The user just answered the final question!
Thank them warmly and let them know their results are being prepared.

Example: "Perfect! 🎉 Thanks for answering all my questions. Let me prepare your results!"`;
    } else if (!userMessage || session.messages.length === 0) {
      // Initial greeting
      questionContext = `This is the first interaction. 
Start with a warm greeting and ask the first question naturally:

"${currentQuestion.text}"

Example: "Hi there! 😊 Let's chat about some feelings and behaviors. ${currentQuestion.text}"`;
    } else {
      // Fallback - just ask the current question
      questionContext = `Ask this question naturally: "${currentQuestion.text}"`;
    }

    const messages = [
      systemMessage,
      { role: "system", content: questionContext },
      ...conversationHistory,
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
      const aiContent = await this.callOpenAI(messages, 0.7);

      return {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: "ai",
        content: aiContent,
        timestamp: new Date(),
        metadata: {
          questionId: currentQuestion.id,
          domainSlug: (currentQuestion as any).domainSlug || "unknown",
          confidence: context?.confidence || 0.85,
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

  async extractAnswer(
    userMessage: string,
    question: Question
  ): Promise<{ answer: boolean | null; confidence: number }> {
    // Use OpenAI to analyze the user's response and extract yes/no with confidence
    const analysisPrompt = `Given this question: "${question.text}"

And this user response: "${userMessage}"

Analyze if the user's response indicates a YES (true) or NO (false) answer, and rate your confidence.

Context:
- YES/TRUE means: the behavior happens often, is present, is a concern, agrees with statement
- NO/FALSE means: the behavior rarely/never happens, is not present, disagrees with statement

Respond in this EXACT format:
ANSWER: [YES/NO/UNCLEAR]
CONFIDENCE: [0.0-1.0]

Where confidence is:
- 0.9-1.0: Very clear answer (e.g., "yes", "no", "definitely", "never")
- 0.6-0.8: Moderately clear (e.g., "sometimes", "I think so", "not really")
- 0.3-0.5: Somewhat unclear (e.g., "maybe", "I don't know")
- 0.0-0.2: Very unclear or off-topic

Example:
ANSWER: YES
CONFIDENCE: 0.95`;

    try {
      const response = await this.callOpenAI(
        [
          {
            role: "system",
            content:
              "You are an expert at analyzing conversational responses to behavioral assessment questions. Be precise and provide confidence scores.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        0.1 // Low temperature for consistent analysis
      );

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

      return { answer, confidence };
    } catch (error) {
      console.error("Error extracting answer:", error);
      return { answer: null, confidence: 0 };
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
      const response = await this.callOpenAI(
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
