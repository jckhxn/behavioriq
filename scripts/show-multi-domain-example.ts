import { PrismaClient } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function showMultiDomainExample() {
  console.log("🎨 MULTI-DOMAIN ASSESSMENT EXAMPLE");
  console.log("===================================");

  try {
    // Get one of the multi-domain assessments
    const assessment = await prisma.assessment.findFirst({
      where: { shortId: "BIQ-8KG6KE" },
      include: {
        scores: {
          select: {
            domain: true,
            rawScore: true,
            totalPossible: true,
            riskLevel: true,
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (!assessment) {
      console.log("Assessment not found");
      return;
    }

    console.log(`\n📊 ${assessment.shortId} (${assessment.subjectName})`);
    console.log(`Status: ${assessment.status}`);

    // Get the latest score for each domain
    const latestScores: Record<string, any> = {};
    assessment.scores.forEach((score: any) => {
      if (!latestScores[score.domain]) {
        latestScores[score.domain] = score;
      }
    });

    console.log(`\nDomain Scores (as they would appear in UI):`);
    Object.entries(latestScores).forEach(([domain, score]) => {
      const mappedLabel = (DOMAIN_LABELS as any)[domain];
      console.log(
        `   🏷️  ${mappedLabel}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
      );
    });

    console.log(
      `\nThis assessment should show different domain names in the UI!`
    );
    console.log(
      `Try accessing: http://localhost:3000/assessment/${assessment.shortId}/results`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

showMultiDomainExample();
