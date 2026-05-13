/**
 * Shared assessment navigation logic.
 *
 * Used by both the end-user assessment taker (AssessmentChat) and the
 * admin AssessmentTester so they always behave identically.
 */

import type { QuestionSetConfig } from "./types";
import { computeSkippedQuestions, evaluateDomainGatingSkip } from "./skip-logic";

export type ResponseValue = boolean | number | string;

export interface ActiveQuestion {
  questionId: string;
  text: string;
  domain: string;
  domainIndex: number;
  questionIndex: number;
  responseType: QuestionSetConfig["questions"][number]["responseType"];
  likertScale: QuestionSetConfig["questions"][number]["likertScale"];
}

function toAnswerMap(responses: Record<string, ResponseValue>): Map<string, string> {
  return new Map(Object.entries(responses).map(([k, v]) => [k, String(v)]));
}

/** Returns true if a domain should be bypassed given current responses. */
function isDomainSkipped(
  domain: QuestionSetConfig,
  answerMap: Map<string, string>
): boolean {
  // Prerequisite gate (e.g. age check)
  for (const prereq of domain.prerequisites) {
    if (!answerMap.has(prereq.questionId)) return false; // not yet answered → don't skip
    if (answerMap.get(prereq.questionId) !== String(prereq.requiredValue)) return true;
  }

  // Gating-question threshold (e.g. screening Q answered No)
  if (domain.gatingLogic && evaluateDomainGatingSkip(domain.gatingLogic, answerMap)) {
    return true;
  }

  return false;
}

/**
 * Returns the next question to show, or null when the assessment is complete.
 * Applies domain gating, question-level skip logic, and termination rules.
 */
export function getNextQuestion(
  configs: QuestionSetConfig[],
  responses: Record<string, ResponseValue>
): ActiveQuestion | null {
  const answerMap = toAnswerMap(responses);

  for (let di = 0; di < configs.length; di++) {
    const domain = configs[di];

    if (isDomainSkipped(domain, answerMap)) continue;
    if (domain.questions.length === 0) continue;

    // Termination rules: if enough questions have been answered in this domain
    // without meeting the minimum yes-count, skip the rest of the domain.
    const answeredInDomain = domain.questions.filter((q) => answerMap.has(q.id));
    const lastAnsweredIdx = domain.questions.reduce(
      (max, q, idx) => (answerMap.has(q.id) ? idx : max),
      -1
    );
    let terminatedEarly = false;
    for (const rule of domain.terminationRules) {
      if (lastAnsweredIdx + 1 >= rule.checkAfterQuestion) {
        const yesCount = answeredInDomain.filter(
          (q) => (!q.responseType || q.responseType === "boolean") && answerMap.get(q.id) === "true"
        ).length;
        if (yesCount < rule.minimumYesToContinue) {
          terminatedEarly = true;
          break;
        }
      }
    }
    if (terminatedEarly) continue;

    // Question-level skip logic
    const skippedIds = computeSkippedQuestions(domain.questions, answerMap);

    for (let qi = 0; qi < domain.questions.length; qi++) {
      const question = domain.questions[qi];
      if (answerMap.has(question.id)) continue;   // already answered
      if (skippedIds.has(question.id)) continue;  // skipped by logic
      return {
        questionId: question.id,
        text: question.text,
        domain: domain.name,
        domainIndex: di,
        questionIndex: qi,
        responseType: question.responseType,
        likertScale: question.likertScale,
      };
    }
  }

  return null; // assessment complete
}

export interface ProgressSummary {
  totalQuestions: number;
  answeredQuestions: number;
  completedDomains: number;
  overallProgress: number;
}

/**
 * Computes progress accounting for gating skips and question-level skip logic.
 */
export function computeProgress(
  configs: QuestionSetConfig[],
  responses: Record<string, ResponseValue>
): ProgressSummary {
  const answerMap = toAnswerMap(responses);

  let totalQuestions = 0;
  let answeredQuestions = 0;
  let completedDomains = 0;

  for (const domain of configs) {
    if (isDomainSkipped(domain, answerMap)) {
      // Count only the gating questions themselves in the totals
      const gatingIds = domain.gatingLogic?.questionSubsetThreshold?.questionIds ?? [];
      totalQuestions += gatingIds.length;
      answeredQuestions += gatingIds.filter((id) => answerMap.has(id)).length;
      completedDomains += 1;
      continue;
    }

    const skippedIds = computeSkippedQuestions(domain.questions, answerMap);
    const effective = domain.questions.filter((q) => !skippedIds.has(q.id));

    totalQuestions += effective.length;
    answeredQuestions += effective.filter((q) => answerMap.has(q.id)).length;

    if (effective.length > 0 && effective.every((q) => answerMap.has(q.id))) {
      completedDomains += 1;
    }
  }

  return {
    totalQuestions,
    answeredQuestions,
    completedDomains,
    overallProgress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
  };
}
