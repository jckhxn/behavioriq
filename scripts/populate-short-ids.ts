import { PrismaClient } from "@prisma/client";
import { generateUniqueShortAssessmentId } from "../lib/utils/shortId";

const prisma = new PrismaClient();

async function populateShortIds() {
  console.log("Starting to populate shortId for existing assessments...");

  // Get all assessments without shortId
  const assessments = await prisma.assessment.findMany({
    where: {
      shortId: null,
    },
    select: {
      id: true,
    },
  });

  console.log(`Found ${assessments.length} assessments without shortId`);

  // Helper function to check if shortId exists
  const shortIdExists = async (shortId: string): Promise<boolean> => {
    const existing = await prisma.assessment.findUnique({
      where: { shortId },
      select: { id: true },
    });
    return !!existing;
  };

  // Update each assessment with a unique shortId
  for (const assessment of assessments) {
    try {
      const shortId = await generateUniqueShortAssessmentId(shortIdExists);

      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { shortId },
      });

      console.log(
        `Updated assessment ${assessment.id} with shortId: ${shortId}`
      );
    } catch (error) {
      console.error(`Failed to update assessment ${assessment.id}:`, error);
    }
  }

  console.log("Finished populating shortIds");
}

populateShortIds()
  .catch((error) => {
    console.error("Error populating shortIds:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
