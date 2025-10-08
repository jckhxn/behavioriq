const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function deleteTestAssessments() {
  try {
    console.log(
      '🔍 Finding all assessments with "TEST-" prefix in shortId...\n'
    );

    // Find all assessments with TEST- prefix
    const testAssessments = await prisma.assessment.findMany({
      where: {
        shortId: {
          startsWith: "TEST-",
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            scores: true,
            recommendations: true,
            messages: true,
            shareableLinks: true,
          },
        },
      },
    });

    if (testAssessments.length === 0) {
      console.log("✅ No test assessments found!");
      return;
    }

    console.log(`Found ${testAssessments.length} test assessment(s):\n`);

    testAssessments.forEach((assessment, idx) => {
      console.log(`${idx + 1}. ${assessment.shortId}`);
      console.log(`   Subject: ${assessment.subjectName}`);
      console.log(
        `   User: ${assessment.user.name} (${assessment.user.email})`
      );
      console.log(`   Status: ${assessment.status}`);
      console.log(`   Created: ${assessment.startedAt}`);
      console.log(`   Related records:`);
      console.log(`     - Scores: ${assessment._count.scores}`);
      console.log(`     - Messages: ${assessment._count.messages}`);
      console.log(
        `     - Recommendations: ${assessment._count.recommendations}`
      );
      console.log(`     - Share Links: ${assessment._count.shareableLinks}`);
      console.log("");
    });

    console.log(
      `\n⚠️  Preparing to delete ${testAssessments.length} assessments...\n`
    );

    let deletedCount = 0;
    let failedCount = 0;
    const failedAssessments = [];

    for (const assessment of testAssessments) {
      try {
        console.log(`Deleting ${assessment.shortId}...`);

        await prisma.$transaction(async (tx) => {
          // Delete related records first (foreign key constraints)
          await tx.chatMessage.deleteMany({
            where: { assessmentId: assessment.id },
          });

          await tx.score.deleteMany({
            where: { assessmentId: assessment.id },
          });

          await tx.recommendation.deleteMany({
            where: { assessmentId: assessment.id },
          });

          await tx.shareableLink.deleteMany({
            where: { assessmentId: assessment.id },
          });

          // Delete the assessment
          await tx.assessment.delete({
            where: { id: assessment.id },
          });
        });

        console.log(`  ✅ Deleted successfully`);
        deletedCount++;
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        failedCount++;
        failedAssessments.push({
          shortId: assessment.shortId,
          error: error.message,
        });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successfully deleted: ${deletedCount}`);
    console.log(`  ❌ Failed to delete: ${failedCount}`);

    if (failedAssessments.length > 0) {
      console.log(`\n⚠️  Failed assessments:`);
      failedAssessments.forEach((fail) => {
        console.log(`  - ${fail.shortId}: ${fail.error}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestAssessments();
