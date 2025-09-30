import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "System Administrator",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create a sample assessment template
  const assessmentTemplate = await prisma.assessmentTemplate.create({
    data: {
      name: "Behavioral Risk Assessment",
      slug: "behavioral-risk-assessment",
      description:
        "A comprehensive assessment for evaluating behavioral risks across multiple domains",
      instructions:
        "Please answer all questions honestly. This assessment will help identify areas where support may be beneficial.",
      createdById: admin.id,
    },
  });

  console.log(
    "✅ Created sample assessment template:",
    assessmentTemplate.name
  );

  // Create sample domain templates
  const domainTemplates = [
    {
      name: "Attention Issues",
      slug: "attention-issues",
      description: "Evaluates focus problems, hyperactivity, and impulsivity",
      questions: [
        {
          id: "attention_1",
          text: "Do you have trouble paying attention to details?",
          order: 1,
          weight: 1,
          isGatingQuestion: true,
        },
        {
          id: "attention_2",
          text: "Do you often get distracted during tasks?",
          order: 2,
          weight: 1,
          isGatingQuestion: false,
        },
        {
          id: "attention_3",
          text: "Do you have difficulty organizing tasks and activities?",
          order: 3,
          weight: 1,
          isGatingQuestion: false,
        },
      ],
      scoringConfig: {
        maxScore: 3,
        riskLevels: {
          low: { min: 0, max: 1 },
          moderate: { min: 2, max: 2 },
          high: { min: 3, max: 3 },
        },
      },
      createdById: admin.id,
    },
    {
      name: "Conduct Problems",
      slug: "conduct-problems",
      description:
        "Evaluates rule-breaking behavior, defiance, and authority issues",
      questions: [
        {
          id: "conduct_1",
          text: "Do you often break rules or ignore instructions?",
          order: 1,
          weight: 1,
          isGatingQuestion: true,
        },
        {
          id: "conduct_2",
          text: "Do you frequently argue with authority figures?",
          order: 2,
          weight: 1,
          isGatingQuestion: false,
        },
      ],
      scoringConfig: {
        maxScore: 2,
        riskLevels: {
          low: { min: 0, max: 0 },
          moderate: { min: 1, max: 1 },
          high: { min: 2, max: 2 },
        },
      },
      createdById: admin.id,
    },
  ];

  for (const domainData of domainTemplates) {
    const domainTemplate = await prisma.domainTemplate.create({
      data: domainData,
    });

    console.log("✅ Created domain template:", domainTemplate.name);

    // Link domain to assessment template
    await prisma.assessmentTemplateDomain.create({
      data: {
        assessmentTemplateId: assessmentTemplate.id,
        domainTemplateId: domainTemplate.id,
        order: domainTemplates.indexOf(domainData) + 1,
        isRequired: true,
      },
    });
  }

  console.log("✅ Linked domains to assessment template");

  console.log("🎉 Database seed completed successfully!");
  console.log("");
  console.log("Test Accounts:");
  console.log("Admin: admin@example.com / admin123");
  console.log("User:  user@example.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
