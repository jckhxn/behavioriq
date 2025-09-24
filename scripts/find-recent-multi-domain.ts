import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findMultiDomainAssessments() {
  console.log("🔍 FINDING ASSESSMENTS WITH MULTIPLE DOMAINS");
  console.log("============================================");

  try {
    // Get recent assessments with their domain counts
    const assessments = await prisma.assessment.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
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
          },
        },
      },
    });

    console.log(`\n📊 Recent Assessments (${assessments.length}):`);

    assessments.forEach((assessment, index) => {
      // Get unique domains
      const domains = new Set(assessment.scores.map((s) => s.domain));
      const domainList = Array.from(domains);

      console.log(
        `\n${index + 1}. ${assessment.subjectName} (${assessment.shortId || assessment.id.slice(0, 8)})`
      );
      console.log(
        `   Status: ${assessment.status} | Started: ${assessment.startedAt.toISOString().slice(0, 16)}`
      );
      console.log(
        `   Domains: ${domainList.length} → ${domainList.join(", ")}`
      );
      console.log(`   Total Scores: ${assessment.scores.length}`);

      if (domainList.length > 1) {
        console.log(
          `   🎯 MULTI-DOMAIN! Should show ${domainList.length} different pills:`
        );

        // Show latest score per domain
        const latestByDomain: Record<string, any> = {};
        assessment.scores.forEach((score) => {
          if (!latestByDomain[score.domain]) {
            latestByDomain[score.domain] = score;
          }
        });

        Object.entries(latestByDomain).forEach(([domain, score]) => {
          console.log(
            `     - ${domain}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
          );
        });
      }
    });

    // Check which is the most recent multi-domain assessment
    const multiDomainAssessments = assessments.filter((a) => {
      const domains = new Set(a.scores.map((s) => s.domain));
      return domains.size > 1;
    });

    if (multiDomainAssessments.length > 0) {
      const latest = multiDomainAssessments[0];
      console.log(
        `\n🎯 MOST RECENT MULTI-DOMAIN: ${latest.subjectName} (${latest.shortId})`
      );
      console.log(
        `   You should test this assessment to see the pill display issue.`
      );
      console.log(
        `   URL: http://localhost:3001/assessment/${latest.shortId || latest.id.slice(0, 8)}`
      );
    } else {
      console.log(
        `\n⚠️  NO MULTI-DOMAIN ASSESSMENTS FOUND in recent assessments`
      );
      console.log(
        `   You may need to create a new assessment and answer questions`
      );
      console.log(`   across multiple domains to see the issue.`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

findMultiDomainAssessments();
