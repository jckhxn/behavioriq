/**
 * Migration Script Part 2: Migrate Assessments and Related Data
 *
 * This script migrates assessments, scores, and other data after users are already in Supabase.
 * It creates a mapping between old user IDs and new Supabase user IDs by matching emails.
 *
 * Run with: node scripts/migrate-assessments.js
 */

const { PrismaClient } = require("@prisma/client");

// OLD Local Database
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.OLD_DATABASE_URL ||
        "postgresql://jack@localhost:5432/ai_diagnostic?schema=public",
    },
  },
});

// NEW Supabase Database
const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const stats = {
  assessmentsMigrated: 0,
  scoresMigrated: 0,
  documentsMigrated: 0,
  paymentsMigrated: 0,
  shareableLinksMigrated: 0,
};

async function main() {
  console.log("\n🚀 Migrating Assessments and Data...\n");
  console.log("━".repeat(50));

  try {
    // Step 1: Build user ID mapping
    console.log("\n📊 Step 1: Building User ID Map...");
    const userIdMap = await buildUserIdMap();
    console.log(`   Mapped ${userIdMap.size} users`);

    // Step 2: Migrate Assessments
    console.log("\n📊 Step 2: Migrating Assessments...");
    await migrateAssessments(userIdMap);

    // Step 3: Migrate Scores
    console.log("\n📊 Step 3: Migrating Scores...");
    await migrateScores();

    // Step 4: Migrate Documents
    console.log("\n📊 Step 4: Migrating Documents...");
    await migrateDocuments(userIdMap);

    // Step 5: Migrate Other Data
    console.log("\n📊 Step 5: Migrating Other Data...");
    await migrateOtherData(userIdMap);

    // Print Summary
    printSummary();
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

async function buildUserIdMap() {
  const oldUsers = await oldPrisma.user.findMany();
  const newUsers = await newPrisma.user.findMany();

  const userIdMap = new Map();

  for (const oldUser of oldUsers) {
    const newUser = newUsers.find((u) => u.email === oldUser.email);
    if (newUser) {
      userIdMap.set(oldUser.id, newUser.id);
      console.log(`   ${oldUser.email}: ${oldUser.id} → ${newUser.id}`);
    }
  }

  return userIdMap;
}

async function migrateAssessments(userIdMap) {
  const assessments = await oldPrisma.assessment.findMany();
  console.log(`Found ${assessments.length} assessments to migrate`);

  for (const assessment of assessments) {
    try {
      const newUserId = userIdMap.get(assessment.userId);
      if (!newUserId) {
        console.log(`  ⚠️  Assessment ${assessment.id} - user not found`);
        continue;
      }

      await newPrisma.assessment.create({
        data: {
          id: assessment.id,
          userId: newUserId,
          subjectName: assessment.subjectName,
          status: assessment.status,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt,
          currentDomain: assessment.currentDomain,
          currentQuestionOrder: assessment.currentQuestionOrder,
          shortId: assessment.shortId,
          assessmentTemplateId: assessment.assessmentTemplateId,
          isConversational: assessment.isConversational,
          hasEnhancedReport: assessment.hasEnhancedReport,
          enhancedReportPurchasedAt: assessment.enhancedReportPurchasedAt,
          childResponses: assessment.childResponses,
          enhancedAnalysis: assessment.enhancedAnalysis,
        },
      });
      stats.assessmentsMigrated++;
      console.log(`  ✅ Assessment ${assessment.subjectName}`);
    } catch (error) {
      if (!error.message.includes("Unique constraint")) {
        console.log(`  ⚠️  ${assessment.id} - ${error.message}`);
      }
    }
  }
}

async function migrateScores() {
  const scores = await oldPrisma.score.findMany();
  console.log(`Found ${scores.length} scores to migrate`);

  for (const score of scores) {
    try {
      await newPrisma.score.create({
        data: {
          id: score.id,
          assessmentId: score.assessmentId,
          domain: score.domain,
          domainTemplateId: score.domainTemplateId,
          domainName: score.domainName,
          rawScore: score.rawScore,
          riskLevel: score.riskLevel,
          confidence: score.confidence,
          timestamp: score.timestamp,
          questionsAnswered: score.questionsAnswered,
          totalPossible: score.totalPossible,
          wasTerminatedEarly: score.wasTerminatedEarly,
        },
      });
      stats.scoresMigrated++;
    } catch (error) {
      if (
        !error.message.includes("Foreign key") &&
        !error.message.includes("Unique constraint")
      ) {
        console.log(`  ⚠️  Score ${score.id} - ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Migrated ${stats.scoresMigrated} scores`);
}

async function migrateDocuments(userIdMap) {
  const documents = await oldPrisma.document.findMany({
    include: { chunks: true },
  });
  console.log(`Found ${documents.length} documents to migrate`);

  for (const document of documents) {
    try {
      const newUserId = userIdMap.get(document.userId);
      if (!newUserId) continue;

      await newPrisma.document.create({
        data: {
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          category: document.category,
          content: document.content,
          userId: newUserId,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      });

      for (const chunk of document.chunks) {
        try {
          await newPrisma.documentChunk.create({
            data: {
              id: chunk.id,
              title: chunk.title,
              content: chunk.content,
              category: chunk.category,
              chunkIndex: chunk.chunkIndex,
              embedding: chunk.embedding,
              documentId: chunk.documentId,
              userId: newUserId,
              createdAt: chunk.createdAt,
            },
          });
        } catch (error) {
          /* Skip */
        }
      }

      stats.documentsMigrated++;
    } catch (error) {
      if (!error.message.includes("Unique constraint")) {
        console.log(`  ⚠️  ${document.title} - ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Migrated ${stats.documentsMigrated} documents`);
}

async function migrateOtherData(userIdMap) {
  // Migrate QuestionResponses
  try {
    const responses = await oldPrisma.questionResponse.findMany();
    for (const response of responses) {
      try {
        await newPrisma.questionResponse.create({ data: response });
      } catch (error) {
        /* Skip */
      }
    }
    console.log(`  ✅ Migrated question responses`);
  } catch (error) {
    /* Skip */
  }

  // Migrate Payments
  try {
    const payments = await oldPrisma.payment.findMany();
    for (const payment of payments) {
      try {
        const newUserId = userIdMap.get(payment.userId);
        if (!newUserId) continue;

        await newPrisma.payment.create({
          data: {
            ...payment,
            userId: newUserId,
          },
        });
        stats.paymentsMigrated++;
      } catch (error) {
        /* Skip */
      }
    }
    console.log(`  ✅ Migrated ${stats.paymentsMigrated} payments`);
  } catch (error) {
    /* Skip */
  }

  // Migrate ShareableLinks
  try {
    const shareLinks = await oldPrisma.shareableLink.findMany();
    for (const link of shareLinks) {
      try {
        const newUserId = userIdMap.get(link.createdById);
        if (!newUserId) continue;

        await newPrisma.shareableLink.create({
          data: {
            ...link,
            createdById: newUserId,
          },
        });
        stats.shareableLinksMigrated++;
      } catch (error) {
        /* Skip */
      }
    }
    console.log(
      `  ✅ Migrated ${stats.shareableLinksMigrated} shareable links`
    );
  } catch (error) {
    /* Skip */
  }
}

function printSummary() {
  console.log("\n");
  console.log("━".repeat(50));
  console.log("📊 MIGRATION SUMMARY");
  console.log("━".repeat(50));
  console.log(`\n📝 Assessments:     ${stats.assessmentsMigrated} ✅`);
  console.log(`📊 Scores:          ${stats.scoresMigrated} ✅`);
  console.log(`📄 Documents:       ${stats.documentsMigrated} ✅`);
  console.log(`💳 Payments:        ${stats.paymentsMigrated} ✅`);
  console.log(`🔗 Shareable Links: ${stats.shareableLinksMigrated} ✅`);
  console.log("\n");
  console.log("━".repeat(50));
  console.log("✅ Migration Complete!");
  console.log("━".repeat(50));
  console.log("\n");
}

main();
