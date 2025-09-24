import { PrismaClient } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function checkSpecificAssessments() {
  console.log("🔍 CHECKING SPECIFIC ASSESSMENTS FROM SCREENSHOT");
  console.log("================================================");

  try {
    const specificIds = ["BIQ-IR8X6R", "BIQ-AJEVI7"];

    for (const shortId of specificIds) {
      console.log(`\n📊 Assessment: ${shortId}`);

      const assessment = await prisma.assessment.findFirst({
        where: { shortId },
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
      });

      if (!assessment) {
        console.log(`   ❌ Not found`);
        continue;
      }

      console.log(`   Subject: ${assessment.subjectName}`);
      console.log(`   Status: ${assessment.status}`);
      console.log(`   Scores: ${assessment.scores.length}`);

      if (assessment.scores.length === 0) {
        console.log(`   ⚠️  No scores found!`);
        continue;
      }

      // Group scores by domain to see latest
      const scoresByDomain: Record<string, any[]> = {};
      assessment.scores.forEach((score: any) => {
        if (!scoresByDomain[score.domain]) {
          scoresByDomain[score.domain] = [];
        }
        scoresByDomain[score.domain].push(score);
      });

      console.log(
        `   Domains found: ${Object.keys(scoresByDomain).join(", ")}`
      );

      Object.entries(scoresByDomain).forEach(([domain, scores]) => {
        const mappedLabel = (DOMAIN_LABELS as any)[domain];
        const latestScore = scores[scores.length - 1]; // Get latest score
        console.log(`   - ${domain} → "${mappedLabel}"`);
        console.log(
          `     Latest: ${latestScore.rawScore}/${latestScore.totalPossible} (${latestScore.riskLevel})`
        );
        console.log(`     Total scores for this domain: ${scores.length}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificAssessments();
