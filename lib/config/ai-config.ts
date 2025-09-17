/**
 * AI Assessment & Knowledge Chat Configuration
 *
 * This file contains all configurable AI settings, prompts, and parameters.
 * Modify these values to customize the behavior of the AI systems.
 */

import { AssessmentDomain, RiskLevel, DocumentCategory } from '@prisma/client'

// =============================================================================
// AI MODEL CONFIGURATION
// =============================================================================

export const AI_MODELS = {
  // Chat completion models
  CHAT: {
    PRIMARY: 'gpt-4' as const,
    FALLBACK: 'gpt-3.5-turbo' as const,
    FAST: 'gpt-3.5-turbo' as const,
  },

  // Embedding models
  EMBEDDING: {
    PRIMARY: 'text-embedding-3-small' as const,
    LARGE: 'text-embedding-3-large' as const,
  }
} as const

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
} as const

// =============================================================================
// ASSESSMENT CONFIGURATION
// =============================================================================

export const ASSESSMENT_CONFIG = {
  // Assessment domains and their descriptions
  DOMAINS: {
    [AssessmentDomain.ANTISOCIAL]: {
      name: 'Antisocial Behavior',
      description: 'Social withdrawal, isolation, lack of social skills',
      keywords: ['isolation', 'withdrawn', 'antisocial', 'alone', 'social anxiety'],
    },
    [AssessmentDomain.VIOLENCE]: {
      name: 'Violence Risk',
      description: 'Aggressive thoughts, violent tendencies, harm to others',
      keywords: ['anger', 'aggressive', 'violence', 'hurt', 'fight', 'rage'],
    },
    [AssessmentDomain.ATTENTION]: {
      name: 'Attention Issues',
      description: 'Focus issues, hyperactivity, impulsivity',
      keywords: ['focus', 'attention', 'hyperactive', 'impulsive', 'concentrate'],
    },
    [AssessmentDomain.EMOTIONAL]: {
      name: 'Emotional Regulation',
      description: 'Emotional dysregulation, anxiety, depression',
      keywords: ['sad', 'anxious', 'depressed', 'emotional', 'mood', 'feelings'],
    },
    [AssessmentDomain.CONDUCT]: {
      name: 'Conduct Problems',
      description: 'Rule-breaking, defiance, authority issues',
      keywords: ['rules', 'defiant', 'authority', 'rebel', 'conduct', 'behavior'],
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
    acc[domain] = 0
    return acc
  }, {} as Record<AssessmentDomain, number>),

  // Assessment Mode Configuration
  MODE: {
    STRUCTURED: 'structured', // New yes/no format
    CONVERSATIONAL: 'conversational', // Original open-ended format
  },

  // Current assessment mode (can be changed to switch between formats)
  CURRENT_MODE: 'structured' as const,
} as const

// =============================================================================
// STRUCTURED ASSESSMENT CONFIGURATION
// =============================================================================

export interface QuestionConfig {
  id: string
  text: string
  order: number
  isGatingQuestion: boolean
  weight: number
}

export interface TerminationRuleConfig {
  name: string
  description: string
  minimumYesToContinue: number
  checkAfterQuestion: number
}

export interface QuestionSetConfig {
  domain: AssessmentDomain
  name: string
  description: string
  order: number
  questions: QuestionConfig[]
  terminationRules: TerminationRuleConfig[]
}

