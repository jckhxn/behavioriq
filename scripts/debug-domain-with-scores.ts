import { PrismaClient } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function debugDomainWithScores() {
  console.log("🔍 FINDING ASSESSMENTS WITH SCORES");
  console.log("===================================");

  try {
    // Get assessments that actually have scores
    const assessmentsWithScores = await prisma.assessment.findMany({
      where: {
        scores: {
          some: {},
        },
      },
      include: {
        scores: {
          select: {
            id: true,
            domain: true,
            rawScore: true,
            totalPossible: true,
            riskLevel: true,
          },
        },
      },
      take: 3,
    });

    console.log(
      `\n📊 Found ${assessmentsWithScores.length} assessments with scores:`
    );

    assessmentsWithScores.forEach((assessment: any, index: number) => {
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

    // Get all scores to see the distribution
    const allScores = await prisma.score.findMany({
      select: {
        domain: true,
        assessmentId: true,
      },
      take: 20,
    });

    console.log(`\n📈 SCORE DISTRIBUTION (first 20):`);
    const domainCounts: Record<string, number> = {};
    allScores.forEach((score: any) => {
      domainCounts[score.domain] = (domainCounts[score.domain] || 0) + 1;
    });

    Object.entries(domainCounts).forEach(([domain, count]) => {
      const mappedLabel = (DOMAIN_LABELS as any)[domain];
      console.log(`   ${domain}: ${count} scores → "${mappedLabel}"`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDomainWithScores();
