#!/usr/bin/env tsx
// @ts-nocheck

/**
 * Cleanup script to remove orphaned assessments
 * Run with: npx tsx scripts/cleanup-orphaned-assessments.ts
 */

import prisma from "../lib/db/prisma";

async function cleanupOrphanedAssessments() {
  console.log("Starting cleanup of orphaned assessments...");

  try {
    // Find assessments with non-existent users
    const orphanedAssessments = await prisma.assessment.findMany({
      where: {
        userId: {
          not: null,
        },
      },
      include: {
        user: true,
      },
    });

    const toDelete = orphanedAssessments.filter((a) => !a.user);

    console.log(`Found ${toDelete.length} orphaned assessments`);

    if (toDelete.length > 0) {
      const result = await prisma.assessment.deleteMany({
        where: {
          id: {
            in: toDelete.map((a) => a.id),
          },
        },
      });

      console.log(`Deleted ${result.count} orphaned assessments`);
    }

    // Also cleanup old IN_PROGRESS assessments (>30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldInProgress = await prisma.assessment.deleteMany({
      where: {
        status: "IN_PROGRESS",
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`Deleted ${oldInProgress.count} old IN_PROGRESS assessments`);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedAssessments()
  .then(() => {
    console.log("\n✨ Cleanup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Cleanup failed:", error);
    process.exit(1);
  });
