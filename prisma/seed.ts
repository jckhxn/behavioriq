import {
  PrismaClient,
  Role,
  DocumentCategory,
  AssessmentDomain,
  RiskLevel,
  MessageRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

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

  // Create sample documents
  const sampleDocuments = [
    {
      title: "Employee Handbook",
      fileName: "employee-handbook.pdf",
      fileType: "pdf",
      fileSize: 2048000, // 2MB
      category: DocumentCategory.POLICY,
      content: `Employee Handbook

Welcome to our company! This handbook contains important information about our policies, procedures, and benefits.

1. Code of Conduct
All employees are expected to maintain high standards of professional conduct. This includes treating colleagues with respect, maintaining confidentiality, and following company policies.

2. Work Schedule
Our standard work hours are 9:00 AM to 5:00 PM, Monday through Friday. Flexible work arrangements may be available with supervisor approval.

3. Benefits
We offer comprehensive benefits including health insurance, retirement savings plan, and paid time off.

4. Performance Reviews
Performance reviews are conducted annually to provide feedback and set goals for professional development.

5. Communication Policy
Use official company channels for business communication. Personal use of company resources should be limited.`,
      userId: admin.id,
    },
    {
      title: "Security Guidelines",
      fileName: "security-guidelines.docx",
      fileType: "docx",
      fileSize: 512000, // 512KB
      category: DocumentCategory.GUIDELINE,
      content: `Security Guidelines

Information security is crucial for protecting our company and client data.

Password Requirements:
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Change passwords every 90 days
- Do not reuse last 5 passwords

Data Protection:
- Encrypt sensitive data in transit and at rest
- Use approved cloud storage solutions only
- Report security incidents immediately
- Follow data retention policies

Access Control:
- Use multi-factor authentication
- Limit access to business need
- Regular access reviews
- Secure remote access via VPN

Physical Security:
- Lock workstations when away
- Visitor escort requirements
- Secure document disposal
- Report suspicious activity`,
      userId: admin.id,
    },
    {
      title: "Assessment Protocol",
      fileName: "assessment-protocol.txt",
      fileType: "txt",
      fileSize: 128000, // 128KB
      category: DocumentCategory.ASSESSMENT_TOOL,
      content: `Behavioral Assessment Protocol

This protocol outlines the standardized approach for conducting behavioral assessments.

Assessment Domains:
1. Antisocial Behavior - Social withdrawal, isolation, relationship difficulties
2. Violence Risk - Aggressive thoughts, violent tendencies, harm to others
3. Attention Issues - Focus problems, hyperactivity, impulsivity
4. Emotional Regulation - Mood instability, anxiety, depression
5. Conduct Problems - Rule-breaking, defiance, authority issues

Scoring Guidelines:
- Scores range from 0-100 for each domain
- Low Risk: 0-25
- Moderate Risk: 26-50
- High Risk: 51-75
- Very High Risk: 76-100

Assessment Process:
1. Establish rapport and explain confidentiality
2. Use open-ended questions to explore each domain
3. Document responses objectively
4. Score based on severity and frequency
5. Provide appropriate referrals when indicated

Quality Assurance:
- Regular calibration training
- Supervisor review of high-risk cases
- Documentation standards
- Follow-up protocols`,
      userId: admin.id,
    },
  ];

  for (const docData of sampleDocuments) {
    const document = await prisma.document.create({
      data: docData,
    });

    console.log("✅ Created sample document:", document.title);

    // Create sample chunks for the document
    const chunks = [
      {
        title: `${document.title} (Part 1)`,
        content: docData.content.substring(0, 500),
        category: document.category,
        chunkIndex: 0,
        documentId: document.id,
        userId: document.userId,
      },
      {
        title: `${document.title} (Part 2)`,
        content: docData.content.substring(500, 1000),
        category: document.category,
        chunkIndex: 1,
        documentId: document.id,
        userId: document.userId,
      },
    ];

    for (const chunkData of chunks) {
      if (chunkData.content.trim()) {
        const chunk = await prisma.documentChunk.create({
          data: chunkData,
        });
        console.log(`✅ Created chunk for ${document.title}`);
      }
    }
  }

  // Seed assessment configurations from JSON files
  console.log("🔧 Seeding assessment configurations...");

  const assessmentFiles = [
    "conduct.json",
    "antisocial.json",
    "violence.json",
    "attention.json",
    "emotional.json",
  ];

  for (const fileName of assessmentFiles) {
    try {
      const filePath = join(process.cwd(), "assessments", fileName);
      const assessmentData = JSON.parse(readFileSync(filePath, "utf-8"));

      // Create or update the question set
      const questionSet = await prisma.questionSet.upsert({
        where: { domain: assessmentData.domain },
        update: {
          name: assessmentData.name,
          description: assessmentData.description,
          order: assessmentData.order,
          isActive: true,
          // Use any type for new fields until Prisma types update
          ...({
            displayName: assessmentData.displayName,
            totalPossibleScore: assessmentData.totalPossibleScore,
            clinicallySignificantScore:
              assessmentData.clinicallySignificantScore,
            skipConditions: JSON.stringify(assessmentData.skipConditions || []),
            prerequisites: JSON.stringify(assessmentData.prerequisites || []),
            multiPartLogic: assessmentData.multiPartLogic
              ? JSON.stringify(assessmentData.multiPartLogic)
              : null,
          } as any),
        },
        create: {
          domain: assessmentData.domain,
          name: assessmentData.name,
          description: assessmentData.description,
          order: assessmentData.order,
          isActive: true,
          // Use any type for new fields until Prisma types update
          ...({
            displayName: assessmentData.displayName,
            totalPossibleScore: assessmentData.totalPossibleScore,
            clinicallySignificantScore:
              assessmentData.clinicallySignificantScore,
            skipConditions: JSON.stringify(assessmentData.skipConditions || []),
            prerequisites: JSON.stringify(assessmentData.prerequisites || []),
            multiPartLogic: assessmentData.multiPartLogic
              ? JSON.stringify(assessmentData.multiPartLogic)
              : null,
          } as any),
        },
      });

      console.log(`✅ Created/updated question set: ${questionSet.name}`);

      // Clear existing questions for this question set
      await prisma.question.deleteMany({
        where: { questionSetId: questionSet.id },
      });

      // Create questions
      for (const questionData of assessmentData.questions) {
        await prisma.question.create({
          data: {
            questionSetId: questionSet.id,
            text: questionData.text,
            order: questionData.order,
            isGatingQuestion: questionData.isGatingQuestion || false,
            weight: questionData.weight || 1,
            isActive: true,
          },
        });
      }

      console.log(
        `✅ Created ${assessmentData.questions.length} questions for ${questionSet.name}`
      );

      // Clear existing termination rules for this question set
      await prisma.terminationRule.deleteMany({
        where: { questionSetId: questionSet.id },
      });

      // Create termination rules
      if (
        assessmentData.terminationRules &&
        assessmentData.terminationRules.length > 0
      ) {
        for (const ruleData of assessmentData.terminationRules) {
          await prisma.terminationRule.create({
            data: {
              questionSetId: questionSet.id,
              name: ruleData.name,
              description: ruleData.description,
              minimumYesToContinue: ruleData.minimumYesToContinue,
              checkAfterQuestion: ruleData.checkAfterQuestion,
              isActive: true,
            },
          });
        }
        console.log(
          `✅ Created ${assessmentData.terminationRules.length} termination rules for ${questionSet.name}`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to seed assessment from ${fileName}:`, error);
    }
  }

  console.log("✅ Assessment configurations seeded successfully");

  // Create sample assessment for the test user
  const assessment = await prisma.assessment.create({
    data: {
      userId: user.id,
      subjectName: "Sample Assessment",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      completedAt: new Date(),
    },
  });

  console.log("✅ Created sample assessment");

  // Create sample scores
  const sampleScores = [
    {
      domain: AssessmentDomain.ANTISOCIAL,
      rawScore: 15,
      totalPossible: 50,
      questionsAnswered: 8,
      riskLevel: RiskLevel.LOW,
      confidence: 0.85,
    },
    {
      domain: AssessmentDomain.VIOLENCE,
      rawScore: 8,
      totalPossible: 40,
      questionsAnswered: 6,
      riskLevel: RiskLevel.LOW,
      confidence: 0.92,
    },
    {
      domain: AssessmentDomain.ATTENTION,
      rawScore: 45,
      totalPossible: 60,
      questionsAnswered: 10,
      riskLevel: RiskLevel.MODERATE,
      confidence: 0.78,
    },
    {
      domain: AssessmentDomain.EMOTIONAL,
      rawScore: 35,
      totalPossible: 55,
      questionsAnswered: 9,
      riskLevel: RiskLevel.MODERATE,
      confidence: 0.81,
    },
    {
      domain: AssessmentDomain.CONDUCT,
      rawScore: 12,
      totalPossible: 45,
      questionsAnswered: 7,
      riskLevel: RiskLevel.LOW,
      confidence: 0.88,
    },
  ];

  for (const scoreData of sampleScores) {
    await prisma.score.create({
      data: {
        assessmentId: assessment.id,
        ...scoreData,
      },
    });
  }

  console.log("✅ Created sample scores");

  // Create sample chat session for knowledge chat
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: "Security Policy Questions",
      type: "KNOWLEDGE",
    },
  });

  // Create sample messages
  const messages = [
    {
      sessionId: chatSession.id,
      role: MessageRole.USER,
      content: "What are the password requirements?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      sessionId: chatSession.id,
      role: MessageRole.ASSISTANT,
      content:
        "Based on the security guidelines, password requirements include: minimum 12 characters, include uppercase, lowercase, numbers, and symbols, change passwords every 90 days, and do not reuse last 5 passwords.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000), // 2 hours ago + 30 seconds
      sources: [
        {
          id: "chunk-1",
          title: "Security Guidelines",
          documentTitle: "Security Guidelines",
          fileName: "security-guidelines.docx",
          similarity: 0.95,
        },
      ],
    },
  ];

  for (const messageData of messages) {
    await prisma.chatMessage.create({
      data: messageData,
    });
  }

  console.log("✅ Created sample chat session and messages");

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
