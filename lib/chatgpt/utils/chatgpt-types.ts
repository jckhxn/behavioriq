/**
 * TypeScript definitions for ChatGPT integration
 */

// OpenAI SDK Window Interface
export interface OpenAISDK {
  toolOutput: any;
  sendMessage: (message: string, metadata?: Record<string, any>) => Promise<void>;
  updateProgress: (progress: number) => Promise<void>;
  ready: boolean;
}

declare global {
  interface Window {
    openai?: OpenAISDK;
  }
}

// Widget Tool Output Types
export interface TrialToolOutput {
  sessionId: string;
  toolName: "start_trial";
  widgetType: "trial";
}

export interface AssessmentToolOutput {
  sessionId: string;
  assessmentId: string;
  subjectName: string;
  toolName: "start_full_assessment";
  widgetType: "assessment";
}

export interface ResultsToolOutput {
  assessmentId: string;
  toolName: "view_results";
  widgetType: "results";
}

export type WidgetToolOutput = TrialToolOutput | AssessmentToolOutput | ResultsToolOutput;

// Session State
export interface SessionState {
  sessionId: string;
  assessmentId?: string;
  currentQuestionIndex: number;
  answeredCount: number;
  totalQuestions: number;
  progress: number;
  isComplete: boolean;
  isTrial: boolean;
  currentQuestion?: Question;
  messages?: ConversationalMessage[];
}

// Question Types
export interface Question {
  id: string;
  text: string;
  domain?: string;
  domainSlug?: string;
  weight?: number;
  order?: number;
  required?: boolean;
}

// Message Types
export interface ConversationalMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date | string;
  metadata?: {
    questionId?: string;
    domainSlug?: string;
    confidence?: number;
  };
}

// Results Types
export interface DomainScore {
  name: string;
  score: number;
  answered: number;
  total: number;
  riskLevel?: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
}

export interface AssessmentResults {
  id: string;
  mode: "TRIAL" | "FULL";
  completedAt: string;
  childLabel: string;
  anonymous: boolean;
  domains: DomainScore[];
  flags: string[];
  isComplete: boolean;
  answeredCount: number;
  totalCount: number;
  sessionId: string;
}

// Analytics Event Types
export interface WidgetEvent {
  event: string;
  sessionId?: string;
  assessmentId?: string;
  widgetType: "trial" | "assessment" | "results" | "auth";
  timestamp: number;
  metadata?: Record<string, any>;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
}

export interface MagicLinkRequest {
  email: string;
  returnTo?: string;
  sessionId?: string;
  assessmentId?: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message: string;
  email: string;
  expiresIn: number;
}
