/**
 * Skip-logic evaluation for structured assessments.
 *
 * Each question may carry a `skipLogic` (or legacy `skipCondition`) field:
 *   { questionId, skipValue, skipToQuestion? }
 *
 * Semantics: "if the answer to `questionId` equals `skipValue`, skip ME
 * and (if `skipToQuestion` is set) skip every subsequent question until
 * `skipToQuestion` is reached."
 */

import type { DomainGatingLogic } from "./types";

/**
 * Evaluate whether a domain should be skipped entirely based on its
 * scoringConfig.skipLogic.questionSubsetThreshold gating logic.
 *
 * Returns true only when all gating questions have been answered AND
 * the configured condition is satisfied, meaning the domain should be
 * bypassed and navigation should jump to the next domain.
 */
export function evaluateDomainGatingSkip(
  gatingLogic: DomainGatingLogic,
  answerMap: Map<string, string>
): boolean {
  const qst = gatingLogic.questionSubsetThreshold;
  if (!qst || !qst.enabled) return false;

  const ids = qst.questionIds ?? [];
  if (ids.length === 0) return false;

  // All gating questions must have been answered before we can decide
  const allAnswered = ids.every((id) => answerMap.has(id));
  if (!allAnswered) return false;

  const parseVal = (raw: string): number => {
    const n = Number(raw);
    if (!Number.isNaN(n)) return n;
    const lower = raw.toLowerCase();
    if (lower === "true" || lower === "yes" || lower === "y") return 1;
    if (lower === "false" || lower === "no" || lower === "n") return 0;
    return 0;
  };

  const compare = (value: number, threshold: number, op: string): boolean => {
    switch (op) {
      case "=":  return value === threshold;
      case ">":  return value > threshold;
      case ">=": return value >= threshold;
      case "<":  return value < threshold;
      case "<=": return value <= threshold;
      default:   return value === threshold;
    }
  };

  let conditionMet: boolean;

  if (qst.aggregation === "sum") {
    const total = ids.reduce((sum, id) => sum + parseVal(answerMap.get(id) ?? "0"), 0);
    conditionMet = compare(total, qst.threshold, qst.comparator);
  } else if (qst.aggregation === "all") {
    conditionMet = ids.every((id) =>
      compare(parseVal(answerMap.get(id) ?? "0"), qst.threshold, qst.comparator)
    );
  } else {
    // "any" — default
    conditionMet = ids.some((id) =>
      compare(parseVal(answerMap.get(id) ?? "0"), qst.threshold, qst.comparator)
    );
  }

  return qst.skipWhen === "met" ? conditionMet : !conditionMet;
}

export function computeSkippedQuestions(
  orderedQuestions: Array<{ id: string; skipLogic?: any }>,
  answerMap: Map<string, string>
): Set<string> {
  const skipped = new Set<string>();
  let skipUntilId: string | null = null;

  for (const q of orderedQuestions) {
    if (skipUntilId !== null) {
      if (q.id === skipUntilId) {
        skipUntilId = null; // reached jump target — resume normal flow
      } else {
        skipped.add(q.id);
        continue;
      }
    }

    const sc = q.skipLogic;
    if (sc && answerMap.has(sc.questionId)) {
      const raw = answerMap.get(sc.questionId)!;
      const boolAnswer =
        raw === "true" || raw === "1" || raw === "y" || raw === "yes";
      const triggerValue =
        typeof sc.skipValue === "boolean"
          ? sc.skipValue
          : sc.skipValue === true ||
            sc.skipValue === "true" ||
            sc.skipValue === "1";

      if (boolAnswer === triggerValue) {
        skipped.add(q.id);
        if (sc.skipToQuestion) {
          skipUntilId = sc.skipToQuestion;
        }
      }
    }
  }

  return skipped;
}
