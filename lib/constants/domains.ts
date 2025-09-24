import { AssessmentDomain, RiskLevel } from "@prisma/client";

export const DOMAIN_LABELS = {
  [AssessmentDomain.ANTISOCIAL]: "Antisocial Behavior",
  [AssessmentDomain.VIOLENCE]: "Violence Risk",
  [AssessmentDomain.ATTENTION]: "Attention Issues",
  [AssessmentDomain.EMOTIONAL]: "Emotional Regulation",
  [AssessmentDomain.CONDUCT]: "Conduct Disorder",
};

export const DOMAIN_LABELS_SHORT = {
  [AssessmentDomain.ANTISOCIAL]: "Antisocial",
  [AssessmentDomain.VIOLENCE]: "Violence",
  [AssessmentDomain.ATTENTION]: "Attention",
  [AssessmentDomain.EMOTIONAL]: "Emotional",
  [AssessmentDomain.CONDUCT]: "Conduct",
};

export const RISK_COLORS = {
  [RiskLevel.LOW]: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-800 dark:text-green-400",
    chart: "#10b981",
  },
  [RiskLevel.MODERATE]: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-800 dark:text-yellow-400",
    chart: "#f59e0b",
  },
  [RiskLevel.HIGH]: {
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-800 dark:text-orange-400",
    chart: "#ea580c",
  },
  [RiskLevel.VERY_HIGH]: {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-800 dark:text-red-400",
    chart: "#dc2626",
  },
};

export const RISK_COLORS_GRADIENT = {
  [RiskLevel.LOW]: "from-green-400 to-green-600",
  [RiskLevel.MODERATE]: "from-yellow-400 to-orange-500",
  [RiskLevel.HIGH]: "from-orange-500 to-red-500",
  [RiskLevel.VERY_HIGH]: "from-red-500 to-red-700",
};

export const DOMAIN_ORDER = [
  AssessmentDomain.ANTISOCIAL,
  AssessmentDomain.VIOLENCE,
  AssessmentDomain.ATTENTION,
  AssessmentDomain.EMOTIONAL,
  AssessmentDomain.CONDUCT,
];
