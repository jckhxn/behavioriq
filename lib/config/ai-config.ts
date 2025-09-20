/**
 * AI Assessment & Knowledge Chat Configuration
 *
 * This file contains all configurable AI settings, prompts, and parameters.
 * Modify these values to customize the behavior of the AI systems.
 */

import { AssessmentDomain, RiskLevel, DocumentCategory } from "@prisma/client";

// =============================================================================
// AI MODEL CONFIGURATION
// =============================================================================

export const AI_MODELS = {
  // Chat completion models
  CHAT: {
    PRIMARY: "gpt-4o-mini" as const,
    FALLBACK: "gpt-4o-mini" as const,
    FAST: "gpt-4o-mini" as const,
  },

  // Embedding models
  EMBEDDING: {
    PRIMARY: "text-embedding-3-small" as const,
    LARGE: "text-embedding-3-large" as const,
  },
} as const;

// =============================================================================
// AI PARAMETERS
// =============================================================================

export const AI_PARAMETERS = {
  // Assessment AI settings
  ASSESSMENT: {
    TEMPERATURE: 0.3,
    MAX_TOKENS: 800,
    MAX_CONVERSATION_LENGTH: 20,
    MIN_EXCHANGES_FOR_COMPLETION: 8,
    MAX_EXCHANGES_FOR_COMPLETION: 12,
    SCORE_CONFIDENCE_THRESHOLD: 0.5,
  },

  // Knowledge AI settings
  KNOWLEDGE: {
    TEMPERATURE: 0.3,
    MAX_TOKENS: 1000,
    CONTEXT_WINDOW: 20, // Max messages to keep in history
    CONVERSATION_CONTEXT_LIMIT: 6, // Messages to include in context
    SEARCH_LIMIT: 5,
    SEARCH_THRESHOLD: 0.6,
    HIGH_SIMILARITY_THRESHOLD: 0.7,
    MIN_SIMILARITY_FOR_CONTEXT: 0.6,
    CONFIDENCE_BOOST_FACTOR: 1.2,
    MAX_CONFIDENCE: 0.95,
  },

  // Question generation settings
  QUESTION_GENERATION: {
    TEMPERATURE: 0.7,
    MAX_TOKENS: 200,
  },
} as const;

// =============================================================================
// ASSESSMENT CONFIGURATION
// =============================================================================

export const ASSESSMENT_CONFIG = {
  // Assessment domains and their descriptions
  DOMAINS: {
    [AssessmentDomain.ANTISOCIAL]: {
      name: "Antisocial Behavior",
      description: "Social withdrawal, isolation, lack of social skills",
      keywords: [
        "isolation",
        "withdrawn",
        "antisocial",
        "alone",
        "social anxiety",
      ],
    },
    [AssessmentDomain.VIOLENCE]: {
      name: "Violence Risk",
      description: "Aggressive thoughts, violent tendencies, harm to others",
      keywords: ["anger", "aggressive", "violence", "hurt", "fight", "rage"],
    },
    [AssessmentDomain.ATTENTION]: {
      name: "Attention Issues",
      description: "Focus issues, hyperactivity, impulsivity",
      keywords: [
        "focus",
        "attention",
        "hyperactive",
        "impulsive",
        "concentrate",
      ],
    },
    [AssessmentDomain.EMOTIONAL]: {
      name: "Emotional Regulation",
      description: "Emotional dysregulation, anxiety, depression",
      keywords: [
        "sad",
        "anxious",
        "depressed",
        "emotional",
        "mood",
        "feelings",
      ],
    },
    [AssessmentDomain.CONDUCT]: {
      name: "Conduct Problems",
      description: "Rule-breaking, defiance, authority issues",
      keywords: [
        "rules",
        "defiant",
        "authority",
        "rebel",
        "conduct",
        "behavior",
      ],
    },
  },

  // Risk level thresholds (now percentage-based: score/totalPossible * 100)
  RISK_THRESHOLDS: {
    [RiskLevel.LOW]: { min: 0, max: 25 },
    [RiskLevel.MODERATE]: { min: 26, max: 50 },
    [RiskLevel.HIGH]: { min: 51, max: 75 },
    [RiskLevel.VERY_HIGH]: { min: 76, max: 100 },
  },

  // Default scores for new assessments
  DEFAULT_SCORES: Object.values(AssessmentDomain).reduce((acc, domain) => {
    acc[domain] = 0;
    return acc;
  }, {} as Record<AssessmentDomain, number>),

  // Assessment Mode Configuration - Now only structured mode
  MODE: {
    STRUCTURED: "structured", // Yes/no question format
  },

  // Current assessment mode - always structured
  CURRENT_MODE: "structured" as const,
} as const;

