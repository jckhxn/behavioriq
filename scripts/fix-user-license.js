const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixUserLicense() {
  try {
    const email = "user@example.com";

    console.log(`🔧 Fixing license for ${email}...\n`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });
    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log(`✅ User found: ${user.name || user.email}`);
    console.log(`   ID: ${user.id}\n`);

    // Check existing licenses
    if (user.licenses.length > 0) {
      console.log("📋 Existing licenses:");
      user.licenses.forEach((ul, i) => {
        console.log(`   ${i + 1}. Type: ${ul.license.type}`);
        console.log(`      Allowed: ${ul.assessmentsAllowed}`);
        console.log(`      Used: ${ul.assessmentsUsed}`);
        console.log(
          `      Remaining: ${ul.assessmentsAllowed - ul.assessmentsUsed}`
        );
        console.log(`      Active: ${ul.isActive}`);
      });

      // Just activate the first one and add credits
      const firstLicense = user.userLicenses[0];
      console.log(`\n🔧 Updating first license...`);

      await prisma.userLicense.update({
        where: { id: firstLicense.id },
        data: {
          isActive: true,
          assessmentsAllowed: 3, // Give 3 credits for testing
          assessmentsUsed: 0,
        },
      });

      console.log(`✅ License updated! User now has 3 credits`);
      return;
    }

    // No licenses - create one
    console.log("📝 Creating new license...\n");

    // Generate license key
    function generateLicenseKey() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const segments = 4;
      const segmentLength = 4;
      const key = [];

      for (let i = 0; i < segments; i++) {
        let segment = "";
        for (let j = 0; j < segmentLength; j++) {
          segment += chars[Math.floor(Math.random() * chars.length)];
        }
        key.push(segment);
      }

      return key.join("-");
    }

    const licenseKey = generateLicenseKey();

    // Create license
    const license = await prisma.license.create({
      data: {
        licenseKey,
        type: "BASIC",
        status: "ACTIVE",
        maxAssessments: 3,
        maxUsers: 1,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    console.log(`✅ License created: ${license.licenseKey}`);
    console.log(`   Type: ${license.type}`);
    console.log(`   Max Assessments: ${license.maxAssessments}\n`);

    // Create user license
    const userLicense = await prisma.userLicense.create({
      data: {
        userId: user.id,
        licenseId: license.id,
        isActive: true,
        assessmentsAllowed: 3, // Give 3 credits for testing
        assessmentsUsed: 0,
      },
    });

    console.log(`✅ UserLicense created!`);
    console.log(`   Assessments Allowed: ${userLicense.assessmentsAllowed}`);
    console.log(`   Assessments Used: ${userLicense.assessmentsUsed}`);
    console.log(
      `   Credits Remaining: ${userLicense.assessmentsAllowed - userLicense.assessmentsUsed}`
    );

    console.log(`\n🎉 Done! User now has 3 assessment credits`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserLicense();
