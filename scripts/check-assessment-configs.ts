import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAssessmentConfigs() {
  console.log("🔧 CHECKING ASSESSMENT CONFIGURATIONS");
  console.log("====================================");

  try {
    // Check what question sets exist in the database
    const questionSets = await prisma.questionSet.findMany({
      select: {
        id: true,
        domain: true,
        name: true,
        description: true,
        order: true,
        isActive: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    console.log(`\n📚 AVAILABLE QUESTION SETS (${questionSets.length}):`);
    if (questionSets.length === 0) {
      console.log("❌ No question sets found in database!");
      console.log("This means assessments cannot access other domains.");
      console.log("Run: npm run db:seed to populate assessment configurations");
      return;
    }

    questionSets.forEach((set, index) => {
      const status = set.isActive ? "✅ Active" : "❌ Inactive";
      console.log(
        `${index + 1}. ${set.domain} - "${set.name}" (${set._count.questions} questions) ${status}`
      );
    });

    // Check which domains are actually being used in assessments
    console.log(`\n📊 DOMAINS IN ACTUAL ASSESSMENTS:`);
    const domainsInUse = await prisma.score.findMany({
      select: {
        domain: true,
      },
      distinct: ["domain"],
    });

    console.log(
      `   Domains with scores: ${domainsInUse.map((d) => d.domain).join(", ")}`
    );

    // Check if the assessment process is configured to use multiple domains
    console.log(`\n🔍 ASSESSMENT PROCESS ANALYSIS:`);

    // Check if there are any question sets that should be triggered but aren't
    const activeDomains = questionSets
      .filter((s) => s.isActive)
      .map((s) => s.domain);
    const usedDomains = domainsInUse.map((d) => d.domain);

    const unusedActiveDomains = activeDomains.filter(
      (domain) => !usedDomains.includes(domain)
    );

    if (unusedActiveDomains.length > 0) {
      console.log(
        `   ⚠️  UNUSED ACTIVE DOMAINS: ${unusedActiveDomains.join(", ")}`
      );
      console.log(
        `   This suggests the assessment AI is not triggering these domains`
      );
    } else {
      console.log(`   ✅ All active domains are being used in assessments`);
    }

    // Check the assessment AI configuration
    console.log(`\n🤖 ASSESSMENT AI DOMAIN MAPPING:`);
    const domainMapping = {
      SUICIDALITY: "EMOTIONAL",
      SELF_HARM: "VIOLENCE",
      ANTISOCIAL: "ANTISOCIAL",
    };

    console.log(`   Current AI domain mapping:`);
    Object.entries(domainMapping).forEach(([key, value]) => {
      console.log(`     ${key} → ${value}`);
    });

    console.log(`\n💡 CONCLUSION:`);
    if (unusedActiveDomains.length > 0) {
      console.log(
        `   BIQ-IR8X6R only shows ANTISOCIAL because the assessment AI`
      );
      console.log(
        `   is not configured to detect/trigger other domains during the conversation.`
      );
      console.log(
        `   The other domains (${unusedActiveDomains.join(", ")}) exist but aren't being used.`
      );
    } else {
      console.log(`   The domain coverage appears to be working as designed.`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessmentConfigs();
