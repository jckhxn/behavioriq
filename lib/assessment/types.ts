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
  skipLogic?: SkipCondition | null;
  category?: string | null;
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

export interface QuestionSubsetThreshold {
  enabled: boolean;
  /** Skip the domain when the condition is "met" or "not_met" */
  skipWhen: "met" | "not_met";
  threshold: number;
  comparator: "=" | ">" | ">=" | "<" | "<=";
  /** "any": at least one question meets it; "all": every question meets it; "sum": sum of values meets it */
  aggregation: "any" | "all" | "sum";
  /** Question IDs to evaluate */
  questionIds: string[];
  questionIndexes?: number[];
}

export interface DomainGatingLogic {
  questionSubsetThreshold?: QuestionSubsetThreshold;
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
  gatingLogic?: DomainGatingLogic;
  resources?: any; // Domain-specific recommended resources with citations
}
