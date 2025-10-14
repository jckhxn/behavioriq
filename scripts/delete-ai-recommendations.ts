#!/usr/bin/env ts-node
/**
 * Delete AI Recommendations Script
 *
 * This script deletes AI recommendations (AIReport records) so they can be regenerated.
 * You can delete:
 * - All AI recommendations
 * - AI recommendations for a specific assessment (by shortId or full ID)
 * - AI recommendations for a specific user
 *
 * Usage:
 *   npx ts-node scripts/delete-ai-recommendations.ts              # Delete all
 *   npx ts-node scripts/delete-ai-recommendations.ts <shortId>    # Delete for specific assessment
 *   npx ts-node scripts/delete-ai-recommendations.ts --user <email> # Delete for specific user
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  console.log("🗑️  AI Recommendations Deletion Tool\n");

  try {
    if (args.length === 0) {
      // Delete all AI recommendations
      console.log("⚠️  WARNING: This will delete ALL AI recommendations!");
      console.log("Press Ctrl+C to cancel, or continue in 3 seconds...\n");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result = await prisma.aIReport.deleteMany({});
      console.log(`✅ Deleted ${result.count} AI recommendation(s)\n`);
    } else if (args[0] === "--user" && args[1]) {
      // Delete by user email
      const email = args[1];
      console.log(`🔍 Finding AI recommendations for user: ${email}\n`);

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        console.error(`❌ User not found: ${email}\n`);
        process.exit(1);
      }

      const result = await prisma.aIReport.deleteMany({
        where: { generatedByUserId: user.id },
      });

      console.log(
        `✅ Deleted ${result.count} AI recommendation(s) for ${user.name || user.email}\n`
      );
    } else {
      // Delete by assessment ID or shortId
      const identifier = args[0];
      console.log(
        `🔍 Finding AI recommendations for assessment: ${identifier}\n`
      );

      // Try to find assessment by shortId first, then by full ID
      const assessment = await prisma.assessment.findFirst({
        where: {
          OR: [{ shortId: identifier }, { id: identifier }],
        },
        select: {
          id: true,
          shortId: true,
          subjectName: true,
          aiReport: true,
        },
      });

      if (!assessment) {
        console.error(`❌ Assessment not found: ${identifier}\n`);
        console.log("💡 Tip: Use the shortId (e.g., 'abc123') or full ID\n");
        process.exit(1);
      }

      if (!assessment.aiReport) {
        console.log(
          `ℹ️  No AI recommendations found for assessment: ${assessment.subjectName} (${assessment.shortId})\n`
        );
        process.exit(0);
      }

      await prisma.aIReport.delete({
        where: { assessmentId: assessment.id },
      });

      console.log(
        `✅ Deleted AI recommendations for assessment: ${assessment.subjectName} (${assessment.shortId})\n`
      );
    }

    console.log("✨ Done! You can now regenerate recommendations.\n");
  } catch (error) {
    console.error("❌ Error deleting AI recommendations:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage if --help flag
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Usage:
  npx ts-node scripts/delete-ai-recommendations.ts                  # Delete all
  npx ts-node scripts/delete-ai-recommendations.ts <shortId>         # Delete for specific assessment
  npx ts-node scripts/delete-ai-recommendations.ts --user <email>    # Delete for specific user

Examples:
  npx ts-node scripts/delete-ai-recommendations.ts abc123
  npx ts-node scripts/delete-ai-recommendations.ts --user test@example.com
  
  `);
  process.exit(0);
}

main();
