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
  DEFAULT_SCORES: Object.values(AssessmentDomain).reduce(
    (acc, domain) => {
      acc[domain] = 0;
      return acc;
    },
    {} as Record<AssessmentDomain, number>
  ),

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
  ASSESSMENT_ANALYSIS: `You are a compassionate psychological assessment AI. You’ll receive one or more domains with scores (0–100), and some domains may also include trusted resources. Write a conversational, empathetic summary of the results: (1) give a supportive overview highlighting higher-scoring domains using their exact names; (2) explain, in simple relatable terms, how any higher-scoring domains might interact with each other; (3) naturally suggest practical, easy-to-understand resources from trusted sources (Mayo Clinic, CDC, APA, NIH, etc.) or any resources provided with the domains, phrased as clickable descriptive links that can be saved or bookmarked. Do not return JSON, raw scores, percentages, or risk levels. Make it easy to read, with resources woven into the text—not a list of links—and don’t include a disclaimer (the UI already provides it).`,
  CONVERSATIONAL_PROMPT: `You are a gentle, friendly helper AI talking with a child.  
You will be given a list of questions about feelings, focus, and behavior.  

Your job is to:
• Speak like a kind, patient friend or older sibling — warm, simple words, short sentences.  
• Do not mention "assessment," "test," or the name of anything; just start a friendly chat.  
• Ask one question at a time. Use soft, encouraging phrases like "Let's try another question" or "That's okay!"  
• When the child answers, internally infer "yes" or "no" but don't tell them you're doing that.  
• Gently acknowledge their answer ("thanks for telling me" or "that's helpful") before moving on.  
• Keep each question and acknowledgment light and conversational.
• Use **markdown formatting** for emphasis (bold, italic, lists) when it helps make your message clearer and friendlier.
• You can use emojis occasionally to make the conversation feel warm and engaging (😊, 👍, ✨, etc.).
• At the end, thank them, and give a simple, positive wrap-up about what you talked about, using everyday words ("we talked about paying attention, staying calm…"), with no scores or technical terms.  
• Do not show JSON or any behind-the-scenes information.  
• Do not include disclaimers (the UI already provides them).
`,
  CONVERSATIONAL_ANALYSIS: `You are a gentle, friendly helper AI talking with a child and their caregiver.  
You will receive one or more domains with scores from 0–100. Some domains may also include trusted resources.  

Your job is to:
• Speak like a kind, supportive friend — warm, simple words, short sentences.  
• Don't say "assessment," "score," "percent," "risk," or the names of tests; instead talk about "areas we talked about" or "things you do or feel."  
• Highlight the areas with higher numbers using their exact names, but explain what they mean in easy-to-grasp, kid-level language.
• Use **markdown formatting** liberally:
  - Use **bold** for key areas or important points
  - Use *italics* for gentle emphasis
  - Use numbered lists for steps or tips
  - Use bullet points for related ideas
  - Use emojis to make it warm and engaging (😊, 💪, 🌟, 📚, etc.)
• Show how those areas might connect with everyday life (school, play, friends, family) in gentle, relatable examples.  
• Suggest a few simple tips or activities and naturally weave in trusted resources or any provided with the domains as **clickable markdown links** like [friendly description](url).
• Do not show numbers, percentages, or risk levels.  
• End with encouragement and hope.  
• Do not include disclaimers (the UI already provides them).
`,

  // Child-friendly conversational prompts for enhanced report
  CONVERSATIONAL_CHILD_WELCOME: `👋 Hi there! I'm here to ask you some simple questions. There are no right or wrong answers — just tell me what you think. Ready?`,

  CONVERSATIONAL_CHILD_ENCOURAGEMENT: [
    "You're doing amazing 👍",
    "Thank you for sharing that.",
    "Great answer — let's keep going.",
    "Almost done — just a few more!",
    "That's really helpful, thank you!",
    "You're being super honest, I appreciate that.",
  ],

  CONVERSATIONAL_CHILD_CLOSING: `🎉 All done! Thank you so much for sharing your thoughts. Your parent can now see a preview of your answers.`,

  // Enhanced analysis for parent-child comparison
  CONVERSATIONAL_ENHANCED_ANALYSIS: `You are analyzing assessment results that include BOTH parent responses AND child responses.

Your task:
1. **Identify meaningful differences** between parent and child perspectives
2. **Highlight direct quotes** from the child that reveal unique insights
3. **Provide actionable recommendations** based on BOTH perspectives
4. **Note areas** where parent and child aligned vs diverged
5. Use empathetic, strengths-based language

Format your response using markdown:

## 🎯 Child's Voice Highlights
[Direct quotes and key insights from the child's responses]

## 👨‍👩‍👧 Parent vs Child Perspective
[Comparison analysis showing where they align and where they differ]

## 💡 Enhanced Recommendations
[Actionable next steps based on both perspectives]

Keep tone professional but warm, suitable for parents AND school staff. Use emojis sparingly for section headers only.`,
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
// MOCK RECOMMENDATIONS CONFIGURATION
// =============================================================================

