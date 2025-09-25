#!/usr/bin/env node

/**
 * Assessment JSON Validator
 *
 * Validates assessment JSON files for structural correctness,
 * logical consistency, and best practices compliance.
 */

const fs = require("fs");
const path = require("path");

class AssessmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate(filePath) {
    this.errors = [];
    this.warnings = [];

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const assessment = JSON.parse(fileContent);

      this.validateStructure(assessment, filePath);
      this.validateQuestions(assessment);
      this.validateSkipLogic(assessment);
      this.validatePrerequisites(assessment);
      this.validateTerminationRules(assessment);
      this.validateScoring(assessment);
      this.validateBestPractices(assessment);
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.errors.push(`Invalid JSON syntax: ${error.message}`);
      } else {
        this.errors.push(`File reading error: ${error.message}`);
      }
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  validateStructure(assessment, filePath) {
    const requiredFields = [
      "domain",
      "name",
      "displayName",
      "description",
      "order",
      "totalPossibleScore",
      "clinicallySignificantScore",
      "questions",
    ];

    for (const field of requiredFields) {
      if (!(field in assessment)) {
        this.errors.push(`Missing required field: ${field}`);
      }
    }

    // Check file naming convention
    const fileName = path.basename(filePath, ".json");
    if (assessment.domain && fileName !== assessment.domain.toLowerCase()) {
      this.warnings.push(
        `File name "${fileName}" doesn't match domain "${assessment.domain.toLowerCase()}"`
      );
    }

    // Check data types
    if (assessment.order && typeof assessment.order !== "number") {
      this.errors.push('Field "order" must be a number');
    }
    if (
      assessment.totalPossibleScore &&
      typeof assessment.totalPossibleScore !== "number"
    ) {
      this.errors.push('Field "totalPossibleScore" must be a number');
    }
    if (
      assessment.clinicallySignificantScore &&
      typeof assessment.clinicallySignificantScore !== "number"
    ) {
      this.errors.push('Field "clinicallySignificantScore" must be a number');
    }
  }

  validateQuestions(assessment) {
    if (!assessment.questions || !Array.isArray(assessment.questions)) {
      this.errors.push("Questions must be an array");
      return;
    }

    if (assessment.questions.length === 0) {
      this.errors.push("Assessment must have at least one question");
      return;
    }

    const questionIds = new Set();
    const orders = new Set();

    for (const question of assessment.questions) {
      // Check required fields
      const requiredFields = [
        "id",
        "text",
        "order",
        "isGatingQuestion",
        "weight",
      ];
      for (const field of requiredFields) {
        if (!(field in question)) {
          this.errors.push(`Question missing required field: ${field}`);
        }
      }

      // Check for duplicate IDs
      if (questionIds.has(question.id)) {
        this.errors.push(`Duplicate question ID: ${question.id}`);
      }
      questionIds.add(question.id);

      // Check for duplicate orders
      if (orders.has(question.order)) {
        this.errors.push(`Duplicate question order: ${question.order}`);
      }
      orders.add(question.order);

      // Check ID naming convention
      if (
        assessment.domain &&
        !question.id.startsWith(assessment.domain.toLowerCase() + "_")
      ) {
        this.warnings.push(
          `Question ID "${question.id}" doesn't follow naming convention (${assessment.domain.toLowerCase()}_N)`
        );
      }

      // Check question text
      if (!question.text || question.text.trim().length === 0) {
        this.errors.push(`Question ${question.id} has empty text`);
      }

      if (question.text && !question.text.endsWith("?")) {
        this.warnings.push(
          `Question ${question.id} doesn't end with a question mark`
        );
      }

      // Check weight
      if (question.weight !== undefined && question.weight <= 0) {
        this.errors.push(
          `Question ${question.id} has invalid weight: ${question.weight}`
        );
      }
    }

    // Check order sequence
    const sortedOrders = Array.from(orders).sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        this.warnings.push(
          `Question orders are not sequential (expected ${i + 1}, found ${sortedOrders[i]})`
        );
        break;
      }
    }
  }

  validateSkipLogic(assessment) {
    if (!assessment.skipConditions) return;

    const questionIds = new Set(assessment.questions.map((q) => q.id));

    for (const skip of assessment.skipConditions) {
      if (!questionIds.has(skip.questionId)) {
        this.errors.push(
          `Skip condition references non-existent question: ${skip.questionId}`
        );
      }
      if (!questionIds.has(skip.skipToQuestion)) {
        this.errors.push(
          `Skip condition references non-existent target question: ${skip.skipToQuestion}`
        );
      }

      // Check for logical order
      const sourceOrder = assessment.questions.find(
        (q) => q.id === skip.questionId
      )?.order;
      const targetOrder = assessment.questions.find(
        (q) => q.id === skip.skipToQuestion
      )?.order;

      if (sourceOrder && targetOrder && sourceOrder >= targetOrder) {
        this.warnings.push(
          `Skip condition skips backwards or to same question: ${skip.questionId} -> ${skip.skipToQuestion}`
        );
      }
    }
  }

  validatePrerequisites(assessment) {
    if (!assessment.prerequisites) return;

    const questionIds = new Set(assessment.questions.map((q) => q.id));

    for (const prereq of assessment.prerequisites) {
      if (!questionIds.has(prereq.questionId)) {
        this.errors.push(
          `Prerequisite references non-existent question: ${prereq.questionId}`
        );
      }
    }
  }

  validateTerminationRules(assessment) {
    if (!assessment.terminationRules) return;

    for (const rule of assessment.terminationRules) {
      if (rule.checkAfterQuestion > assessment.questions.length) {
        this.errors.push(
          `Termination rule "${rule.name}" checks after non-existent question ${rule.checkAfterQuestion}`
        );
      }

      if (rule.minimumYesToContinue < 0) {
        this.errors.push(
          `Termination rule "${rule.name}" has negative minimum: ${rule.minimumYesToContinue}`
        );
      }

      if (rule.minimumYesToContinue > rule.checkAfterQuestion) {
        this.warnings.push(
          `Termination rule "${rule.name}" requires more "yes" answers than questions checked`
        );
      }
    }
  }

  validateScoring(assessment) {
    // Calculate theoretical maximum score
    const maxScore = assessment.questions.reduce(
      (sum, q) => sum + (q.weight || 1),
      0
    );

    if (assessment.totalPossibleScore !== maxScore) {
      this.errors.push(
        `totalPossibleScore (${assessment.totalPossibleScore}) doesn't match calculated maximum (${maxScore})`
      );
    }

    // Check clinical threshold
    if (assessment.clinicallySignificantScore > assessment.totalPossibleScore) {
      this.errors.push(
        `clinicallySignificantScore (${assessment.clinicallySignificantScore}) exceeds totalPossibleScore (${assessment.totalPossibleScore})`
      );
    }

    const thresholdPercentage =
      (assessment.clinicallySignificantScore / assessment.totalPossibleScore) *
      100;
    if (thresholdPercentage < 30) {
      this.warnings.push(
        `Clinical threshold is very low (${thresholdPercentage.toFixed(1)}% of maximum)`
      );
    }
    if (thresholdPercentage > 80) {
      this.warnings.push(
        `Clinical threshold is very high (${thresholdPercentage.toFixed(1)}% of maximum)`
      );
    }
  }

  validateBestPractices(assessment) {
    // Check question count
    if (assessment.questions.length > 25) {
      this.warnings.push(
        `Assessment has many questions (${assessment.questions.length}). Consider reducing for better user experience.`
      );
    }
    if (assessment.questions.length < 3) {
      this.warnings.push(
        `Assessment has few questions (${assessment.questions.length}). Consider adding more for reliability.`
      );
    }

    // Check for gating questions
    const gatingQuestions = assessment.questions.filter(
      (q) => q.isGatingQuestion
    );
    if (gatingQuestions.length === 0) {
      this.warnings.push(
        "No gating questions found. Consider marking important screening questions as gating questions."
      );
    }

    // Check description length
    if (assessment.description.length < 20) {
      this.warnings.push(
        "Description is very short. Consider adding more detail about what this assessment measures."
      );
    }

    // Check display name length
    if (assessment.displayName.length > 30) {
      this.warnings.push(
        "Display name is long. Consider shortening for better UI display."
      );
    }

    // Check for help text on complex questions
    const complexQuestions = assessment.questions.filter(
      (q) =>
        q.text.length > 100 ||
        q.text.includes("intrusive") ||
        q.text.includes("compulsive") ||
        q.text.includes("dissociat")
    );
    const questionsWithHelp = assessment.questions.filter((q) => q.helpText);

    if (complexQuestions.length > 0 && questionsWithHelp.length === 0) {
      this.warnings.push(
        "Complex questions detected but no help text provided. Consider adding explanations."
      );
    }
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node validate-assessments.js <file1.json> [file2.json] ..."
    );
    console.log(
      "   or: node validate-assessments.js --all (validates all files in assessments/ directory)"
    );
    process.exit(1);
  }

  const validator = new AssessmentValidator();
  let filesToValidate = [];

  if (args[0] === "--all") {
    const assessmentsDir = path.join(__dirname, "..", "assessments");
    if (fs.existsSync(assessmentsDir)) {
      filesToValidate = fs
        .readdirSync(assessmentsDir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.join(assessmentsDir, file));
    } else {
      console.error("Assessments directory not found");
      process.exit(1);
    }
  } else {
    filesToValidate = args;
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of filesToValidate) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      continue;
    }

    console.log(`\\n📋 Validating: ${path.basename(file)}`);
    console.log("─".repeat(50));

    const result = validator.validate(file);

    if (result.isValid) {
      console.log("✅ Valid");
    } else {
      console.log("❌ Invalid");
    }

    if (result.errors.length > 0) {
      console.log("\\n🚨 Errors:");
      result.errors.forEach((error) => console.log(`  • ${error}`));
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      console.log("\\n⚠️  Warnings:");
      result.warnings.forEach((warning) => console.log(`  • ${warning}`));
      totalWarnings += result.warnings.length;
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log("✨ No issues found");
    }
  }

  console.log("\\n" + "=".repeat(50));
  console.log(`📊 Summary: ${filesToValidate.length} files validated`);
  console.log(`🚨 Total errors: ${totalErrors}`);
  console.log(`⚠️  Total warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log(
      "\\n❌ Validation failed - please fix errors before proceeding"
    );
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(
      "\\n⚠️  Validation passed with warnings - consider addressing warnings"
    );
    process.exit(0);
  } else {
    console.log("\\n✅ All validations passed!");
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AssessmentValidator };
