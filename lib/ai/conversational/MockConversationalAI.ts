import {
  ConversationalAIProvider,
  ConversationalMessage,
  ConversationalSession,
  Question,
} from "./types";

export class MockConversationalAI implements ConversationalAIProvider {
  private responses = {
    greeting: [
      "Hi there! I'm here to help you with some questions about your child. Let's start with the first one!",
      "Hello! Ready to chat about your child? I'll ask some questions and we can talk through them together.",
      "Hey! Thanks for trying our assessment. Let me ask you about your child, and feel free to share as much as you'd like!",
    ],

    followUp: [
      "That's really helpful to know. Can you tell me a bit more about that?",
      "I understand. How often would you say this happens?",
      "Thanks for sharing that with me. Does this seem to be getting better or worse lately?",
      "That gives me good insight. Have you noticed any patterns with this behavior?",
      "Interesting. Can you give me a specific example of when this happens?",
      "I see. How does your child react when this occurs?",
    ],

    clarification: [
      "Just to make sure I understand - would you say that's mostly true or mostly false?",
      "Based on what you're telling me, it sounds like the answer would be yes. Is that right?",
      "From what you've described, I'm thinking this would be a 'no' - does that match what you're seeing?",
      "Help me understand - are we talking about something that happens regularly?",
      "So if I had to categorize this as a yes or no, which would you lean toward?",
      "Let me clarify - does this happen more often than not?",
    ],

    transition: [
      "Great, that helps me understand that area. Let's move on to the next topic.",
      "Perfect! Now I'd like to ask about something a bit different.",
      "Thanks for that insight. The next question is about a different area entirely.",
      "Wonderful! Let's shift gears and talk about something else.",
      "That's very helpful. Moving on to our next question...",
      "Excellent information. Now let's explore another aspect.",
    ],

    encouragement: [
      "You're doing great sharing this information with me!",
      "This is really helpful - you know your child well.",
      "I appreciate how thoughtfully you're answering these questions.",
      "Your insights are giving me a clear picture. Keep going!",
      "Thank you for being so open about your observations.",
      "This level of detail is exactly what helps create accurate assessments.",
    ],

    completion: [
      "Thank you so much for sharing all of that with me! I have everything I need to generate your child's assessment report.",
      "That's all the questions I have. You've provided excellent insights about your child - let me prepare your results!",
      "Perfect! We've covered all the areas I needed to assess. Your detailed responses will help create a comprehensive report.",
    ],
  };

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
    // Simulate AI thinking delay
    await this.delay(800 + Math.random() * 1500);

    let responseText: string;

    // ✅ STRUCTURED RESPONSE LOGIC
    if (context?.clarificationNeeded) {
      responseText = this.getRandomResponse("clarification");
    } else if (context?.shouldProgress && context?.nextQuestion) {
      const acknowledgment = this.getRandomResponse("transition");
      responseText = `${acknowledgment} ${context.nextQuestion.text}`;
    } else if (context?.shouldProgress && !context?.nextQuestion) {
      responseText = this.getRandomResponse("completion");
    } else if (session.messages.length === 0) {
      // Initial greeting
      responseText = `${this.getRandomResponse("greeting")} ${currentQuestion.text}`;
    } else {
      // Fallback - ask follow-up
      responseText = this.getRandomResponse("followUp");
    }

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: "ai",
      content: responseText,
      timestamp: new Date(),
      metadata: {
        questionId: currentQuestion.id,
        domainSlug: this.getDomainSlug(currentQuestion),
        confidence: context?.confidence || 0.8 + Math.random() * 0.2,
      },
    };
  }

  async extractAnswer(
    userMessage: string,
    question: Question
  ): Promise<{ answer: boolean | null; confidence: number }> {
    // Simulate processing delay
    await this.delay(300 + Math.random() * 700);

    const message = userMessage.toLowerCase().trim();

    // Strong positive indicators
    if (
      this.containsAny(message, [
        "yes",
        "definitely",
        "always",
        "constantly",
        "very often",
        "frequently",
        "all the time",
        "absolutely",
        "for sure",
      ])
    ) {
      return { answer: true, confidence: 0.95 };
    }

    // Strong negative indicators
    if (
      this.containsAny(message, [
        "no",
        "never",
        "not at all",
        "rarely",
        "hardly ever",
        "definitely not",
        "absolutely not",
        "not really",
      ])
    ) {
      return { answer: false, confidence: 0.95 };
    }

    // Moderate positive indicators
    if (
      this.containsAny(message, [
        "sometimes",
        "occasionally",
        "a bit",
        "somewhat",
        "kind of",
        "sort of",
        "pretty much",
        "usually",
        "most of the time",
      ])
    ) {
      return { answer: true, confidence: 0.7 };
    }

    // Moderate negative indicators
    if (
      this.containsAny(message, [
        "not often",
        "not usually",
        "seldom",
        "infrequently",
        "not much",
        "barely",
        "not really much",
      ])
    ) {
      return { answer: false, confidence: 0.7 };
    }

    // Look for contextual clues in longer responses
    if (message.length > 50) {
      const positiveWords = [
        "problem",
        "difficult",
        "struggle",
        "issue",
        "concern",
        "worry",
      ];
      const negativeWords = ["fine", "good", "normal", "okay", "well", "great"];

      const hasPositive = positiveWords.some((word) => message.includes(word));
      const hasNegative = negativeWords.some((word) => message.includes(word));

      if (hasPositive && !hasNegative) {
        return { answer: true, confidence: 0.65 };
      }
      if (hasNegative && !hasPositive) {
        return { answer: false, confidence: 0.65 };
      }
    }

    // Default uncertain - need more clarification
    return { answer: null, confidence: 0.3 };
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
    // Mock summary for trial users
    return `Thank you for completing this assessment! Your responses have been recorded and will help provide insights into your child's behavioral patterns.`;
  }

  private getRandomResponse(type: keyof typeof this.responses): string {
    const responses = this.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private needsClarification(message: string): boolean {
    const lowConfidenceIndicators = [
      "maybe",
      "i think",
      "i guess",
      "not sure",
      "depends",
      "it varies",
      "sometimes yes sometimes no",
      "hard to say",
    ];

    return (
      message.length > 30 &&
      !this.containsAny(message.toLowerCase(), [
        "yes",
        "no",
        "always",
        "never",
      ]) &&
      (lowConfidenceIndicators.some((indicator) =>
        message.toLowerCase().includes(indicator)
      ) ||
        message.length > 100)
    );
  }

  private shouldEncourage(session: ConversationalSession): boolean {
    return session.messages.length > 0 && session.messages.length % 6 === 0;
  }

  private getNextQuestionText(session: ConversationalSession): string {
    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex < session.questions.length) {
      return session.questions[nextIndex].text;
    }
    return "Let me prepare your assessment results!";
  }

  private getDomainSlug(question: Question): string {
    return question.domainSlug || "general";
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
