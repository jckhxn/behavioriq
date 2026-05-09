/**
 * Dynamic Scoring Calculator for Structured Assessments
 *
 * Handles yes/no question scoring, early termination logic,
 * and risk level calculation for dynamically loaded assessments.
 *
 * NOTE: This module now uses dynamic assessment configs.
 * The old static EARLY_DETECTION_SCREENER approach has been replaced.
 */

import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { QuestionSetConfig } from "./types";
import { DynamicScoringCalculator } from "./scoring-dynamic";

export interface QuestionResponse {
  questionId: string;
  response: string | boolean | number;
  timestamp?: Date;
}

export interface DomainScore {
  domain: string;
  displayName: string;
  score: number;
  totalPossible: number;
  clinicallySignificantScore: number;
  isClinicallySignificant: boolean;
  skipped: boolean;
  skipReason?: string;
  percentage: number;
  questionsAnswered: number;
}

export interface TerminationCheckResult {
  shouldTerminate: boolean;
  nextQuestionId?: string;
}

/**
 * Legacy ScoringCalculator class - now requires assessment configs
 * Use DynamicScoringCalculator directly for new code
 */
export class ScoringCalculator {
  private dynamicCalculator: DynamicScoringCalculator;

  constructor(assessmentConfigs: QuestionSetConfig[]) {
    this.dynamicCalculator = new DynamicScoringCalculator(assessmentConfigs);
  }

  /**
   * Calculate score for a specific domain (legacy format for compatibility)
   */
  calculateDomainScore(
    domainName: string,
    responses: QuestionResponse[]
  ): {
    score: number;
    totalPossible: number;
    riskLevel: RiskLevel;
    details: {
      answeredQuestions: number;
      skippedQuestions: number;
      criticalIndicators: string[];
    };
    skipped?: boolean;
    skipReason?: string;
  } {
    const domainScore = this.dynamicCalculator.calculateDomainScore(
      domainName,
      responses
    );

    return {
      score: domainScore.score,
      totalPossible: domainScore.totalPossible,
      riskLevel: this.dynamicCalculator.mapScoreToRiskLevel(domainScore),
      details: {
        answeredQuestions: domainScore.questionsAnswered,
        skippedQuestions:
          domainScore.totalPossible - domainScore.questionsAnswered,
        criticalIndicators: domainScore.isClinicallySignificant
          ? [`${domainName} clinically significant`]
          : [],
      },
      skipped: domainScore.skipped,
      skipReason: domainScore.skipReason,
    };
  }

  /**
   * Get full domain score (new format)
   */
  getDomainScore(
    domainName: string,
    responses: QuestionResponse[]
  ): DomainScore {
    return this.dynamicCalculator.calculateDomainScore(domainName, responses);
  }

  /**
   * Check if early termination should occur for a domain
   */
  checkEarlyTermination(
    domainName: string,
    responses: QuestionResponse[]
  ): TerminationCheckResult {
    return this.dynamicCalculator.checkEarlyTermination(domainName, responses);
  }

  /**
   * Calculate all domain scores
   */
  getAllDomainScores(responses: QuestionResponse[]): DomainScore[] {
    return this.dynamicCalculator.getAllDomainScores(responses);
  }

  /**
   * Get next question for assessment
   */
  getNextQuestion(
    currentDomainIndex: number,
    currentQuestionIndex: number,
    responses: QuestionResponse[]
  ): { questionId: string; text: string; domain: string } | null {
    return this.dynamicCalculator.getNextQuestion(
      currentDomainIndex,
      currentQuestionIndex,
      responses
    );
  }

  /**
   * Get next domain
   */
  getNextDomain(currentDomainIndex: number): {
    name: string;
    firstQuestion: { questionId: string; text: string };
  } | null {
    return this.dynamicCalculator.getNextDomain(currentDomainIndex);
  }

  /**
   * Check if assessment is complete
   */
  isAssessmentComplete(
    responses: QuestionResponse[],
    currentDomainIndex: number
  ): boolean {
    return this.dynamicCalculator.isAssessmentComplete(
      responses,
      currentDomainIndex
    );
  }

  /**
   * Calculate progress
   */
  calculateProgress(
    responses: QuestionResponse[],
    currentDomainIndex: number
  ): {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  } {
    return this.dynamicCalculator.calculateProgress(
      responses,
      currentDomainIndex
    );
  }

  /**
   * Map score to risk level
   */
  mapScoreToRiskLevel(domainScore: DomainScore): RiskLevel {
    return this.dynamicCalculator.mapScoreToRiskLevel(domainScore);
  }
}

// Export the new dynamic calculator
export { DynamicScoringCalculator };

// Export singleton for backwards compatibility - now requires configs
export const createScoringCalculator = (
  assessmentConfigs: QuestionSetConfig[]
) => new ScoringCalculator(assessmentConfigs);
