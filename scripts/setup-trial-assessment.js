/**
 * Setup Trial Assessment Script
 * Finds or creates trial assessment and configures platform settings
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setupTrialAssessment() {
  console.log("🚀 Setting up trial assessment...\n");

  try {
    // Check if platform settings exist
    let platformSettings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // If platform settings exist and trial assessment is configured
    if (platformSettings?.globalTrialAssessment) {
      const trial = platformSettings.globalTrialAssessment;
      console.log("✅ Trial assessment already configured!");
      console.log(`   Name: ${trial.name}`);
      console.log(`   ID: ${trial.id}`);
      console.log(`   Slug: ${trial.slug}`);
      console.log(
        `   Active: ${trial.isActive ? "✅ YES" : "❌ NO (NEEDS ACTIVATION!)"}`
      );
      console.log(`   Domains: ${trial.domains.length}`);

      if (trial.domains.length > 0) {
        console.log("\nDomains:");
        trial.domains.forEach((d, i) => {
          const questionCount = Array.isArray(d.domainTemplate.questions)
            ? d.domainTemplate.questions.length
            : 0;
          console.log(
            `   ${i + 1}. ${d.domainTemplate.name} (${questionCount} questions)`
          );
        });
      }

      if (!trial.isActive) {
        console.log("\n⚠️  Trial assessment is INACTIVE. Activating it now...");
        await prisma.assessmentTemplate.update({
          where: { id: trial.id },
          data: { isActive: true },
        });
        console.log("✅ Trial assessment activated!");
      }

      return trial;
    }

    // Find any existing assessment templates
    console.log("🔍 Looking for existing assessment templates...\n");
    const templates = await prisma.assessmentTemplate.findMany({
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (templates.length === 0) {
      console.log("❌ No assessment templates found!");
      console.log("\n📝 You need to create an assessment template first.");
      console.log("   Run: node scripts/create-trial-assessment.js");
      return null;
    }

    console.log(`Found ${templates.length} assessment template(s):\n`);
    templates.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (${t.slug})`);
      console.log(`   ID: ${t.id}`);
      console.log(`   Active: ${t.isActive}`);
      console.log(`   Domains: ${t.domains.length}`);
      console.log("");
    });

    // Use the first active template, or the first template if none are active
    let trialTemplate = templates.find((t) => t.isActive) || templates[0];

    console.log(`📌 Using "${trialTemplate.name}" as trial assessment\n`);

    // Activate it if not active
    if (!trialTemplate.isActive) {
      console.log("⚠️  Template is inactive. Activating it...");
      trialTemplate = await prisma.assessmentTemplate.update({
        where: { id: trialTemplate.id },
        data: { isActive: true },
        include: {
          domains: {
            include: {
              domainTemplate: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
      console.log("✅ Template activated!\n");
    }

    // Get super admin for updatedBy field
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (!superAdmin) {
      console.log("⚠️  No super admin found, using first user");
    }

    // Create or update platform settings
    if (!platformSettings) {
      console.log("🔧 Creating platform settings...");
      platformSettings = await prisma.platformSettings.create({
        data: {
          globalTrialAssessmentId: trialTemplate.id,
          trialAssessmentsEnabled: true,
          updatedBy: superAdmin?.id,
        },
      });
      console.log("✅ Platform settings created!\n");
    } else {
      console.log("🔧 Updating platform settings...");
      await prisma.platformSettings.update({
        where: { id: platformSettings.id },
        data: {
          globalTrialAssessmentId: trialTemplate.id,
          trialAssessmentsEnabled: true,
          updatedBy: superAdmin?.id,
        },
      });
      console.log("✅ Platform settings updated!\n");
    }

    console.log("🎯 Trial Assessment Setup Complete!");
    console.log(`   Template: ${trialTemplate.name}`);
    console.log(`   ID: ${trialTemplate.id}`);
    console.log(`   Domains: ${trialTemplate.domains.length}`);
    console.log(`   Enabled: ✅ YES\n`);

    return trialTemplate;
  } catch (error) {
    console.error("❌ Error setting up trial assessment:", error);
    throw error;
  }
}

// Run the script
setupTrialAssessment()
  .then((result) => {
    if (result) {
      console.log("🎉 Setup completed successfully!");
    } else {
      console.log(
        "⚠️  Setup incomplete - please create an assessment template first"
      );
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
