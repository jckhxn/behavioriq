export interface ConversationalMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    domainSlug?: string;
    confidence?: number;
    tokenUsage?: TokenUsage;
  };
}

export interface ConversationalSession {
  id: string;
  assessmentId: string;
  userId?: string; // null for trial
  currentQuestionIndex: number;
  responses: Record<string, boolean>;
  messages: ConversationalMessage[];
  isComplete: boolean;
  isTrial: boolean;
  questions: Question[];
  totalTokenUsage?: TokenUsage;
  clarificationAttempts?: number; // Track how many times we've asked for clarification on current question
}

export interface AnswerExtraction {
  answer: boolean | null;
  confidence: number;
  tokenUsage?: TokenUsage;
}

export interface ResponseContext {
  shouldProgress: boolean;
  clarificationNeeded: boolean;
  extractedAnswer: boolean | null;
  confidence: number;
  nextQuestion: Question | null;
}

export interface ConversationalAIProvider {
  generateResponse(
    session: ConversationalSession,
    userMessage: string,
    currentQuestion: Question,
    context?: ResponseContext
  ): Promise<ConversationalMessage>;

  extractAnswer(
    userMessage: string,
    question: Question
  ): Promise<AnswerExtraction>;

  generateInitialMessage(
    session: ConversationalSession
  ): Promise<ConversationalMessage>;

  generateSummary?(
    session: ConversationalSession,
    scores: Record<string, number>
  ): Promise<string>;

  generateStreamingResponse?(
    session: ConversationalSession,
    userMessage: string,
    currentQuestion: Question,
    context?: ResponseContext
  ): Promise<any>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Question {
  id: string;
  text: string;
  domainSlug?: string;
  weight?: number;
  order?: number;
  domain?: string;
  required?: boolean;
  domainTemplateId?: string;
}
