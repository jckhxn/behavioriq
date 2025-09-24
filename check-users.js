import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkUserAssessments() {
  console.log("Assessments visible in your UI:");
  console.log("================================");

  // Get the assessments that appear in your screenshot
  const visibleAssessments = [
    "BIQ-61CSHV",
    "BIQ-IBMRTD",
    "BIQ-IR8X6R",
    "BIQ-AJEVI7",
  ];

  for (const shortId of visibleAssessments) {
    const assessment = await prisma.assessment.findFirst({
      where: { shortId },
      select: {
        shortId: true,
        subjectName: true,
        userId: true,
      },
    });

    if (assessment) {
      console.log(
        `${assessment.subjectName} (${assessment.shortId}) - User: ${assessment.userId}`
      );
    }
  }

  console.log("\nMulti-domain assessments:");
  console.log("=========================");

  // Check multi-domain assessments
  const multiDomainAssessments = ["BIQ-8KG6KE", "BIQ-HFGD6A", "BIQ-EIKFQ5"];

  for (const shortId of multiDomainAssessments) {
    const assessment = await prisma.assessment.findFirst({
      where: { shortId },
      select: {
        shortId: true,
        subjectName: true,
        userId: true,
      },
    });

    if (assessment) {
      console.log(
        `${assessment.subjectName} (${assessment.shortId}) - User: ${assessment.userId}`
      );
    }
  }

  await prisma.$disconnect();
}

checkUserAssessments().catch(console.error);
