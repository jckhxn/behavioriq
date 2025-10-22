import type { TrialTemplateMeta } from "./get-trial-template";

export type LikertValue = 0 | 1 | 2 | 3 | 4;

export interface SnapshotDomain {
  domain: string;
  slug: string;
  score: number;
  level: "low" | "moderate" | "elevated";
}

export interface SnapshotResult {
  indicators: number;
  domains: SnapshotDomain[];
  recommendationPreview: string;
}

interface ScoreOptions {
  responses: Record<string, number>;
  template: TrialTemplateMeta;
  elevatedThreshold?: number;
  moderateThreshold?: number;
}

export function scoreTrialSnapshot({
  responses,
  template,
  elevatedThreshold = 2.5,
  moderateThreshold = 1.5,
}: ScoreOptions): SnapshotResult {
  const domainScores: Record<string, { values: number[]; name: string; slug: string }> = {};

  for (const question of template.questions) {
    const value = responses[question.id];
    if (typeof value !== "number") continue;

    if (!domainScores[question.domainSlug]) {
      domainScores[question.domainSlug] = {
        values: [],
        name: question.domain,
        slug: question.domainSlug,
      };
    }

    domainScores[question.domainSlug].values.push(value);
  }

  const domains: SnapshotDomain[] = Object.values(domainScores).map((domain) => {
    const mean =
      domain.values.length === 0
        ? 0
        : domain.values.reduce((sum, value) => sum + value, 0) /
          domain.values.length;

    let level: SnapshotDomain["level"] = "low";
    if (mean > elevatedThreshold) {
      level = "elevated";
    } else if (mean >= moderateThreshold) {
      level = "moderate";
    }

    return {
      domain: domain.name,
      slug: domain.slug,
      score: Number(mean.toFixed(2)),
      level,
    };
  });

  const indicators = domains.filter((domain) => domain.level === "elevated").length;

  const rankedDomains = [...domains].sort((a, b) => b.score - a.score);
  const topDomains = rankedDomains.slice(0, 2).map((domain) => domain.domain);

  const recommendationPreview = topDomains.length
    ? `Most noticeable patterns appear in ${topDomains.join(" and ")}. Unlock the full report for action steps.`
    : "No elevated indicators detected. Monitor and retake as needed.";

  return {
    indicators,
    domains,
    recommendationPreview,
  };
}
