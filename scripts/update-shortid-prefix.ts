import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateAssessmentsToNewPrefix() {
  console.log("🔄 Updating assessment shortIds from ASS- to BIQ- prefix...");

  try {
    // Find all assessments with ASS- prefix
    const assessmentsWithOldPrefix = await prisma.assessment.findMany({
      where: {
        shortId: {
          startsWith: "ASS-",
        },
      },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
      },
    });

    console.log(
      `Found ${assessmentsWithOldPrefix.length} assessments with ASS- prefix`
    );

    if (assessmentsWithOldPrefix.length === 0) {
      console.log("✅ No assessments need updating");
      return;
    }

    // Update each assessment
    for (const assessment of assessmentsWithOldPrefix) {
      if (!assessment.shortId) continue;

      const newShortId = assessment.shortId.replace(/^ASS-/, "BIQ-");

      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { shortId: newShortId },
      });

      console.log(
        `  ✅ ${assessment.subjectName}: ${assessment.shortId} → ${newShortId}`
      );
    }

    console.log(
      `\n✅ Successfully updated ${assessmentsWithOldPrefix.length} assessments!`
    );

    // Verify the changes
    const verifyCount = await prisma.assessment.count({
      where: {
        shortId: {
          startsWith: "BIQ-",
        },
      },
    });

    console.log(`\n📊 Total assessments with BIQ- prefix: ${verifyCount}`);
  } catch (error) {
    console.error("❌ Error updating assessments:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAssessmentsToNewPrefix();
