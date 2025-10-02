# Assessment JSON Schema Documentation

This document defines the complete schema and structure for JSON assessment files used in the AI Diagnostic System.

## Overview

Each assessment is defined as a JSON file that describes a behavioral domain, its questions, scoring rules, and conditional logic. The system uses these files to dynamically generate assessments with proper flow control and scoring.

## Root Schema

```typescript
interface Assessment {
  domain: string; // Unique identifier for the domain
  name: string; // Full descriptive name
  displayName: string; // Short display name for UI
  description: string; // Detailed description of what this assesses
  order: number; // Display order in assessment lists
  totalPossibleScore: number; // Maximum possible score
  clinicallySignificantScore: number; // Threshold for clinical significance
  skipConditions?: SkipCondition[]; // Conditional question skipping rules
  prerequisites?: Prerequisite[]; // Required conditions to show questions
  questions: Question[]; // Array of assessment questions
  terminationRules?: TerminationRule[]; // Early termination conditions
}
```

## Question Schema

```typescript
interface Question {
  id: string; // Unique identifier (domain_questionNumber format)
  text: string; // The question text presented to users
  order: number; // Display order within the assessment
  isGatingQuestion: boolean; // Whether this question affects flow control
  weight: number; // Scoring weight (typically 1)
  helpText?: string; // Optional additional guidance
  required?: boolean; // Whether response is mandatory (default: true)
}
```

## Skip Conditions

Skip conditions allow assessments to bypass questions based on previous answers:

```typescript
interface SkipCondition {
  questionId: string; // The question whose answer triggers the skip
  skipValue: boolean; // The answer value that triggers skipping
  skipToQuestion: string; // Question ID to jump to
  reason?: string; // Optional explanation for the skip logic
}
```

### Example Skip Condition

```json
{
  "questionId": "antisocial_1",
  "skipValue": false,
  "skipToQuestion": "antisocial_5",
  "reason": "If no social discomfort, skip to anxiety questions"
}
```

## Prerequisites

Prerequisites ensure questions only appear when certain conditions are met:

```typescript
interface Prerequisite {
  questionId: string; // Question that must be answered first
  requiredValue: boolean; // Required answer to show dependent questions
  description?: string; // Optional explanation
}
```

### Example Prerequisite

```json
{
  "questionId": "antisocial_2",
  "requiredValue": true,
  "description": "Only ask follow-up questions if user prefers solitude"
}
```

## Termination Rules

Termination rules allow assessments to end early based on response patterns:

```typescript
interface TerminationRule {
  name: string; // Rule identifier
  description: string; // Human-readable explanation
  minimumYesToContinue: number; // Minimum "yes" answers needed to continue
  checkAfterQuestion: number; // Question number to evaluate the rule
  alternativeEndMessage?: string; // Custom message if terminated early
}
```

### Example Termination Rule

```json
{
  "name": "Early Social Screening",
  "description": "Skip remaining questions if no initial social concerns",
  "minimumYesToContinue": 1,
  "checkAfterQuestion": 2,
  "alternativeEndMessage": "Based on your responses, we'll focus on other areas."
}
```

## Domain Types

The system recognizes these standard domains:

- `ANTISOCIAL` - Social withdrawal and interaction difficulties
- `ATTENTION` - Focus, concentration, and attention deficits
- `CONDUCT` - Behavioral problems and rule violations
- `EMOTIONAL` - Emotional regulation and mood disorders
- `VIOLENCE` - Aggressive behaviors and violence risk

## Scoring System

### Basic Scoring

- Each question typically has a weight of 1
- "Yes" answers contribute to the domain score
- "No" answers contribute 0 points
- Final score = sum of (answer_value × question_weight)

### Clinical Significance

- `clinicallySignificantScore` defines the threshold for concern
- Scores at or above this threshold may trigger recommendations
- Risk levels are calculated based on score ranges

### Risk Level Mapping

```typescript
enum RiskLevel {
  LOW = "LOW", // Score: 0-25% of maximum
  MODERATE = "MODERATE", // Score: 26-50% of maximum
  HIGH = "HIGH", // Score: 51-75% of maximum
  VERY_HIGH = "VERY_HIGH", // Score: 76-100% of maximum
}
```

## File Naming Convention

Assessment files should follow this pattern:

- Filename: `{domain}.json` (lowercase)
- Domain field: `{DOMAIN}` (uppercase)
- Question IDs: `{domain}_{number}` (lowercase domain, sequential numbers)

Examples:

- File: `antisocial.json`
- Domain: `"ANTISOCIAL"`
- Question IDs: `"antisocial_1"`, `"antisocial_2"`, etc.

## Validation Rules

1. **Required Fields**: `domain`, `name`, `displayName`, `description`, `order`, `totalPossibleScore`, `clinicallySignificantScore`, `questions`
2. **Question IDs**: Must be unique within the assessment
3. **Order Numbers**: Should be sequential starting from 1
4. **Skip Logic**: Referenced question IDs must exist
5. **Prerequisites**: Referenced question IDs must exist
6. **Termination Rules**: `checkAfterQuestion` must be ≤ total questions
7. **Clinical Threshold**: Should be reasonable (typically 50-70% of total possible score)

## Best Practices

### Question Writing

- Use clear, simple language appropriate for the target population
- Avoid double negatives or complex conditional statements
- Keep questions focused on specific, observable behaviors
- Use consistent tense (present tense recommended)

### Flow Control

- Use skip conditions sparingly to avoid confusing logic
- Test all possible paths through the assessment
- Provide clear reasoning for complex skip logic
- Consider the user experience when designing question flow

### Scoring Design

- Ensure the scoring range makes clinical sense
- Set appropriate thresholds for clinical significance
- Consider the impact of weighted questions on interpretation
- Test edge cases (all yes, all no, mixed responses)

## Example Complete Assessment

See the Assessment Template Manager in the admin interface to create complete assessments using this schema.

## Schema Validation

The system automatically validates assessment JSON files on startup. Common validation errors include:

- Missing required fields
- Invalid question ID references in skip conditions
- Duplicate question IDs
- Invalid order sequences
- Clinical significance scores higher than total possible scores

## Question Format Requirements

**IMPORTANT**: All questions in the AI Diagnostic system use a **Yes/No format only**.

- Questions should be designed to elicit boolean (true/false) responses
- UI components present these as "Yes" and "No" buttons
- Backend systems expect boolean values (true for "Yes", false for "No")
- Scoring is calculated based on Yes/No responses with configurable weights

This standardized format ensures:

- Consistent user experience across all assessments
- Simplified scoring algorithms
- Clear data interpretation
- Streamlined assessment taking process

## Future Enhancements

Planned schema additions:

- Adaptive scoring based on response patterns
- Multi-language support with translation keys
- Question branching based on demographic data
- Integration with external assessment standards

---

For implementation details and usage examples, see `ASSESSMENT_GUIDE.md` and the Assessment Template Manager in the admin interface.
