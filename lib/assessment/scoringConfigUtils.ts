/**
 * Compute the totalPossibleScore for a domain's scoringConfig.
 *
 * Rules:
 * - If the admin explicitly set maxScore (e.g. Violence Risk maxScore:2), respect it.
 * - Likert / multiple_choice: each question normalises to 0–1, so total = active count.
 * - yes_no (default): sum of question weights (default weight 1 each).
 * - text: 0 (questions contribute nothing to the score).
 */
export function computeTotalPossibleScore(
  questions: any[],
  scoringConfig: any
): number {
  const activeQs = (Array.isArray(questions) ? questions : []).filter(
    (q: any) => q.active !== false
  );

  if (typeof scoringConfig?.maxScore === "number" && scoringConfig.maxScore > 0) {
    return scoringConfig.maxScore;
  }

  const responseType: string | undefined = scoringConfig?.responseType;

  if (responseType === "text") return 0;

  if (responseType && responseType !== "yes_no") {
    // Likert / multiple_choice: normalised 0–1 per question
    return activeQs.length;
  }

  // yes_no (default): sum weights
  return activeQs.reduce((sum: number, q: any) => {
    const w = typeof q.weight === "number" && q.weight > 0 ? q.weight : 1;
    return sum + w;
  }, 0);
}
