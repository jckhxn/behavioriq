/**
 * Add Credits Script
 * Adds assessment credits to a user's account
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addCredits(emailOrId, amount) {
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

    // Get user's active license
    let userLicense = await prisma.userLicense.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        license: true,
      },
    });

    if (!userLicense) {
      console.log(
        "\n📝 No active license found. Creating new BASIC license..."
      );

      // Generate license key
      const licenseKey = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create license
      const license = await prisma.license.create({
        data: {
          licenseKey,
          type: "BASIC",
          status: "ACTIVE",
          maxAssessments: amount,
          maxUsers: 1,
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      // Create user license
      userLicense = await prisma.userLicense.create({
        data: {
          userId: user.id,
          licenseId: license.id,
          isActive: true,
          assessmentsAllowed: amount,
          assessmentsUsed: 0,
        },
        include: {
          license: true,
        },
      });

      console.log(`✅ Created new license: ${licenseKey}`);
    } else {
      console.log(`\n📜 Current License: ${userLicense.license.licenseKey}`);
      console.log(`   Type: ${userLicense.license.type}`);
      console.log(
        `   Credits before: ${userLicense.assessmentsAllowed - userLicense.assessmentsUsed}`
      );

      // Update user license
      await prisma.userLicense.update({
        where: { id: userLicense.id },
        data: {
          assessmentsAllowed: {
            increment: amount,
          },
        },
      });

      // Update license
      await prisma.license.update({
        where: { id: userLicense.license.id },
        data: {
          maxAssessments: {
            increment: amount,
          },
          status: "ACTIVE",
        },
      });

      // Fetch updated data
      userLicense = await prisma.userLicense.findUnique({
        where: { id: userLicense.id },
        include: { license: true },
      });
    }

    console.log(`\n✅ Added ${amount} credit(s)!`);
    console.log(`\n📊 Updated Status:`);
    console.log(`   Assessments Allowed: ${userLicense.assessmentsAllowed}`);
    console.log(`   Assessments Used: ${userLicense.assessmentsUsed}`);
    console.log(
      `   Credits Remaining: ${userLicense.assessmentsAllowed - userLicense.assessmentsUsed}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run the script
const emailOrId = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!emailOrId || !amount || isNaN(amount)) {
  console.log("Usage: node scripts/add-credits.js <email-or-user-id> <amount>");
  console.log("\nExample:");
  console.log("  node scripts/add-credits.js user@example.com 1");
  console.log("  node scripts/add-credits.js user@example.com 5");
  process.exit(1);
}

if (amount <= 0) {
  console.log("❌ Amount must be a positive number");
  process.exit(1);
}

addCredits(emailOrId, amount)
  .then(() => {
    console.log("\n🎉 Credits added successfully!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to add credits:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