export const STRUCTURED_ASSESSMENT_CONFIG: QuestionSetConfig[] = [
  {
    domain: AssessmentDomain.ANTISOCIAL,
    name: 'Antisocial Behavior Assessment',
    description: 'Evaluates social withdrawal, isolation, and social interaction difficulties',
    order: 1,
    questions: [
      {
        id: 'antisocial_1',
        text: 'Do you often feel uncomfortable in social situations?',
        order: 1,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'antisocial_2',
        text: 'Do you prefer to spend time alone rather than with others?',
        order: 2,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'antisocial_3',
        text: 'Do you avoid social gatherings when possible?',
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'antisocial_4',
        text: 'Do you have difficulty making new friends?',
        order: 4,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'antisocial_5',
        text: 'Do you feel anxious when meeting new people?',
        order: 5,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'antisocial_6',
        text: 'Do you often feel like you don\'t fit in with groups?',
        order: 6,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'antisocial_7',
        text: 'Do you find it hard to maintain close relationships?',
        order: 7,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [
      {
        name: 'Early Social Screening',
        description: 'Skip remaining questions if no initial social concerns',
        minimumYesToContinue: 1,
        checkAfterQuestion: 2,
      },
    ],
  },
  {
    domain: AssessmentDomain.VIOLENCE,
    name: 'Violence Risk Assessment',
    description: 'Evaluates aggressive thoughts, violent tendencies, and risk of harm to others',
    order: 2,
    questions: [
      {
        id: 'violence_1',
        text: 'Do you often feel angry or irritated?',
        order: 1,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'violence_2',
        text: 'Do you sometimes have thoughts about hurting others?',
        order: 2,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'violence_3',
        text: 'Do you have difficulty controlling your temper?',
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'violence_4',
        text: 'Have you been in physical fights in the past year?',
        order: 4,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'violence_5',
        text: 'Do you enjoy watching violent movies or games?',
        order: 5,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'violence_6',
        text: 'Do you feel like hitting things when you\'re frustrated?',
        order: 6,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'violence_7',
        text: 'Do you sometimes threaten others when angry?',
        order: 7,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'violence_8',
        text: 'Do you have access to weapons?',
        order: 8,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [
      {
        name: 'Early Violence Screening',
        description: 'Skip remaining questions if no initial violence indicators',
        minimumYesToContinue: 1,
        checkAfterQuestion: 2,
      },
    ],
  },
  {
    domain: AssessmentDomain.ATTENTION,
    name: 'Attention Issues Assessment',
    description: 'Evaluates focus problems, hyperactivity, and impulsivity',
    order: 3,
    questions: [
      {
        id: 'attention_1',
        text: 'Do you have trouble concentrating on tasks?',
        order: 1,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'attention_2',
        text: 'Do you often feel restless or fidgety?',
        order: 2,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'attention_3',
        text: 'Do you have difficulty sitting still for long periods?',
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'attention_4',
        text: 'Do you often lose things or forget where you put them?',
        order: 4,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'attention_5',
        text: 'Do you have trouble following instructions?',
        order: 5,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'attention_6',
        text: 'Do you act without thinking about consequences?',
        order: 6,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [
      {
        name: 'Early Attention Screening',
        description: 'Skip remaining questions if no initial attention concerns',
        minimumYesToContinue: 1,
        checkAfterQuestion: 2,
      },
    ],
  },
  {
    domain: AssessmentDomain.EMOTIONAL,
    name: 'Emotional Regulation Assessment',
    description: 'Evaluates emotional stability, anxiety, and depression indicators',
    order: 4,
    questions: [
      {
        id: 'emotional_1',
        text: 'Do you often feel sad or depressed?',
        order: 1,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'emotional_2',
        text: 'Do you frequently feel anxious or worried?',
        order: 2,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'emotional_3',
        text: 'Do your moods change quickly throughout the day?',
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'emotional_4',
        text: 'Do you have trouble sleeping due to worries?',
        order: 4,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'emotional_5',
        text: 'Do you feel overwhelmed by daily tasks?',
        order: 5,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'emotional_6',
        text: 'Do you have thoughts of self-harm?',
        order: 6,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'emotional_7',
        text: 'Do you feel hopeless about the future?',
        order: 7,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [
      {
        name: 'Early Emotional Screening',
        description: 'Skip remaining questions if no initial emotional concerns',
        minimumYesToContinue: 1,
        checkAfterQuestion: 2,
      },
    ],
  },
  {
    domain: AssessmentDomain.CONDUCT,
    name: 'Conduct Problems Assessment',
    description: 'Evaluates rule-breaking behavior, defiance, and authority issues',
    order: 5,
    questions: [
      {
        id: 'conduct_1',
        text: 'Do you often break rules or ignore instructions?',
        order: 1,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'conduct_2',
        text: 'Do you frequently argue with authority figures?',
        order: 2,
        isGatingQuestion: true,
        weight: 1,
      },
      {
        id: 'conduct_3',
        text: 'Do you skip school or work without permission?',
        order: 3,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'conduct_4',
        text: 'Do you lie to avoid getting in trouble?',
        order: 4,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'conduct_5',
        text: 'Do you take things that don\'t belong to you?',
        order: 5,
        isGatingQuestion: false,
        weight: 1,
      },
      {
        id: 'conduct_6',
        text: 'Do you deliberately damage other people\'s property?',
        order: 6,
        isGatingQuestion: false,
        weight: 1,
      },
    ],
    terminationRules: [
      {
        name: 'Early Conduct Screening',
        description: 'Skip remaining questions if no initial conduct concerns',
        minimumYesToContinue: 1,
        checkAfterQuestion: 2,
      },
    ],
  },
]

// =============================================================================
// KNOWLEDGE CHAT CONFIGURATION
// =============================================================================

export const KNOWLEDGE_CONFIG = {
  // Document categories and their display information
  CATEGORIES: {
    [DocumentCategory.POLICY]: {
      name: 'Policy',
      emoji: '📋',
      description: 'Organizational policies and rules',
    },
    [DocumentCategory.PROCEDURE]: {
      name: 'Procedure',
      emoji: '⚙️',
      description: 'Step-by-step procedures and workflows',
    },
    [DocumentCategory.GUIDELINE]: {
      name: 'Guideline',
      emoji: '📝',
      description: 'Guidelines and best practices',
    },
    [DocumentCategory.MANUAL]: {
      name: 'Manual',
      emoji: '📖',
      description: 'User manuals and documentation',
    },
    [DocumentCategory.ASSESSMENT_TOOL]: {
      name: 'Assessment Tool',
      emoji: '🧮',
      description: 'Assessment instruments and tools',
    },
    [DocumentCategory.REFERENCE]: {
      name: 'Reference',
      emoji: '🔗',
      description: 'Reference materials and resources',
    },
    [DocumentCategory.OTHER]: {
      name: 'Other',
      emoji: '📄',
      description: 'Other documents and materials',
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
} as const

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

export const SYSTEM_PROMPTS = {
  // Assessment analysis prompt
  ASSESSMENT_ANALYSIS: `You are a psychological assessment AI analyzing responses for behavioral indicators.

Analyze the user's response and provide scores for each domain on a scale of 0-100:
- ANTISOCIAL: Social withdrawal, isolation, lack of social skills
- VIOLENCE: Aggressive thoughts, violent tendencies, harm to others
- ATTENTION: Focus issues, hyperactivity, impulsivity
- EMOTIONAL: Emotional dysregulation, anxiety, depression
- CONDUCT: Rule-breaking, defiance, authority issues

For each domain, provide:
1. Raw score (0-100)
2. Risk level (LOW, MODERATE, HIGH, VERY_HIGH)
3. Confidence (0.0-1.0)

Also determine if enough information has been gathered (typically after 8-12 exchanges).

Respond ONLY with valid JSON in this format:
{
  "scores": [
    {
      "domain": "ANTISOCIAL",
      "rawScore": 25,
      "riskLevel": "LOW",
      "confidence": 0.8
    }
  ],
  "isComplete": false
}`,

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
    ASSESSMENT_QUESTION: "Can you tell me more about how you've been feeling lately?",
    KNOWLEDGE_NO_CONTEXT: "I don't have enough relevant information in the knowledge base to answer your question accurately. Could you try rephrasing your question or asking about a different topic?",
    KNOWLEDGE_ERROR: "I encountered an error while processing your question. Please try again.",
    ASSESSMENT_ERROR: "I'm sorry, I couldn't generate a response. Please try again.",
  },
} as const

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  AI: {
    NO_RESPONSE: 'No response from AI',
    ANALYSIS_FAILED: 'Failed to analyze response',
    QUESTION_GENERATION_FAILED: 'Failed to generate next question',
    COMPLETION_FAILED: 'Failed to generate response',
    EMBEDDING_FAILED: 'Failed to create embedding',
  },
  ASSESSMENT: {
    INITIALIZATION_FAILED: 'Failed to initialize assessment',
    PROCESSING_FAILED: 'Failed to process response',
    SCORE_UPDATE_FAILED: 'Failed to update assessment scores',
    CREATION_FAILED: 'Failed to create assessment',
  },
  KNOWLEDGE: {
    INITIALIZATION_FAILED: 'Failed to initialize knowledge chat',
    PROCESSING_FAILED: 'Failed to process query',
    SEARCH_FAILED: 'Failed to search documents',
    SESSION_CREATION_FAILED: 'Failed to create chat session',
    SESSION_UPDATE_FAILED: 'Failed to update session title',
  },
} as const

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  ASSESSMENT: {
    COMPLETION: (responseCount: number) =>
      `Thank you for completing the assessment. I've gathered valuable information from our ${responseCount} exchanges. The assessment results are now available in your dashboard.`,
  },
  KNOWLEDGE: {
    SESSION_CREATED: 'Session created successfully',
    SESSION_UPDATED: 'Session updated successfully',
  },
} as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get risk level based on raw score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.LOW.max) return RiskLevel.LOW
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.MODERATE.max) return RiskLevel.MODERATE
  if (score <= ASSESSMENT_CONFIG.RISK_THRESHOLDS.HIGH.max) return RiskLevel.HIGH
  return RiskLevel.VERY_HIGH
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: DocumentCategory) {
  return KNOWLEDGE_CONFIG.CATEGORIES[category]
}

/**
 * Get suggested questions for a category
 */
export function getCategorySuggestions(categories: DocumentCategory[]): string[] {
  const suggestions: string[] = [...KNOWLEDGE_CONFIG.DEFAULT_SUGGESTIONS]

  categories.forEach(category => {
    const categorySuggestions = KNOWLEDGE_CONFIG.CATEGORY_SUGGESTIONS[category]
    if (categorySuggestions) {
      suggestions.push(...categorySuggestions)
    }
  })

  return [...new Set(suggestions)].slice(0, 5)
}

/**
 * Validate assessment score
 */
export function validateScore(score: number): boolean {
  return score >= 0 && score <= 100
}

/**
 * Validate confidence level
 */
export function validateConfidence(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1
}