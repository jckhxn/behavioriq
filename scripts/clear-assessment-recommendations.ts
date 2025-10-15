#!/usr/bin/env ts-node
// @ts-nocheck
/**
 * Clear recommendations for a specific assessment
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shortId = "BIQ-MFM0CX";

  console.log(`🔍 Looking for assessment: ${shortId}\n`);

  const assessment = await prisma.assessment.findFirst({
    where: { shortId },
    include: {
      recommendations: true,
      aiReport: true,
    },
  });

  if (!assessment) {
    console.error(`❌ Assessment not found: ${shortId}`);
    process.exit(1);
  }

  console.log(`📋 Assessment: ${assessment.subjectName}`);
  console.log(`   Status: ${assessment.status}`);
  console.log(`   Has Enhanced Report: ${assessment.hasEnhancedReport}`);
  console.log(`   AI Report: ${assessment.aiReport ? "✅ Yes" : "❌ No"}`);
  console.log(`   Recommendations: ${assessment.recommendations.length} found`);
  console.log(
    `   Enhanced Analysis: ${assessment.enhancedAnalysis ? "✅ Yes" : "❌ No"}\n`
  );

  // Delete AI Report if exists
  if (assessment.aiReport) {
    await prisma.aIReport.delete({
      where: { id: assessment.aiReport.id },
    });
    console.log(`✅ Deleted AI Report`);
  }

  // Delete Recommendations if exist
  if (assessment.recommendations.length > 0) {
    await prisma.recommendation.deleteMany({
      where: { assessmentId: assessment.id },
    });
    console.log(
      `✅ Deleted ${assessment.recommendations.length} recommendation(s)`
    );
  }

  // Clear enhanced analysis if exists
  if (assessment.enhancedAnalysis) {
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { enhancedAnalysis: {} as any },
    });
    console.log(`✅ Cleared enhanced analysis`);
  }

  console.log(
    `\n✨ Done! You can now regenerate recommendations for ${shortId}\n`
  );

  await prisma.$disconnect();
}

main();
