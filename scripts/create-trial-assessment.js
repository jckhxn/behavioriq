/**
 * Create Trial Assessment Template Script
 * Creates a comprehensive trial assessment template for parents
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTrialAssessment() {
  console.log("🚀 Creating trial assessment template...");

  try {
    // Get the super admin user
    const superAdmin = await prisma.user.findUnique({
      where: { email: "tjhixon@gmail.com" }
    });

    if (!superAdmin) {
      throw new Error("Super admin user not found. Please run setup-super-admin.js first.");
    }

    // Create domain templates first
    const attentionDomain = await prisma.domainTemplate.create({
      data: {
        name: "Attention & Focus",
        slug: "attention-focus",
        description: "Assesses attention, focus, and concentration difficulties",
        version: 1,
        questions: [
          {
            id: "att_1",
            text: "Does your child have difficulty paying attention to details or make careless mistakes in schoolwork, work, or other activities?",
            order: 1,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "att_2", 
            text: "Does your child have trouble staying focused on tasks or activities (like homework, chores, or playing)?",
            order: 2,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "att_3",
            text: "Does your child seem to not listen when spoken to directly?",
            order: 3,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "att_4",
            text: "Does your child fail to follow through on instructions and fail to finish schoolwork or chores?",
            order: 4,
            isGatingQuestion: false,
            weight:1,
            required: true
          },
          {
            id: "att_5",
            text: "Does your child have difficulty organizing tasks and activities?",
            order: 5,
            isGatingQuestion: false,
            weight: 1,
            required: true
          }
        ],
        resources: [],
        scoringConfig: {
          totalPossibleScore: 15,
          clinicallySignificantScore: 8,
          riskLevels: {
            low: { min: 0, max: 4, label: "Low Risk", color: "#22c55e" },
            moderate: { min: 5, max: 7, label: "Moderate Risk", color: "#eab308" },
            high: { min: 8, max: 11, label: "High Risk", color: "#f97316" },
            veryHigh: { min: 12, max: 15, label: "Very High Risk", color: "#ef4444" }
          }
        },
        createdById: superAdmin.id
      }
    });

    const hyperactivityDomain = await prisma.domainTemplate.create({
      data: {
        name: "Hyperactivity & Impulsivity",
        slug: "hyperactivity-impulsivity",
        description: "Assesses hyperactive and impulsive behaviors",
        version: 1,
        questions: [
          {
            id: "hyp_1",
            text: "Does your child fidget with or tap hands or feet, or squirm in seat?",
            order: 1,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "hyp_2",
            text: "Does your child leave their seat when remaining seated is expected?",
            order: 2,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "hyp_3",
            text: "Does your child run or climb excessively when it's inappropriate?",
            order: 3,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "hyp_4",
            text: "Does your child have difficulty playing or engaging in activities quietly?",
            order: 4,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "hyp_5",
            text: "Does your child blurt out answers before questions have been completed?",
            order: 5,
            isGatingQuestion: false,
            weight: 1,
            required: true
          }
        ],
        resources: [],
        scoringConfig: {
          totalPossibleScore: 15,
          clinicallySignificantScore: 8,
          riskLevels: {
            low: { min: 0, max: 4, label: "Low Risk", color: "#22c55e" },
            moderate: { min: 5, max: 7, label: "Moderate Risk", color: "#eab308" },
            high: { min: 8, max: 11, label: "High Risk", color: "#f97316" },
            veryHigh: { min: 12, max: 15, label: "Very High Risk", color: "#ef4444" }
          }
        },
        createdById: superAdmin.id
      }
    });

    const emotionalDomain = await prisma.domainTemplate.create({
      data: {
        name: "Emotional Regulation",
        slug: "emotional-regulation", 
        description: "Assesses emotional regulation and mood-related challenges",
        version: 1,
        questions: [
          {
            id: "emo_1",
            text: "Does your child have frequent temper outbursts or angry episodes?",
            order: 1,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "emo_2",
            text: "Does your child seem sad, depressed, or unhappy most of the time?",
            order: 2,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "emo_3",
            text: "Does your child worry excessively about many things?",
            order: 3,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "emo_4",
            text: "Does your child have difficulty calming down when upset?",
            order: 4,
            isGatingQuestion: false,
            weight: 1,
            required: true
          },
          {
            id: "emo_5",
            text: "Does your child avoid activities or situations due to fear or anxiety?",
            order: 5,
            isGatingQuestion: false,
            weight: 1,
            required: true
          }
        ],
        resources: [],
        scoringConfig: {
          totalPossibleScore: 15,
          clinicallySignificantScore: 8,
          riskLevels: {
            low: { min: 0, max: 4, label: "Low Risk", color: "#22c55e" },
            moderate: { min: 5, max: 7, label: "Moderate Risk", color: "#eab308" },
            high: { min: 8, max: 11, label: "High Risk", color: "#f97316" },
            veryHigh: { min: 12, max: 15, label: "Very High Risk", color: "#ef4444" }
          }
        },
        createdById: superAdmin.id
      }
    });

    // Create the trial assessment template
    const trialAssessment = await prisma.assessmentTemplate.create({
      data: {
        name: "Parent Behavioral Screening - Trial",
        slug: "parent-behavioral-screening-trial",
        description: "A comprehensive behavioral screening assessment for parents to evaluate their child's attention, hyperactivity, and emotional regulation. This trial version provides an overview of key behavioral indicators.",
        instructions: "Please answer each question based on your child's behavior over the past 6 months. Select the option that best describes how often these behaviors occur.",
        isActive: true,
        version: 1,
        createdById: superAdmin.id,
        domains: {
          create: [
            {
              domainTemplateId: attentionDomain.id,
              order: 1,
              isRequired: true
            },
            {
              domainTemplateId: hyperactivityDomain.id, 
              order: 2,
              isRequired: true
            },
            {
              domainTemplateId: emotionalDomain.id,
              order: 3,
              isRequired: true
            }
          ]
        }
      },
      include: {
        domains: {
          include: {
            domainTemplate: true
          }
        }
      }
    });

    console.log("✅ Trial assessment template created successfully!");
    console.log(`📝 Assessment: ${trialAssessment.name}`);
    console.log(`🆔 ID: ${trialAssessment.id}`);
    console.log(`📚 Domains: ${trialAssessment.domains.length}`);
    
    trialAssessment.domains.forEach((domain, index) => {
      console.log(`   ${index + 1}. ${domain.domainTemplate.name}`);
    });

    // Now update platform settings to use this as the global trial assessment
    console.log("\n🔧 Updating platform settings...");
    
    let platformSettings = await prisma.platformSettings.findFirst();
    
    if (!platformSettings) {
      platformSettings = await prisma.platformSettings.create({
        data: {
          globalTrialAssessmentId: trialAssessment.id,
          updatedBy: superAdmin.id
        }
      });
      console.log("✅ Platform settings created with trial assessment");
    } else {
      await prisma.platformSettings.updateMany({
        data: {
          globalTrialAssessmentId: trialAssessment.id,
          updatedBy: superAdmin.id
        }
      });
      console.log("✅ Platform settings updated with trial assessment");
    }

    console.log("\n🎯 Trial Assessment Setup Complete:");
    console.log("- 15 carefully selected questions across 3 key behavioral domains");
    console.log("- Attention & Focus (5 questions)");
    console.log("- Hyperactivity & Impulsivity (5 questions)");
    console.log("- Emotional Regulation (5 questions)");
    console.log("- Risk-based scoring with clinical thresholds");
    console.log("- Set as global trial assessment in platform settings");

  } catch (error) {
    console.error("❌ Error creating trial assessment:", error);
    throw error;
  }
}

// Run the script
createTrialAssessment()
  .then(() => {
    console.log("\n🎉 Trial assessment creation completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Trial assessment creation failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });