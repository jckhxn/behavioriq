import { PrismaClient } from "@prisma/client";
import { loadAssessmentConfigs } from "../lib/assessment/db-loader";

const prisma = new PrismaClient();

async function simulateAssessmentFlow() {
  console.log("🎯 SIMULATING ASSESSMENT FLOW");
  console.log("=============================");

  try {
    // Step 1: Load assessment configurations (like AssessmentAI does)
    console.log("1. Loading assessment configurations...");
    const assessmentConfigs = await loadAssessmentConfigs();

    console.log(
      `   Loaded ${assessmentConfigs.length} assessment configurations:`
    );
    assessmentConfigs.forEach((config, index) => {
      console.log(
        `   ${index + 1}. ${config.domain} - "${config.name}" (${config.questions.length} questions)`
      );
    });

    // Step 2: Show the question flow
    console.log(`\n2. Assessment Question Flow:`);
    console.log(
      `   The system goes through domains IN ORDER based on the 'order' field:`
    );

    assessmentConfigs.forEach((config, index) => {
      console.log(`\n   Domain ${config.order}: ${config.domain}`);
      console.log(`   Questions: ${config.questions.length}`);
      if (config.questions.length > 0) {
        console.log(`   First question: "${config.questions[0].text}"`);

        // Check if this domain has prerequisites
        if (config.prerequisites && config.prerequisites.length > 0) {
          console.log(
            `   ⚠️  Has prerequisites: ${JSON.stringify(config.prerequisites)}`
          );
        }

        // Check if this domain has skip conditions
        if (config.skipConditions && config.skipConditions.length > 0) {
          console.log(
            `   ⏭️  Has skip conditions: ${JSON.stringify(config.skipConditions)}`
          );
        }
      }
    });

    console.log(`\n3. Why BIQ-IR8X6R Only Shows ANTISOCIAL:`);
    console.log(
      `   The assessment goes through domains in order (1, 2, 3, 4, 5)`
    );
    console.log(
      `   It appears that after completing domain 1 (ANTISOCIAL), the assessment`
    );
    console.log(`   was either:`);
    console.log(
      `   - Terminated early due to skip conditions/gating questions`
    );
    console.log(`   - Completed only the first domain and marked as finished`);
    console.log(
      `   - Had responses that didn't trigger continuation to other domains`
    );

    console.log(`\n4. To Get ALL Domains:`);
    console.log(`   You would need to answer in a way that:`);
    console.log(`   - Doesn't trigger early termination in ANTISOCIAL domain`);
    console.log(`   - Meets any prerequisites for subsequent domains`);
    console.log(`   - Continues through all 5 domains systematically`);

    // Let's check the ANTISOCIAL domain specifically
    const antisocialDomain = assessmentConfigs.find(
      (c) => c.domain === "ANTISOCIAL"
    );
    if (antisocialDomain) {
      console.log(`\n5. ANTISOCIAL Domain Analysis:`);
      console.log(`   Questions: ${antisocialDomain.questions.length}`);
      console.log(
        `   Skip conditions: ${antisocialDomain.skipConditions.length}`
      );
      console.log(`   Prerequisites: ${antisocialDomain.prerequisites.length}`);

      antisocialDomain.questions.forEach((q, index) => {
        console.log(
          `     ${index + 1}. ${q.text} (gating: ${q.isGatingQuestion})`
        );
      });

      if (antisocialDomain.skipConditions.length > 0) {
        console.log(`\n   Skip Conditions:`);
        antisocialDomain.skipConditions.forEach((skip, index) => {
          console.log(
            `     ${index + 1}. If "${skip.questionId}" = ${skip.skipValue}, skip to "${skip.skipToQuestion}"`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAssessmentFlow();
