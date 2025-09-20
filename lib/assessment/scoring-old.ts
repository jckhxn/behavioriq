/**
 * Dynamic Scoring Calculator for Structured Assessments
 *
 * Handles yes/no question scoring, early termination logic,
 * and risk level calculation for dynamically loaded assessments.
 */

import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { QuestionSetConfig } from "./types";

export interface QuestionResponse {
  questionId: string;
  response: boolean;
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
  reason?: string;
  nextQuestionId?: string;
}

export class ScoringCalculator {
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
  ): {
    score: number;
    totalPossible: number;
    riskLevel: RiskLevel;
    details: {
      answeredQuestions: number;
      skippedQuestions: number;
      criticalIndicators: string[];
    };
  } {
    const domainConfig = this.assessmentConfigs.find(
      (d) => d.name === domainName
    );

    if (!domainConfig) {
      throw new Error(`Domain ${domainName} not found`);
    }

    console.log(`\n=== CALCULATING DOMAIN SCORE: ${domainName} ===`);
    console.log(`Domain config:`, {
      totalPossible: domainConfig.totalPossibleScore,
      clinicalThreshold: domainConfig.clinicallySignificantScore,
      hasPrerequisite: !!domainConfig.prerequisite,
      hasMultiPart: !!domainConfig.multiPartLogic,
    });

    // Check prerequisite (e.g., age check for ASPD)
    if (domainConfig.prerequisite) {
      console.log(
        `Checking prerequisite: ${domainConfig.prerequisite.questionId} must be ${domainConfig.prerequisite.requiredValue}`
      );
      const prereqResponse = responses.find(
        (r) => r.questionId === domainConfig.prerequisite!.questionId
      );
      console.log(
        `Prerequisite response:`,
        prereqResponse
          ? `${prereqResponse.questionId} = ${prereqResponse.response}`
          : "Not found"
      );

      if (
        !prereqResponse ||
        prereqResponse.response !== domainConfig.prerequisite.requiredValue
      ) {
        console.log(`❌ DOMAIN SKIPPED: Prerequisite not met`);
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
      console.log(`✅ Prerequisite met, continuing with domain`);
    }

    // Handle multi-part logic (ASPD)
    if (domainConfig.multiPartLogic) {
      return this.calculateMultiPartScore(domainConfig, responses);
    }

    // Standard scoring
    const domainResponses = responses.filter((r) =>
      domainConfig.questions.some((q) => q.id === r.questionId)
    );

    console.log(
      `Domain responses (${domainResponses.length} answered):`,
      domainResponses.map((r) => `${r.questionId}=${r.response ? "YES" : "NO"}`)
    );

    const score = domainResponses.reduce(
      (sum, response) => sum + (response.response ? 1 : 0),
      0
    );

    const yesCount = score;
    const noCount = domainResponses.length - score;
    const percentage = (score / domainConfig.totalPossibleScore) * 100;
    const isClinicallySignificant =
      score >= domainConfig.clinicallySignificantScore;

    console.log(`Scoring results:`, {
      yesAnswers: yesCount,
      noAnswers: noCount,
      totalAnswered: domainResponses.length,
      rawScore: score,
      totalPossible: domainConfig.totalPossibleScore,
      percentage: percentage.toFixed(1) + "%",
      clinicalThreshold: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
    });

    return {
      domain: domainName,
      displayName: domainConfig.displayName,
      score,
      totalPossible: domainConfig.totalPossibleScore,
      clinicallySignificantScore: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
      percentage,
      questionsAnswered: domainResponses.length,
    };
  }

  private static calculateMultiPartScore(
    domainConfig: AssessmentDomainConfig,
    responses: QuestionResponse[]
  ): DomainScore {
    const { multiPartLogic } = domainConfig;
    if (!multiPartLogic) throw new Error("Multi-part logic not defined");

    console.log(`Multi-part logic for ${domainConfig.name}:`, {
      part1Questions: multiPartLogic.part1Questions,
      part1Threshold: multiPartLogic.part1Threshold,
      part2Questions: multiPartLogic.part2Questions,
      part2Threshold: multiPartLogic.part2Threshold,
    });

    // Calculate Part 1 score
    const part1Responses = responses.filter((r) =>
      multiPartLogic.part1Questions.includes(r.questionId)
    );
    const part1Score = part1Responses.reduce(
      (sum, r) => sum + (r.response ? 1 : 0),
      0
    );

    console.log(`Part 1 results:`, {
      answered: part1Responses.map(
        (r) => `${r.questionId}=${r.response ? "YES" : "NO"}`
      ),
      yesCount: part1Score,
      threshold: multiPartLogic.part1Threshold,
      thresholdMet: part1Score >= multiPartLogic.part1Threshold,
    });

    // Check if Part 1 threshold is met
    if (part1Score < multiPartLogic.part1Threshold) {
      console.log(
        `❌ DOMAIN SKIPPED: Part 1 threshold not met (${part1Score}/${multiPartLogic.part1Threshold})`
      );
      return {
        domain: domainConfig.name,
        displayName: domainConfig.displayName,
        score: part1Score,
        totalPossible: domainConfig.totalPossibleScore,
        clinicallySignificantScore: domainConfig.clinicallySignificantScore,
        isClinicallySignificant: false,
        skipped: true,
        skipReason: `Part 1 threshold not met (${part1Score}/${multiPartLogic.part1Threshold})`,
        percentage: (part1Score / domainConfig.totalPossibleScore) * 100,
        questionsAnswered: part1Responses.length,
      };
    }

    console.log(`✅ Part 1 threshold met, continuing to Part 2`);

    // Calculate Part 2 score
    const part2Responses = responses.filter((r) =>
      multiPartLogic.part2Questions.includes(r.questionId)
    );
    const part2Score = part2Responses.reduce(
      (sum, r) => sum + (r.response ? 1 : 0),
      0
    );

    console.log(`Part 2 results:`, {
      answered: part2Responses.map(
        (r) => `${r.questionId}=${r.response ? "YES" : "NO"}`
      ),
      yesCount: part2Score,
      threshold: multiPartLogic.part2Threshold,
      thresholdMet: part2Score >= multiPartLogic.part2Threshold,
    });

    const totalScore = part1Score + part2Score;
    const isClinicallySignificant =
      part1Score >= multiPartLogic.part1Threshold &&
      part2Score >= multiPartLogic.part2Threshold;

    console.log(`Multi-part final results:`, {
      part1Score,
      part2Score,
      totalScore,
      totalPossible: domainConfig.totalPossibleScore,
      isClinicallySignificant,
      bothThresholdsMet: `Part1: ${
        part1Score >= multiPartLogic.part1Threshold
      }, Part2: ${part2Score >= multiPartLogic.part2Threshold}`,
    });

    return {
      domain: domainConfig.name,
      displayName: domainConfig.displayName,
      score: totalScore,
      totalPossible: domainConfig.totalPossibleScore,
      clinicallySignificantScore: domainConfig.clinicallySignificantScore,
      isClinicallySignificant,
      skipped: false,
      percentage: (totalScore / domainConfig.totalPossibleScore) * 100,
      questionsAnswered: part1Responses.length + part2Responses.length,
    };
  }

  /**
   * Check if early termination should occur for a domain
   */
  static checkEarlyTermination(
    domainName: string,
    responses: QuestionResponse[]
  ): TerminationCheckResult {
    const domainConfig = EARLY_DETECTION_SCREENER.find(
      (d) => d.name === domainName
    );
    if (!domainConfig) return { shouldTerminate: false };

    // Get the most recently answered question
    const lastResponse = responses[responses.length - 1];
    if (!lastResponse) return { shouldTerminate: false };

    // Check if any question in this domain has a skip condition triggered by the last response
    for (const question of domainConfig.questions) {
      if (
        question.skipCondition &&
        question.skipCondition.questionId === lastResponse.questionId
      ) {
        // The last response was to a question that can trigger a skip
        if (lastResponse.response === question.skipCondition.skipValue) {
          return {
            shouldTerminate: false,
            nextQuestionId: question.skipCondition.skipToQuestion,
          };
        }
      }
    }

    return { shouldTerminate: false };
  }

  /**
   * Calculate all domain scores
   */
  static getAllDomainScores(responses: QuestionResponse[]): DomainScore[] {
    return EARLY_DETECTION_SCREENER.map((domain) =>
      this.calculateDomainScore(domain.name, responses)
    );
  }

  /**
   * Get next question for assessment
   */
  static getNextQuestion(
    currentDomainIndex: number,
    currentQuestionIndex: number,
    responses: QuestionResponse[]
  ): { questionId: string; text: string; domain: string } | null {
    if (currentDomainIndex >= EARLY_DETECTION_SCREENER.length) return null;

    const currentDomain = EARLY_DETECTION_SCREENER[currentDomainIndex];

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
  static getNextDomain(currentDomainIndex: number): {
    name: string;
    firstQuestion: { questionId: string; text: string };
  } | null {
    const nextDomainIndex = currentDomainIndex + 1;
    if (nextDomainIndex >= EARLY_DETECTION_SCREENER.length) return null;

    const nextDomain = EARLY_DETECTION_SCREENER[nextDomainIndex];
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
  static isAssessmentComplete(
    responses: QuestionResponse[],
    currentDomainIndex: number
  ): boolean {
    return currentDomainIndex >= EARLY_DETECTION_SCREENER.length;
  }

  /**
   * Calculate progress
   */
  static calculateProgress(
    responses: QuestionResponse[],
    currentDomainIndex: number
  ): {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  } {
    const totalQuestions = EARLY_DETECTION_SCREENER.reduce(
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
  static mapScoreToRiskLevel(domainScore: DomainScore): RiskLevel {
    if (domainScore.skipped) return RiskLevel.LOW;
    if (domainScore.isClinicallySignificant) return RiskLevel.HIGH;

    if (domainScore.percentage >= 60) return RiskLevel.MODERATE;
    return RiskLevel.LOW;
  }
}

// Export singleton instance for backwards compatibility
export const scoringCalculator = new (class {
  calculateDomainScore = ScoringCalculator.calculateDomainScore;
  checkEarlyTermination = ScoringCalculator.checkEarlyTermination;
  getAllDomainScores = ScoringCalculator.getAllDomainScores;
  getNextQuestion = ScoringCalculator.getNextQuestion;
  getNextDomain = ScoringCalculator.getNextDomain;
  isAssessmentComplete = ScoringCalculator.isAssessmentComplete;
  calculateProgress = ScoringCalculator.calculateProgress;
  mapScoreToRiskLevel = ScoringCalculator.mapScoreToRiskLevel;
})();
