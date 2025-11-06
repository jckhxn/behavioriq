/**
 * Dynamic Scoring Calculator for Structured Assessments
 *
 * Handles yes/no question scoring, early termination logic,
 * and risk level calculation for dynamically loaded assessments.
 */

import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { QuestionSetConfig } from "./types";

const isScoringDebugEnabled =
  process.env.ASSESSMENT_SCORING_DEBUG === "true";

const scoringDebugLog = (...args: unknown[]) => {
  if (isScoringDebugEnabled) {
    console.log(...args);
  }
};

export interface QuestionResponse {
  questionId: string;
  response: string | boolean; // Can be string from DB or boolean from code
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

export class DynamicScoringCalculator {
  private assessmentConfigs: QuestionSetConfig[];

  constructor(assessmentConfigs: QuestionSetConfig[]) {
    this.assessmentConfigs = assessmentConfigs;
  }

  /**
   * Calculate score for a specific domain
   */
  calculateDomainScore(
    domainName: string,
    responses: QuestionResponse[]
  ): DomainScore {
    const domainConfig = this.assessmentConfigs.find(
      (d) => d.name === domainName
    );

    if (!domainConfig) {
      throw new Error(`Domain ${domainName} not found`);
    }

    scoringDebugLog(`\n=== CALCULATING DOMAIN SCORE: ${domainName} ===`);
    scoringDebugLog(`Domain config:`, {
      totalPossible: domainConfig.totalPossibleScore,
      clinicalThreshold: domainConfig.clinicallySignificantScore,
      hasPrerequisites: domainConfig.prerequisites.length > 0,
      hasMultiPart: !!domainConfig.multiPartLogic,
    });

    // Check prerequisites (e.g., age check for ASPD)
    if (domainConfig.prerequisites.length > 0) {
      for (const prerequisite of domainConfig.prerequisites) {
        scoringDebugLog(
          `Checking prerequisite: ${prerequisite.questionId} must be ${prerequisite.requiredValue}`
        );
        const prereqResponse = responses.find(
          (r) => r.questionId === prerequisite.questionId
        );
        scoringDebugLog(
          `Prerequisite response:`,
          prereqResponse
            ? `${prereqResponse.questionId} = ${prereqResponse.response}`
            : "Not found"
        );

        if (
          !prereqResponse ||
          prereqResponse.response !== prerequisite.requiredValue
        ) {
          scoringDebugLog(`❌ DOMAIN SKIPPED: Prerequisite not met`);
          return {
            domain: domainName,
            displayName: domainConfig.displayName,
            score: 0,
            totalPossible: domainConfig.totalPossibleScore,
            clinicallySignificantScore: domainConfig.clinicallySignificantScore,
            isClinicallySignificant: false,
            skipped: true,
            skipReason: "Prerequisite not met",
            percentage: 0,
            questionsAnswered: 0,
          };
        }
      }
      scoringDebugLog(`✅ Prerequisites met, continuing with domain`);
    }

    // Handle multi-part logic (ASPD)
    if (domainConfig.multiPartLogic) {
      return this.calculateMultiPartScore(domainConfig, responses);
    }

    // Standard scoring
    const domainResponses = responses.filter((r) =>
      domainConfig.questions.some((q) => q.id === r.questionId)
    );

    const deduped = new Map<string, QuestionResponse>();
    for (const response of domainResponses) {
      deduped.set(response.questionId, response);
    }
    const uniqueResponses = Array.from(deduped.values());

    scoringDebugLog(
      `Domain responses (${uniqueResponses.length} answered):`,
      uniqueResponses.map((r) => `${r.questionId}=${r.response ? "YES" : "NO"}`)
    );

    const totalPossible = domainConfig.totalPossibleScore || 0;
    const rawScore = uniqueResponses.reduce(
      (sum, response) => sum + (response.response ? 1 : 0),
      0
    );
    const clampedScore = Math.min(rawScore, totalPossible || rawScore);

    const yesCount = clampedScore;
    const noCount = uniqueResponses.length - clampedScore;
    const percentage =
      totalPossible > 0 ? (clampedScore / totalPossible) * 100 : 0;
    const isClinicallySignificant =
      clampedScore >= domainConfig.clinicallySignificantScore;

    scoringDebugLog(`Scoring results:`, {
      yesAnswers: yesCount,
      noAnswers: noCount,
      totalAnswered: uniqueResponses.length,
      rawScore,
      clampedScore,
      totalPossible,
      percentage: percentage.toFixed(1) + "%",
      clinicalThreshold: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
    });

    return {
      domain: domainName,
      displayName: domainConfig.displayName,
      score: clampedScore,
      totalPossible,
      clinicallySignificantScore: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
      percentage,
      questionsAnswered: Math.min(uniqueResponses.length, totalPossible),
    };
  }

