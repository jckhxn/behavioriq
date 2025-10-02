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

async function generateUserAssessment() {
  try {
    console.log("🚀 Creating sample assessment for user@example.com...");

    // Find the regular user account
    const user = await prisma.user.findUnique({
      where: { email: "user@example.com" },
    });

    if (!user) {
      console.log("❌ user@example.com not found. Creating user...");
      const newUser = await prisma.user.create({
        data: {
          email: "user@example.com",
          name: "Regular User",
          password: "hashed_password_here",
          role: "USER",
        },
      });
      console.log(`✅ Created user: ${newUser.email}`);
      userId = newUser.id;
    } else {
      console.log(`✅ Using existing user: ${user.email}`);
      userId = user.id;
    }

    // Create a completed assessment
    console.log("📊 Creating sample assessment...");
    const assessment = await prisma.assessment.create({
      data: {
        userId: userId,
        subjectName: "Alex Johnson",
        status: "COMPLETED",
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        shortId: `BIQ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      },
    });

    console.log(
      `✅ Created assessment: ${assessment.id} (${assessment.shortId})`
    );

    // Generate realistic scores for all domains with some variety
    console.log("🎯 Generating scores for all domains...");
    const domains = [
      "ANTISOCIAL",
      "VIOLENCE",
      "ATTENTION",
      "EMOTIONAL",
      "CONDUCT",
    ];

    const scoreData = [
      {
        domain: "ANTISOCIAL",
        rawScore: 15,
        riskLevel: "LOW",
        questionsAnswered: 8,
      },
      {
        domain: "VIOLENCE",
        rawScore: 35,
        riskLevel: "HIGH",
        questionsAnswered: 10,
      },
      {
        domain: "ATTENTION",
        rawScore: 28,
        riskLevel: "MODERATE",
        questionsAnswered: 9,
      },
      {
        domain: "EMOTIONAL",
        rawScore: 42,
        riskLevel: "VERY_HIGH",
        questionsAnswered: 12,
      },
      {
        domain: "CONDUCT",
        rawScore: 22,
        riskLevel: "MODERATE",
        questionsAnswered: 9,
      },
    ];

    for (const scoreInfo of scoreData) {
      const totalPossible = 50;
      const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 range

      await prisma.score.create({
        data: {
          assessmentId: assessment.id,
          domain: scoreInfo.domain,
          domainName: domainDisplayNames[scoreInfo.domain], // Store domain name for display
          rawScore: scoreInfo.rawScore,
          riskLevel: scoreInfo.riskLevel,
          confidence: confidence,
          questionsAnswered: scoreInfo.questionsAnswered,
          totalPossible: totalPossible,
          wasTerminatedEarly: Math.random() < 0.1, // 10% chance of early termination
        },
      });

      console.log(
        `  ➕ ${domainDisplayNames[scoreInfo.domain]}: ${scoreInfo.rawScore}/${totalPossible} (${scoreInfo.riskLevel})`
      );
    }

    // Create some realistic recommendations
    console.log("💡 Creating sample recommendations...");
    const recommendations = [
      {
        title: "Emotional Regulation Support",
        content:
          "Consider seeking support for emotional regulation techniques. Mindfulness-based interventions and cognitive behavioral therapy can be particularly effective for managing intense emotions.",
        category: "Behavioral Support",
        priority: 1,
      },
      {
        title: "Violence Risk Assessment",
        content:
          "Given the elevated scores in violence risk, a professional assessment is recommended to develop appropriate safety planning and intervention strategies.",
        category: "Safety Planning",
        priority: 1,
      },
      {
        title: "Attention and Focus Strategies",
        content:
          "Implement structured routines and attention-focusing techniques. Consider evaluation for attention-related concerns if difficulties persist.",
        category: "Academic Support",
        priority: 2,
      },
      {
        title: "Behavioral Intervention Plan",
        content:
          "Develop a comprehensive behavioral intervention plan that addresses multiple domains of concern with consistent implementation across settings.",
        category: "Comprehensive Care",
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

    console.log("\n🎉 User assessment generated successfully!");
    console.log(`📍 Assessment ID: ${assessment.id}`);
    console.log(`📍 Short ID: ${assessment.shortId}`);
    console.log(`📍 Subject: ${assessment.subjectName}`);
    console.log(`📍 Status: ${assessment.status}`);
    console.log(`📍 User: ${user ? user.email : "user@example.com"}`);
    console.log(
      `📍 Access URL: http://localhost:3000/assessment/${assessment.id}/results`
    );

    return assessment;
  } catch (error) {
    console.error("❌ Error generating user assessment:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateUserAssessment()
    .then(() => {
      console.log("\n✨ Done! User can now view their assessment results.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to generate user assessment:", error);
      process.exit(1);
    });
}

module.exports = { generateUserAssessment };
