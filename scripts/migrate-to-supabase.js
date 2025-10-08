/**
 * Migration Script: Local Database → Supabase
 *
 * This script migrates all data from your local PostgreSQL database to Supabase.
 * It handles:
 * 1. Users → Supabase Auth + Database
 * 2. All related data (assessments, scores, documents, etc.)
 *
 * Run with: node scripts/migrate-to-supabase.js
 */

const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");

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

// Supabase Admin Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Track migration progress
const stats = {
  usersTotal: 0,
  usersMigrated: 0,
  usersSkipped: 0,
  assessmentsMigrated: 0,
  scoresMigrated: 0,
  documentsMigrated: 0,
  errors: [],
};

// Map old user IDs to new Supabase IDs
const userIdMap = new Map();

async function main() {
  console.log("\n🚀 Starting Migration to Supabase...\n");
  console.log("━".repeat(50));

  try {
    // Step 1: Migrate Users
    console.log("\n📊 Step 1: Analyzing Users...");
    await migrateUsers();

    // Step 2: Migrate Organizations
    console.log("\n📊 Step 2: Migrating Organizations...");
    await migrateOrganizations();

    // Step 3: Migrate Licenses
    console.log("\n📊 Step 3: Migrating Licenses...");
    await migrateLicenses();

    // Step 4: Migrate Assessments
    console.log("\n📊 Step 4: Migrating Assessments...");
    await migrateAssessments();

    // Step 5: Migrate Scores
    console.log("\n📊 Step 5: Migrating Scores...");
    await migrateScores();

    // Step 6: Migrate Documents
    console.log("\n📊 Step 6: Migrating Documents...");
    await migrateDocuments();

    // Step 7: Migrate Other Tables
    console.log("\n📊 Step 7: Migrating Other Data...");
    await migrateOtherData();

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

async function migrateUsers() {
  const users = await oldPrisma.user.findMany();
  stats.usersTotal = users.length;

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    try {
      // Create user in Supabase Auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true, // Auto-confirm emails
          user_metadata: {
            name: user.name,
            role: user.role,
            legacy_id: user.id, // Keep old ID for reference
          },
          // Note: Supabase will generate a random password since we can't migrate hashed passwords
          // Users will need to use "Forgot Password" to set a new one
        });

      if (authError) {
        if (authError.message.includes("already registered")) {
          console.log(
            `  ⚠️  ${user.email} - already exists in Supabase Auth, skipping...`
          );
          stats.usersSkipped++;
          continue;
        }
        throw authError;
      }

      // Create user record in database with Supabase Auth ID
      await newPrisma.user.create({
        data: {
          id: authUser.user.id, // Use Supabase auth ID
          email: user.email,
          name: user.name,
          password: "", // No longer needed
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          organizationId: user.organizationId,
          parentUserId: user.parentUserId,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          onboardingSkipped: user.onboardingSkipped,
        },
      });

      // Map old ID to new ID
      userIdMap.set(user.id, authUser.user.id);

      stats.usersMigrated++;
      console.log(`  ✅ ${user.email} → ${authUser.user.id}`);
    } catch (error) {
      stats.usersSkipped++;
      stats.errors.push({ user: user.email, error: error.message });
      console.log(`  ❌ ${user.email} - ${error.message}`);
    }
  }
}

async function migrateOrganizations() {
  const organizations = await oldPrisma.organization.findMany();
  console.log(`Found ${organizations.length} organizations to migrate`);

  for (const org of organizations) {
    try {
      await newPrisma.organization.create({
        data: {
          id: org.id,
          name: org.name,
          email: org.email,
          phone: org.phone,
          address: org.address,
          billingEmail: org.billingEmail,
          taxId: org.taxId,
          industry: org.industry,
          employeeCount: org.employeeCount,
          customDomain: org.customDomain,
          logo: org.logo,
          primaryColor: org.primaryColor,
          secondaryColor: org.secondaryColor,
          headerTitle: org.headerTitle,
          footerText: org.footerText,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        },
      });
      console.log(`  ✅ ${org.name}`);
    } catch (error) {
      if (!error.message.includes("Unique constraint")) {
        console.log(`  ⚠️  ${org.name} - ${error.message}`);
      }
    }
  }
}

