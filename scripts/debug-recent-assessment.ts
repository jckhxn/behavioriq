import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugRecentAssessment() {
  console.log("🔍 DEBUGGING RECENT ASSESSMENT");
  console.log("==============================");

  try {
    // Get the most recent assessment
    const recentAssessment = await prisma.assessment.findFirst({
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        startedAt: true,
        scores: {
          select: {
            domain: true,
            rawScore: true,
            totalPossible: true,
            riskLevel: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
        },
        messages: {
          select: {
            content: true,
            role: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
          take: 5,
        },
      },
    });

    if (!recentAssessment) {
      console.log("❌ No assessments found");
      return;
    }

    console.log(
      `\n📊 Most Recent Assessment: ${recentAssessment.subjectName} (${recentAssessment.shortId})`
    );
    console.log(`   Status: ${recentAssessment.status}`);
    console.log(`   Started: ${recentAssessment.startedAt}`);
    console.log(`   Total Scores: ${recentAssessment.scores.length}`);

    // Analyze what domains were actually scored
    const domainGroups: Record<string, any[]> = {};
    recentAssessment.scores.forEach((score) => {
      if (!domainGroups[score.domain]) {
        domainGroups[score.domain] = [];
      }
      domainGroups[score.domain].push(score);
    });

    console.log(`\n📈 DOMAINS SCORED:`);
    Object.entries(domainGroups).forEach(([domain, scores]) => {
      console.log(`   ${domain}: ${scores.length} scores`);

      // Show latest score for this domain
      const latestScore = scores[0]; // Already sorted by timestamp desc
      console.log(
        `     Latest: ${latestScore.rawScore}/${latestScore.totalPossible} (${latestScore.riskLevel}) at ${latestScore.timestamp.toISOString().slice(11, 19)}`
      );

      // Show all scores for this domain if there are multiple
      if (scores.length > 1) {
        console.log(`     All scores:`);
        scores.forEach((score, index) => {
          console.log(
            `       ${index + 1}. ${score.rawScore}/${score.totalPossible} (${score.riskLevel}) at ${score.timestamp.toISOString().slice(11, 19)}`
          );
        });
      }
    });

    console.log(`\n🎯 EXPECTED FRONTEND BEHAVIOR:`);
    console.log(
      `   Should show ${Object.keys(domainGroups).length} domain pills:`
    );
    Object.keys(domainGroups).forEach((domain) => {
      const latestScore = domainGroups[domain][0];
      console.log(
        `   - ${domain}: ${latestScore.rawScore}/${latestScore.totalPossible}`
      );
    });

    // Check recent messages to see if this was a multi-domain assessment
    console.log(`\n💬 RECENT MESSAGES (${recentAssessment.messages.length}):`);
    recentAssessment.messages.forEach((message, index) => {
      const preview =
        message.content.length > 80
          ? message.content.slice(0, 80) + "..."
          : message.content;
      console.log(`   ${index + 1}. ${message.role}: ${preview}`);
    });

    // Now let's test what the API would return
    console.log(`\n🔌 API RESPONSE TEST:`);
    const apiResponse = recentAssessment.scores.map((score) => ({
      domain: score.domain,
      rawScore: score.rawScore,
      totalPossible: score.totalPossible,
      riskLevel: score.riskLevel,
      timestamp: score.timestamp,
    }));

    // Simulate frontend deduplication
    const latestScoresByDomain: Record<string, any> = {};
    apiResponse.forEach((score) => {
      if (
        !latestScoresByDomain[score.domain] ||
        new Date(score.timestamp) >
          new Date(latestScoresByDomain[score.domain].timestamp)
      ) {
        latestScoresByDomain[score.domain] = score;
      }
    });

    console.log(`   Deduplicated scores that frontend should show:`);
    Object.values(latestScoresByDomain).forEach((score: any) => {
      console.log(
        `     ${score.domain}: ${score.rawScore}/${score.totalPossible}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRecentAssessment();
