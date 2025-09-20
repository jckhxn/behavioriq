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

export interface QuestionConfig {
  id: string;
  text: string;
  order: number;
  isGatingQuestion: boolean;
  weight: number;
  skipCondition?: SkipCondition;
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
}
