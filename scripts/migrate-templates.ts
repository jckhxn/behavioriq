/**
 * Export templates from old database and import to Supabase
 * Run this with the OLD_DATABASE_URL environment variable
 */

import { PrismaClient } from "@prisma/client";

// Connect to OLD database
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.OLD_DATABASE_URL ||
        "postgresql://jack@localhost:5432/ai_diagnostic?schema=public",
    },
  },
});

// Connect to NEW database (Supabase)
const newDb = new PrismaClient();

async function migrateTemplates() {
  console.log("\n🔄 Starting template migration...\n");

  try {
    // 1. Get assessment templates from old DB
    console.log("📥 Fetching assessment templates from old database...");
    const oldAssessmentTemplates = await oldDb.assessmentTemplate.findMany({
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
        },
      },
    });
    console.log(
      `   Found ${oldAssessmentTemplates.length} assessment templates\n`
    );

    // 2. Get domain templates from old DB
    console.log("📥 Fetching domain templates from old database...");
    const oldDomainTemplates = await oldDb.domainTemplate.findMany();
    console.log(`   Found ${oldDomainTemplates.length} domain templates\n`);

    if (
      oldAssessmentTemplates.length === 0 &&
      oldDomainTemplates.length === 0
    ) {
      console.log("❌ No templates found in old database!");
      console.log("   Check your OLD_DATABASE_URL environment variable\n");
      return;
    }

    // 3. Get a super admin user ID for createdById
    console.log("🔍 Finding super admin user in new database...");
    const superAdmin = await newDb.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (!superAdmin) {
      console.error("❌ No SUPER_ADMIN user found in new database!");
      console.error("   Please create a super admin first\n");
      return;
    }
    console.log(`   Using super admin: ${superAdmin.email}\n`);

    // 4. Migrate domain templates first (they're referenced by assessment templates)
    console.log("📤 Migrating domain templates...");
    const domainTemplateMap = new Map<string, string>(); // old ID -> new ID

    for (const oldDomain of oldDomainTemplates) {
      try {
        const newDomain = await newDb.domainTemplate.create({
          data: {
            id: oldDomain.id, // Keep same ID
            name: oldDomain.name,
            slug: oldDomain.slug,
            description: oldDomain.description,
            questions: oldDomain.questions as any,
            resources: oldDomain.resources as any,
            scoringConfig: oldDomain.scoringConfig as any,
            version: oldDomain.version,
            createdById: superAdmin.id,
            createdAt: oldDomain.createdAt,
            updatedAt: oldDomain.updatedAt,
          },
        });
        domainTemplateMap.set(oldDomain.id, newDomain.id);
        console.log(`   ✅ ${oldDomain.name}`);
      } catch (error: any) {
        console.error(
          `   ❌ Failed to migrate ${oldDomain.name}: ${error.message}`
        );
      }
    }

    // 5. Migrate assessment templates
    console.log("\n📤 Migrating assessment templates...");
    for (const oldTemplate of oldAssessmentTemplates) {
      try {
        // Create assessment template
        const newTemplate = await newDb.assessmentTemplate.create({
          data: {
            id: oldTemplate.id, // Keep same ID
            name: oldTemplate.name,
            slug: oldTemplate.slug,
            description: oldTemplate.description,
            instructions: oldTemplate.instructions,
            isActive: oldTemplate.isActive,
            version: oldTemplate.version,
            createdById: superAdmin.id,
            createdAt: oldTemplate.createdAt,
            updatedAt: oldTemplate.updatedAt,
          },
        });

        // Create domain associations
        for (const domainAssoc of oldTemplate.domains) {
          await newDb.assessmentTemplateDomain.create({
            data: {
              assessmentTemplateId: newTemplate.id,
              domainTemplateId: domainAssoc.domainTemplateId,
              order: domainAssoc.order,
              isRequired: domainAssoc.isRequired,
            },
          });
        }

        console.log(
          `   ✅ ${oldTemplate.name} (${oldTemplate.domains.length} domains)`
        );
      } catch (error: any) {
        console.error(
          `   ❌ Failed to migrate ${oldTemplate.name}: ${error.message}`
        );
      }
    }

    console.log("\n✅ Migration complete!\n");

    // Verify
    const newTemplateCount = await newDb.assessmentTemplate.count();
    const newDomainCount = await newDb.domainTemplate.count();
    console.log(`📊 Final counts:`);
    console.log(`   Assessment Templates: ${newTemplateCount}`);
    console.log(`   Domain Templates: ${newDomainCount}\n`);
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  }
}

migrateTemplates();
