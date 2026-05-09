/**
 * Shared Assessment Types
 *
 * Common type definitions used by both server and client assessment loaders
 */

import { AssessmentDomain } from "@prisma/client";

export interface SkipCondition {
  questionId: string;
  skipValue: boolean;
  skipToQuestion?: string;
}

export type QuestionResponseType = "boolean" | "likert" | "text";

export interface LikertOption {
  value: number;
  label: string;
}

export interface LikertScale {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  options?: LikertOption[];
}

export interface QuestionConfig {
  id: string;
  text: string;
  order: number;
  isGatingQuestion: boolean;
  weight: number;
  skipCondition?: SkipCondition;
  responseType?: QuestionResponseType;
  likertScale?: LikertScale;
}

export interface TerminationRuleConfig {
  name: string;
  description: string;
  minimumYesToContinue: number;
  checkAfterQuestion: number;
}

export interface PrerequisiteConfig {
  questionId: string;
  requiredValue: boolean;
}

export interface MultiPartLogicConfig {
  part1Questions: string[];
  part1Threshold: number;
  part2Questions: string[];
  part2Threshold: number;
}

export interface QuestionSetConfig {
  domain: AssessmentDomain;
  name: string;
  displayName: string;
  description: string;
  order: number;
  totalPossibleScore: number;
  clinicallySignificantScore: number;
  skipConditions: SkipCondition[];
  prerequisites: PrerequisiteConfig[];
  questions: QuestionConfig[];
  terminationRules: TerminationRuleConfig[];
  multiPartLogic?: MultiPartLogicConfig;
  resources?: any; // Domain-specific recommended resources with citations
}
