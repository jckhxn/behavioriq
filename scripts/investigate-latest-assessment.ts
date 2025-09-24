import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function investigateLatestAssessment() {
  console.log("🔍 INVESTIGATING LATEST ASSESSMENT DOMAINS");
  console.log("=========================================");

  try {
    // Get the most recent assessment
    const latestAssessment = await prisma.assessment.findFirst({
      orderBy: { startedAt: "desc" },
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

    if (!latestAssessment) {
      console.log("❌ No assessments found");
      return;
    }

    console.log(
      `\n📊 Latest Assessment: ${latestAssessment.subjectName} (${latestAssessment.shortId})`
    );
    console.log(`   Status: ${latestAssessment.status}`);
    console.log(`   Started: ${latestAssessment.startedAt}`);
    console.log(`   Total Scores: ${latestAssessment.scores.length}`);

    // Group scores by domain
    const scoresByDomain: Record<string, any[]> = {};
    latestAssessment.scores.forEach((score) => {
      if (!scoresByDomain[score.domain]) {
        scoresByDomain[score.domain] = [];
      }
      scoresByDomain[score.domain].push(score);
    });

    console.log(`\n📈 SCORES BY DOMAIN:`);
    Object.entries(scoresByDomain).forEach(([domain, scores]) => {
      console.log(`\n   ${domain} (${scores.length} entries):`);
      scores.forEach((score, index) => {
        console.log(
          `     ${index + 1}. ${score.rawScore}/${score.totalPossible} | Risk: ${score.riskLevel} | Questions: ${score.questionsAnswered} | Time: ${score.timestamp.toISOString().slice(11, 19)}`
        );
      });

      // Show what the latest score would be
      const latestScore = scores[0]; // Already ordered by timestamp desc
      console.log(
        `     --> LATEST: ${latestScore.rawScore}/${latestScore.totalPossible} (${latestScore.riskLevel})`
      );
    });

    console.log(`\n🎯 DEDUPLICATION TEST:`);
    console.log(
      `   Frontend should show ${Object.keys(scoresByDomain).length} domain pills:`
    );

    // Simulate the deduplication logic from AssessmentsView.tsx
    const latestScoresByDomain: Record<string, any> = {};
    latestAssessment.scores.forEach((score) => {
      if (
        !latestScoresByDomain[score.domain] ||
        new Date(score.timestamp) >
          new Date(latestScoresByDomain[score.domain].timestamp)
      ) {
        latestScoresByDomain[score.domain] = score;
      }
    });

    Object.entries(latestScoresByDomain).forEach(([domain, score]) => {
      console.log(
        `   - ${domain}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
      );
    });

    // Also check what domain names should be displayed
    console.log(`\n📝 CHECKING ASSESSMENT CONFIGURATIONS FOR DOMAIN NAMES:`);

    const questionSets = await prisma.questionSet.findMany({
      where: {
        domain: { in: Object.keys(scoresByDomain) as any[] },
        isActive: true,
      },
      select: {
        domain: true,
        name: true,
        displayName: true,
      },
    });

    console.log(`   Database domain configurations:`);
    questionSets.forEach((set) => {
      const setWithFields = set as any;
      const displayName = setWithFields.displayName || set.name;
      console.log(`   - ${set.domain} → "${displayName}"`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateLatestAssessment();
