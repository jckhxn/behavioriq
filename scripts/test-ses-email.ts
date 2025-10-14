/**
 * SES Email Testing Script
 *
 * Tests AWS SES email functionality including:
 * - Basic email sending
 * - Assessment reports with PDF attachments
 * - License notifications
 * - Welcome emails
 *
 * IMPORTANT: AWS SES starts in sandbox mode
 * - Only verified email addresses can send/receive
 * - Verify your email in AWS SES Console before testing
 *
 * Usage:
 *   npx tsx scripts/test-ses-email.ts [test-type] [recipient-email]
 *
 * Test types:
 *   basic         - Send a basic test email
 *   assessment    - Send assessment report (mock PDF)
 *   license       - Send license expiration notification
 *   welcome       - Send welcome email
 *   all           - Run all tests
 *
 * Examples:
 *   npx tsx scripts/test-ses-email.ts basic your.email@example.com
 *   npx tsx scripts/test-ses-email.ts all your.email@example.com
 */

import { SESEmailService } from "@/lib/email/ses-email-service";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Validate environment configuration
function validateConfig() {
  const required = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "SES_FROM_EMAIL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nPlease set these in your .env.local file");
    process.exit(1);
  }

  // Check if USE_SES is enabled
  if (process.env.USE_SES !== "true") {
    console.warn("⚠️  USE_SES is not set to 'true' in .env.local");
    console.warn("   Emails will use fallback service instead of SES");
    console.warn("   Set USE_SES='true' to test SES directly\n");
  }

  console.log("✅ Environment configuration validated");
  console.log(`   AWS Region: ${process.env.AWS_REGION}`);
  console.log(`   From Email: ${process.env.SES_FROM_EMAIL}`);
  console.log(`   USE_SES: ${process.env.USE_SES}\n`);
}

// Test 1: Basic Email
async function testBasicEmail(to: string) {
  console.log("\n📧 Test 1: Basic Email");
  console.log("─".repeat(50));

  try {
    const result = await SESEmailService.sendEmail({
      to,
      subject: "SES Test Email - Basic",
      html: `
        <h1>SES Test Email</h1>
        <p>This is a test email from your AWS SES integration.</p>
        <p>If you're seeing this, your SES configuration is working correctly!</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      `,
      text: "This is a test email from your AWS SES integration.",
    });

    if (result.success) {
      console.log(`✅ Basic email sent successfully`);
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }

    return result.success;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Test 2: Assessment Report with Mock PDF
async function testAssessmentReport(to: string) {
  console.log("\n📊 Test 2: Assessment Report with PDF");
  console.log("─".repeat(50));

  try {
    // Create a simple mock PDF buffer
    const mockPDF = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Mock Assessment Report) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000317 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n410\n%%EOF"
    );

    const result = await SESEmailService.sendAssessmentReport({
      to,
      userName: "Test User",
      assessmentName: "Behavioral Assessment - Test",
      assessmentId: "test-" + Date.now(),
      pdfBuffer: mockPDF,
    });

    if (result.success) {
      console.log(`✅ Assessment report sent successfully`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   PDF Size: ${mockPDF.length} bytes`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }

    return result.success;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Test 3: License Expiration Notification
async function testLicenseNotification(to: string) {
  console.log("\n⚠️  Test 3: License Expiration Notification");
  console.log("─".repeat(50));

  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now

    const result = await SESEmailService.sendLicenseExpirationNotification({
      to,
      userName: "Test User",
      licenseType: "Professional License",
      expiryDate,
    });

    if (result.success) {
      console.log(`✅ License notification sent successfully`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Expiry Date: ${expiryDate.toLocaleDateString()}`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }

    return result.success;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Test 4: Welcome Email
async function testWelcomeEmail(to: string) {
  console.log("\n🎉 Test 4: Welcome Email");
  console.log("─".repeat(50));

  try {
    const result = await SESEmailService.sendWelcomeEmail({
      to,
      userName: "Test User",
    });

    if (result.success) {
      console.log(`✅ Welcome email sent successfully`);
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error(`❌ Failed: ${result.error}`);
    }

    return result.success;
  } catch (error) {
    console.error(`❌ Error:`, error);
    return false;
  }
}

// Main test runner
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || "all";
  const recipientEmail = args[1] || process.env.SES_FROM_EMAIL;

  if (!recipientEmail) {
    console.error("❌ Error: Recipient email is required");
    console.error(
      "   Usage: npx tsx scripts/test-ses-email.ts [test-type] [recipient-email]"
    );
    process.exit(1);
  }

  console.log("\n🔬 SES Email Testing Suite");
  console.log("=".repeat(50));
  console.log(`Test Type: ${testType}`);
  console.log(`Recipient: ${recipientEmail}`);
  console.log(
    "\n⚠️  SANDBOX MODE: Ensure recipient email is verified in AWS SES Console"
  );
  console.log("   https://console.aws.amazon.com/ses/home#verified-senders");

  validateConfig();

  const results: { [key: string]: boolean } = {};

  // Run tests based on type
  switch (testType.toLowerCase()) {
    case "basic":
      results.basic = await testBasicEmail(recipientEmail);
      break;

    case "assessment":
      results.assessment = await testAssessmentReport(recipientEmail);
      break;

    case "license":
      results.license = await testLicenseNotification(recipientEmail);
      break;

    case "welcome":
      results.welcome = await testWelcomeEmail(recipientEmail);
      break;

    case "all":
      results.basic = await testBasicEmail(recipientEmail);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay

      results.assessment = await testAssessmentReport(recipientEmail);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay

      results.license = await testLicenseNotification(recipientEmail);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay

      results.welcome = await testWelcomeEmail(recipientEmail);
      break;

    default:
      console.error(`❌ Unknown test type: ${testType}`);
      console.error(
        "   Valid types: basic, assessment, license, welcome, all"
      );
      process.exit(1);
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

  if (passed === total) {
    console.log("\n🎉 All tests passed! SES is working correctly.");
    console.log("\n💡 Next Steps:");
    console.log("   1. Check your email inbox for test messages");
    console.log("   2. Verify email formatting and attachments");
    console.log("   3. Request production access in AWS SES Console");
    console.log("   4. Add more verified recipients if needed");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
    console.log("\n🔍 Troubleshooting:");
    console.log("   1. Verify AWS credentials are correct");
    console.log("   2. Ensure recipient email is verified in SES");
    console.log("   3. Check AWS CloudWatch logs for detailed errors");
    console.log("   4. Verify SES sending limits haven't been exceeded");
    process.exit(1);
  }
}

// Run the test suite
main().catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