  /**
   * Calculate multi-part domain score (for ASPD)
   */
  private calculateMultiPartScore(
    domainConfig: QuestionSetConfig,
    responses: QuestionResponse[]
  ): DomainScore {
    const { multiPartLogic } = domainConfig;
    if (!multiPartLogic) {
      throw new Error("Multi-part logic not defined");
    }

    // Part 1: Childhood Conduct Disorder symptoms (before age 15)
    const part1Seen = new Set<string>();
    const part1Responses = responses.filter((r) => {
      if (!multiPartLogic.part1Questions.includes(r.questionId)) {
        return false;
      }
      if (part1Seen.has(r.questionId)) {
        return false;
      }
      part1Seen.add(r.questionId);
      return true;
    });
    const part1Score = part1Responses.reduce(
      (sum, r) => sum + (r.response ? 1 : 0),
      0
    );
    const part1Met = part1Score >= multiPartLogic.part1Threshold;

    scoringDebugLog(
      `Part 1 (Childhood CD): ${part1Score}/${multiPartLogic.part1Questions.length} (threshold: ${multiPartLogic.part1Threshold})`
    );

    // Part 2: Adult antisocial behavior (18+)
    const part2Seen = new Set<string>();
    const part2Responses = responses.filter((r) => {
      if (!multiPartLogic.part2Questions.includes(r.questionId)) {
        return false;
      }
      if (part2Seen.has(r.questionId)) {
        return false;
      }
      part2Seen.add(r.questionId);
      return true;
    });
    const part2Score = part2Responses.reduce(
      (sum, r) => sum + (r.response ? 1 : 0),
      0
    );
    const part2Met = part2Score >= multiPartLogic.part2Threshold;

    scoringDebugLog(
      `Part 2 (Adult): ${part2Score}/${multiPartLogic.part2Questions.length} (threshold: ${multiPartLogic.part2Threshold})`
    );

    // Total score
    const totalScore = part1Score + part2Score;
    const totalAnswered = part1Responses.length + part2Responses.length;
    const totalPossible = domainConfig.totalPossibleScore || 0;
    const clampedTotalScore = Math.min(totalScore, totalPossible || totalScore);
    const percentage = totalPossible > 0 ? (clampedTotalScore / totalPossible) * 100 : 0;

    // Clinical significance: Both parts must meet threshold
    const isClinicallySignificant = part1Met && part2Met;

    scoringDebugLog(`Multi-part scoring:`, {
      part1Score,
      part1Met,
      part2Score,
      part2Met,
      totalScore,
      clampedTotalScore,
      isClinicallySignificant,
      percentage: percentage.toFixed(1) + "%",
    });

    return {
      domain: domainConfig.name,
      displayName: domainConfig.displayName,
      score: clampedTotalScore,
      totalPossible,
      clinicallySignificantScore: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
      percentage,
      questionsAnswered: Math.min(totalAnswered, totalPossible),
    };
  }

