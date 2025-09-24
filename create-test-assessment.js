import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple shortId generator for testing (mimicking the actual one)
function generateShortId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "BIQ-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createTestMultiDomainAssessment() {
  console.log("Creating test multi-domain assessment...");

  // Your user ID from the visible assessments
  const userId = "cmflrzwa70001onnfgflir1wv";

  // Generate a shortId
  const shortId = generateShortId();

  // Create a new assessment with multiple domain scores
  const assessment = await prisma.assessment.create({
    data: {
      userId: userId,
      subjectName: "Multi-Domain Test",
      shortId: shortId,
      status: "COMPLETED",
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  console.log(
    `Created assessment: ${assessment.subjectName} (${assessment.shortId})`
  );

  // Add scores for multiple domains
  const scores = [
    { domain: "ANTISOCIAL", rawScore: 2, totalPossible: 12 },
    { domain: "VIOLENCE", rawScore: 1, totalPossible: 7 },
    { domain: "EMOTIONAL", rawScore: 3, totalPossible: 7 },
  ];

  for (const scoreData of scores) {
    await prisma.score.create({
      data: {
        assessmentId: assessment.id,
        domain: scoreData.domain,
        rawScore: scoreData.rawScore,
        totalPossible: scoreData.totalPossible,
        questionsAnswered: scoreData.rawScore, // Assuming each question can contribute 1 point
        riskLevel:
          scoreData.rawScore > scoreData.totalPossible * 0.5
            ? "MODERATE"
            : "LOW",
        confidence: 0.95,
        wasTerminatedEarly: false,
        timestamp: new Date(),
      },
    });

    console.log(
      `  Added score: ${scoreData.domain} = ${scoreData.rawScore}/${scoreData.totalPossible}`
    );
  }

  console.log(`\n✅ Test assessment created: ${assessment.shortId}`);
  console.log("This should now appear in your UI with 3 domain pills:");
  console.log('  - "Antisocial Behavior: 2/12"');
  console.log('  - "Violence Risk: 1/7"');
  console.log('  - "Emotional Regulation: 3/7"');

  await prisma.$disconnect();
}

createTestMultiDomainAssessment().catch(console.error);
