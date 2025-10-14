#!/usr/bin/env ts-node
/**
 * Environment Configuration Verification Script
 *
 * This script checks if all required environment variables are properly set
 * Run with: npx ts-node scripts/verify-env-config.ts
 */

import dotenv from "dotenv";
import path from "path";

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface EnvCheck {
  name: string;
  required: boolean;
  value?: string;
  status: "✅" | "❌" | "⚠️";
  message: string;
}

const checks: EnvCheck[] = [];

function checkEnvVar(name: string, required = true): EnvCheck {
  const value = process.env[name];

  if (!value) {
    return {
      name,
      required,
      status: required ? "❌" : "⚠️",
      message: required
        ? "Missing (REQUIRED)"
        : "Missing (optional, but recommended)",
    };
  }

  // Mask sensitive values
  const maskedValue =
    value.length > 10
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : "***";

  return {
    name,
    required,
    value: maskedValue,
    status: "✅",
    message: "Set correctly",
  };
}

console.log("🔍 Verifying Environment Configuration...\n");

// Check Supabase configuration
console.log("📦 Supabase Configuration:");
checks.push(checkEnvVar("NEXT_PUBLIC_SUPABASE_URL", true));
checks.push(checkEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true));
checks.push(checkEnvVar("SUPABASE_SERVICE_ROLE_KEY", true));

// Check Database
console.log("\n📊 Database Configuration:");
checks.push(checkEnvVar("DATABASE_URL", true));

// Check OpenAI
console.log("\n🤖 OpenAI Configuration:");
checks.push(checkEnvVar("OPENAI_API_KEY", true));

// Check Stripe
console.log("\n💳 Stripe Configuration:");
checks.push(checkEnvVar("STRIPE_SECRET_KEY", true));
checks.push(checkEnvVar("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", true));
checks.push(checkEnvVar("STRIPE_WEBHOOK_SECRET", true));

// Check Application URLs
console.log("\n🌐 Application URLs:");
checks.push(checkEnvVar("NEXT_PUBLIC_SITE_URL", true));
checks.push(checkEnvVar("NEXTAUTH_URL", true));

// Check NextAuth
console.log("\n🔐 NextAuth Configuration:");
checks.push(checkEnvVar("NEXTAUTH_SECRET", true));

// Print results
console.log("\n" + "=".repeat(80));
console.log("RESULTS:");
console.log("=".repeat(80) + "\n");

checks.forEach((check) => {
  console.log(`${check.status} ${check.name}`);
  console.log(`   ${check.message}`);
  if (check.value) {
    console.log(`   Value: ${check.value}`);
  }
  console.log();
});

// Summary
const failed = checks.filter((c) => c.status === "❌");
const warnings = checks.filter((c) => c.status === "⚠️");
const passed = checks.filter((c) => c.status === "✅");

console.log("=".repeat(80));
console.log("SUMMARY:");
console.log(`✅ Passed: ${passed.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log("=".repeat(80));

if (failed.length > 0) {
  console.log(
    "\n❌ CRITICAL: The following required environment variables are missing:\n"
  );
  failed.forEach((check) => {
    console.log(`   - ${check.name}`);
  });
  console.log("\nPlease add these to your .env.local file.");
  console.log("See README.md or docs/ for setup instructions.\n");
  process.exit(1);
}

if (warnings.length > 0) {
  console.log("\n⚠️  WARNING: The following optional variables are missing:\n");
  warnings.forEach((check) => {
    console.log(`   - ${check.name}`);
  });
  console.log();
}

console.log("\n✅ All required environment variables are configured!\n");
process.exit(0);
