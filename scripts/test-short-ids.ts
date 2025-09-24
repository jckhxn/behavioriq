import { PrismaClient, AssessmentDomain } from "@prisma/client";
import { DOMAIN_LABELS } from "../lib/constants/domains";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing shortId generation and retrieval...");

  try {
    // Check if there are any existing assessments
    const existingAssessments = await prisma.assessment.findMany({
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        status: true,
      },
      take: 5,
    });

    console.log("\nExisting assessments:");
    existingAssessments.forEach((assessment: any) => {
      console.log(
        `- ${assessment.subjectName}: UUID=${assessment.id.slice(0, 8)}..., shortId=${assessment.shortId || "null"}`
      );
    });

    // Test the domain labels
    console.log("\nDomain labels test:");
    console.log("ANTISOCIAL:", DOMAIN_LABELS[AssessmentDomain.ANTISOCIAL]);
    console.log("VIOLENCE:", DOMAIN_LABELS[AssessmentDomain.VIOLENCE]);
    console.log("ATTENTION:", DOMAIN_LABELS[AssessmentDomain.ATTENTION]);
    console.log("EMOTIONAL:", DOMAIN_LABELS[AssessmentDomain.EMOTIONAL]);
    console.log("CONDUCT:", DOMAIN_LABELS[AssessmentDomain.CONDUCT]);

    // Test shortId resolution
    if (existingAssessments.length > 0) {
      const { resolveAssessmentId, getAssessmentByIdentifier } = await import(
        "../lib/utils/assessmentResolver"
      );

      const testAssessment = existingAssessments[0];
      if (testAssessment.shortId) {
        console.log(
          `\nTesting shortId resolution for ${testAssessment.shortId}:`
        );
        const resolvedId = await resolveAssessmentId(
          testAssessment.shortId,
          prisma
        );
        console.log(`Resolved UUID: ${resolvedId}`);
        console.log(`Matches original: ${resolvedId === testAssessment.id}`);

        const fullAssessment = await getAssessmentByIdentifier(
          testAssessment.shortId,
          prisma
        );
        console.log(
          `Full assessment retrieved: ${fullAssessment?.subjectName}`
        );
      } else {
        console.log(
          "\nNo shortId found on existing assessments - they may need to be populated"
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