export const MOCK_RECOMMENDATIONS = {
  // Enable/disable mock responses
  ENABLED: true,

  // Mock response template based on assessment domains
  generateMockResponse: (
    domains: { domain: string; riskLevel: string; score: number }[]
  ) => {
    const highRiskDomains = domains.filter(
      (d) => d.riskLevel === "HIGH" || d.riskLevel === "VERY_HIGH"
    );
    const moderateRiskDomains = domains.filter(
      (d) => d.riskLevel === "MODERATE"
    );

    const domainNames = {
      ANTISOCIAL: "SOCIAL",
      VIOLENCE: "AGGRESSION",
      ATTENTION: "ATTENTION",
      EMOTIONAL: "EMOTIONAL",
      CONDUCT: "CONDUCT",
    };

    const primaryDomains =
      highRiskDomains.length > 0 ? highRiskDomains : moderateRiskDomains;
    const domainList = primaryDomains
      .map((d) => domainNames[d.domain as keyof typeof domainNames] || d.domain)
      .join(" and ");

    return `# Assessment Recommendations Summary

## 📊 Overview
Based on your assessment results, **${domainList}** ${primaryDomains.length > 1 ? "are the primary areas" : "is the primary area"} that could benefit from focused attention. ${getDomainInsight(primaryDomains)}. 

${getOverallAssessment(domains)}

---

## 🔗 Domain Interactions
${getDomainInteractions(primaryDomains)}

---

## 📚 Trusted Resources & Support
These evidence-based resources can provide practical guidance and support:

${getResourceLinks(primaryDomains)}

---

## ⚠️ Important Notice
*This assessment provides general insights and is not a substitute for professional medical advice. If you have concerns about mental health, please consult with a licensed mental health professional for personalized guidance and support.*`;
  },
} as const;

// Helper functions for mock responses
function getDomainInsight(
  domains: { domain: string; riskLevel: string }[]
): string {
  const insights = {
    EMOTIONAL:
      "moments of strong emotions may sometimes make it harder to manage daily activities, and developing emotional regulation skills could be beneficial",
    ATTENTION:
      "difficulties with attention and focus may impact daily tasks, and structured routines could provide helpful support",
    ANTISOCIAL:
      "social interactions may present some challenges, and building social skills could enhance relationships",
    VIOLENCE:
      "managing anger and aggressive feelings may need attention, and learning coping strategies could be helpful",
    CONDUCT:
      "following rules and expectations may sometimes be challenging, and consistent structure could provide support",
  };

  return domains
    .map(
      (d) =>
        insights[d.domain as keyof typeof insights] ||
        "attention to this area may be beneficial"
    )
    .join(", and ");
}

