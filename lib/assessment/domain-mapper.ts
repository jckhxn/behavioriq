/**
 * Domain mapping and scoring logic
 * Fixes bug where all domains showed as "Anti Social"
 */

/**
 * Maps question ranges to their correct behavioral domains
 */
export const DOMAIN_MAPPINGS = {
  // Attention/Hyperactivity Domain (Questions 1-9)
  attention_hyperactivity: {
    questionRange: [1, 9] as const,
    label: "Attention & Hyperactivity",
    description: "Measures attention span, focus, and hyperactive behaviors",
    color: "#3B82F6", // blue
  },

  // Anxiety Domain (Questions 10-18)
  anxiety: {
    questionRange: [10, 18] as const,
    label: "Anxiety",
    description: "Assesses worry, fear, and anxious behaviors",
    color: "#8B5CF6", // purple
  },

  // Depression Domain (Questions 19-27)
  depression: {
    questionRange: [19, 27] as const,
    label: "Depression",
    description: "Evaluates mood, energy, and depressive symptoms",
    color: "#6366F1", // indigo
  },

  // Oppositional Defiant Domain (Questions 28-35)
  oppositional_defiant: {
    questionRange: [28, 35] as const,
    label: "Oppositional Defiant Behavior",
    description: "Measures defiance, anger, and vindictiveness",
    color: "#F59E0B", // amber
  },

  // Conduct/Anti-Social Domain (Questions 36-51)
  antisocial: {
    questionRange: [36, 51] as const,
    label: "Conduct & Anti-Social Behavior",
    description: "Assesses rule-breaking and aggressive behaviors",
    color: "#EF4444", // red
  },
} as const;

export type DomainKey = keyof typeof DOMAIN_MAPPINGS;

/**
 * Response value mapping
 */
export const RESPONSE_VALUES = {
  Never: 0,
  Sometimes: 1,
  Often: 2,
  "Very Often": 3,
  true: 1, // For boolean responses
  false: 0,
} as const;

/**
 * ✅ FIX: Correctly identify domain from question ID or number
 * This fixes the bug where all domains were showing as "Anti Social"
 */
export function getDomainFromQuestionId(
  questionId: string
): DomainKey | "unknown" {
  // Extract question number from ID (format: "q1", "q2", etc.)
  const match = questionId.match(/q?(\d+)/i);
  if (!match) {
    console.error(`⚠️ Invalid question ID format: ${questionId}`);
    return "unknown";
  }

  const questionNumber = parseInt(match[1], 10);
  return getDomainFromQuestionNumber(questionNumber);
}

/**
 * ✅ FIX: Correctly identify domain from question number
 */
export function getDomainFromQuestionNumber(
  questionNumber: number
): DomainKey | "unknown" {
  for (const [domain, config] of Object.entries(DOMAIN_MAPPINGS)) {
    const [start, end] = config.questionRange;
    if (questionNumber >= start && questionNumber <= end) {
      return domain as DomainKey;
    }
  }

  console.error(`⚠️ Question ${questionNumber} doesn't match any domain`);
  return "unknown";
}

/**
 * ✅ FIX: Get all responses for a specific domain
 */
export function getResponsesForDomain(
  responses: Array<{ questionId: string; response: boolean | string }>,
  domain: DomainKey
): Array<{ questionId: string; response: boolean | string }> {
  const [start, end] = DOMAIN_MAPPINGS[domain].questionRange;

  return responses.filter((r) => {
    const questionNumber = parseInt(r.questionId.match(/\d+/)?.[0] || "0", 10);
    return questionNumber >= start && questionNumber <= end;
  });
}

/**
 * ✅ FIX: Calculate domain score from responses
 */
export function calculateDomainScore(
  responses: Array<{ questionId: string; response: boolean | string }>,
  domain: DomainKey
): number {
  const domainResponses = getResponsesForDomain(responses, domain);

  if (domainResponses.length === 0) {
    return 0;
  }

  const totalScore = domainResponses.reduce((sum, response) => {
    // Handle both string and boolean responses
    let scoreValue = 0;

    if (typeof response.response === "boolean") {
      scoreValue = response.response ? 1 : 0;
    } else if (typeof response.response === "string") {
      scoreValue =
        RESPONSE_VALUES[response.response as keyof typeof RESPONSE_VALUES] ?? 0;
    }

    return sum + scoreValue;
  }, 0);

  // Return average score (0-3 scale for text responses, 0-1 for boolean)
  return totalScore / domainResponses.length;
}

/**
 * Calculate all domain scores from responses
 */
export function calculateAllDomainScores(
  responses: Array<{ questionId: string; response: boolean | string }>
): Record<DomainKey, { score: number; severity: string; count: number }> {
  const scores = {} as Record<
    DomainKey,
    { score: number; severity: string; count: number }
  >;

  for (const domain of Object.keys(DOMAIN_MAPPINGS) as DomainKey[]) {
    const score = calculateDomainScore(responses, domain);
    const domainResponses = getResponsesForDomain(responses, domain);

    scores[domain] = {
      score: Math.round(score * 100) / 100, // Round to 2 decimals
      severity: getSeverityLabel(score),
      count: domainResponses.length,
    };
  }

  return scores;
}

/**
 * Map numeric score to severity label
 */
export function getSeverityLabel(score: number): string {
  if (score < 0.5) return "Low";
  if (score < 1.0) return "Moderate";
  if (score < 1.5) return "High";
  if (score < 2.0) return "Very High";
  return "Severe";
}

/**
 * Get domain label from key
 */
export function getDomainLabel(domain: DomainKey): string {
  return DOMAIN_MAPPINGS[domain]?.label || domain;
}

/**
 * Get domain description
 */
export function getDomainDescription(domain: DomainKey): string {
  return DOMAIN_MAPPINGS[domain]?.description || "";
}

/**
 * Get domain color
 */
export function getDomainColor(domain: DomainKey): string {
  return DOMAIN_MAPPINGS[domain]?.color || "#6B7280";
}

/**
 * Group responses by domain
 */
export function groupResponsesByDomain(
  responses: Array<{ questionId: string; response: boolean | string }>
): Record<
  DomainKey,
  Array<{ questionId: string; response: boolean | string }>
> {
  const grouped = {} as Record<
    DomainKey,
    Array<{ questionId: string; response: boolean | string }>
  >;

  for (const domain of Object.keys(DOMAIN_MAPPINGS) as DomainKey[]) {
    grouped[domain] = getResponsesForDomain(responses, domain);
  }

  return grouped;
}
