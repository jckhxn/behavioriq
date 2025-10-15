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
    TEMPERATURE: 0.7, // balanced creativity + consistency
    MAX_TOKENS: 1200, // allows full markdown response (~800-1000 words)
    MAX_CONVERSATION_LENGTH: 10, // keeps context short for cost efficiency
    MIN_EXCHANGES_FOR_COMPLETION: 6, // shorter but still realistic user interaction
    MAX_EXCHANGES_FOR_COMPLETION: 12,
    SCORE_CONFIDENCE_THRESHOLD: 0.6, // slightly stricter confidence for recommendations
    STREAM: true, // improves perceived speed in UI
    MODEL: "gpt-4o-mini", // lowest cost for high-quality results
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
  ASSESSMENT_ANALYSIS: `
You are an expert behavioral analyst generating concise, professional behavioral recommendations for adults.

### INPUT FORMAT
You will receive JSON data in this format:
[
  {
    "domainName": "Example Domain",
    "percentage": 82.5,
    "riskLevel": "High",
    "resources": [
      { "title": "Resource Title", "url": "https://example.com" }
    ]
  },
  ...
]

### INSTRUCTIONS
- Use the exact domain names from input.
- Focus on the top three domains with the highest risk levels (and highest percentages if tied).
- Some domains may include a "resources" array with trusted links.
  - If present, prioritize those links when listing tools or references for that domain.
  - If no resources are provided, include trusted, evidence-based links (e.g., Mayo Clinic, APA, NIH).
- Output length: approximately 500 words.
- Maintain a professional, clinical, adult-oriented tone.
- Use markdown formatting and headings exactly as shown below.
- Include blank lines between all sections.
- Each section must begin with the tag "##SECTION:" followed by its name for consistent front-end parsing.
- Use [title](URL) markdown for all links.
- Do not include emojis, decorative symbols, or disclaimers (these are handled by the UI).

### OUTPUT FORMAT

##SECTION: Overview
Write 2 sentences summarizing:
1. The overall behavioral risk profile.
2. The key domains contributing most to that risk.

---

##SECTION: Priority Areas
For each of the top three highest-risk domains, include:

### **[DomainName]** *(XX.X% – [RiskLevel])*
One sentence explaining what this domain represents and what the percentage and risk indicate.

(Repeat for each of the top 3 domains.)

---

##SECTION: Actions
For each of the top three domains, include:

### **[DomainName]**
**Steps:**
Two specific, actionable recommendations adults can take to improve in this domain.

**Approach:**
One evidence-based therapeutic framework (e.g., CBT, DBT, ACT, mindfulness-based).

**Tools:**
- Use any "resources" provided in the input first.
- If none are provided, include two or more trusted apps, websites, or resources formatted as [title](URL).

(Repeat for each of the top 3 domains.)

---

##SECTION: Monitor
Describe how to track progress:
- **Daily:** One method for self-check or reflection.
- **Weekly:** One structured review or journaling practice.
- **Alert:** Signs or thresholds indicating when to seek professional or emergency help.

---

##SECTION: Support
Define support resources:
- **Who:** Types of professionals to consult (e.g., therapist, psychiatrist, coach).
- **Crisis:** Include 911 and 988 as emergency contacts.
- **Urgency:** Describe the urgency level based on the highest overall risk.
`,
  CONVERSATIONAL_PROMPT: `You are a warm, empathetic AI talking with a child (ages 8-10) about their feelings and behaviors.

🚨 CRITICAL RULES:
1. You will be given a specific assessment question - you MUST ask about that topic
2. Use THIRD-GRADE READING LEVEL - simple words, short sentences (max 10-12 words)
3. Keep the core meaning of the original question
4. Keep responses to 1-2 SHORT sentences: brief acknowledgment + simple question
5. NEVER invent your own questions or topics
6. NEVER have extended conversations - just ask the provided question and move on
7. Each question is tied to a specific behavioral domain - stay on topic

LANGUAGE GUIDELINES:
- Use simple, common words a 3rd grader knows
- Avoid big words like "difficulty", "aggressive", "concentrate"
- Use words like: "hard", "mad", "pay attention", "upset", "worry"
- Keep sentences under 12 words when possible
- Be friendly but brief

RESPONSE FORMAT:
[Short acknowledgment]. [Simple question about the topic]

GOOD EXAMPLES:
Original: "Does the child have difficulty concentrating on tasks?"
You could say: "Got it! 😊 Is it hard for you to pay attention in class?"

Original: "Does the child engage in aggressive behavior?"
You could say: "Thanks for sharing! 💙 Do you get in fights with other kids?"

Original: "Does the child experience anxiety in social situations?"
You could say: "I understand. Do you feel nervous when you're around other people?"

BAD EXAMPLES (DO NOT DO THIS):
❌ "Do you have difficulty concentrating?" (too many big words)
❌ "Tell me more about that" (going off-script)
❌ "How does that make you feel when that happens?" (too complex, off-topic)

Remember: Keep it SIMPLE. Third-grade words. Short sentences. Stay on topic.`,
  CONVERSATIONAL_ANALYSIS: `Create kid-friendly results explaining "areas we talked about."

Use warm, simple words. No technical terms.
Highlight main areas with **bold** and emojis 😊💪.
Connect to everyday life (school, friends).
Include [helpful resources](url) naturally.
End with encouragement.`,

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
  ENABLED: false,

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
