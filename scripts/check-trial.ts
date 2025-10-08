import { prisma } from "../lib/db/prisma";

async function checkTrialAssessment() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    console.log("=== Platform Settings Check ===\n");

    if (!settings) {
      console.log("❌ No platform settings found!");
      console.log(
        "\nYou need to create platform settings with a trial assessment."
      );
    } else {
      console.log("✅ Platform settings found");
      console.log(
        `   Trial Assessments Enabled: ${settings.trialAssessmentsEnabled}`
      );
      console.log(
        `   Global Trial Assessment ID: ${settings.globalTrialAssessmentId || "NONE"}`
      );

      if (!settings.globalTrialAssessment) {
        console.log("\n❌ No trial assessment configured!");
        console.log("\nAvailable assessments:");
        const assessments = await prisma.assessmentTemplate.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        });
        console.log(assessments);
      } else {
        const trial = settings.globalTrialAssessment;
        console.log(`\n✅ Trial assessment configured: "${trial.name}"`);
        console.log(`   ID: ${trial.id}`);
        console.log(`   Slug: ${trial.slug}`);
        console.log(`   Active: ${trial.isActive ? "✅ YES" : "❌ NO"}`);
        console.log(`   Domains: ${trial.domains.length}`);

        if (!trial.isActive) {
          console.log("\n⚠️  WARNING: Trial assessment is INACTIVE!");
          console.log("   Users will not be able to access it.");
        }

        if (trial.domains.length === 0) {
          console.log("\n⚠️  WARNING: Trial assessment has NO domains!");
        } else {
          console.log("\nDomains:");
          trial.domains.forEach((d, i) => {
            const questionCount = Array.isArray(d.domainTemplate.questions)
              ? d.domainTemplate.questions.length
              : 0;
            console.log(
              `   ${i + 1}. ${d.domainTemplate.name} (${questionCount} questions)`
            );
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrialAssessment();
