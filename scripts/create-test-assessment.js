const { PrismaClient, AssessmentDomain, RiskLevel } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestAssessment() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (!user) {
      console.error("❌ User test@example.com not found");
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`);

    // Get the active assessment template
    const template = await prisma.assessmentTemplate.findFirst({
      where: { isActive: true },
    });

    if (!template) {
      console.error("❌ No active assessment template found");
      process.exit(1);
    }

    console.log(`✅ Found active template: ${template.name}`);

    // Get domain templates for the assessment through the junction table
    const assessmentTemplateDomains =
      await prisma.assessmentTemplateDomain.findMany({
        where: { assessmentTemplateId: template.id },
        orderBy: { order: "asc" },
        include: {
          domainTemplate: true,
        },
      });

    const domainTemplates = assessmentTemplateDomains.map(
      (atd) => atd.domainTemplate
    );

    console.log(`✅ Found ${domainTemplates.length} domain templates`);

    // Create the assessment
    const assessment = await prisma.assessment.create({
      data: {
        userId: user.id,
        assessmentTemplateId: template.id,
        subjectName: "Test Student",
        status: "COMPLETED",
        isConversational: false,
        startedAt: new Date(),
        completedAt: new Date(),
        shortId: `TEST-${Date.now()}`,
      },
    });

    console.log(`✅ Created assessment: ${assessment.id}`);

    // Create scores for each domain
    const scores = [];
    for (const domainTemplate of domainTemplates) {
      // Try to map slug to enum value (optional, for backward compatibility)
      const domainEnumMap = {
        antisocial: "ANTISOCIAL",
        violence: "VIOLENCE",
        attention: "ATTENTION",
        emotional: "EMOTIONAL",
        conduct: "CONDUCT",
      };
      const domainEnum = domainEnumMap[domainTemplate.slug?.toLowerCase()];

      const score = await prisma.score.create({
        data: {
          assessmentId: assessment.id,
          domain: domainEnum || null, // Optional enum for backward compatibility
          domainTemplateId: domainTemplate.id,
          domainName: domainTemplate.name, // Use name field
          rawScore: Math.floor(Math.random() * 15) + 5, // Random score 5-20
          totalPossible: 20,
          questionsAnswered: 20,
          riskLevel: ["LOW", "MODERATE", "HIGH"][Math.floor(Math.random() * 3)],
          confidence: 0.85,
          timestamp: new Date(),
          wasTerminatedEarly: false,
        },
      });
      scores.push(score);
      console.log(
        `   ✅ Created score for ${domainTemplate.name}: ${score.rawScore}/${score.totalPossible} (${score.riskLevel})`
      );
    }

    // Create a basic AI summary
    await prisma.chatMessage.create({
      data: {
        assessmentId: assessment.id,
        role: "ASSISTANT",
        content: `# Assessment Summary for ${assessment.subjectName}

Based on the completed assessment, here's a summary of the results:

${domainTemplates
  .map((dt, idx) => {
    const score = scores[idx];
    return `## ${dt.name}
- **Score**: ${score.rawScore}/${score.totalPossible}
- **Risk Level**: ${score.riskLevel}
- **Concerns**: ${score.riskLevel === "HIGH" ? "Immediate attention recommended" : score.riskLevel === "MODERATE" ? "Monitor and consider intervention" : "Within typical range"}`;
  })
  .join("\n\n")}

## Recommendations

1. Review the detailed results for each domain
2. Consider consulting with appropriate professionals
3. Implement evidence-based interventions as needed
4. Monitor progress over time

Remember: This assessment is a screening tool and not a diagnosis.`,
      },
    });

    console.log(`✅ Created AI summary message`);

    console.log("\n🎉 Test assessment created successfully!");
    console.log(`📊 Assessment ID: ${assessment.shortId || assessment.id}`);
    console.log(`👤 User: ${user.email}`);
    console.log(`📝 Subject: ${assessment.subjectName}`);
    console.log(`📈 Domains: ${scores.length}`);
    console.log("\nYou can now view this on the dashboard!");
  } catch (error) {
    console.error("❌ Error creating test assessment:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAssessment();
