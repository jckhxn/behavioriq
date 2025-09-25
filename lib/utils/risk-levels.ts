/**
 * Risk level utilities for assessments
 */

export interface RiskLevelInfo {
  level: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  description: string;
  color: string;
}

/**
 * Maps a percentage score to a risk level
 * @param percentage - Score as a percentage (0-100)
 * @returns Risk level information
 */
export function getRiskLevel(percentage: number): RiskLevelInfo {
  if (percentage >= 80) {
    return {
      level: "VERY_HIGH",
      description: "Requires immediate attention and professional intervention",
      color: "red",
    };
  } else if (percentage >= 60) {
    return {
      level: "HIGH",
      description: "Elevated risk level - professional evaluation recommended",
      color: "orange",
    };
  } else if (percentage >= 40) {
    return {
      level: "MODERATE",
      description:
        "Some areas of concern - monitoring and support may be beneficial",
      color: "yellow",
    };
  } else {
    return {
      level: "LOW",
      description: "Low risk level - typical functioning within normal ranges",
      color: "green",
    };
  }
}

/**
 * Gets risk level from raw score and total possible
 * @param rawScore - Raw numeric score
 * @param totalPossible - Maximum possible score
 * @returns Risk level information
 */
export function getRiskLevelFromScore(
  rawScore: number,
  totalPossible: number
): RiskLevelInfo {
  const percentage = (rawScore / totalPossible) * 100;
  return getRiskLevel(percentage);
}
