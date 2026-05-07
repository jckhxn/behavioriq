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
