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
 * Validate domain template structure
 */
function validateDomainTemplate(
  domainTemplate: any,
  domainIndex: number
): boolean {
  const validationIssues: string[] = [];

  if (!domainTemplate) {
    validationIssues.push(`Domain ${domainIndex}: Missing domain template`);
    return false;
  }

  if (!domainTemplate.id || typeof domainTemplate.id !== "string") {
    validationIssues.push(
      `Domain ${domainIndex}: Missing or invalid domain template ID`
    );
  }

  if (!domainTemplate.name || typeof domainTemplate.name !== "string") {
    validationIssues.push(
      `Domain ${domainIndex}: Missing or invalid domain template name`
    );
  }

  if (!domainTemplate.slug || typeof domainTemplate.slug !== "string") {
    validationIssues.push(
      `Domain ${domainIndex}: Missing or invalid domain template slug`
    );
  }

  if (!Array.isArray(domainTemplate.questions)) {
    validationIssues.push(`Domain ${domainIndex}: Questions must be an array`);
  } else if (domainTemplate.questions.length === 0) {
    validationIssues.push(
      `Domain ${domainIndex}: No questions found in domain template`
    );
  } else {
    // Validate each question
    domainTemplate.questions.forEach((question: any, qIndex: number) => {
      if (!question || typeof question !== "object") {
        validationIssues.push(
          `Domain ${domainIndex}, Question ${qIndex}: Invalid question object`
        );
        return;
      }
      if (!question.id || typeof question.id !== "string") {
        validationIssues.push(
          `Domain ${domainIndex}, Question ${qIndex}: Missing or invalid question ID`
        );
      }
      if (!question.text || typeof question.text !== "string") {
        validationIssues.push(
          `Domain ${domainIndex}, Question ${qIndex}: Missing or invalid question text`
        );
      }
      if (question.order === undefined || typeof question.order !== "number") {
        validationIssues.push(
          `Domain ${domainIndex}, Question ${qIndex}: Missing or invalid question order`
        );
      }
    });
  }

  if (validationIssues.length > 0) {
    console.warn(`Domain template validation issues:`, validationIssues);
    return false;
  }

  return true;
}

/**
 * Load assessment configuration from a template (with domains)
 */
