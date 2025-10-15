#!/usr/bin/env tsx
// @ts-nocheck
/**
 * Test database connection
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { prisma } from "../lib/db/prisma";

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test 1: Simple query
    console.log("Test 1: Executing simple query...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection successful!");
    console.log("   Result:", result);

    // Test 2: Check if User table exists
    console.log("\nTest 2: Checking User table...");
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists with ${userCount} users`);

    // Test 3: Check if UserLicense table exists
    console.log("\nTest 3: Checking UserLicense table...");
    const licenseCount = await prisma.userLicense.count();
    console.log(`✅ UserLicense table exists with ${licenseCount} licenses`);

    console.log("\n✨ All database tests passed!");
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes("Can't reach database")) {
      console.log("\n💡 Tip: Your Supabase database might be paused.");
      console.log("   1. Go to https://supabase.com/dashboard");
      console.log("   2. Open your project: tzvqfmeaqdykkyvbpena");
      console.log("   3. Navigate to SQL Editor");
      console.log("   4. Run any query (e.g., SELECT 1) to wake it up");
      console.log("   5. Wait 10-30 seconds and try again");
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
