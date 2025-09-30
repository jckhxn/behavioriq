const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixShortIds() {
  try {
    console.log("🔧 Fixing invalid shortIds in sample assessments...\n");

    // Find assessments with invalid shortIds (TEST-* format)
    const invalidAssessments = await prisma.assessment.findMany({
      where: {
        shortId: {
          startsWith: "TEST-",
        },
      },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
      },
    });

    console.log(
      `📍 Found ${invalidAssessments.length} assessments with invalid shortIds:`
    );
    invalidAssessments.forEach((assessment) => {
      console.log(`  - ${assessment.subjectName} (${assessment.shortId})`);
    });

    // Fix each assessment with a proper BIQ-XXXXXX shortId
    for (const assessment of invalidAssessments) {
      // Generate a new valid shortId
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let suffix = "";
      for (let i = 0; i < 6; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const newShortId = `BIQ-${suffix}`;

      // Update the assessment
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { shortId: newShortId },
      });

      console.log(`  ✅ Updated ${assessment.shortId} → ${newShortId}`);
    }

    console.log("\n🎉 All shortIds have been fixed!");
    console.log(
      "✨ Sample assessments should now be deletable from the main page."
    );
  } catch (error) {
    console.error("❌ Error fixing shortIds:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixShortIds()
    .then(() => {
      console.log(
        "\n🚀 ShortId fix complete! Try deleting the assessments now."
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to fix shortIds:", error);
      process.exit(1);
    });
}

module.exports = { fixShortIds };
