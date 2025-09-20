/**
 * Assessment Database Seeder
 *
 * Seeds the database with assessment configurations
 * from the JSON files in /assessments folder
 */

import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

interface AssessmentData {
  domain: string;
  name: string;
  description: string;
  order: number;
  questions: {
    id: string;
    text: string;
    order: number;
    isGatingQuestion: boolean;
    weight: number;
  }[];
  terminationRules: {
    name: string;
    description: string;
    minimumYesToContinue: number;
    checkAfterQuestion: number;
  }[];
}

async function seedAssessments() {
  console.log("🌱 Seeding assessments from JSON files...");

  const assessmentsDir = path.join(process.cwd(), "assessments");

  try {
    const files = await fs.readdir(assessmentsDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    for (const file of jsonFiles) {
      const filePath = path.join(assessmentsDir, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const assessmentData = JSON.parse(fileContent) as AssessmentData;

      console.log(`📋 Processing ${assessmentData.name}...`);

      // Create or update question set
      const questionSet = await prisma.questionSet.upsert({
        where: { domain: assessmentData.domain as any },
        update: {
          name: assessmentData.name,
          description: assessmentData.description,
          order: assessmentData.order,
          isActive: true,
        },
        create: {
          domain: assessmentData.domain as any,
          name: assessmentData.name,
          description: assessmentData.description,
          order: assessmentData.order,
          isActive: true,
        },
      });

      // Delete existing questions and rules to start fresh
      await prisma.question.deleteMany({
        where: { questionSetId: questionSet.id },
      });

      await prisma.terminationRule.deleteMany({
        where: { questionSetId: questionSet.id },
      });

      // Create questions
      for (const questionData of assessmentData.questions) {
        await prisma.question.create({
          data: {
            questionSetId: questionSet.id,
            text: questionData.text,
            order: questionData.order,
            isGatingQuestion: questionData.isGatingQuestion,
            weight: questionData.weight,
            isActive: true,
          },
        });
      }

      // Create termination rules
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

      console.log(`✅ ${assessmentData.name} seeded successfully`);
    }

    console.log("🎉 All assessments seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding assessments:", error);
    throw error;
  }
}

export { seedAssessments };

// Run seeder if called directly
if (require.main === module) {
  seedAssessments()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
