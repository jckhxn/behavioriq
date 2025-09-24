import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkVisibleAssessments() {
  console.log("Checking assessments from your UI:");
  console.log("===================================");

  // Get the assessments that appear in your screenshot
  const visibleAssessments = [
    "BIQ-61CSHV",
    "BIQ-IBMRTD",
    "BIQ-IR8X6R",
    "BIQ-AJEVI7",
  ];

  for (const shortId of visibleAssessments) {
    const assessment = await prisma.assessment.findFirst({
      where: { shortId },
      select: {
        shortId: true,
        subjectName: true,
        userId: true,
        scores: {
          select: {
            domain: true,
            rawScore: true,
            totalPossible: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });

    if (assessment) {
      console.log(`${assessment.subjectName} (${assessment.shortId})`);
      console.log(`  User: ${assessment.userId}`);

      if (assessment.scores.length > 0) {
        // Get unique domains with latest scores
        const domainMap = new Map();
        assessment.scores.forEach((score) => {
          if (
            !domainMap.has(score.domain) ||
            domainMap.get(score.domain).timestamp < score.timestamp
          ) {
            domainMap.set(score.domain, score);
          }
        });

        console.log(`  Latest scores by domain (${domainMap.size} domains):`);
        domainMap.forEach((score, domain) => {
          console.log(
            `    - ${domain}: ${score.rawScore}/${score.totalPossible}`
          );
        });

        if (domainMap.size > 1) {
          console.log(`  ⭐ This should show ${domainMap.size} domain pills!`);
        }
      } else {
        console.log("  No scores yet");
      }
      console.log("");
    } else {
      console.log(`Assessment ${shortId} not found`);
    }
  }

  await prisma.$disconnect();
}

checkVisibleAssessments().catch(console.error);
