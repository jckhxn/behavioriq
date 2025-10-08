/**
 * Check User Credits Script
 * Displays current credit status and allows adding credits
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkUserCredits(emailOrId) {
  try {
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrId }, { id: emailOrId }],
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${emailOrId}`);
      return;
    }

    console.log(`\n👤 User: ${user.name || user.email}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);

    // Get user licenses
    const userLicenses = await prisma.userLicense.findMany({
      where: { userId: user.id },
      include: {
        license: true,
      },
      orderBy: { assignedAt: "desc" },
    });

    console.log(`\n📜 Licenses (${userLicenses.length} total):`);

    if (userLicenses.length === 0) {
      console.log("   ❌ No licenses found!");
      console.log("\n💡 To add a license:");
      console.log(`   node scripts/add-credits.js ${user.email} 1`);
      return user;
    }

    userLicenses.forEach((ul, index) => {
      const isActive = ul.isActive ? "✅" : "❌";
      console.log(`\n   ${index + 1}. ${isActive} ${ul.license.type} License`);
      console.log(`      License Key: ${ul.license.licenseKey}`);
      console.log(`      Active: ${ul.isActive}`);
      console.log(`      Assessments Allowed: ${ul.assessmentsAllowed}`);
      console.log(`      Assessments Used: ${ul.assessmentsUsed}`);
      console.log(
        `      Credits Remaining: ${ul.assessmentsAllowed - ul.assessmentsUsed}`
      );
      console.log(`      Assigned: ${ul.assignedAt.toLocaleDateString()}`);

      if (ul.license.type === "BASIC") {
        const remaining = ul.assessmentsAllowed - ul.assessmentsUsed;
        if (remaining <= 0) {
          console.log(`      ⚠️  NO CREDITS REMAINING!`);
        } else if (remaining === 1) {
          console.log(`      ⚠️  Only 1 credit remaining`);
        }
      }
    });

    // Get payments
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(
      `\n💳 Recent Payments (${payments.length} total, showing last 5):`
    );
    if (payments.length === 0) {
      console.log("   No payments found");
    } else {
      payments.forEach((p, index) => {
        console.log(`\n   ${index + 1}. ${p.status} - $${p.amount / 100}`);
        console.log(`      Plan: ${p.plan}`);
        console.log(`      Date: ${p.createdAt.toLocaleDateString()}`);
        console.log(
          `      Payment Intent: ${p.stripePaymentIntentId || "N/A"}`
        );
      });
    }

    // Check assessments
    const assessments = await prisma.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    console.log(
      `\n📊 Assessments (${assessments.length} total, showing last 5):`
    );
    if (assessments.length === 0) {
      console.log("   No assessments found");
    } else {
      assessments.forEach((a, index) => {
        console.log(`\n   ${index + 1}. ${a.subjectName || "Unnamed"}`);
        console.log(`      Status: ${a.status}`);
        console.log(`      Created: ${a.createdAt.toLocaleDateString()}`);
        if (a.completedAt) {
          console.log(`      Completed: ${a.completedAt.toLocaleDateString()}`);
        }
      });
    }

    return user;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
const emailOrId = process.argv[2];

if (!emailOrId) {
  console.log("Usage: node scripts/check-user-credits.js <email-or-user-id>");
  console.log("\nExample:");
  console.log("  node scripts/check-user-credits.js user@example.com");
  process.exit(1);
}

checkUserCredits(emailOrId)
  .then(() => {
    console.log("\n✅ Done!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
