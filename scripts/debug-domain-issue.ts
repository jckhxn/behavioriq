import { PrismaClient } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function debugDomainIssue() {
  console.log("🔍 DEBUGGING DOMAIN DISPLAY ISSUE");
  console.log("==================================");

  try {
    // Get some assessments with their scores
    const assessments = await prisma.assessment.findMany({
      include: {
        scores: {
          select: {
            id: true,
            domain: true,
            rawScore: true,
            totalPossible: true,
            riskLevel: true,
          },
          take: 5,
        },
      },
      take: 2,
    });

    console.log(`\n📊 Found ${assessments.length} assessments:`);

    assessments.forEach((assessment, index) => {
      console.log(
        `\n${index + 1}. ${assessment.subjectName} (${assessment.shortId})`
      );
      console.log(`   Status: ${assessment.status}`);
      console.log(`   Scores (${assessment.scores.length}):`);

      assessment.scores.forEach((score: any) => {
        const mappedLabel = (DOMAIN_LABELS as any)[score.domain];
        console.log(
          `   - Domain: "${score.domain}" → Mapped: "${mappedLabel}"`
        );
        console.log(
          `     Score: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
        );
      });
    });

    // Check unique domain values in the database
    const uniqueDomains = await prisma.score.findMany({
      select: {
        domain: true,
      },
      distinct: ["domain"],
    });

    console.log(`\n🏷️  UNIQUE DOMAINS IN DATABASE:`);
    uniqueDomains.forEach((score: any) => {
      const mappedLabel = (DOMAIN_LABELS as any)[score.domain];
      console.log(`   - "${score.domain}" → "${mappedLabel || "NOT MAPPED"}"`);
    });

    // Test the mapping directly
    console.log(`\n🧪 DIRECT MAPPING TEST:`);
    console.log("Available mappings:", Object.keys(DOMAIN_LABELS));
    Object.entries(DOMAIN_LABELS).forEach(([key, value]) => {
      console.log(`   ${key} → "${value}"`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDomainIssue();
