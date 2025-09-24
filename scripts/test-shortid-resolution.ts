import { PrismaClient } from "@prisma/client";
import { resolveAssessmentId } from "../lib/utils/assessmentResolver";

const prisma = new PrismaClient();

async function testShortIdResolution() {
  console.log("🧪 TESTING SHORTID RESOLUTION");
  console.log("==============================");

  try {
    // Get a few recent assessments to test with
    const assessments = await prisma.assessment.findMany({
      where: {
        shortId: { not: null },
      },
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        userId: true,
      },
      take: 3,
      orderBy: { startedAt: "desc" },
    });

    console.log(
      `\n📋 Found ${assessments.length} assessments with shortIds to test:`
    );

    for (const assessment of assessments) {
      console.log(
        `\n🔍 Testing ${assessment.shortId} (${assessment.subjectName}):`
      );
      console.log(`   UUID: ${assessment.id}`);

      // Test shortId resolution
      const resolvedId = await resolveAssessmentId(
        assessment.shortId!,
        assessment.userId
      );
      const isCorrect = resolvedId === assessment.id;

      console.log(`   Resolved UUID: ${resolvedId}`);
      console.log(`   ✅ Resolution ${isCorrect ? "PASSED" : "FAILED"}`);

      if (!isCorrect) {
        console.log(`   ❌ Expected: ${assessment.id}`);
        console.log(`   ❌ Got: ${resolvedId}`);
      }
    }

    console.log(`\n💡 API Endpoint Test:`);
    console.log(`   Now try starting a new assessment or accessing:`);
    assessments.forEach((assessment) => {
      console.log(
        `   - http://localhost:3001/assessment/${assessment.shortId}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testShortIdResolution();
