/**
 * Shared types for ChatGPT widget components
 */

export interface AssessmentQuestion {
  questionId: string;
  text: string;
  domain: string;
  options?: string[];
}

export interface WidgetState {
  sessionId?: string;
  assessmentId?: string;
  resultId?: string;
  userId?: string;
  childName?: string;
  childAge?: number;
  relationshipType?: string;
  questions?: AssessmentQuestion[];
  currentQuestion?: number;
  creditsNeeded?: number;
  creditsAvailable?: number;
  scores?: any;
  percentile?: number;
  riskLevel?: string;
}

export interface ToolOutputContent {
  type: "text" | "image" | "document" | "table" | "json";
  text?: string;
  url?: string;
  data?: any;
}

export interface ToolOutput {
  content: ToolOutputContent[];
  structuredContent?: Record<string, any>;
}

/**
 * OpenAI window.openai API type definitions
 */
declare global {
  interface Window {
    openai: {
      widgetState: WidgetState;
      toolOutput: (output: ToolOutput) => void;
      sendFollowUpMessage: (message: string) => void;
    };
  }
}

export default {};
