const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAssessmentDetails() {
  try {
    const assessmentId = "cmg8se2ml0001on9gl4hyh32k";

    console.log(`🔍 Checking assessment: ${assessmentId}\n`);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: true,
        responses: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assessment) {
      console.log("❌ Assessment not found");
      return;
    }

    console.log("✅ Assessment found:");
    console.log(`  ID: ${assessment.id}`);
    console.log(`  Short ID: ${assessment.shortId || "null"}`);
    console.log(`  Subject Name: ${assessment.subjectName}`);
    console.log(`  Template Name: ${assessment.templateName || "null"}`);
    console.log(`  Status: ${assessment.status}`);
    console.log(`  Mode: ${assessment.mode || "null"}`);
    console.log(`  Is Trial: ${assessment.isTrial}`);
    console.log(`  Started At: ${assessment.startedAt}`);
    console.log(`  Completed At: ${assessment.completedAt || "null"}`);
    console.log(`  Has Enhanced Report: ${assessment.hasEnhancedReport}`);
    console.log(
      `  Enhanced Report Purchased At: ${assessment.enhancedReportPurchasedAt || "null"}\n`
    );

    console.log("👤 User:");
    console.log(`  Name: ${assessment.user.name}`);
    console.log(`  Email: ${assessment.user.email}\n`);

    console.log("📊 Data:");
    console.log(`  Scores: ${assessment.scores.length}`);
    console.log(`  Responses: ${assessment.responses.length}`);
    console.log(
      `  Child Responses: ${assessment.childResponses ? "Yes" : "No"}`
    );
    console.log(
      `  Enhanced Analysis: ${assessment.enhancedAnalysis ? "Yes" : "No"}\n`
    );

    // Check if there are responses in the childResponses JSON
    if (assessment.childResponses) {
      console.log("📝 Child Responses (from JSON field):");
      const childResponses = JSON.parse(
        JSON.stringify(assessment.childResponses)
      );
      if (Array.isArray(childResponses)) {
        console.log(`  Array with ${childResponses.length} items`);
      } else if (childResponses.responses) {
        console.log(
          `  Object with 'responses' array: ${childResponses.responses.length} items`
        );
      } else {
        console.log(`  Type: ${typeof childResponses}`);
        console.log(`  Keys: ${Object.keys(childResponses).join(", ")}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssessmentDetails();
