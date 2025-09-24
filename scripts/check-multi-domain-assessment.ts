import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSpecificMultiDomainAssessment() {
  console.log("🔍 CHECKING BIQ-8KG6KE MULTI-DOMAIN ASSESSMENT");
  console.log("==============================================");

  try {
    const assessment = await prisma.assessment.findFirst({
      where: { shortId: "BIQ-8KG6KE" },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        startedAt: true,
        scores: {
          select: {
            id: true,
            domain: true,
            rawScore: true,
            totalPossible: true,
            questionsAnswered: true,
            riskLevel: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!assessment) {
      console.log("❌ Assessment BIQ-8KG6KE not found");
      return;
    }

    console.log(
      `\n📊 Assessment: ${assessment.subjectName} (${assessment.shortId})`
    );
    console.log(`   Status: ${assessment.status}`);
    console.log(`   Started: ${assessment.startedAt}`);
    console.log(`   Total Scores: ${assessment.scores.length}`);

    // Group scores by domain
    const scoresByDomain: Record<string, any[]> = {};
    assessment.scores.forEach((score) => {
      if (!scoresByDomain[score.domain]) {
        scoresByDomain[score.domain] = [];
      }
      scoresByDomain[score.domain].push(score);
    });

    console.log(`\n📈 SCORES BY DOMAIN:`);
    Object.entries(scoresByDomain).forEach(([domain, scores]) => {
      console.log(`\n   ${domain} (${scores.length} entries):`);
      const latestScore = scores[0]; // First one is latest due to desc order
      console.log(
        `     Latest: ${latestScore.rawScore}/${latestScore.totalPossible} | Risk: ${latestScore.riskLevel}`
      );
    });

    console.log(`\n🎯 FRONTEND PILL SIMULATION:`);
    console.log(
      `   This assessment should show ${Object.keys(scoresByDomain).length} different domain pills:`
    );

    // Simulate exactly what the frontend deduplication does
    const latestScoresByDomain: Record<string, any> = {};
    assessment.scores.forEach((score) => {
      if (
        !latestScoresByDomain[score.domain] ||
        new Date(score.timestamp) >
          new Date(latestScoresByDomain[score.domain].timestamp)
      ) {
        latestScoresByDomain[score.domain] = score;
      }
    });

    // Import the domain labels to see what names should appear
    const { DOMAIN_LABELS } = await import("../lib/constants/domains");

    console.log(`\n   Expected Pills:`);
    Object.entries(latestScoresByDomain).forEach(([domain, score]) => {
      const displayLabel =
        DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS] || domain;
      console.log(
        `   - "${displayLabel}: ${score.rawScore}/${score.totalPossible}"`
      );
    });

    console.log(`\n💡 TEST THIS ASSESSMENT:`);
    console.log(
      `   URL: http://localhost:3001/assessment/${assessment.shortId}`
    );
    console.log(
      `   This should show ${Object.keys(scoresByDomain).length} different domain pills, not just one "Antisocial Behavior" pill.`
    );

    // Also check what the API returns
    console.log(`\n🔍 CHECKING API DATA:`);
    console.log(`   Call: GET /api/assessments`);
    console.log(
      `   Should return this assessment in the list with all domain scores.`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificMultiDomainAssessment();
