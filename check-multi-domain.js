import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkMultiDomainAssessments() {
  // Find assessments with multiple domains (like what shows in your UI)
  const multiDomainAssessments = ["BIQ-8KG6KE", "BIQ-HFGD6A", "BIQ-EIKFQ5"];

  console.log("Checking specific multi-domain assessments:");
  console.log("============================================");

  for (const shortId of multiDomainAssessments) {
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
      console.log(
        `${assessment.subjectName} (${assessment.shortId}) - User: ${assessment.userId}`
      );

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

      console.log(`  Latest scores by domain:`);
      domainMap.forEach((score, domain) => {
        console.log(
          `    - ${domain}: ${score.rawScore}/${score.totalPossible} (latest)`
        );
      });
      console.log("");
    } else {
      console.log(`Assessment ${shortId} not found`);
    }
  }

  await prisma.$disconnect();
}

checkMultiDomainAssessments().catch(console.error);
