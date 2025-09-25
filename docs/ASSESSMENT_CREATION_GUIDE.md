# Assessment Creation Guide

This guide provides step-by-step instructions for creating new JSON assessment files for the AI Diagnostic System.

## Quick Start Checklist

- [ ] Choose a unique domain name
- [ ] Define 5-10 clear, behavioral questions
- [ ] Set appropriate scoring thresholds
- [ ] Test the assessment flow
- [ ] Validate the JSON structure
- [ ] Add to the assessment registry

## Step 1: Planning Your Assessment

### Define the Domain

Choose a clear, specific behavioral domain:

- **Good**: `SLEEP_PATTERNS`, `PEER_RELATIONSHIPS`, `ACADEMIC_PERFORMANCE`
- **Avoid**: `GENERAL_BEHAVIOR`, `EVERYTHING`, `MISCELLANEOUS`

### Determine Question Count

- **Screening assessments**: 3-5 questions
- **Diagnostic assessments**: 7-12 questions
- **Comprehensive assessments**: 15-25 questions

### Set Clinical Thresholds

- **Conservative**: 60-70% of maximum score
- **Moderate**: 40-60% of maximum score
- **Sensitive**: 30-40% of maximum score

## Step 2: Writing Effective Questions

### Question Writing Guidelines

#### ✅ Good Questions

```json
{
  "id": "sleep_1",
  "text": "Do you have trouble falling asleep at night?",
  "order": 1,
  "isGatingQuestion": true,
  "weight": 1
}
```

#### ❌ Poor Questions

```json
{
  "id": "sleep_1",
  "text": "Do you not have no trouble sleeping well?", // Double negative
  "order": 1,
  "isGatingQuestion": true,
  "weight": 1
}
```

### Question Types by Purpose

#### Gating Questions (isGatingQuestion: true)

Use for initial screening and flow control:

```json
{
  "id": "anxiety_1",
  "text": "Do you worry more than most people your age?",
  "order": 1,
  "isGatingQuestion": true,
  "weight": 1
}
```

#### Follow-up Questions (isGatingQuestion: false)

Use for detailed assessment:

```json
{
  "id": "anxiety_2",
  "text": "Do you have physical symptoms when worried (sweating, racing heart)?",
  "order": 2,
  "isGatingQuestion": false,
  "weight": 1
}
```

## Step 3: Creating the JSON Structure

### Basic Template

```json
{
  "domain": "YOUR_DOMAIN",
  "name": "Full Assessment Name",
  "displayName": "Short Name",
  "description": "What this assessment evaluates",
  "order": 6,
  "totalPossibleScore": 8,
  "clinicallySignificantScore": 5,
  "questions": [
    {
      "id": "domain_1",
      "text": "Your first question?",
      "order": 1,
      "isGatingQuestion": true,
      "weight": 1
    }
  ]
}
```

### Adding Skip Logic

```json
{
  "skipConditions": [
    {
      "questionId": "domain_1",
      "skipValue": false,
      "skipToQuestion": "domain_4",
      "reason": "Skip detailed questions if no initial concern"
    }
  ]
}
```

### Adding Prerequisites

```json
{
  "prerequisites": [
    {
      "questionId": "domain_2",
      "requiredValue": true,
      "description": "Only ask if previous condition met"
    }
  ]
}
```

### Adding Termination Rules

```json
{
  "terminationRules": [
    {
      "name": "Early Screening",
      "description": "End early if no significant symptoms",
      "minimumYesToContinue": 2,
      "checkAfterQuestion": 3
    }
  ]
}
```

## Step 4: Common Patterns

### Simple Linear Assessment

No skip logic, all questions answered in order:

```json
{
  "domain": "SIMPLE_DOMAIN",
  "name": "Simple Assessment",
  "displayName": "Simple",
  "description": "A straightforward assessment",
  "order": 1,
  "totalPossibleScore": 5,
  "clinicallySignificantScore": 3,
  "questions": [
    {
      "id": "simple_1",
      "text": "Question 1?",
      "order": 1,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "simple_2",
      "text": "Question 2?",
      "order": 2,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "simple_3",
      "text": "Question 3?",
      "order": 3,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "simple_4",
      "text": "Question 4?",
      "order": 4,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "simple_5",
      "text": "Question 5?",
      "order": 5,
      "isGatingQuestion": false,
      "weight": 1
    }
  ]
}
```

### Screener with Early Termination

```json
{
  "domain": "SCREENER_DOMAIN",
  "name": "Screening Assessment",
  "displayName": "Screener",
  "description": "Quick screening with early termination",
  "order": 1,
  "totalPossibleScore": 8,
  "clinicallySignificantScore": 4,
  "questions": [
    {
      "id": "screen_1",
      "text": "Initial screening question?",
      "order": 1,
      "isGatingQuestion": true,
      "weight": 1
    },
    {
      "id": "screen_2",
      "text": "Second screening question?",
      "order": 2,
      "isGatingQuestion": true,
      "weight": 1
    },
    {
      "id": "screen_3",
      "text": "Third screening question?",
      "order": 3,
      "isGatingQuestion": false,
      "weight": 1
    }
  ],
  "terminationRules": [
    {
      "name": "Early Negative Screen",
      "description": "End if first two answers are negative",
      "minimumYesToContinue": 1,
      "checkAfterQuestion": 2
    }
  ]
}
```

