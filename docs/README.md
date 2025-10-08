# Assessment Documentation

This directory contains comprehensive documentation and tools for creating, managing, and validating JSON assessment files in the AI Diagnostic System.

## 📁 Files Overview

### Assessment Documentation

- **`ASSESSMENT_JSON_SCHEMA.md`** - Complete technical schema documentation with TypeScript interfaces and field definitions
- **`ASSESSMENT_CREATION_GUIDE.md`** - Step-by-step practical guide for creating new assessments with examples and best practices
- **`ASSESSMENT_WRITING_GUIDE.md`** - Guide for writing effective assessment questions and responses
- **`ASSESSMENT_GUIDE.md`** - General assessment system overview

### Feature Documentation

- **`RESOURCE_LIBRARY_IMPLEMENTATION.md`** - Technical documentation for the Resource Library feature (database schema, API endpoints, implementation details)
- **`RESOURCE_LIBRARY_USER_GUIDE.md`** - End-user guide for managing resources in the Super Admin dashboard
- **`PASSWORD_CHANGE_FEATURE.md`** - Password change functionality with security features
- **`PASSWORD_CHANGE_VISUAL_GUIDE.md`** - Visual guide and UI/UX documentation for password change
- **`CONVERSATIONAL_CHAT_WIDGET.md`** - Conversational assessment widget documentation
- **`CONVERSATIONAL_FLOW_DIAGRAM.md`** - Flow diagrams for conversational assessments
- **`ENHANCED_REPORT_IMPLEMENTATION.md`** - Enhanced report system documentation
- **`DYNAMIC_DOMAINS_REFERENCE.md`** - Dynamic domain system documentation

### System Documentation

- **`CONFIG_SYSTEM.md`** - Configuration system documentation
- **`DOCUMENT_GUIDE.md`** - Document handling and processing guide
- **`MARKDOWN_RENDERING.md`** - Markdown rendering implementation
- **`STRIPE_SETUP_GUIDE.md`** - Stripe payment integration setup
- **`STRIPE_TESTING_GUIDE.md`** - Stripe testing procedures

### Tools

- **`../scripts/validate-assessments.js`** - Automated validation script for checking assessment files

## 🚀 Quick Start

### Creating a New Assessment

1. **Plan Your Assessment**

   ```bash
   # Choose domain, question count, and clinical thresholds
   # See ASSESSMENT_CREATION_GUIDE.md for detailed planning steps
   ```

2. **Create the JSON File**

   ```bash
   # Create new assessment file in assessments/ directory
   touch assessments/your-domain.json
   ```

3. **Validate Your Assessment**

   ```bash
   # Validate single file
   npm run validate-assessment assessments/your-domain.json

   # Validate all assessments
   npm run validate-assessments
   ```

### Basic Assessment Template

```json
{
  "domain": "YOUR_DOMAIN",
  "name": "Full Assessment Name",
  "displayName": "Short Name",
  "description": "What this assessment evaluates",
  "order": 6,
  "totalPossibleScore": 5,
  "clinicallySignificantScore": 3,
  "questions": [
    {
      "id": "domain_1",
      "text": "Your question text?",
      "order": 1,
      "isGatingQuestion": true,
      "weight": 1
    }
  ]
}
```

## 📊 Current Assessments

The system currently includes these assessments:

| Domain       | Questions | Clinical Threshold | Features                       |
| ------------ | --------- | ------------------ | ------------------------------ |
| `ANTISOCIAL` | 7         | 4/7 (57%)          | Skip conditions, Prerequisites |
| `ATTENTION`  | 7         | 4/7 (57%)          | Termination rules              |
| `CONDUCT`    | 7         | 4/7 (57%)          | Complex logic                  |
| `EMOTIONAL`  | 7         | 4/7 (57%)          | Screening focus                |
| `VIOLENCE`   | 7         | 4/7 (57%)          | High-stakes assessment         |

## 🔧 Validation Tools

### Automated Validation

```bash
# Validate all assessments
npm run validate-assessments

# Validate specific file
npm run validate-assessment assessments/domain.json

# Or use the script directly
node scripts/validate-assessments.js --all
node scripts/validate-assessments.js assessment1.json assessment2.json
```

### Validation Checks

The validator performs these checks:

#### ✅ Structural Validation

- Required fields present
- Correct data types
- Valid JSON syntax
- File naming conventions

#### ✅ Logical Validation

- Unique question IDs and orders
- Valid skip logic references
- Prerequisite consistency
- Termination rule logic

#### ✅ Clinical Validation

- Appropriate scoring thresholds
- Clinical threshold ranges
- Question count recommendations

#### ✅ Best Practice Validation

- Question text quality
- User experience considerations
- Help text recommendations
- Complexity warnings

### Example Validation Output

