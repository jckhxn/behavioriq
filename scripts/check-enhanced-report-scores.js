#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("\n🔍 Checking Enhanced Report Assessments for Scores...\n");

  // Find all assessments with enhanced reports
  const enhancedReports = await prisma.assessment.findMany({
    where: {
      hasEnhancedReport: true,
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

  console.log(`Found ${enhancedReports.length} enhanced report assessments\n`);

  for (const assessment of enhancedReports) {
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
      `Assessment: ${assessment.shortId} - ${assessment.subjectName}`
    );
    console.log(`  Status: ${assessment.status}`);
    console.log(`  Completed: ${assessment.completedAt}`);
    console.log(`  Score Count: ${scores.length}`);

    if (scores.length > 0) {
      console.log(`  Scores:`);
      scores.forEach((score) => {
        console.log(
          `    - ${score.domainName || score.domain}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
        );
      });
    } else {
      console.log(`  ⚠️  NO SCORES FOUND`);
    }
    console.log("");
  }

  console.log("\n✅ Done checking enhanced reports\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
