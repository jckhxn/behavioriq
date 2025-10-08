#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("\n🧪 Testing Conversational Assessment Scores...\n");

  // Find all conversational assessments
  const conversationalAssessments = await prisma.assessment.findMany({
    where: {
      isConversational: true,
    },
    select: {
      id: true,
      shortId: true,
      subjectName: true,
      status: true,
      completedAt: true,
      hasEnhancedReport: true,
      userId: true,
      _count: {
        select: {
          scores: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  console.log(
    `Found ${conversationalAssessments.length} conversational assessments:\n`
  );

  for (const assessment of conversationalAssessments) {
    const scores = await prisma.score.findMany({
      where: {
        assessmentId: assessment.id,
      },
      select: {
        id: true,
        domain: true,
        domainName: true,
        rawScore: true,
        totalPossible: true,
        riskLevel: true,
      },
    });

    console.log(
      `Assessment: ${assessment.shortId || assessment.id.substring(0, 8)} - ${assessment.subjectName}`
    );
    console.log(`  Status: ${assessment.status}`);
    console.log(
      `  Enhanced Report: ${assessment.hasEnhancedReport ? "Yes" : "No"}`
    );
    console.log(
      `  User ID: ${assessment.userId ? assessment.userId.substring(0, 8) : "Trial"}`
    );
    console.log(`  Completed: ${assessment.completedAt || "Not completed"}`);
    console.log(`  Score Count: ${scores.length}`);

    if (scores.length > 0) {
      console.log(`  Scores:`);
      scores.forEach((score) => {
        console.log(
          `    ✓ ${score.domainName || score.domain}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
        );
      });
    } else {
      console.log(
        `  ⚠️  NO SCORES FOUND - This assessment needs to have scores created`
      );
    }
    console.log("");
  }

  console.log("\n✅ Test complete\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
