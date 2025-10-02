/**
 * Shared TypeScript types for the application
 */

import type { DomainKey } from "@/lib/assessment/domain-mapper";

/**
 * Domain score result
 */
export interface DomainScore {
  score: number;
  severity: "Low" | "Moderate" | "High" | "Very High" | "Severe";
  count: number;
  rawData?: any;
}

/**
 * Assessment results with domain scores
 */
export interface AssessmentResults {
  id: string;
  userId: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  startedAt: Date;
  completedAt: Date | null;
  scores: Record<DomainKey, DomainScore>;
  hasEnhancedReport: boolean;
  responses: QuestionResponse[];
}

/**
 * Question response
 */
export interface QuestionResponse {
  id: string;
  questionId: string;
  response: boolean | string;
  timestamp: Date;
  assessmentId: string;
}

/**
 * Assessment statistics
 */
export interface AssessmentStats {
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}
