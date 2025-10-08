const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugTestStudentAssessments() {
  try {
    console.log("🔍 Searching for Test Student user...\n");

    // Find Test Student user
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: "Test Student", mode: "insensitive" } },
          { email: { contains: "test", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            assessments: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log("❌ No Test Student user found");
      return;
    }

    console.log("Found users:");
    users.forEach((user) => {
      console.log(
        `  - ${user.name} (${user.email}): ${user._count.assessments} assessments`
      );
    });

    // For each user, check their assessments in detail
    for (const user of users) {
      console.log(
        `\n📋 Checking assessments for ${user.name} (${user.email}):`
      );

      const assessments = await prisma.assessment.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: {
              scores: true,
              recommendations: true,
              messages: true,
            },
          },
        },
      });

      if (assessments.length === 0) {
        console.log("  No assessments found");
        continue;
      }

      console.log(`  Found ${assessments.length} assessment(s):\n`);

      for (const assessment of assessments) {
        console.log(`  Assessment ID: ${assessment.id}`);
        console.log(`    Short ID: ${assessment.shortId || "N/A"}`);
        console.log(`    Template: ${assessment.templateName || "N/A"}`);
        console.log(`    Status: ${assessment.status}`);
        console.log(`    Completed: ${assessment.completedAt ? "Yes" : "No"}`);
        console.log(`    Related records:`);
        console.log(`      - Scores: ${assessment._count.scores}`);
        console.log(
          `      - Recommendations: ${assessment._count.recommendations}`
        );
        console.log(`      - Messages: ${assessment._count.messages}`);

        // Check if there are any share links
        const shareLinks = await prisma.shareableLink.findMany({
          where: { assessmentId: assessment.id },
        });

        if (shareLinks.length > 0) {
          console.log(`      - Share Links: ${shareLinks.length}`);
        }

        console.log("");
      }

      // Try to find any orphaned records that might prevent deletion
      console.log("  🔍 Checking for potential deletion blockers...\n");

      // Check for any records with foreign keys to these assessments
      const assessmentIds = assessments.map((a) => a.id);

      const scores = await prisma.score.count({
        where: { assessmentId: { in: assessmentIds } },
      });

      const recommendations = await prisma.recommendation.count({
        where: { assessmentId: { in: assessmentIds } },
      });

      const messages = await prisma.chatMessage.count({
        where: { assessmentId: { in: assessmentIds } },
      });

      const shareLinks = await prisma.shareableLink.count({
        where: { assessmentId: { in: assessmentIds } },
      });

      console.log(`  Total related records across all assessments:`);
      console.log(`    - Scores: ${scores}`);
      console.log(`    - Recommendations: ${recommendations}`);
      console.log(`    - Messages: ${messages}`);
      console.log(`    - Share Links: ${shareLinks}`);

      // Test deletion capability
      console.log("\n  🧪 Testing deletion capability...");

      const testAssessment = assessments[0];
      if (testAssessment) {
        console.log(
          `  Attempting to delete assessment ${testAssessment.id} in a transaction...`
        );

        try {
          await prisma.$transaction(async (tx) => {
            // Delete related records
            await tx.chatMessage.deleteMany({
              where: { assessmentId: testAssessment.id },
            });

            await tx.score.deleteMany({
              where: { assessmentId: testAssessment.id },
            });

            await tx.recommendation.deleteMany({
              where: { assessmentId: testAssessment.id },
            });

            await tx.shareableLink.deleteMany({
              where: { assessmentId: testAssessment.id },
            });

            // This will roll back, we're just testing if it would work
            throw new Error("Rolling back test transaction");
          });
        } catch (error) {
          if (error.message === "Rolling back test transaction") {
            console.log(
              "  ✅ Deletion would succeed (transaction rolled back)"
            );
          } else {
            console.log(`  ❌ Deletion would fail: ${error.message}`);
            console.log(`  Error details:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTestStudentAssessments();