export async function loadAssessmentConfigFromTemplate(
  templateId: string
): Promise<QuestionSetConfig[]> {
  try {
    if (!templateId || typeof templateId !== "string") {
      throw new Error("Invalid template ID provided");
    }

    console.log(`Loading assessment template: ${templateId}`);

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
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
      throw new Error(`Assessment template with id ${templateId} not found`);
    }

    if (!template.domains || template.domains.length === 0) {
      console.warn(`Assessment template ${templateId} has no domains`);
      return [];
    }

    console.log(
      `Found ${template.domains.length} domains in template ${templateId}`
    );

    // Convert domain templates to QuestionSetConfig format with validation
    const validConfigs: QuestionSetConfig[] = [];
    const errors: string[] = [];

    for (let index = 0; index < template.domains.length; index++) {
      const domain = template.domains[index];

      try {
        if (!domain || !domain.domainTemplate) {
          errors.push(`Domain ${index}: Missing domain or domain template`);
          continue;
        }

        const domainTemplate = domain.domainTemplate;

        // Validate domain template structure
        if (!validateDomainTemplate(domainTemplate, index)) {
          errors.push(`Domain ${index}: Failed validation checks`);
          continue;
        }

        // Safely parse questions array
        let questions: any[] = [];
        try {
          if (Array.isArray(domainTemplate.questions)) {
            questions = domainTemplate.questions;
          } else if (typeof domainTemplate.questions === "string") {
            // Handle case where questions might be stored as JSON string
            questions = JSON.parse(domainTemplate.questions);
            if (!Array.isArray(questions)) {
              throw new Error("Parsed questions is not an array");
            }
          } else {
            throw new Error(
              "Questions field is not an array or valid JSON string"
            );
          }
        } catch (parseError) {
          errors.push(
            `Domain ${index}: Failed to parse questions - ${parseError instanceof Error ? parseError.message : "Unknown error"}`
          );
          continue;
        }

        // Safely parse scoring config
        let scoringConfig: any = {};
        try {
          if (domainTemplate.scoringConfig) {
            if (typeof domainTemplate.scoringConfig === "object") {
              scoringConfig = domainTemplate.scoringConfig;
            } else if (typeof domainTemplate.scoringConfig === "string") {
              scoringConfig = JSON.parse(domainTemplate.scoringConfig);
            }
          }
        } catch (parseError) {
          console.warn(
            `Domain ${index}: Failed to parse scoring config, using defaults - ${parseError instanceof Error ? parseError.message : "Unknown error"}`
          );
          scoringConfig = {};
        }

        // Safely parse resources
        let resources: any = undefined;
        try {
          if (domainTemplate.resources) {
            if (typeof domainTemplate.resources === "object") {
              resources = domainTemplate.resources;
            } else if (typeof domainTemplate.resources === "string") {
              resources = JSON.parse(domainTemplate.resources);
            }
          }
        } catch (parseError) {
          console.warn(
            `Domain ${index}: Failed to parse resources - ${parseError instanceof Error ? parseError.message : "Unknown error"}`
          );
        }

        // Create question set config with safe defaults
        const questionSetConfig: QuestionSetConfig = {
          name: domainTemplate.name,
          displayName: domainTemplate.name,
          description: domainTemplate.description || "",
          domain: domainTemplate.slug as any, // Use slug directly instead of mapping to enum
          order: domain.order !== undefined ? domain.order : index,
          totalPossibleScore:
            (scoringConfig as any)?.maxScore || questions.length,
          clinicallySignificantScore:
            (scoringConfig as any)?.significantScore ||
            Math.ceil(questions.length * 0.6),
          resources: resources,
          questions: questions.map((q: any, qIndex: number) => {
            try {
              return {
                id: q.id || `question_${qIndex}`,
                text: q.text || `Question ${qIndex + 1}`,
                weight: typeof q.weight === "number" ? q.weight : 1,
                order: typeof q.order === "number" ? q.order : qIndex,
                isGatingQuestion: Boolean(q.isGatingQuestion),
                skipLogic: q.skipLogic || null,
                category: q.category || null,
              };
            } catch (questionError) {
              console.warn(
                `Domain ${index}, Question ${qIndex}: Error processing question, using defaults - ${questionError instanceof Error ? questionError.message : "Unknown error"}`
              );
              return {
                id: `question_${qIndex}`,
                text: `Question ${qIndex + 1}`,
                weight: 1,
                order: qIndex,
                isGatingQuestion: false,
                skipLogic: null,
                category: null,
              };
            }
          }),
          skipConditions: [],
          prerequisites: [],
          multiPartLogic: undefined,
          terminationRules: [],
        };

        validConfigs.push(questionSetConfig);
        console.log(
          `Successfully processed domain ${index}: ${domainTemplate.name} with ${questions.length} questions`
        );
      } catch (domainError) {
        const errorMessage = `Domain ${index}: Error processing domain - ${domainError instanceof Error ? domainError.message : "Unknown error"}`;
        errors.push(errorMessage);
        console.error(errorMessage, domainError);
      }
    }

    // Log summary
    console.log(
      `Assessment template ${templateId} processing complete: ${validConfigs.length} valid domains, ${errors.length} errors`
    );

    if (errors.length > 0) {
      console.warn(
        `Errors encountered while loading template ${templateId}:`,
        errors
      );
    }

    if (validConfigs.length === 0 && template.domains.length > 0) {
      throw new Error(
        `All domains in template ${templateId} failed validation. Check domain template structure and questions.`
      );
    }

    return validConfigs;
  } catch (error) {
    const errorMessage = `Error loading assessment config from template ${templateId}`;
    console.error(errorMessage, error);

    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`${errorMessage}: ${error.message}`);
    } else {
      throw new Error(`${errorMessage}: Unknown error occurred`);
    }
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
        resources: setWithFields.resources
          ? typeof setWithFields.resources === "string"
            ? JSON.parse(setWithFields.resources)
            : setWithFields.resources
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
      resources: questionSetWithFields.resources
        ? typeof questionSetWithFields.resources === "string"
          ? JSON.parse(questionSetWithFields.resources)
          : questionSetWithFields.resources
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