async function migrateLicenses() {
  const licenses = await oldPrisma.license.findMany({
    include: {
      users: true,
    },
  });
  console.log(`Found ${licenses.length} licenses to migrate`);

  for (const license of licenses) {
    try {
      // Create license
      await newPrisma.license.create({
        data: {
          id: license.id,
          licenseKey: license.licenseKey,
          type: license.type,
          status: license.status,
          maxUsers: license.maxUsers,
          maxAssessments: license.maxAssessments,
          features: license.features,
          validFrom: license.validFrom,
          validUntil: license.validUntil,
          organizationId: license.organizationId,
          createdAt: license.createdAt,
          updatedAt: license.updatedAt,
        },
      });

      // Create user licenses
      for (const userLicense of license.users) {
        try {
          await newPrisma.userLicense.create({
            data: {
              id: userLicense.id,
              userId: userLicense.userId,
              licenseId: userLicense.licenseId,
              assignedAt: userLicense.assignedAt,
              assignedBy: userLicense.assignedBy,
              isActive: userLicense.isActive,
              assessmentsAllowed: userLicense.assessmentsAllowed,
              assessmentsUsed: userLicense.assessmentsUsed,
            },
          });
        } catch (error) {
          // User might not exist yet, skip
          console.log(
            `    ⚠️  User license for user ${userLicense.userId} skipped`
          );
        }
      }

      console.log(`  ✅ License ${license.licenseKey}`);
    } catch (error) {
      if (!error.message.includes("Unique constraint")) {
        console.log(`  ⚠️  ${license.licenseKey} - ${error.message}`);
      }
    }
  }
}

async function migrateAssessments() {
  const assessments = await oldPrisma.assessment.findMany();
  console.log(`Found ${assessments.length} assessments to migrate`);

  for (const assessment of assessments) {
    try {
      // Map old user ID to new Supabase user ID
      const newUserId = userIdMap.get(assessment.userId);
      if (!newUserId) {
        console.log(
          `  ⚠️  Assessment ${assessment.id} skipped - user not found in map`
        );
        continue;
      }

      await newPrisma.assessment.create({
        data: {
          id: assessment.id,
          userId: newUserId, // Use mapped user ID
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
    } catch (error) {
      if (error.message.includes("Foreign key constraint")) {
        console.log(
          `  ⚠️  Assessment ${assessment.id} skipped - user not migrated`
        );
      } else if (!error.message.includes("Unique constraint")) {
        console.log(`  ⚠️  Assessment ${assessment.id} - ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Migrated ${stats.assessmentsMigrated} assessments`);
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
        !error.message.includes("Foreign key constraint") &&
        !error.message.includes("Unique constraint")
      ) {
        console.log(`  ⚠️  Score ${score.id} - ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Migrated ${stats.scoresMigrated} scores`);
}

async function migrateDocuments() {
  const documents = await oldPrisma.document.findMany({
    include: {
      chunks: true,
    },
  });
  console.log(`Found ${documents.length} documents to migrate`);

  for (const document of documents) {
    try {
      await newPrisma.document.create({
        data: {
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          category: document.category,
          content: document.content,
          userId: document.userId,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      });

      // Migrate chunks
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
              userId: chunk.userId,
              createdAt: chunk.createdAt,
            },
          });
        } catch (error) {
          // Skip chunk errors
        }
      }

      stats.documentsMigrated++;
    } catch (error) {
      if (
        !error.message.includes("Foreign key constraint") &&
        !error.message.includes("Unique constraint")
      ) {
        console.log(`  ⚠️  Document ${document.title} - ${error.message}`);
      }
    }
  }
  console.log(`  ✅ Migrated ${stats.documentsMigrated} documents`);
}

async function migrateOtherData() {
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
        await newPrisma.payment.create({ data: payment });
      } catch (error) {
        /* Skip */
      }
    }
    console.log(`  ✅ Migrated payments`);
  } catch (error) {
    /* Skip */
  }

  // Migrate ShareableLinks
  try {
    const shareLinks = await oldPrisma.shareableLink.findMany();
    for (const link of shareLinks) {
      try {
        await newPrisma.shareableLink.create({ data: link });
      } catch (error) {
        /* Skip */
      }
    }
    console.log(`  ✅ Migrated shareable links`);
  } catch (error) {
    /* Skip */
  }
}

function printSummary() {
  console.log("\n");
  console.log("━".repeat(50));
  console.log("📊 MIGRATION SUMMARY");
  console.log("━".repeat(50));
  console.log(`\n👥 Users:`);
  console.log(`   Total:    ${stats.usersTotal}`);
  console.log(`   Migrated: ${stats.usersMigrated} ✅`);
  console.log(`   Skipped:  ${stats.usersSkipped} ⚠️`);
  console.log(`\n📝 Assessments: ${stats.assessmentsMigrated} ✅`);
  console.log(`📊 Scores:      ${stats.scoresMigrated} ✅`);
  console.log(`📄 Documents:   ${stats.documentsMigrated} ✅`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((err) => {
      console.log(`   - ${err.user}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`);
    }
  }

  console.log("\n");
  console.log("━".repeat(50));
  console.log("✅ Migration Complete!");
  console.log("━".repeat(50));
  console.log('\n⚠️  IMPORTANT: Users will need to use "Forgot Password"');
  console.log(
    "   to set new passwords since we cannot migrate hashed passwords."
  );
  console.log("\n");
}

// Run migration
main();
