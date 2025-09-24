import { PrismaClient } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function simulateFrontendDisplay() {
  console.log("🎨 SIMULATING FRONTEND ASSESSMENT DISPLAY");
  console.log("==========================================");

  try {
    // Simulate the same query as the API
    const assessments = await prisma.assessment.findMany({
      orderBy: { startedAt: "desc" },
      take: 2,
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        startedAt: true,
        completedAt: true,
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

    console.log(
      `\n📊 Processing ${assessments.length} assessments (as frontend would):`
    );

    assessments.forEach((assessment: any, index: number) => {
      console.log(
        `\n${index + 1}. ${assessment.subjectName} (${assessment.shortId || assessment.id.slice(0, 8)}...)`
      );
      console.log(`   Status: ${assessment.status}`);
      console.log(`   Scores: ${assessment.scores.length}`);

      if (assessment.scores.length > 0) {
        console.log(`   Score Pills (as they would appear):`);
        assessment.scores.forEach((score: any, scoreIndex: number) => {
          // Simulate the exact logic from AssessmentsView.tsx
          const displayLabel =
            DOMAIN_LABELS[score.domain as keyof typeof DOMAIN_LABELS] ||
            score.domain;
          const pillText = `${displayLabel}: ${score.rawScore}/${score.totalPossible}`;

          console.log(`     ${scoreIndex + 1}. "${pillText}"`);
          console.log(`        Raw domain: "${score.domain}"`);
          console.log(`        Mapped label: "${displayLabel}"`);
        });
      } else {
        console.log(`   ⚠️  No scores to display`);
      }
    });

    // Also test a multi-domain assessment specifically
    console.log(`\n🔍 Testing multi-domain assessment BIQ-8KG6KE:`);
    const multiDomainAssessment = await prisma.assessment.findFirst({
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

    if (multiDomainAssessment) {
      // Get unique domains only (latest score per domain)
      const scoresByDomain: Record<string, any> = {};
      multiDomainAssessment.scores.forEach((score: any) => {
        scoresByDomain[score.domain] = score;
      });

      console.log(`   Unique domain pills:`);
      Object.values(scoresByDomain).forEach((score: any, index: number) => {
        const displayLabel =
          DOMAIN_LABELS[score.domain as keyof typeof DOMAIN_LABELS] ||
          score.domain;
        const pillText = `${displayLabel}: ${score.rawScore}/${score.totalPossible}`;
        console.log(`     ${index + 1}. "${pillText}"`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateFrontendDisplay();
