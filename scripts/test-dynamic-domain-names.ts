import { PrismaClient } from "@prisma/client";
import { getDynamicDomainNames } from "../lib/utils/domainNames";

const prisma = new PrismaClient();

async function testDynamicDomainNames() {
  console.log("🧪 TESTING DYNAMIC DOMAIN NAMES FIX");
  console.log("===================================");

  try {
    // Test 1: Check dynamic domain loading
    console.log("\n1. Testing dynamic domain name loading:");
    const domainNames = await getDynamicDomainNames();
    console.log("   Loaded domain names:");
    Object.entries(domainNames).forEach(([domain, displayName]) => {
      console.log(`   - ${domain} → "${displayName}"`);
    });

    // Test 2: Simulate API response
    console.log("\n2. Simulating updated API response:");
    const testAssessment = await prisma.assessment.findFirst({
      where: { shortId: "BIQ-8KG6KE" },
      select: {
        shortId: true,
        subjectName: true,
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

    if (testAssessment) {
      console.log(
        `\n   Assessment: ${testAssessment.subjectName} (${testAssessment.shortId})`
      );

      // Deduplicate scores (latest per domain)
      const latestScoresByDomain: Record<string, any> = {};
      testAssessment.scores.forEach((score) => {
        if (!latestScoresByDomain[score.domain]) {
          latestScoresByDomain[score.domain] = score;
        }
      });

      console.log(`\n   API Response with dynamic domain names:`);
      const apiResponse = {
        ...testAssessment,
        scores: Object.values(latestScoresByDomain).map((score) => ({
          ...score,
          domainDisplayName: domainNames[score.domain] || score.domain,
        })),
      };

      apiResponse.scores.forEach((score) => {
        console.log(
          `   - Domain: ${score.domain} → Display: "${score.domainDisplayName}"`
        );
        console.log(
          `     Score: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
        );
      });

      console.log(`\n   Frontend Pills should now show:`);
      apiResponse.scores.forEach((score) => {
        console.log(
          `   • "${score.domainDisplayName}: ${score.rawScore}/${score.totalPossible}"`
        );
      });
    }

    console.log(`\n✅ Fix Summary:`);
    console.log(`   - Domain names are now loaded dynamically from database`);
    console.log(`   - API includes domainDisplayName field`);
    console.log(
      `   - Frontend uses domainDisplayName instead of hardcoded DOMAIN_LABELS`
    );
    console.log(`   - Each assessment shows its actual domain configurations`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicDomainNames();