// =============================================================================
// STRUCTURED ASSESSMENT CONFIGURATION
// =============================================================================

// Assessment configuration types and functions (now loaded from database)
export type {
  QuestionConfig,
  TerminationRuleConfig,
  QuestionSetConfig,
} from "@/lib/assessment/db-loader";

// Database assessment loading utilities
export {
  loadAssessmentConfigs,
  loadAssessmentByDomain,
  getAvailableAssessmentDomains,
  loadAssessmentConfigsClient,
  loadAssessmentByDomainClient,
  validateAssessmentConfig,
} from "@/lib/assessment/db-loader";

// =============================================================================
// KNOWLEDGE CHAT CONFIGURATION
// =============================================================================

export const KNOWLEDGE_CONFIG = {
  // Document categories and their display information
  CATEGORIES: {
    [DocumentCategory.POLICY]: {
      name: "Policy",
      emoji: "📋",
      description: "Organizational policies and rules",
    },
    [DocumentCategory.PROCEDURE]: {
      name: "Procedure",
      emoji: "⚙️",
      description: "Step-by-step procedures and workflows",
    },
    [DocumentCategory.GUIDELINE]: {
      name: "Guideline",
      emoji: "📝",
      description: "Guidelines and best practices",
    },
    [DocumentCategory.MANUAL]: {
      name: "Manual",
      emoji: "📖",
      description: "User manuals and documentation",
    },
    [DocumentCategory.ASSESSMENT_TOOL]: {
      name: "Assessment Tool",
      emoji: "🧮",
      description: "Assessment instruments and tools",
    },
    [DocumentCategory.REFERENCE]: {
      name: "Reference",
      emoji: "🔗",
      description: "Reference materials and resources",
    },
    [DocumentCategory.OTHER]: {
      name: "Other",
      emoji: "📄",
      description: "Other documents and materials",
    },
  },

  // Default suggested questions
  DEFAULT_SUGGESTIONS: [
    "What are the key policies I should be aware of?",
    "Can you summarize the main procedures?",
    "What assessment tools are available?",
    "Help me understand the guidelines for...",
    "What information do you have about...?",
  ],

  // Category-specific question templates
  CATEGORY_SUGGESTIONS: {
    [DocumentCategory.POLICY]: [
      "What's our policy on...",
      "Are there any policy updates regarding...",
      "How does the policy handle...",
    ],
    [DocumentCategory.PROCEDURE]: [
      "How do I follow the procedure for...",
      "What are the steps to...",
      "Can you walk me through the process of...",
    ],
    [DocumentCategory.ASSESSMENT_TOOL]: [
      "Which assessment tool should I use for...",
      "How do I interpret the results of...",
      "What are the scoring guidelines for...",
    ],
    [DocumentCategory.GUIDELINE]: [
      "What are the guidelines for...",
      "Are there best practices for...",
      "What should I consider when...",
    ],
    [DocumentCategory.MANUAL]: [
      "How do I use...",
      "What are the features of...",
      "Can you explain how to...",
    ],
    [DocumentCategory.REFERENCE]: [
      "Where can I find information about...",
      "What resources are available for...",
      "Can you reference materials on...",
    ],
    [DocumentCategory.OTHER]: [
      "Can you help me understand...",
      "What should I know about...",
      "Is there information on...",
    ],
  },
} as const;

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

