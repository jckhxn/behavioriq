import { AssessmentDomain } from "@prisma/client";
import { loadAssessmentConfigs } from "@/lib/assessment/db-loader";

// Cache for domain display names to avoid repeated DB calls
let domainNamesCache: Record<string, string> | null = null;

/**
 * Get dynamic domain display names from assessment configurations
 */
export async function getDynamicDomainNames(): Promise<Record<string, string>> {
  if (domainNamesCache) {
    return domainNamesCache;
  }

  try {
    const assessmentConfigs = await loadAssessmentConfigs();
    const domainNames: Record<string, string> = {};

    assessmentConfigs.forEach((config) => {
      domainNames[config.domain] = config.displayName || config.name;
    });

    domainNamesCache = domainNames;
    return domainNames;
  } catch (error) {
    console.error("Error loading dynamic domain names:", error);

    // Fallback to hardcoded names if database fails
    return {
      [AssessmentDomain.ANTISOCIAL]: "Antisocial Behavior",
      [AssessmentDomain.VIOLENCE]: "Violence Risk",
      [AssessmentDomain.ATTENTION]: "Attention Issues",
      [AssessmentDomain.EMOTIONAL]: "Emotional Regulation",
      [AssessmentDomain.CONDUCT]: "Conduct Disorder",
    };
  }
}

/**
 * Get a single domain display name
 */
export async function getDomainDisplayName(domain: string): Promise<string> {
  const domainNames = await getDynamicDomainNames();
  return domainNames[domain] || domain;
}

/**
 * Clear the domain names cache (useful for testing or when configurations change)
 */
export function clearDomainNamesCache() {
  domainNamesCache = null;
}

/**
 * Get domain names for client-side use (synchronous with fallback)
 */
export function getDomainDisplayNameSync(domain: string): string {
  // Fallback mapping for client-side when async loading isn't available
  const fallbackNames: Record<string, string> = {
    [AssessmentDomain.ANTISOCIAL]: "Antisocial Behavior",
    [AssessmentDomain.VIOLENCE]: "Violence Risk",
    [AssessmentDomain.ATTENTION]: "Attention Issues",
    [AssessmentDomain.EMOTIONAL]: "Emotional Regulation",
    [AssessmentDomain.CONDUCT]: "Conduct Disorder",
  };

  return fallbackNames[domain] || domain;
}
