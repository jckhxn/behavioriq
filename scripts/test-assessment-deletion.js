const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDeletion() {
  try {
    console.log("🧪 Testing assessment deletion...\n");

    // Find Test User
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
      include: {
        _count: {
          select: { assessments: true },
        },
      },
    });

    if (!user) {
      console.log("❌ Test user not found");
      return;
    }

    console.log(
      `Found test user: ${user.email} with ${user._count.assessments} assessments\n`
    );

    // Get the first assessment
    const assessment = await prisma.assessment.findFirst({
      where: { userId: user.id },
      include: {
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

    if (!assessment) {
      console.log("❌ No assessments found to delete");
      return;
    }

    console.log(`Found assessment to delete:`);
    console.log(`  ID: ${assessment.id}`);
    console.log(`  Short ID: ${assessment.shortId || "N/A"}`);
    console.log(`  Status: ${assessment.status}`);
    console.log(`  Related records:`);
    console.log(`    - Scores: ${assessment._count.scores}`);
    console.log(`    - Recommendations: ${assessment._count.recommendations}`);
    console.log(`    - Messages: ${assessment._count.messages}`);
    console.log(`    - Share Links: ${assessment._count.shareableLinks}`);

    console.log(`\n⚠️  Deleting assessment ${assessment.id}...\n`);

    // Delete the assessment
    await prisma.$transaction(async (tx) => {
      // Delete related records first
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

    console.log("✅ Assessment deleted successfully!\n");

    // Check remaining assessments
    const remainingCount = await prisma.assessment.count({
      where: { userId: user.id },
    });

    console.log(`Remaining assessments for ${user.email}: ${remainingCount}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeletion();
