import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findMultiDomainAssessments() {
  console.log("🔍 FINDING ASSESSMENTS WITH MULTIPLE DOMAINS");
  console.log("============================================");

  try {
    // Get assessments with scores and group by assessment to see domain diversity
    const assessmentsWithScores = await prisma.assessment.findMany({
      where: {
        scores: {
          some: {},
        },
      },
      include: {
        scores: {
          select: {
            domain: true,
          },
        },
      },
      take: 10,
    });

    console.log(`\nChecking ${assessmentsWithScores.length} assessments:`);

    assessmentsWithScores.forEach((assessment: any) => {
      const domains = new Set(assessment.scores.map((s: any) => s.domain));
      const domainList = Array.from(domains).join(", ");

      console.log(
        `- ${assessment.shortId}: ${domains.size} domains (${domainList})`
      );
    });

    // Find assessments with more than one domain type
    const multiDomainAssessments = assessmentsWithScores.filter(
      (assessment: any) => {
        const domains = new Set(assessment.scores.map((s: any) => s.domain));
        return domains.size > 1;
      }
    );

    console.log(
      `\n🎯 MULTI-DOMAIN ASSESSMENTS (${multiDomainAssessments.length}):`
    );
    multiDomainAssessments.forEach((assessment: any) => {
      const domains = new Set(assessment.scores.map((s: any) => s.domain));
      const domainList = Array.from(domains).join(", ");
      console.log(
        `✅ ${assessment.shortId} (${assessment.subjectName}): ${domainList}`
      );
    });

    if (multiDomainAssessments.length === 0) {
      console.log("⚠️  No assessments found with multiple domain types!");
      console.log(
        "This suggests the assessments are only testing ANTISOCIAL domain."
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findMultiDomainAssessments();
