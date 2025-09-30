const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugAssessmentIssue() {
  try {
    console.log("🔍 Debugging assessment deletion issue...\n");

    // 1. Check all users in the system
    console.log("📋 Users in the system:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });

    // 2. Check all assessments and their ownership
    console.log("\n📊 Assessments in the system:");
    const assessments = await prisma.assessment.findMany({
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
        userId: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    assessments.forEach((assessment) => {
      console.log(`  - ${assessment.subjectName} (${assessment.shortId})`);
      console.log(
        `    Owner: ${assessment.user.email} (${assessment.user.role})`
      );
      console.log(`    Status: ${assessment.status}`);
      console.log(`    Assessment ID: ${assessment.id}`);
      console.log(`    User ID: ${assessment.userId}\n`);
    });

    // 3. Check if admin can see all assessments (for admin functionality)
    const adminUser = users.find((u) => u.role === "ADMIN");
    if (adminUser) {
      console.log("🔑 Admin user found:", adminUser.email);

      // Check if there are assessments that the admin should be able to manage
      const adminOwnedAssessments = assessments.filter(
        (a) => a.userId === adminUser.id
      );
      const otherUserAssessments = assessments.filter(
        (a) => a.userId !== adminUser.id
      );

      console.log(
        `  - Admin owned assessments: ${adminOwnedAssessments.length}`
      );
      console.log(
        `  - Other users' assessments: ${otherUserAssessments.length}`
      );

      if (otherUserAssessments.length > 0) {
        console.log("\n⚠️  ISSUE IDENTIFIED:");
        console.log(
          "  Admin can see assessments from other users on the main page,"
        );
        console.log(
          "  but the deletion API only allows users to delete their own assessments."
        );
        console.log(
          "  This creates the \"can't delete\" issue you're experiencing."
        );
      }
    }

    return { users, assessments, adminUser };
  } catch (error) {
    console.error("❌ Error debugging assessment issue:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function fixAssessmentOwnership() {
  try {
    console.log("\n🔧 Attempting to fix assessment ownership...");

    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("❌ No admin user found");
      return;
    }

    // Update sample assessments to be owned by admin
    const result = await prisma.assessment.updateMany({
      where: {
        subjectName: "Sample Student", // Our sample assessment
      },
      data: {
        userId: adminUser.id,
      },
    });

    console.log(
      `✅ Updated ${result.count} sample assessments to be owned by admin (${adminUser.email})`
    );
  } catch (error) {
    console.error("❌ Error fixing assessment ownership:", error);
    throw error;
  }
}

// Run the debugging
if (require.main === module) {
  debugAssessmentIssue()
    .then(async ({ adminUser }) => {
      if (adminUser) {
        await fixAssessmentOwnership();
        console.log("\n✨ Assessment ownership fixed!");
        console.log(
          "🎯 Now try deleting the sample assessment from the main page."
        );
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to debug/fix assessment issue:", error);
      process.exit(1);
    });
}

module.exports = { debugAssessmentIssue, fixAssessmentOwnership };
