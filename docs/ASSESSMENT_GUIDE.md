# Early Detection Screener Assessment System Guide

This guide explains the Early Detection Screener assessment system, its configuration, and how to customize it for different clinical applications.

## Table of Contents

- [Assessment Overview](#assessment-overview)
- [Early Detection Screener Configuration](#early-detection-screener-configuration)
- [Domain Structure](#domain-structure)
- [Question Flow & Skip Logic](#question-flow--skip-logic)
- [Scoring System](#scoring-system)
- [Customizing Assessments](#customizing-assessments)
- [Adding New Domains](#adding-new-domains)
- [Testing & Validation](#testing--validation)

## Assessment Overview

The Early Detection Screener is a structured clinical assessment tool designed for efficient evaluation of behavioral health concerns. The system uses evidence-based questions with intelligent skip logic to minimize assessment time while maintaining clinical accuracy.

### Key Features

- **Structured Question Flow**: Predetermined questions with conditional branching
- **Skip Logic**: Gatekeeper questions that efficiently route respondents
- **Multi-Part Scoring**: Complex scoring algorithms for nuanced assessment
- **Clinical Thresholds**: Evidence-based cutoff scores for risk determination
- **Real-Time Progress**: Visual tracking of domain completion
- **AI Integration**: GPT-4 powered recommendations based on assessment patterns

## Early Detection Screener Configuration

All assessment configuration is located in `/lib/assessment/assessments.ts`. This file defines:

- **Domain configurations** with questions and scoring parameters
- **Skip conditions** and gatekeeper question logic
- **Clinical thresholds** for each domain
- **Multi-part logic** for complex scoring scenarios

## Domain Structure

The Early Detection Screener evaluates three core behavioral domains:

### Current Domains

| Domain                     | Questions    | Clinical Threshold     | Special Features                                  |
| -------------------------- | ------------ | ---------------------- | ------------------------------------------------- |
| **Suicidality**            | 7 questions  | ≥3 positive responses  | Gatekeeper question with skip logic               |
| **Self-Harm**              | 7 questions  | ≥3 positive responses  | Progressive questioning from ideation to behavior |
| **Antisocial Personality** | 12 questions | Part 1: ≥3, Part 2: ≥3 | Age prerequisite (≥15), multi-part scoring        |

### Domain Details

#### Suicidality Domain

- **Purpose**: Assess suicidal ideation and risk
- **Skip Logic**: "No" response to gatekeeper question (suic_b) skips to final question (suic_g)
- **Efficiency**: Reduces assessment time for low-risk respondents
- **Clinical Focus**: Death wishes, suicidal thoughts, plans, and preparations

#### Self-Harm Domain

- **Purpose**: Evaluate non-suicidal self-injury behaviors
- **Progressive Structure**: Questions build from ideation to specific behaviors
- **Comprehensive Coverage**: Thoughts, plans, attempts, and methods
- **Clinical Utility**: Distinguishes between different levels of self-harm risk

#### Antisocial Personality Domain

- **Purpose**: Screen for antisocial personality disorder indicators
- **Prerequisites**: Age verification (must be ≥15 years old)
- **Multi-Part Structure**:
  - Part 1 (5 questions): Early conduct problems before age 15
  - Part 2 (7 questions): Adult antisocial behavior patterns
- **Clinical Significance**: Both parts must meet thresholds for positive screening

## Question Flow & Skip Logic

The Early Detection Screener uses intelligent question flow to optimize assessment efficiency while maintaining clinical accuracy.

### Skip Logic Implementation

#### Suicidality Domain Skip Example

```typescript
{
  id: "suic_c",
  text: "Have you been thinking about how you might end your life?",
  skipCondition: {
    questionId: "suic_b",
    skipValue: false,
    skipToQuestion: "suic_g"
  }
}
```

- **Trigger**: If `suic_b` (gatekeeper question) is answered "No"
- **Action**: Skip directly to `suic_g` (final question)
- **Efficiency**: Bypasses 4 intermediate questions for low-risk respondents

#### Prerequisite Validation Example

```typescript
{
  name: "ANTISOCIAL",
  prerequisite: {
    questionId: "aspd_age",
    requiredValue: true
  }
}
```

- **Requirement**: Age verification question must be answered "Yes" (≥15 years)
- **Behavior**: If prerequisite fails, entire domain is skipped
- **Clinical Rationale**: ASPD screening requires minimum age threshold

### Question Flow Architecture

1. **Linear Progression**: Questions asked in predetermined order
2. **Conditional Branching**: Skip conditions evaluated after each response
3. **Domain Completion**: All required questions answered before moving to next domain
4. **State Persistence**: Progress saved across sessions

## Scoring System

### Standard Scoring (Suicidality & Self-Harm)

```typescript
// Simple additive scoring
const score = responses.reduce(
  (sum, response) => sum + (response.response ? 1 : 0),
  0
);

const isClinicallySignificant = score >= domain.clinicallySignificantScore;
```

- **Scoring Method**: Sum of "Yes" responses
- **Clinical Threshold**: ≥3 positive responses
- **Risk Assessment**: Above threshold indicates clinical concern

### Multi-Part Scoring (Antisocial Personality)

```typescript
// Part 1: Early conduct problems
const part1Score = part1Responses.reduce(
  (sum, r) => sum + (r.response ? 1 : 0),
  0
);

// Part 2: Adult antisocial behavior
const part2Score = part2Responses.reduce(
  (sum, r) => sum + (r.response ? 1 : 0),
  0
);

const isClinicallySignificant =
  part1Score >= part1Threshold && part2Score >= part2Threshold;
```

- **Two-Stage Evaluation**: Both parts must meet individual thresholds
- **Part 1 Threshold**: ≥3 positive responses (early conduct)
- **Part 2 Threshold**: ≥3 positive responses (adult behavior)
- **Clinical Significance**: Requires both thresholds to be met

### Risk Level Mapping

```typescript
export enum RiskLevel {
  LOW = "LOW", // Below clinical threshold
  MODERATE = "MODERATE", // At clinical threshold
  HIGH = "HIGH", // Above clinical threshold
  VERY_HIGH = "VERY_HIGH", // Significantly above threshold
}
```

## Customizing Assessments

### Adding a New Domain

1. **Update Database Schema** (`prisma/schema.prisma`):

```prisma
enum AssessmentDomain {
  ANTISOCIAL
  VIOLENCE
  ATTENTION
  EMOTIONAL
  CONDUCT
  YOUR_NEW_DOMAIN  // Add here
}
```

2. **Configure Domain** (`lib/assessment/assessments.ts`):

```typescript
export const EARLY_DETECTION_SCREENER: AssessmentDomainConfig[] = [
  // ... existing domains
  {
    name: "YOUR_NEW_DOMAIN",
    displayName: "Your Domain Display Name",
    totalPossibleScore: 5,
    clinicallySignificantScore: 3,
    questions: [
      {
        id: "domain_q1",
        text: "Your first question?",
      },
      // ... more questions
    ],
  },
];
```

3. **Update Domain Mapping** (`lib/ai/AssessmentAI.ts`):

```typescript
private mapDomainToEnum(domainName: string): AssessmentDomain {
  const domainMapping: Record<string, AssessmentDomain> = {
    // ... existing mappings
    YOUR_NEW_DOMAIN: AssessmentDomain.YOUR_NEW_DOMAIN,
  };
  return domainMapping[domainName] || AssessmentDomain.ANTISOCIAL;
}
```

### Adding Skip Logic

```typescript
{
  id: "question_with_skip",
  text: "Gatekeeper question text?",
  isGatekeeper: true,
},
{
  id: "conditional_question",
  text: "Follow-up question?",
  skipCondition: {
    questionId: "question_with_skip",
    skipValue: false,  // Skip if "No"
    skipToQuestion: "target_question"
  }
}
```

### Adding Prerequisites

```typescript
{
  name: "DOMAIN_WITH_PREREQ",
  prerequisite: {
    questionId: "prereq_question_id",
    requiredValue: true  // Must be "Yes"
  },
  // ... rest of domain config
}
```

```typescript
export const AI_PARAMETERS = {
  ASSESSMENT: {
    TEMPERATURE: 0.3, // Creativity (0.0-1.0, lower = more focused)
    MAX_TOKENS: 800, // Maximum response length
    MAX_CONVERSATION_LENGTH: 20, // Max total exchanges
    MIN_EXCHANGES_FOR_COMPLETION: 8, // Minimum before completion
    MAX_EXCHANGES_FOR_COMPLETION: 12, // Target completion range
  },
  QUESTION_GENERATION: {
    TEMPERATURE: 0.7, // Higher creativity for varied questions
    MAX_TOKENS: 200, // Shorter responses for questions
  },
};
```

### Question System Prompt

Customize how questions are generated by modifying the `ASSESSMENT_QUESTIONS` prompt:

```typescript
export const SYSTEM_PROMPTS = {
  ASSESSMENT_QUESTIONS: `You are conducting a psychological assessment interview...

Guidelines:
- Ask open-ended questions that encourage detailed responses
- Explore areas that need more information based on current scores
- Be empathetic and professional
- Avoid leading questions
- Focus on understanding thoughts, feelings, and behaviors
- Keep questions conversational and non-threatening

Generate ONE concise, empathetic question that will help gather more assessment information.`,
};
```

### Example Question Templates

You can add specific question templates or modify the AI's approach by updating the prompt. Consider adding:

#### Domain-Specific Questions

```typescript
// Add to the system prompt for more targeted questions
const DOMAIN_FOCUS_EXAMPLES = {
  ANTISOCIAL: [
    "How do you typically spend time with friends or family?",
    "Tell me about your relationships with others.",
    "How comfortable do you feel in social situations?",
  ],
  VIOLENCE: [
    "How do you typically handle anger or frustration?",
    "Tell me about a time when you felt really upset.",
    "What helps you calm down when you're frustrated?",
  ],
  // ... add for other domains
};
```

## Modifying Scoring

### Risk Level Thresholds

Adjust when scores transition between risk levels:

```typescript
export const ASSESSMENT_CONFIG = {
  RISK_THRESHOLDS: {
    [RiskLevel.LOW]: { min: 0, max: 25 }, // 0-25: Low risk
    [RiskLevel.MODERATE]: { min: 26, max: 50 }, // 26-50: Moderate risk
    [RiskLevel.HIGH]: { min: 51, max: 75 }, // 51-75: High risk
    [RiskLevel.VERY_HIGH]: { min: 76, max: 100 }, // 76-100: Very high risk
  },
};
```

### Scoring Analysis Prompt

The AI analyzes responses using this prompt. Modify for different scoring behavior:

```typescript
export const SYSTEM_PROMPTS = {
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
};
```

### Confidence Thresholds

Set minimum confidence levels for scores:

```typescript
export const AI_PARAMETERS = {
  ASSESSMENT: {
    SCORE_CONFIDENCE_THRESHOLD: 0.5, // Minimum confidence to accept scores
  },
};
```

## AI Model Configuration

### Changing AI Models

Update the models used for different tasks:

```typescript
export const AI_MODELS = {
  CHAT: {
    PRIMARY: "gpt-4", // Main model for assessment
    FALLBACK: "gpt-3.5-turbo", // Backup if primary fails
    FAST: "gpt-3.5-turbo", // For quick operations
  },
};
```

### Model Parameters

Fine-tune AI behavior:

```typescript
export const AI_PARAMETERS = {
  ASSESSMENT: {
    TEMPERATURE: 0.3, // Lower = more consistent, Higher = more creative
    MAX_TOKENS: 800, // Response length limit
    // ... other parameters
  },
};
```

## Testing Assessments

### 1. Create Test Scenarios

Create test cases for different risk levels:

```typescript
// Example test scenarios (add to your test suite)
const TEST_SCENARIOS = {
  lowRisk: {
    responses: [
      "I've been feeling pretty good lately",
      "I get along well with my family and friends",
      "I can focus on my work most of the time",
    ],
    expectedScores: {
      /* low scores across domains */
    },
  },

  highRisk: {
    responses: [
      "I've been really angry and isolated",
      "I can't concentrate on anything",
      "I don't follow rules that don't make sense",
    ],
    expectedScores: {
      /* higher scores in relevant domains */
    },
  },
};
```

### 2. Manual Testing

1. **Start a new assessment** through the UI
2. **Provide test responses** that should trigger specific domains
3. **Monitor scoring** in the dashboard
4. **Verify completion** happens at appropriate time

### 3. Automated Testing

```bash
# Run the test suite
npm test

# Test specific assessment functionality
npm test -- --grep "assessment"
```

## Deployment Considerations

### Environment Variables

Ensure these are set in production:

```bash
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_auth_secret
```

### Database Migrations

When you add new domains or modify the schema:

```bash
# Generate migration
npx prisma migrate dev --name your-migration-name

# Apply to production
npx prisma migrate deploy
```

### Configuration Versioning

When updating prompts or parameters:

1. **Test changes** in development environment
2. **Document changes** in version control
3. **Monitor assessment quality** after deployment
4. **Keep rollback capability** by preserving previous configurations

## Troubleshooting

### Common Issues

1. **Assessment not completing**: Check `MIN_EXCHANGES_FOR_COMPLETION` setting
2. **Unexpected scores**: Review `ASSESSMENT_ANALYSIS` prompt and test data
3. **Poor question quality**: Adjust `QUESTION_GENERATION` temperature and prompt
4. **Model errors**: Verify API keys and check model availability

### Debugging

Enable detailed logging by modifying the AI classes to log:

- Raw AI responses
- Parsed scores
- Confidence levels
- Decision points

### Getting Help

- Check the console for error messages
- Review the `ai-config.ts` file for parameter adjustments
- Test with known good/bad response patterns
- Validate JSON responses from the AI are properly formatted
