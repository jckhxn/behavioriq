const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Domain names mapping for better display
const domainDisplayNames = {
  ANTISOCIAL: "Antisocial Behavior",
  VIOLENCE: "Violence Risk",
  ATTENTION: "Attention Issues",
  EMOTIONAL: "Emotional Regulation",
  CONDUCT: "Conduct Problems",
};

// Risk levels for variety
const riskLevels = ["LOW", "MODERATE", "HIGH", "VERY_HIGH"];

async function generateSampleAssessment() {
  try {
    console.log("🚀 Starting sample assessment generation...");

    // First, check if there are any users in the system
    const users = await prisma.user.findMany({
      take: 1,
    });

    let userId;
    if (users.length === 0) {
      // Create a sample user
      console.log("📝 Creating sample user...");
      const sampleUser = await prisma.user.create({
        data: {
          email: "sample.user@example.com",
          name: "Sample User",
          password: "hashed_password_here",
          role: "USER",
        },
      });
      userId = sampleUser.id;
      console.log(`✅ Created sample user: ${sampleUser.email}`);
    } else {
      userId = users[0].id;
      console.log(`✅ Using existing user: ${users[0].email}`);
    }

    // Create a completed assessment
    console.log("📊 Creating sample assessment...");
    const assessment = await prisma.assessment.create({
      data: {
        userId: userId,
        subjectName: "Sample Student",
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        completedAt: new Date(),
        shortId: `BIQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      },
    });

    console.log(
      `✅ Created assessment: ${assessment.id} (${assessment.shortId})`
    );

    // Generate scores for all domains
    console.log("🎯 Generating scores for all domains...");
    const domains = [
      "ANTISOCIAL",
      "VIOLENCE",
      "ATTENTION",
      "EMOTIONAL",
      "CONDUCT",
    ];

    for (const domain of domains) {
      // Generate realistic scores with some variation
      const rawScore = Math.floor(Math.random() * 40) + 10; // 10-50 range
      const totalPossible = 50;
      const riskLevel =
        riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 range
      const questionsAnswered = Math.floor(Math.random() * 5) + 8; // 8-12 questions

      await prisma.score.create({
        data: {
          assessmentId: assessment.id,
          domain: domain,
          domainName: domainDisplayNames[domain], // Store domain name for display
          rawScore: rawScore,
          riskLevel: riskLevel,
          confidence: confidence,
          questionsAnswered: questionsAnswered,
          totalPossible: totalPossible,
          wasTerminatedEarly: Math.random() < 0.2, // 20% chance of early termination
        },
      });

      console.log(
        `  ➕ ${domainDisplayNames[domain]}: ${rawScore}/${totalPossible} (${riskLevel})`
      );
    }

    // Note: Skipping question responses for now as they require existing questions
    console.log(
      "ℹ️  Skipping question responses (would need existing questions in the system)"
    );

    // Create some sample recommendations
    console.log("💡 Creating sample recommendations...");
    const recommendations = [
      {
        title: "Social Skills Training",
        content:
          "Consider enrolling the student in social skills training programs to help develop better peer relationships and empathy.",
        category: "Behavioral Support",
        priority: 1,
      },
      {
        title: "Attention Support Strategies",
        content:
          "Implement structured breaks and attention-focusing techniques during academic tasks.",
        category: "Academic Support",
        priority: 2,
      },
      {
        title: "Emotional Regulation Techniques",
        content:
          "Teach coping strategies such as deep breathing, mindfulness, and identifying emotional triggers.",
        category: "Emotional Support",
        priority: 1,
      },
    ];

    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          assessmentId: assessment.id,
          userId: userId,
          ...rec,
        },
      });
    }

    console.log(`✅ Created ${recommendations.length} recommendations`);

    console.log("\n🎉 Sample assessment generated successfully!");
    console.log(`📍 Assessment ID: ${assessment.id}`);
    console.log(`📍 Short ID: ${assessment.shortId}`);
    console.log(`📍 Subject: ${assessment.subjectName}`);
    console.log(`📍 Status: ${assessment.status}`);
    console.log(
      `📍 Access URL: http://localhost:3000/assessment/${assessment.id}/results`
    );

    return assessment;
  } catch (error) {
    console.error("❌ Error generating sample assessment:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateSampleAssessment()
    .then(() => {
      console.log(
        "\n✨ Done! You can now view the assessment results to see all domains displayed properly."
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to generate sample assessment:", error);
      process.exit(1);
    });
}

module.exports = { generateSampleAssessment };