function getOverallAssessment(
  domains: { domain: string; riskLevel: string }[]
): string {
  const lowRisk = domains.filter((d) => d.riskLevel === "LOW").length;
  if (lowRisk > domains.length / 2) {
    return "Many areas show positive functioning, which is encouraging.";
  }
  return "Understanding these patterns can help in developing effective support strategies.";
}

function getDomainInteractions(
  domains: { domain: string; riskLevel: string }[]
): string {
  if (
    domains.some((d) => d.domain === "EMOTIONAL") &&
    domains.some((d) => d.domain === "ATTENTION")
  ) {
    return "High EMOTIONAL scores can influence ATTENTION, making it harder to concentrate during emotionally intense moments. Conversely, struggles with focus can amplify emotional responses. Being aware of this interaction can help in planning structured routines and coping strategies to support both domains.";
  }

  if (
    domains.some((d) => d.domain === "EMOTIONAL") &&
    domains.some((d) => d.domain === "ANTISOCIAL")
  ) {
    return "Emotional challenges can impact social interactions, while social difficulties may increase emotional stress. Working on both emotional regulation and social skills together can create positive reinforcement between these areas.";
  }

  return "The identified domains often influence each other. Addressing multiple areas simultaneously with consistent strategies can create positive momentum across different aspects of behavior and well-being.";
}

function getResourceLinks(
  domains: { domain: string; riskLevel: string }[]
): string {
  const generalResources = [
    "### 🏥 General Support Resources",
    "• [Mayo Clinic - Child Mental Health](https://www.mayoclinic.org/healthy-lifestyle/childrens-health) - Comprehensive strategies for attention and focus improvement",
    "• [CDC Child Development Resources](https://www.cdc.gov/child-development/emotional-wellbeing) - Evidence-based guidance for emotional well-being",
    "• [American Psychological Association - Child Development](https://www.apa.org/topics/child-development/social-skills) - Activities to foster positive social interactions",
  ];

  const domainSpecificResources: Record<string, string[]> = {
    EMOTIONAL: [
      "### 💭 Emotional Regulation",
      "• [NIMH Emotional Wellness Guide](https://www.nimh.nih.gov/health/topics/emotional-wellness) - Comprehensive emotional regulation strategies",
      "• [Mindfulness for Children](https://www.mindful.org/mindfulness-for-kids/) - Age-appropriate mindfulness techniques",
    ],
    ATTENTION: [
      "### 🎯 Attention & Focus",
      "• [ADHD Foundation Resources](https://www.adhdfoundation.org.uk/what-is-adhd/parents-carers/) - Practical attention management tools",
      "• [CHADD (Children and Adults with ADHD)](https://chadd.org/for-parents/) - Evidence-based strategies and support networks",
    ],
    ANTISOCIAL: [
      "### 🤝 Social Skills Development",
      "• [Social Skills Development Guide](https://www.understood.org/en/learning-thinking-differences/child-learning-disabilities/social-skills-issues) - Building social connections",
      "• [Child Mind Institute - Social Skills](https://childmind.org/topics/concerns/social-skills-issues/) - Age-appropriate social activities",
    ],
    VIOLENCE: [
      "### 😤 Anger Management",
      "• [APA Anger Management for Children](https://www.apa.org/topics/anger/children-anger) - Strategies for managing aggressive feelings",
      "• [Crisis Text Line](https://www.crisistextline.org/) - 24/7 confidential support (Text HOME to 741741)",
    ],
    CONDUCT: [
      "### 📋 Behavioral Support",
      "• [Positive Behavior Support](https://www.pbis.org/family) - Evidence-based behavioral strategies",
      "• [Child Development Institute](https://childdevelopmentinfo.com/behavior/) - Practical behavior management techniques",
    ],
  };

  let resources = [...generalResources];

  // Add domain-specific resources
  domains.forEach((d) => {
    const domainResources = domainSpecificResources[d.domain];
    if (domainResources) {
      resources.push("", ...domainResources);
    }
  });

  return resources.join("\n");
}

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
