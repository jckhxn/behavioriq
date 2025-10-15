// @ts-nocheck
/**
 * Cleanup Script: Fix Duplicate Conversational Assessments
 *
 * This script:
 * 1. Finds duplicate conversational assessments for the same user
 * 2. Keeps the oldest one (from start route) and deletes duplicates
 * 3. Fixes credit deductions if they were over-counted
 *
 * Usage: npx tsx scripts/cleanup-conversational-duplicates.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/db/prisma";

async function cleanupConversationalDuplicates() {
  console.log("🧹 Starting Conversational Assessment Cleanup\n");
  console.log("=".repeat(60));

  try {
    // Find all users with conversational assessments
    const users = await prisma.user.findMany({
      where: {
        assessments: {
          some: {
            isConversational: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    console.log(
      `\n📊 Found ${users.length} users with conversational assessments\n`
    );

    let totalDuplicatesRemoved = 0;
    let totalCreditsFixed = 0;

    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.email} (${user.id})`);

      // Get all conversational assessments for this user
      const assessments = await prisma.assessment.findMany({
        where: {
          userId: user.id,
          isConversational: true,
        },
        orderBy: {
          startedAt: "asc", // Oldest first
        },
        include: {
          scores: true,
          conversationalSession: true,
        },
      });

      console.log(`  Found ${assessments.length} conversational assessments`);

      // Group by subject name and timeframe (within 1 minute)
      const groups: Map<string, typeof assessments> = new Map();

      for (const assessment of assessments) {
        const key = `${assessment.subjectName}_${Math.floor(assessment.startedAt.getTime() / 60000)}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(assessment);
      }

      // Find groups with duplicates
      for (const [key, group] of groups) {
        if (group.length > 1) {
          console.log(
            `  ⚠️  Found ${group.length} duplicates for "${group[0].subjectName}"`
          );

          // Keep the oldest with scores, delete the rest
          const withScores = group.filter((a) => a.scores.length > 0);
          const keepAssessment =
            withScores.length > 0 ? withScores[0] : group[0];

          for (const assessment of group) {
            if (assessment.id !== keepAssessment.id) {
              console.log(`    🗑️  Deleting duplicate: ${assessment.id}`);

              // Delete related records first
              await prisma.score.deleteMany({
                where: { assessmentId: assessment.id },
              });

              await prisma.conversationalSession.deleteMany({
                where: { assessmentId: assessment.id },
              });

              await prisma.assessment.delete({
                where: { id: assessment.id },
              });

              totalDuplicatesRemoved++;
            }
          }

          console.log(`    ✅ Kept assessment: ${keepAssessment.id}`);
        }
      }

      // Check credit count
      const userLicense = await prisma.userLicense.findFirst({
        where: { userId: user.id },
      });

      if (userLicense) {
        // Count completed assessments
        const completedCount = await prisma.assessment.count({
          where: {
            userId: user.id,
            isConversational: true,
            status: "COMPLETED",
          },
        });

        const creditsUsed = userLicense.conversationalAssessmentsUsed;

        if (creditsUsed > completedCount) {
          console.log(
            `  ⚠️  Credit mismatch: Used=${creditsUsed}, Completed=${completedCount}`
          );
          console.log(`    Fixing credit count...`);

          await prisma.userLicense.update({
            where: { id: userLicense.id },
            data: {
              conversationalAssessmentsUsed: completedCount,
            },
          });

          totalCreditsFixed++;
          console.log(`    ✅ Fixed: Set creditsUsed to ${completedCount}`);
        } else {
          console.log(
            `  ✅ Credits correct: ${creditsUsed} used, ${completedCount} completed`
          );
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 CLEANUP SUMMARY:");
    console.log("=".repeat(60));
    console.log(`Users checked: ${users.length}`);
    console.log(`Duplicate assessments removed: ${totalDuplicatesRemoved}`);
    console.log(`User credits fixed: ${totalCreditsFixed}`);

    console.log("\n✅ Cleanup complete!\n");
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupConversationalDuplicates().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