  /**
   * Check if early termination should occur for a domain
   */
  checkEarlyTermination(
    domainName: string,
    responses: QuestionResponse[]
  ): TerminationCheckResult {
    const domainConfig = this.assessmentConfigs.find(
      (d) => d.name === domainName
    );
    if (!domainConfig) return { shouldTerminate: false };

    // Get the most recently answered question
    const lastResponse = responses[responses.length - 1];
    if (!lastResponse) return { shouldTerminate: false };

    // Check if any question in this domain has a skip condition triggered by the last response
    for (const question of domainConfig.questions) {
      // Check through skipConditions array
      for (const skipCondition of domainConfig.skipConditions) {
        if (skipCondition.questionId === lastResponse.questionId) {
          // The last response was to a question that can trigger a skip
          if (lastResponse.response === skipCondition.skipValue) {
            return {
              shouldTerminate: false,
              nextQuestionId: skipCondition.skipToQuestion,
            };
          }
        }
      }
    }

    return { shouldTerminate: false };
  }

  /**
   * Calculate all domain scores
   */
  getAllDomainScores(responses: QuestionResponse[]): DomainScore[] {
    return this.assessmentConfigs.map((domain) =>
      this.calculateDomainScore(domain.name, responses)
    );
  }

  /**
   * Get next question for assessment
   */
  getNextQuestion(
    currentDomainIndex: number,
    currentQuestionIndex: number,
    responses: QuestionResponse[]
  ): { questionId: string; text: string; domain: string } | null {
    if (currentDomainIndex >= this.assessmentConfigs.length) return null;

    const currentDomain = this.assessmentConfigs[currentDomainIndex];

    // Check for skip conditions
    const terminationCheck = this.checkEarlyTermination(
      currentDomain.name,
      responses
    );
    if (terminationCheck.nextQuestionId) {
      const question = currentDomain.questions.find(
        (q) => q.id === terminationCheck.nextQuestionId
      );
      if (question) {
        return {
          questionId: question.id,
          text: question.text,
          domain: currentDomain.name,
        };
      }
    }

    // Get next question in current domain
    if (currentQuestionIndex < currentDomain.questions.length - 1) {
      const nextQuestion = currentDomain.questions[currentQuestionIndex + 1];
      return {
        questionId: nextQuestion.id,
        text: nextQuestion.text,
        domain: currentDomain.name,
      };
    }

    return null;
  }

  /**
   * Get next domain
   */
  getNextDomain(currentDomainIndex: number): {
    name: string;
    firstQuestion: { questionId: string; text: string };
  } | null {
    const nextDomainIndex = currentDomainIndex + 1;
    if (nextDomainIndex >= this.assessmentConfigs.length) return null;

    const nextDomain = this.assessmentConfigs[nextDomainIndex];
    const firstQuestion = nextDomain.questions[0];

    return {
      name: nextDomain.name,
      firstQuestion: {
        questionId: firstQuestion.id,
        text: firstQuestion.text,
      },
    };
  }

  /**
   * Check if assessment is complete
   */
  isAssessmentComplete(
    responses: QuestionResponse[],
    currentDomainIndex: number
  ): boolean {
    return currentDomainIndex >= this.assessmentConfigs.length;
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
    const totalQuestions = this.assessmentConfigs.reduce(
      (sum, domain) => sum + domain.questions.length,
      0
    );
    const answeredQuestions = responses.length;
    const completedDomains = currentDomainIndex;

    return {
      totalQuestions,
      answeredQuestions,
      completedDomains,
      overallProgress: (answeredQuestions / totalQuestions) * 100,
    };
  }

  /**
   * Map score to risk level
   */
  mapScoreToRiskLevel(domainScore: DomainScore): RiskLevel {
    if (domainScore.skipped) return RiskLevel.LOW;
    if (domainScore.isClinicallySignificant) return RiskLevel.HIGH;

    if (domainScore.percentage >= 60) return RiskLevel.MODERATE;
    return RiskLevel.LOW;
  }
}
