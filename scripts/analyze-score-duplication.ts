import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeScoreDuplication() {
  console.log("🔍 ANALYZING SCORE DUPLICATION");
  console.log("==============================");

  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        shortId: { in: ["BIQ-IR8X6R", "BIQ-AJEVI7", "BIQ-8KG6KE"] },
      },
      select: {
        shortId: true,
        subjectName: true,
        scores: {
          select: {
            id: true,
            domain: true,
            rawScore: true,
            totalPossible: true,
            timestamp: true,
          },
          orderBy: { timestamp: "desc" },
        },
      },
    });

    assessments.forEach((assessment) => {
      console.log(`\n📊 ${assessment.subjectName} (${assessment.shortId})`);
      console.log(`   Total scores: ${assessment.scores.length}`);

      // Group by domain to see duplicates
      const domainGroups: Record<string, any[]> = {};
      assessment.scores.forEach((score) => {
        if (!domainGroups[score.domain]) {
          domainGroups[score.domain] = [];
        }
        domainGroups[score.domain].push(score);
      });

      console.log(`   Domains: ${Object.keys(domainGroups).length}`);

      Object.entries(domainGroups).forEach(([domain, scores]) => {
        console.log(`     ${domain}: ${scores.length} entries`);
        if (scores.length > 1) {
          console.log(
            `       ^ DUPLICATE! Frontend will show ${scores.length} pills for same domain`
          );
          scores.forEach((score, index) => {
            console.log(
              `         ${index + 1}. ${score.rawScore}/${score.totalPossible} (${score.timestamp.toISOString().slice(0, 19)})`
            );
          });
        }
      });
    });

    console.log(
      `\n💡 SOLUTION: Frontend should deduplicate by domain (show latest score per domain)`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeScoreDuplication();
