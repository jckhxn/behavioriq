/**
 * Database Assessment Loader
 *
 * Loads assessment configurations from the database
 * instead of files, eliminating filesystem dependencies
 */

import { prisma } from "@/lib/db/prisma";
import { AssessmentDomain } from "@prisma/client";
import {
  QuestionSetConfig,
  QuestionConfig,
  TerminationRuleConfig,
  SkipCondition,
  PrerequisiteConfig,
  MultiPartLogicConfig,
} from "./types";

// Re-export types for external use
export type {
  QuestionSetConfig,
  QuestionConfig,
  TerminationRuleConfig,
  SkipCondition,
  PrerequisiteConfig,
  MultiPartLogicConfig,
};

/**
 * Load assessment configuration from a specific assessment template
 */
export async function loadAssessmentConfigFromTemplate(
  assessmentTemplateId: string
): Promise<QuestionSetConfig[]> {
  try {
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: assessmentTemplateId },
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      throw new Error(`Assessment template not found: ${assessmentTemplateId}`);
    }

    // Convert domain templates to QuestionSetConfig format
    return template.domains.map((domain, index) => {
      const domainTemplate = domain.domainTemplate;
      const questions = Array.isArray(domainTemplate.questions)
        ? domainTemplate.questions
        : [];
      const scoringConfig = domainTemplate.scoringConfig || {};

      return {
        id: domainTemplate.id,
        name: domainTemplate.name,
        displayName: domainTemplate.name,
        description: domainTemplate.description || "",
        domain: domainTemplate.slug as any, // Use slug directly instead of mapping to enum
        isActive: true,
        order: index,
        totalPossibleScore:
          (scoringConfig as any)?.maxScore || questions.length,
        clinicallySignificantScore:
          (scoringConfig as any)?.significantScore ||
          Math.ceil(questions.length * 0.6),
        questions: questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          weight: q.weight || 1,
          order: q.order,
          isGatingQuestion: q.isGatingQuestion || false,
          skipLogic: q.skipLogic || null,
          category: q.category || null,
        })),
        skipConditions: [],
        prerequisites: [],
        multiPartLogic: undefined,
        terminationRules: [],
      };
    });
  } catch (error) {
    console.error("Error loading assessment config from template:", error);
    throw error;
  }
}

/**
 * Load all active assessment configurations from the database (legacy)
 */
