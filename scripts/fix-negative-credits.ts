/**
 * Fix Negative Credits Script
 *
 * This script fixes users with negative assessmentsUsed or conversationalAssessmentsUsed values
 * by recalculating based on actual completed assessments in the database.
 *
 * Usage: npx tsx scripts/fix-negative-credits.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/db/prisma";

async function fixNegativeCredits() {
  console.log("🔧 Starting Credit Fix Script\n");
  console.log("=".repeat(60));

  try {
    // Find all users with licenses
    const userLicenses = await prisma.userLicense.findMany({
      where: {
        OR: [
          { assessmentsUsed: { lt: 0 } },
          { conversationalAssessmentsUsed: { lt: 0 } },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`\n📊 Found ${userLicenses.length} licenses with negative credits\n`);

    let fixedRegularCredits = 0;
    let fixedConversationalCredits = 0;

    for (const userLicense of userLicenses) {
      console.log(`\n👤 Checking user: ${userLicense.user.email} (${userLicense.userId})`);

      // Fix regular assessments
      if (userLicense.assessmentsUsed < 0) {
        const completedRegularCount = await prisma.assessment.count({
          where: {
            userId: userLicense.userId,
            status: "COMPLETED",
            isConversational: false,
          },
        });

        console.log(`  ⚠️  Regular assessments: Used=${userLicense.assessmentsUsed}, Actual=${completedRegularCount}`);

        await prisma.userLicense.update({
          where: { id: userLicense.id },
          data: { assessmentsUsed: completedRegularCount },
        });

        console.log(`  ✅ Fixed regular credits: ${userLicense.assessmentsUsed} → ${completedRegularCount}`);
        fixedRegularCredits++;
      }

      // Fix conversational assessments
      if (userLicense.conversationalAssessmentsUsed < 0) {
        const completedConversationalCount = await prisma.assessment.count({
          where: {
            userId: userLicense.userId,
            status: "COMPLETED",
            isConversational: true,
          },
        });

        console.log(`  ⚠️  Conversational assessments: Used=${userLicense.conversationalAssessmentsUsed}, Actual=${completedConversationalCount}`);

        await prisma.userLicense.update({
          where: { id: userLicense.id },
          data: { conversationalAssessmentsUsed: completedConversationalCount },
        });

        console.log(`  ✅ Fixed conversational credits: ${userLicense.conversationalAssessmentsUsed} → ${completedConversationalCount}`);
        fixedConversationalCredits++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📊 FIX SUMMARY:");
    console.log("=".repeat(60));
    console.log(`Licenses checked: ${userLicenses.length}`);
    console.log(`Regular credits fixed: ${fixedRegularCredits}`);
    console.log(`Conversational credits fixed: ${fixedConversationalCredits}`);
    console.log("\n✅ Fix complete!\n");

  } catch (error) {
    console.error("\n❌ Error during fix:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixNegativeCredits().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
