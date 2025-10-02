# Assessment Writing Guide

This guide explains how to create, structure, and add new behavioral assessments to the AI Diagnostic system.

## Table of Contents

1. [Overview](#overview)
2. [Assessment Structure](#assessment-structure)
3. [JSON Format Specification](#json-format-specification)
4. [Clinical Scoring Guidelines](#clinical-scoring-guidelines)
5. [Question Design Best Practices](#question-design-best-practices)
6. [Advanced Features](#advanced-features)
7. [Adding New Assessments](#adding-new-assessments)
8. [Testing and Validation](#testing-and-validation)
9. [Examples](#examples)

## Overview

The AI Diagnostic system uses structured JSON files to define behavioral assessments. Each assessment is designed to evaluate specific psychological or behavioral domains using evidence-based questions with clinical scoring thresholds.

### Key Principles

- **Clinical Validity**: All assessments should be based on established psychological research
- **Binary Scoring**: Questions use Yes/No responses for clear, objective scoring
- **Clinical Thresholds**: Each assessment defines scores that indicate clinical significance
- **Modular Design**: Assessments are independent and can be used individually or together

## Assessment Structure

Each assessment consists of several core components:

```
Assessment
├── Metadata (domain, name, description)
├── Clinical Scoring (total possible, clinical threshold)
├── Questions (structured yes/no items)
├── Termination Rules (early stopping conditions)
└── Advanced Logic (skip conditions, prerequisites)
```

## JSON Format Specification

### Required Fields

```json
{
  "domain": "ASSESSMENT_DOMAIN",
  "name": "Technical Name",
  "displayName": "User-Friendly Display Name",
  "description": "Brief description of what this assessment measures",
  "order": 1,
  "totalPossibleScore": 10,
  "clinicallySignificantScore": 6,
  "skipConditions": [],
  "prerequisites": [],
  "questions": [],
  "terminationRules": []
}
```

### Field Specifications

#### `domain` (string, required)

Must match one of the predefined domains in the system:

- `CONDUCT` - Conduct problems and rule-breaking behavior
- `ANTISOCIAL` - Antisocial personality traits
- `VIOLENCE` - Violence risk and aggression
- `ATTENTION` - Attention and hyperactivity issues
- `EMOTIONAL` - Emotional regulation problems

#### `name` (string, required)

Technical identifier used internally. Should be descriptive and unique.

#### `displayName` (string, required)

User-friendly name shown in the interface. Should be clear and professional.

#### `description` (string, required)

Brief explanation of what the assessment measures. Shown to users and administrators.

#### `order` (number, required)

Determines the sequence in which assessments are presented. Lower numbers appear first.

#### `totalPossibleScore` (number, required)

Maximum score possible if all questions are answered "Yes". Usually equals the number of questions.

#### `clinicallySignificantScore` (number, required)

Threshold score indicating clinical significance. Scores at or above this level suggest meaningful concerns.

**Guidelines for Clinical Thresholds:**

- **Conservative approach**: Set threshold at 60-70% of total possible score
- **Research-based**: Use established cutoff scores when available
- **Domain-specific**: Adjust based on the severity of the domain being assessed

### Question Structure

```json
{
  "id": "unique_question_id",
  "text": "Question text that is clear and unambiguous",
  "order": 1,
  "isGatingQuestion": false,
  "weight": 1
}
```

#### Question Field Specifications

- **`id`**: Unique identifier within the assessment (e.g., "conduct_q1")
- **`text`**: The actual question text. Should be clear, unbiased, and appropriate for the target population
- **`order`**: Sequence number determining question presentation order
- **`isGatingQuestion`**: Boolean indicating if this question is critical for assessment continuation
- **`weight`**: Scoring weight (typically 1, but can be adjusted for more important items)

### Termination Rules

Termination rules allow assessments to end early when certain conditions are met, improving efficiency.

```json
{
  "name": "Early Termination - Low Risk",
  "description": "Stop assessment if first 3 questions are all 'No'",
  "minimumYesToContinue": 1,
  "checkAfterQuestion": 3
}
```

#### Termination Rule Guidelines

- **Conservative termination**: Only terminate when clearly appropriate
- **Clinical safety**: Err on the side of completing assessments when in doubt
- **Efficiency balance**: Use termination to reduce unnecessary burden on respondents

## Clinical Scoring Guidelines

### Setting Clinical Thresholds

1. **Literature Review**: Research established cutoff scores for similar instruments
2. **Clinical Judgment**: Consider the severity and implications of the domain
3. **Population Considerations**: Adjust for age, cultural factors, and setting
4. **Validation**: Test thresholds with known groups when possible

### Recommended Threshold Ranges by Domain

| Domain     | Typical Threshold Range | Rationale                                         |
| ---------- | ----------------------- | ------------------------------------------------- |
| Violence   | 30-40% of total score   | Conservative due to safety implications           |
| Conduct    | 60-70% of total score   | Moderate threshold for behavioral concerns        |
| Antisocial | 50-60% of total score   | Moderate-conservative for personality traits      |
| Attention  | 60-70% of total score   | Higher threshold for developmental considerations |
| Emotional  | 60-75% of total score   | Variable based on specific emotional domain       |

## Question Design Best Practices

### Writing Effective Questions

1. **Clarity and Simplicity**
   - Use simple, direct language
   - Avoid double-barreled questions
   - One concept per question

2. **Clinical Relevance**
   - Base questions on diagnostic criteria
   - Focus on observable behaviors
   - Include timeframe specifications when relevant

3. **Response Format**
   - Use clear Yes/No format
   - Avoid ambiguous middle options
   - Provide context when needed

### Example Question Progression

```
Good: "Do you often have trouble sitting still?"
Better: "In the past 6 months, have you often had trouble sitting still when required?"
Best: "In the past 6 months, have you often had trouble sitting still during activities where you're expected to remain seated (like meetings, classes, or meals)?"
```

### Question Format Requirements

**ALL QUESTIONS MUST USE YES/NO FORMAT**

The AI Diagnostic system requires all questions to be answerable with a simple "Yes" or "No" response:

✅ **Correct**: "Do you often have trouble concentrating during tasks?"
✅ **Correct**: "Have you experienced difficulty sleeping in the past month?"
✅ **Correct**: "Do you find it hard to control your temper when frustrated?"

❌ **Incorrect**: "How often do you have trouble concentrating?" (requires multiple choice)
❌ **Incorrect**: "Rate your sleep quality from 1-10" (requires scale rating)
❌ **Incorrect**: "What triggers your anger?" (requires open-ended response)

### Question Types to Avoid

- **Leading questions**: "Don't you think violence is wrong?"
- **Double negatives**: "Is it not true that you don't avoid conflicts?"
- **Vague timeframes**: "Do you sometimes feel angry?"
- **Judgment-laden**: "Are you a violent person?"
- **Multiple choice formats**: Questions requiring more than Yes/No responses
- **Scale ratings**: Questions asking for numerical or Likert scale responses

## Advanced Features

### Skip Conditions

Skip conditions allow questions to be bypassed based on previous responses:

```json
"skipConditions": [
  {
    "questionId": "conduct_q1",
    "skipValue": false,
    "skipToQuestion": "conduct_q5"
  }
]
```

### Prerequisites

Prerequisites ensure certain conditions are met before starting an assessment:

```json
"prerequisites": [
  {
    "questionId": "screening_age",
    "requiredValue": true
  }
]
```

### Multi-Part Logic

For assessments requiring complex scoring across question groups:

```json
"multiPartLogic": {
  "part1Questions": ["q1", "q2", "q3"],
  "part1Threshold": 2,
  "part2Questions": ["q4", "q5", "q6"],
  "part2Threshold": 1
}
```

## Adding New Assessments

### Step 1: Create the JSON File

1. Use the Assessment Template Manager in the admin interface to create assessments
2. Follow the naming convention: `domain_name.json`
3. Use the complete JSON structure with all required fields

### Step 2: Add Domain (if new)

If creating a new domain, update:

1. `prisma/schema.prisma` - Add to `AssessmentDomain` enum
2. Database migration: `npx prisma migrate dev`

### Step 3: Validate Structure

1. Use the built-in validation in the Assessment Template Manager interface
2. Verify all required fields are present
3. Confirm question IDs are unique

### Step 4: Seed Database

Run the seeder to add your assessment to the database:

```bash
npx prisma db seed
```

### Step 5: Test Integration

1. Verify assessment loads: Check admin dashboard
2. Test question flow: Complete a sample assessment
3. Validate scoring: Confirm clinical thresholds work correctly

## Testing and Validation

### Content Validation

1. **Clinical Review**: Have qualified professionals review questions
2. **Face Validity**: Ensure questions appear to measure what they claim
3. **Cultural Sensitivity**: Review for cultural bias and appropriateness

### Technical Testing

1. **JSON Validation**: Ensure proper syntax and structure
2. **Database Integration**: Verify successful loading and retrieval
3. **Scoring Logic**: Test various response patterns
4. **UI Integration**: Confirm proper display and functionality

### Quality Assurance Checklist

- [ ] All required fields present and valid
- [ ] Question IDs are unique within assessment
- [ ] Clinical threshold is appropriate and justified
- [ ] Questions are clear and unambiguous
- [ ] Termination rules are safe and appropriate
- [ ] Assessment integrates properly with system
- [ ] Scoring produces expected results

## Examples

### Complete Assessment Example

```json
{
  "domain": "CONDUCT",
  "name": "Conduct Problems Assessment",
  "displayName": "Conduct Problems",
  "description": "Evaluates rule-breaking behavior and conduct issues",
  "order": 1,
  "totalPossibleScore": 6,
  "clinicallySignificantScore": 4,
  "skipConditions": [],
  "prerequisites": [],
  "questions": [
    {
      "id": "conduct_q1",
      "text": "In the past 6 months, have you often been involved in physical fights?",
      "order": 1,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "conduct_q2",
      "text": "In the past 6 months, have you often bullied, threatened, or intimidated others?",
      "order": 2,
      "isGatingQuestion": false,
      "weight": 1
    }
  ],
  "terminationRules": [
    {
      "name": "Early Termination - Low Risk",
      "description": "Stop if first 3 questions are negative",
      "minimumYesToContinue": 1,
      "checkAfterQuestion": 3
    }
  ]
}
```

### Question Writing Examples

**Physical Aggression Domain:**

```json
{
  "id": "violence_q1",
  "text": "In the past year, have you physically harmed someone else during an argument?",
  "order": 1,
  "isGatingQuestion": true,
  "weight": 1
}
```

**Attention Problems Domain:**

```json
{
  "id": "attention_q3",
  "text": "Do you often have difficulty maintaining attention during tasks or activities?",
  "order": 3,
  "isGatingQuestion": false,
  "weight": 1
}
```

## Best Practices Summary

1. **Start with research**: Base assessments on established instruments and literature
2. **Keep it simple**: Use clear, direct language appropriate for your population
3. **Test thoroughly**: Validate both content and technical implementation
4. **Document decisions**: Record rationale for thresholds and design choices
5. **Iterate carefully**: Make changes based on user feedback and validation data
6. **Maintain consistency**: Follow established patterns and conventions
7. **Consider ethics**: Ensure assessments are fair, unbiased, and clinically appropriate

## Support and Resources

- **Technical Issues**: Check system logs and error messages
- **Clinical Questions**: Consult with qualified mental health professionals
- **Format Questions**: Refer to existing assessment files as templates
- **Testing**: Use the admin dashboard to preview and test assessments

For additional support, review the related documentation:

- `ASSESSMENT_GUIDE.md` - User-facing assessment information
- `CONFIG_SYSTEM.md` - System configuration details
- `DOCUMENT_GUIDE.md` - Document processing information