### Complex Assessment with Skip Logic

```json
{
  "domain": "COMPLEX_DOMAIN",
  "name": "Complex Assessment with Branching",
  "displayName": "Complex",
  "description": "Assessment with conditional question flow",
  "order": 1,
  "totalPossibleScore": 10,
  "clinicallySignificantScore": 6,
  "questions": [
    {
      "id": "complex_1",
      "text": "Do you have the main symptom?",
      "order": 1,
      "isGatingQuestion": true,
      "weight": 1
    },
    {
      "id": "complex_2",
      "text": "Follow-up to main symptom?",
      "order": 2,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "complex_3",
      "text": "Severity question?",
      "order": 3,
      "isGatingQuestion": false,
      "weight": 1
    },
    {
      "id": "complex_4",
      "text": "Alternative pathway question?",
      "order": 4,
      "isGatingQuestion": false,
      "weight": 1
    }
  ],
  "skipConditions": [
    {
      "questionId": "complex_1",
      "skipValue": false,
      "skipToQuestion": "complex_4",
      "reason": "Skip detailed questions if main symptom absent"
    }
  ],
  "prerequisites": [
    {
      "questionId": "complex_1",
      "requiredValue": true,
      "description": "Detailed questions only if main symptom present"
    }
  ]
}
```

## Step 5: Testing Your Assessment

### Validation Checklist

- [ ] JSON syntax is valid
- [ ] All required fields present
- [ ] Question IDs are unique
- [ ] Order numbers are sequential
- [ ] Skip logic references valid questions
- [ ] Clinical threshold is reasonable
- [ ] Total possible score matches question count (for weight=1)

### Manual Testing Paths

Test these scenarios:

1. **All "Yes" responses** - Should reach clinical threshold
2. **All "No" responses** - Should score 0
3. **Mixed responses** - Should follow skip logic correctly
4. **Early termination** - Should end at appropriate points

### Automated Validation

```bash
# Run the assessment validator (if available)
npm run validate-assessments

# Or check with TypeScript compilation
npx tsc --noEmit
```

## Step 6: Integration

### File Placement

Save your assessment as `/assessments/{domain}.json` (lowercase domain name).

### Registry Update

Add your assessment to the system registry:

```typescript
// In assessment configuration
const ASSESSMENT_DOMAINS = [
  // ... existing domains
  "YOUR_DOMAIN",
];
```

### Database Migration

If adding new domain types, update the database schema:

```sql
-- Add new domain to enum if needed
ALTER TYPE "Domain" ADD VALUE 'YOUR_DOMAIN';
```

## Step 7: Documentation

### Assessment Documentation

Create a brief description for each assessment:

```markdown
## Your Domain Assessment

**Purpose**: Brief description
**Questions**: Number of questions
**Duration**: Estimated completion time
**Clinical Threshold**: Score/Total (percentage)
**Special Features**: Skip logic, early termination, etc.
```

### Update System Docs

- Add to assessment catalog
- Update user guides
- Include in API documentation

## Common Mistakes to Avoid

### ❌ Structural Issues

- Missing required fields
- Non-sequential question orders
- Duplicate question IDs
- Invalid JSON syntax

### ❌ Logic Problems

- Circular skip conditions
- Unreachable questions
- Invalid question references
- Impossible termination conditions

### ❌ Clinical Issues

- Threshold too high/low
- Questions that don't measure the domain
- Inconsistent question difficulty
- Poor construct validity

### ❌ UX Problems

- Too many questions (>25)
- Confusing question wording
- Complex skip logic
- Unclear instructions

## Advanced Features

### Custom Weights

```json
{
  "id": "weighted_1",
  "text": "High-importance question?",
  "order": 1,
  "isGatingQuestion": false,
  "weight": 2 // This question counts double
}
```

### Help Text

```json
{
  "id": "complex_1",
  "text": "Do you experience intrusive thoughts?",
  "order": 1,
  "isGatingQuestion": true,
  "weight": 1,
  "helpText": "Intrusive thoughts are unwanted thoughts that pop into your mind repeatedly."
}
```

### Optional Questions

```json
{
  "id": "optional_1",
  "text": "Additional detail question?",
  "order": 5,
  "isGatingQuestion": false,
  "weight": 1,
  "required": false // User can skip this question
}
```

## Examples and Templates

See the `assessments/` directory for complete examples:

- `antisocial.json` - Simple assessment with skip logic
- `attention.json` - Assessment with termination rules
- `conduct.json` - Complex assessment with prerequisites
- `emotional.json` - Screening assessment
- `violence.json` - High-stakes assessment

## Getting Help

- Review existing assessments for patterns
- Check the schema documentation for field definitions
- Test thoroughly before deployment
- Ask for peer review of clinical content
- Validate JSON structure before submission

---

Remember: Good assessments balance clinical validity with user experience. Keep questions clear, logic simple, and thresholds clinically meaningful.
