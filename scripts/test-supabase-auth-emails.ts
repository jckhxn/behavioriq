/**
 * Supabase Authentication Email Testing Script
 *
 * Tests Supabase authentication flows with SES SMTP:
 * - Magic Link
 * - Password Reset
 * - Email Verification
 *
 * Prerequisites:
 * 1. Supabase SMTP configured with SES credentials
 * 2. Email templates updated in Supabase Dashboard
 * 3. Test email address verified in SES (if in sandbox)
 *
 * Usage:
 *   npx tsx scripts/test-supabase-auth-emails.ts [test-email@example.com]
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validation
function validateConfig() {
  console.log("✅ Supabase Configuration:");
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Anon Key: ${supabaseAnonKey?.slice(0, 20)}...`);
  console.log(`   Site URL: ${process.env.NEXT_PUBLIC_SITE_URL || "Not set"}\n`);
}

// Test 1: Magic Link Email
async function testMagicLink(email: string) {
  console.log("\n🔐 Test 1: Magic Link Email");
  console.log("─".repeat(50));

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      console.error(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Magic link email sent to ${email}`);
    console.log(`   Check your inbox for the email`);
    console.log(
      `   Expected from: ${process.env.SES_FROM_EMAIL || "AI Diagnostic"}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Test 2: Password Reset Email
async function testPasswordReset(email: string) {
  console.log("\n🔒 Test 2: Password Reset Email");
  console.log("─".repeat(50));

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    });

    if (error) {
      console.error(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Password reset email sent to ${email}`);
    console.log(`   Check your inbox for the email`);
    console.log(
      `   Expected from: ${process.env.SES_FROM_EMAIL || "AI Diagnostic"}`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Test 3: Check User Exists
async function checkUserExists(email: string): Promise<boolean> {
  console.log("\n👤 Checking if user exists...");
  console.log("─".repeat(50));

  try {
    // Try to sign in with an invalid password to check if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "test-invalid-password-" + Date.now(),
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        console.log(`✅ User exists: ${email}`);
        return true;
      } else if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("not found")
      ) {
        console.log(`ℹ️  User may not exist or email not confirmed: ${email}`);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error checking user:`, error);
    return false;
  }
}

// Test 4: Sign Up (Email Verification)
async function testSignUp(email: string) {
  console.log("\n📧 Test 3: Email Verification (Sign Up)");
  console.log("─".repeat(50));

  const testPassword = "TestPassword123!@#";

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log(
          `ℹ️  User already exists. Skipping sign up test for ${email}`
        );
        console.log(
          `   Use a new email address if you want to test email verification`
        );
        return false;
      }
      console.error(`❌ Failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Sign up successful for ${email}`);
    console.log(`   Check your inbox for the verification email`);
    console.log(
      `   Expected from: ${process.env.SES_FROM_EMAIL || "AI Diagnostic"}`
    );
    console.log(`\n   ⚠️  NOTE: Test account created with password: ${testPassword}`);
    console.log(`   You may want to delete this test user later`);
    return true;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Main test runner
async function main() {
  const args = process.argv.slice(2);
  const testEmail =
    args[0] || process.env.SES_FROM_EMAIL || "test@example.com";

  console.log("\n🧪 Supabase Authentication Email Testing Suite");
  console.log("=".repeat(50));
  console.log(`Test Email: ${testEmail}`);
  console.log(
    "\n⚠️  IMPORTANT: Ensure this email is verified in AWS SES Console"
  );
  console.log("   if you're still in SES sandbox mode.\n");

  validateConfig();

  console.log("📋 Test Plan:");
  console.log("   1. Send Magic Link email");
  console.log("   2. Send Password Reset email");
  console.log("   3. Send Email Verification (if user doesn't exist)\n");
  console.log("─".repeat(50));

  // Wait for user confirmation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const results: { [key: string]: boolean } = {};

  // Check if user exists first
  const userExists = await checkUserExists(testEmail);

  // Test 1: Magic Link
  results.magicLink = await testMagicLink(testEmail);
  await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay

  // Test 2: Password Reset
  if (userExists) {
    results.passwordReset = await testPasswordReset(testEmail);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
  } else {
    console.log(
      "\nℹ️  Skipping password reset test (user doesn't exist yet)"
    );
  }

  // Test 3: Sign Up / Email Verification
  if (!userExists) {
    results.emailVerification = await testSignUp(testEmail);
  } else {
    console.log(
      `\nℹ️  Skipping sign up test (user already exists: ${testEmail})`
    );
    console.log(`   Use a different email if you want to test email verification`);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 Test Summary");
  console.log("=".repeat(50));

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, success]) => {
    console.log(`${success ? "✅" : "❌"} ${test}`);
  });

  console.log("\n" + "─".repeat(50));
  console.log(`Result: ${passed}/${total} tests passed`);

  if (passed === total && total > 0) {
    console.log("\n🎉 All tests passed!");
    console.log("\n📬 Action Items:");
    console.log(
      `   1. Check inbox for ${testEmail} (may take 1-2 minutes)`
    );
    console.log("   2. Verify emails are from: " + process.env.SES_FROM_EMAIL);
    console.log("   3. Check email formatting and branding");
    console.log("   4. Click links to verify they work correctly");
    console.log("   5. Check AWS SES Console → Sending Statistics");
    console.log("\n💡 Next Steps:");
    console.log(
      "   - If emails look good, mark Phase 3 as complete ✅"
    );
    console.log("   - Customize email templates further if needed");
    console.log("   - Test with additional email addresses");
    console.log("   - Request SES production access (if still in sandbox)");
  } else if (total === 0) {
    console.log("\n⚠️  No tests were run.");
    console.log("\n🔍 Possible reasons:");
    console.log(`   - User already exists: ${testEmail}`);
    console.log("   - Try running with a different email address");
    console.log(
      `   - Example: npx tsx scripts/test-supabase-auth-emails.ts newuser@example.com`
    );
  } else {
    console.log("\n⚠️  Some tests failed.");
    console.log("\n🔍 Troubleshooting:");
    console.log("   1. Verify SMTP is configured in Supabase Dashboard");
    console.log("   2. Check AWS SES Console for errors");
    console.log("   3. Ensure sender email is verified in SES");
    console.log("   4. Check Supabase Dashboard → Authentication → Logs");
    console.log(
      "   5. Verify email templates are saved in Supabase Dashboard"
    );
  }

  console.log("\n");
}

// Run the test suite
main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
