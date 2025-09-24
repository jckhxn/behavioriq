import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function investigateAssessmentDomains() {
  console.log("🔍 INVESTIGATING ASSESSMENT DOMAIN STRUCTURE");
  console.log("===========================================");

  try {
    // Get the specific assessment with all details
    const assessment = await prisma.assessment.findFirst({
      where: { shortId: "BIQ-IR8X6R" },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        startedAt: true,
        completedAt: true,
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
        messages: {
          select: {
            id: true,
            content: true,
            role: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!assessment) {
      console.log("❌ Assessment BIQ-IR8X6R not found");
      return;
    }

    console.log(
      `\n📊 Assessment: ${assessment.subjectName} (${assessment.shortId})`
    );
    console.log(`   Status: ${assessment.status}`);
    console.log(`   Started: ${assessment.startedAt}`);
    console.log(`   Completed: ${assessment.completedAt}`);
    console.log(`   Messages: ${assessment.messages.length}`);
    console.log(`   Scores: ${assessment.scores.length}`);

    // Analyze score patterns
    console.log(`\n📈 SCORE ANALYSIS:`);
    const domainGroups: Record<string, any[]> = {};
    assessment.scores.forEach((score) => {
      if (!domainGroups[score.domain]) {
        domainGroups[score.domain] = [];
      }
      domainGroups[score.domain].push(score);
    });

    Object.entries(domainGroups).forEach(([domain, scores]) => {
      console.log(`\n   ${domain}: ${scores.length} entries`);
      scores.forEach((score, index) => {
        console.log(
          `     ${index + 1}. Score: ${score.rawScore}/${score.totalPossible} | Questions: ${score.questionsAnswered} | Risk: ${score.riskLevel} | Time: ${score.timestamp.toISOString().slice(11, 19)}`
        );
      });
    });

    // Check recent messages for clues about domain coverage
    console.log(`\n💬 RECENT ASSESSMENT MESSAGES:`);
    assessment.messages.slice(0, 5).forEach((message, index) => {
      const content =
        message.content.length > 100
          ? message.content.slice(0, 100) + "..."
          : message.content;
      console.log(`   ${index + 1}. ${message.role}: ${content}`);
    });

    // Look for any mentions of other domains in the assessment
    console.log(`\n🔎 CHECKING FOR OTHER DOMAIN MENTIONS:`);
    const allContent = assessment.messages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();
    const domainKeywords = [
      "violence",
      "emotional",
      "conduct",
      "attention",
      "adhd",
      "aggression",
      "anger",
    ];

    domainKeywords.forEach((keyword) => {
      if (allContent.includes(keyword)) {
        console.log(
          `   ⚠️  Found "${keyword}" in assessment content - may indicate missing domain scores`
        );
      }
    });

    // Check if this is a complete assessment or if scoring was interrupted
    if (assessment.status === "COMPLETED") {
      console.log(`\n✅ Assessment is marked as COMPLETED`);
      console.log(`   This suggests all intended domains were scored`);
    } else {
      console.log(`\n⚠️  Assessment status: ${assessment.status}`);
      console.log(`   May indicate incomplete scoring process`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateAssessmentDomains();
