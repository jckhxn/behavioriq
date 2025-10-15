#!/usr/bin/env tsx
// @ts-nocheck
/**
 * Watch for recent webhook activity (payments and license changes)
 * Run with: npx tsx scripts/watch-webhook-activity.ts
 */

import { prisma } from "../lib/db/prisma";

async function watchActivity() {
  console.log("👀 Watching for recent webhook activity...\n");
  console.log("Press Ctrl+C to stop\n");

  let lastPaymentId: string | null = null;
  let lastLicenseUpdate: Date | null = null;

  const checkActivity = async () => {
    try {
      // Check for new payments
      const latestPayment = await prisma.payment.findFirst({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true } } },
      });

      if (latestPayment && latestPayment.id !== lastPaymentId) {
        console.log(`💰 New Payment Detected!`);
        console.log(`   Time: ${latestPayment.createdAt.toLocaleString()}`);
        console.log(`   User: ${latestPayment.user.email}`);
        console.log(`   Amount: $${latestPayment.amount / 100}`);
        console.log(`   Plan: ${latestPayment.plan}`);
        console.log(`   Status: ${latestPayment.status}`);
        console.log("");
        lastPaymentId = latestPayment.id;

        // Check corresponding license update
        const userLicense = await prisma.userLicense.findFirst({
          where: { userId: latestPayment.userId, isActive: true },
          include: { license: true },
        });

        if (userLicense) {
          console.log(`📊 License Status:`);
          console.log(
            `   Credits: ${userLicense.assessmentsUsed}/${userLicense.assessmentsAllowed}`
          );
          console.log(`   Type: ${userLicense.license.type}`);
          console.log(`   Status: ${userLicense.license.status}`);
          console.log("");
        }
      }

      // Check for license updates
      const recentLicenseUpdate = await prisma.userLicense.findFirst({
        where: { isActive: true },
        orderBy: { id: "desc" },
        include: {
          user: { select: { email: true } },
          license: true,
        },
      });

      if (recentLicenseUpdate) {
        const updateTime = recentLicenseUpdate.license.updatedAt;
        if (
          !lastLicenseUpdate ||
          updateTime.getTime() > lastLicenseUpdate.getTime()
        ) {
          if (lastLicenseUpdate) {
            // Only log if this is not the first check
            console.log(`🔄 License Updated!`);
            console.log(`   Time: ${updateTime.toLocaleString()}`);
            console.log(`   User: ${recentLicenseUpdate.user.email}`);
            console.log(
              `   Credits: ${recentLicenseUpdate.assessmentsUsed}/${recentLicenseUpdate.assessmentsAllowed}`
            );
            console.log("");
          }
          lastLicenseUpdate = updateTime;
        }
      }
    } catch (error) {
      console.error("Error checking activity:", error);
    }
  };

  // Initial check
  await checkActivity();
  console.log("✓ Monitoring started. Waiting for webhook events...\n");

  // Check every 2 seconds
  const interval = setInterval(checkActivity, 2000);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    console.log("\n👋 Stopping monitor...");
    clearInterval(interval);
    await prisma.$disconnect();
    process.exit(0);
  });
}

watchActivity();
