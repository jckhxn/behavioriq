/**
 * Assessment configuration and constants
 */
export const ASSESSMENT_TYPES = {
  BASIC: "basic",
  ADHD: "adhd",
  ANXIETY: "anxiety",
  DEPRESSION: "depression",
  ODD: "odd",
  CONDUCT: "conduct",
  FULL: "full", // All domains
} as const;

export type AssessmentType =
  (typeof ASSESSMENT_TYPES)[keyof typeof ASSESSMENT_TYPES];

/**
 * Risk level thresholds and colors
 */
export const RISK_LEVELS = {
  LOW: {
    threshold: 0.5,
    label: "Low Risk",
    color: "green",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  MODERATE: {
    threshold: 1.0,
    label: "Moderate Risk",
    color: "yellow",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  HIGH: {
    threshold: 1.5,
    label: "High Risk",
    color: "orange",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  VERY_HIGH: {
    threshold: Infinity,
    label: "Very High Risk",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
} as const;

/**
 * Map score to risk level
 */
export function getRiskLevel(score: number) {
  if (score < RISK_LEVELS.LOW.threshold) return RISK_LEVELS.LOW;
  if (score < RISK_LEVELS.MODERATE.threshold) return RISK_LEVELS.MODERATE;
  if (score < RISK_LEVELS.HIGH.threshold) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.VERY_HIGH;
}

/**
 * Map assessment type to display name
 */
export function getAssessmentDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    basic: "Basic Assessment",
    adhd: "ADHD Assessment",
    anxiety: "Anxiety Assessment",
    depression: "Depression Assessment",
    odd: "Oppositional Defiant Assessment",
    conduct: "Conduct Assessment",
    full: "Full Behavioral Assessment",
  };
  return displayNames[type?.toLowerCase()] || "Assessment";
}
