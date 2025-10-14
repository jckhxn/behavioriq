#!/usr/bin/env tsx
/**
 * Test Stripe webhook locally
 * Run with: npx tsx scripts/test-stripe-webhook.ts
 */

import { prisma } from "../lib/db/prisma";

async function testStripeWebhookFlow() {
  console.log("🔍 Testing Stripe webhook flow...\n");

  try {
    // Test 1: Check if user has a license
    console.log("Test 1: Checking for active user licenses...");
    const userLicenses = await prisma.userLicense.findMany({
      where: { isActive: true },
      include: {
        user: { select: { email: true } },
        license: true,
      },
      take: 3,
    });

    if (userLicenses.length === 0) {
      console.log("⚠️  No active user licenses found");
      console.log("   This is normal for a fresh database");
    } else {
      console.log(`✅ Found ${userLicenses.length} active user license(s):`);
      userLicenses.forEach((ul) => {
        console.log(
          `   - ${ul.user.email}: ${ul.assessmentsUsed}/${ul.assessmentsAllowed} assessments`
        );
      });
    }

    // Test 2: Check payment records
    console.log("\nTest 2: Checking recent payments...");
    const payments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });

    if (payments.length === 0) {
      console.log("⚠️  No payment records found");
    } else {
      console.log(`✅ Found ${payments.length} payment record(s):`);
      payments.forEach((p) => {
        console.log(
          `   - ${p.user.email}: $${p.amount / 100} (${p.status}) - ${p.plan}`
        );
      });
    }

    // Test 3: Simulate adding credits
    console.log("\nTest 3: Simulating credit addition...");
    if (userLicenses.length > 0) {
      const testLicense = userLicenses[0];
      console.log(`   Current: ${testLicense.assessmentsAllowed} credits`);
      console.log("   Simulating: +1 credit");

      const updated = await prisma.userLicense.update({
        where: { id: testLicense.id },
        data: {
          assessmentsAllowed: {
            increment: 1,
          },
        },
      });

      console.log(`   ✅ Updated: ${updated.assessmentsAllowed} credits`);

      // Revert the change
      await prisma.userLicense.update({
        where: { id: testLicense.id },
        data: {
          assessmentsAllowed: {
            decrement: 1,
          },
        },
      });
      console.log("   ✅ Reverted test change");
    } else {
      console.log("   ⏭️  Skipped (no licenses to test with)");
    }

    console.log("\n✨ All tests completed!");
    console.log("\n📝 Next Steps:");
    console.log("1. Make sure your dev server is running: npm run dev");
    console.log("2. Run Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook");
    console.log("3. Copy the webhook secret (whsec_...) to .env.local as STRIPE_WEBHOOK_SECRET");
    console.log("4. Restart your dev server");
    console.log("5. Trigger a test: stripe trigger checkout.session.completed");
  } catch (error) {
    console.error("\n❌ Test failed!");
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testStripeWebhookFlow();