export const SYSTEM_PROMPTS = {
  // Assessment analysis prompt
  ASSESSMENT_ANALYSIS: `You are a psychological assessment AI analyzing responses for behavioral indicators.

You will receive one or more domains with associated scores (0–100).

Domain names may vary between assessments (e.g., “EMOTIONAL,” “MOOD,” “ANGER,” “STRESS”).

Each domain will always provide a score.

Your task is to generate a conversational, empathetic summary of the user’s results.
Always follow this structure in your response:

Overview: Provide a supportive summary of the main findings, highlighting domains that appear higher. Use the domain names provided in the input.

Domain Interactions: If certain higher-scoring domains tend to interact (e.g., high EMOTIONAL + high ATTENTION), explain how they may influence each other.

Trusted Resources: Provide a short list of practical, easy-to-understand resources (articles, guides, or tools) only from trusted sources such as Mayo Clinic, CDC, American Psychological Association (APA), or NIH. Include clickable links.

Disclaimer: Always include a clear statement that this is not medical advice, and encourage the user to consult a licensed mental health professional if concerns are significant.

Do not return JSON, raw scores, or risk levels. Only return a conversational response in this structured format.`,

  // Assessment question generation prompt
  ASSESSMENT_QUESTIONS: `You are conducting a psychological assessment interview. Based on the conversation history and current assessment needs, generate the next most appropriate question.

Guidelines:
- Ask open-ended questions that encourage detailed responses
- Explore areas that need more information based on current scores
- Be empathetic and professional
- Avoid leading questions
- Focus on understanding thoughts, feelings, and behaviors
- Keep questions conversational and non-threatening

Generate ONE concise, empathetic question that will help gather more assessment information.`,

  // Knowledge chat system prompt
  KNOWLEDGE_RESPONSE: `You are a knowledgeable AI assistant helping users find information from their document collection.

Guidelines:
- Provide accurate, helpful answers based solely on the provided context
- Be concise but comprehensive
- If information is incomplete, acknowledge limitations
- Always cite which documents you're referencing
- Maintain conversational tone while being informative
- If the context doesn't contain relevant information, say so clearly

Provide a helpful response that answers the user's question using the available context.`,

  // Fallback responses
  FALLBACKS: {
    ASSESSMENT_QUESTION:
      "Can you tell me more about how you've been feeling lately?",
    KNOWLEDGE_NO_CONTEXT:
      "I don't have enough relevant information in the knowledge base to answer your question accurately. Could you try rephrasing your question or asking about a different topic?",
    KNOWLEDGE_ERROR:
      "I encountered an error while processing your question. Please try again.",
    ASSESSMENT_ERROR:
      "I'm sorry, I couldn't generate a response. Please try again.",
  },
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  AI: {
    NO_RESPONSE: "No response from AI",
    ANALYSIS_FAILED: "Failed to analyze response",
    QUESTION_GENERATION_FAILED: "Failed to generate next question",
    COMPLETION_FAILED: "Failed to generate response",
    EMBEDDING_FAILED: "Failed to create embedding",
  },
  ASSESSMENT: {
    INITIALIZATION_FAILED: "Failed to initialize assessment",
    PROCESSING_FAILED: "Failed to process response",
    SCORE_UPDATE_FAILED: "Failed to update assessment scores",
    CREATION_FAILED: "Failed to create assessment",
  },
  KNOWLEDGE: {
    INITIALIZATION_FAILED: "Failed to initialize knowledge chat",
    PROCESSING_FAILED: "Failed to process query",
    SEARCH_FAILED: "Failed to search documents",
    SESSION_CREATION_FAILED: "Failed to create chat session",
    SESSION_UPDATE_FAILED: "Failed to update session title",
  },
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  ASSESSMENT: {
    COMPLETION: (responseCount: number) =>
      `Thank you for completing the assessment. I've gathered valuable information from our ${responseCount} exchanges. The assessment results are now available in your dashboard.`,
  },
  KNOWLEDGE: {
    SESSION_CREATED: "Session created successfully",
    SESSION_UPDATED: "Session updated successfully",
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get risk level based on raw score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.LOW.max) return RiskLevel.LOW;
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.MODERATE.max)
    return RiskLevel.MODERATE;
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.HIGH.max)
    return RiskLevel.HIGH;
  return RiskLevel.VERY_HIGH;
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: DocumentCategory) {
  return KNOWLEDGE_CONFIG.CATEGORIES[category];
}

/**
 * Get suggested questions for a category
 */
export function getCategorySuggestions(
  categories: DocumentCategory[]
): string[] {
  const suggestions: string[] = [...KNOWLEDGE_CONFIG.DEFAULT_SUGGESTIONS];

  categories.forEach((category) => {
    const categorySuggestions = KNOWLEDGE_CONFIG.CATEGORY_SUGGESTIONS[category];
    if (categorySuggestions) {
      suggestions.push(...categorySuggestions);
    }
  });

  return [...new Set(suggestions)].slice(0, 5);
}

/**
 * Validate assessment score
 */
export function validateScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

/**
 * Validate confidence level
 */
export function validateConfidence(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}