export async function loadAssessmentConfigs(): Promise<QuestionSetConfig[]> {
  try {
    const questionSets = await prisma.questionSet.findMany({
      where: { isActive: true },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        terminationRules: {
          where: { isActive: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return questionSets.map((set) => {
      const setWithFields = set as any; // Type assertion for new fields
      return {
        domain: set.domain,
        name: set.name,
        displayName: setWithFields.displayName || set.name,
        description: set.description || "",
        order: set.order,
        totalPossibleScore: setWithFields.totalPossibleScore || 0,
        clinicallySignificantScore:
          setWithFields.clinicallySignificantScore || 0,
        skipConditions: setWithFields.skipConditions
          ? (JSON.parse(
              setWithFields.skipConditions as string
            ) as SkipCondition[])
          : [],
        prerequisites: setWithFields.prerequisites
          ? (JSON.parse(
              setWithFields.prerequisites as string
            ) as PrerequisiteConfig[])
          : [],
        multiPartLogic: setWithFields.multiPartLogic
          ? (JSON.parse(
              setWithFields.multiPartLogic as string
            ) as MultiPartLogicConfig)
          : undefined,
        questions: set.questions.map((q) => ({
          id: q.id,
          text: q.text,
          order: q.order,
          isGatingQuestion: q.isGatingQuestion,
          weight: q.weight,
        })),
        terminationRules: set.terminationRules.map((rule) => ({
          name: rule.name,
          description: rule.description || "",
          minimumYesToContinue: rule.minimumYesToContinue,
          checkAfterQuestion: rule.checkAfterQuestion,
        })),
      };
    });
  } catch (error) {
    console.error(
      "Error loading assessment configurations from database:",
      error
    );
    return [];
  }
}

/**
 * Load a specific assessment configuration by domain
 */
export async function loadAssessmentByDomain(
  domain: AssessmentDomain
): Promise<QuestionSetConfig | null> {
  try {
    const questionSet = await prisma.questionSet.findUnique({
      where: {
        domain: domain,
        isActive: true,
      },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        terminationRules: {
          where: { isActive: true },
        },
      },
    });

    if (!questionSet) return null;

    const questionSetWithFields = questionSet as any; // Type assertion for new fields
    return {
      domain: questionSet.domain,
      name: questionSet.name,
      displayName: questionSetWithFields.displayName || questionSet.name,
      description: questionSet.description || "",
      order: questionSet.order,
      totalPossibleScore: questionSetWithFields.totalPossibleScore || 0,
      clinicallySignificantScore:
        questionSetWithFields.clinicallySignificantScore || 0,
      skipConditions: questionSetWithFields.skipConditions
        ? (JSON.parse(
            questionSetWithFields.skipConditions as string
          ) as SkipCondition[])
        : [],
      prerequisites: questionSetWithFields.prerequisites
        ? (JSON.parse(
            questionSetWithFields.prerequisites as string
          ) as PrerequisiteConfig[])
        : [],
      multiPartLogic: questionSetWithFields.multiPartLogic
        ? (JSON.parse(
            questionSetWithFields.multiPartLogic as string
          ) as MultiPartLogicConfig)
        : undefined,
      questions: questionSet.questions.map((q) => ({
        id: q.id,
        text: q.text,
        order: q.order,
        isGatingQuestion: q.isGatingQuestion,
        weight: q.weight,
      })),
      terminationRules: questionSet.terminationRules.map((rule) => ({
        name: rule.name,
        description: rule.description || "",
        minimumYesToContinue: rule.minimumYesToContinue,
        checkAfterQuestion: rule.checkAfterQuestion,
      })),
    };
  } catch (error) {
    console.error(
      `Error loading assessment for domain ${domain} from database:`,
      error
    );
    return null;
  }
}

/**
 * Get available assessment domains from database
 */
export async function getAvailableAssessmentDomains(): Promise<
  AssessmentDomain[]
> {
  try {
    const questionSets = await prisma.questionSet.findMany({
      where: { isActive: true },
      select: { domain: true },
      orderBy: { order: "asc" },
    });

    return questionSets.map((set) => set.domain);
  } catch (error) {
    console.error(
      "Error getting available assessment domains from database:",
      error
    );
    return [];
  }
}

/**
 * Client-side assessment loader (for use in components)
 * Loads assessments via API endpoints
 */
export async function loadAssessmentConfigsClient(): Promise<
  QuestionSetConfig[]
> {
  try {
    const response = await fetch("/api/assessments/config");
    if (!response.ok) {
      throw new Error("Failed to load assessment configurations");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading assessment configurations from API:", error);
    return [];
  }
}

/**
 * Load assessment configuration by domain (client-side)
 */
export async function loadAssessmentByDomainClient(
  domain: AssessmentDomain
): Promise<QuestionSetConfig | null> {
  try {
    const response = await fetch(
      `/api/assessments/config/${domain.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Failed to load assessment for domain ${domain}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading assessment for domain ${domain}:`, error);
    return null;
  }
}

/**
 * Validate an assessment configuration
 */
export function validateAssessmentConfig(
  assessment: any
): assessment is QuestionSetConfig {
  return (
    assessment &&
    typeof assessment.domain === "string" &&
    typeof assessment.name === "string" &&
    typeof assessment.description === "string" &&
    typeof assessment.order === "number" &&
    Array.isArray(assessment.questions) &&
    Array.isArray(assessment.terminationRules) &&
    assessment.questions.every(
      (q: any) =>
        typeof q.id === "string" &&
        typeof q.text === "string" &&
        typeof q.order === "number" &&
        typeof q.isGatingQuestion === "boolean" &&
        typeof q.weight === "number"
    )
  );
}
