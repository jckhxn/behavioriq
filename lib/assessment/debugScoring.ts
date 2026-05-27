import type { QuestionSetConfig, QuestionConfig } from "./types";

export interface DebugQuestionScore {
  questionId: string;
  domainName: string;
  response: string | boolean | number;
  score: number;
  maxScore: number;
}

export interface DebugDomainScore {
  domainKey: string;
  displayName: string;
  answered: number;
  rawScore: number;
  maxPossible: number;
  percent: number;
}

function getQuestionMaxScore(question: QuestionConfig): number {
  if (question.likertScale) return 1; // normalized max
  return question.weight ?? 1;
}

function computeResponseScore(
  response: string | boolean | number,
  question: QuestionConfig
): number {
  if (question.likertScale) {
    const scale = question.likertScale;
    const range = scale.max - scale.min;
    if (range <= 0) return 0;
    let val: number;
    if (typeof response === "number") {
      val = response;
    } else if (typeof response === "boolean") {
      return response ? 1 : 0;
    } else {
      const num = Number(response);
      if (!Number.isFinite(num)) {
        if (scale.options) {
          const lower = String(response).toLowerCase();
          const opt = scale.options.find(
            (o) => String(o.value) === response || (o.label ?? "").toLowerCase() === lower
          );
          if (opt) return (opt.value - scale.min) / range;
        }
        return 0;
      }
      val = num;
    }
    return (val - scale.min) / range;
  }

  // Boolean / weight-based
  const maxScore = question.weight ?? 1;
  if (typeof response === "boolean") return response ? maxScore : 0;
  if (typeof response === "number") return response;
  const lower = String(response).toLowerCase();
  if (lower === "true" || lower === "yes" || lower === "y") return maxScore;
  if (lower === "false" || lower === "no" || lower === "n") return 0;
  const num = Number(response);
  if (Number.isFinite(num)) return num;
  return 0;
}

export function computeDebugScores(
  configs: QuestionSetConfig[],
  responses: Array<{ questionId: string; response: string | boolean | number }>
): { questionScores: DebugQuestionScore[]; domainScores: DebugDomainScore[] } {
  const responseMap = new Map(responses.map((r) => [r.questionId, r.response]));
  const questionScores: DebugQuestionScore[] = [];

  for (const domain of configs) {
    for (const question of domain.questions) {
      const response = responseMap.get(question.id);
      if (response === undefined) continue;
      questionScores.push({
        questionId: question.id,
        domainName: domain.name,
        response,
        score: computeResponseScore(response, question),
        maxScore: getQuestionMaxScore(question),
      });
    }
  }

  const domainScores: DebugDomainScore[] = configs
    .map((domain) => {
      const domainQs = questionScores.filter((qs) => qs.domainName === domain.name);
      const rawScore = domainQs.reduce((s, qs) => s + qs.score, 0);
      const maxPossible = domainQs.reduce((s, qs) => s + qs.maxScore, 0);
      return {
        domainKey: String(domain.domain),
        displayName: domain.name,
        answered: domainQs.length,
        rawScore,
        maxPossible,
        percent: maxPossible > 0 ? Math.round((rawScore / maxPossible) * 100) : 0,
      };
    })
    .filter((d) => d.answered > 0);

  return { questionScores, domainScores };
}