```
📋 Validating: antisocial.json
──────────────────────────────────────────────────
✅ Valid
✨ No issues found

📋 Validating: new-assessment.json
──────────────────────────────────────────────────
❌ Invalid

🚨 Errors:
  • Missing required field: clinicallySignificantScore
  • Question antisocial_3 has invalid weight: 0

⚠️  Warnings:
  • Clinical threshold is very high (85.7% of maximum)
  • No gating questions found
```

## 📚 Assessment Features

### Core Features

- **Linear Assessments** - Simple question sequences
- **Skip Logic** - Conditional question flow based on previous answers
- **Prerequisites** - Questions that depend on other responses
- **Termination Rules** - Early ending based on response patterns
- **Weighted Questions** - Different point values for questions
- **Gating Questions** - Key screening questions that control flow

### Advanced Features

- **Help Text** - Additional guidance for complex questions
- **Optional Questions** - User can skip non-essential questions
- **Custom Scoring** - Complex weighted scoring systems
- **Risk Calculation** - Automatic risk level determination

## 🎯 Best Practices

### Question Writing

- ✅ Use clear, simple language
- ✅ Keep questions specific and behavioral
- ✅ End questions with question marks
- ✅ Avoid double negatives
- ✅ Use present tense consistently

### Assessment Design

- ✅ 5-15 questions for most assessments
- ✅ Set clinical thresholds at 40-70% of maximum
- ✅ Include at least 1-2 gating questions
- ✅ Test all possible response paths
- ✅ Provide help text for complex concepts

### Technical Requirements

- ✅ Use sequential question ordering (1, 2, 3...)
- ✅ Follow naming convention: `domain_N` for question IDs
- ✅ Match file names to domain (lowercase)
- ✅ Ensure skip logic flows forward only
- ✅ Validate JSON syntax before deployment

## 🔍 Assessment Analysis

### Scoring System

- **Basic Scoring**: Each "yes" = weight points, "no" = 0 points
- **Risk Levels**:
  - LOW (0-25% of max)
  - MODERATE (26-50% of max)
  - HIGH (51-75% of max)
  - VERY_HIGH (76-100% of max)

### Clinical Thresholds

- **Conservative**: 60-70% of maximum score
- **Moderate**: 40-60% of maximum score
- **Sensitive**: 30-40% of maximum score

### Question Flow Logic

1. **Linear Flow**: Questions asked in order
2. **Skip Logic**: Jump to different questions based on responses
3. **Prerequisites**: Only show questions if conditions met
4. **Early Termination**: End assessment if criteria not met

## 🚀 Integration

### Database Integration

Assessments are automatically loaded into the system and stored in the database with proper domain relationships.

### API Integration

- Assessment content served via `/api/assessments/[id]`
- Scoring handled by `lib/assessment/scoring.ts`
- AI reports generated via `lib/reports/ai-report-service.ts`

### UI Integration

- Questions rendered by `components/assessment/QuestionPresenter.tsx`
- Domain information shown in `components/assessment/DomainSidebar.tsx`
- Results displayed in `components/assessment/AssessmentCompletion.tsx`

## 🐛 Troubleshooting

### Common Issues

#### JSON Syntax Errors

```
Error: Invalid JSON syntax
Solution: Check for missing commas, quotes, brackets
```

#### Missing Required Fields

```
Error: Missing required field: domain
Solution: Add all required fields from schema
```

#### Question Reference Errors

```
Error: Skip condition references non-existent question
Solution: Ensure referenced question IDs exist
```

#### Scoring Calculation Errors

```
Error: totalPossibleScore doesn't match calculated maximum
Solution: Verify sum of question weights matches total
```

### Validation Process

1. Run validator before deployment
2. Fix all errors (❌) before proceeding
3. Address warnings (⚠️) for best practices
4. Test assessment flow manually
5. Verify clinical appropriateness

## 📈 Future Enhancements

### Planned Features

- Multi-language support
- Likert scale questions (1-5 rating)
- Adaptive assessment algorithms
- Integration with clinical standards
- Real-time scoring analytics
- Question bank management

### Schema Extensions

- Question types beyond yes/no
- Conditional scoring algorithms
- Multi-domain assessments
- Branching assessment paths
- External assessment imports

## 🤝 Contributing

### Adding New Assessments

1. Review existing assessments for patterns
2. Follow the creation guide step-by-step
3. Validate assessment thoroughly
4. Test all question flows
5. Have clinical content reviewed
6. Submit for integration

### Improving Documentation

- Report unclear sections
- Suggest additional examples
- Contribute best practices
- Update validation rules
- Add troubleshooting cases

---

For technical implementation details, see the main `README.md` in the project root.
For assessment creation help, start with `ASSESSMENT_CREATION_GUIDE.md`.
