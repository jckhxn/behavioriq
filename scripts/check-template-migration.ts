/**
 * Check migration status of templates
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTemplates() {
  console.log("\n📊 Checking template migration status...\n");

  // Check assessment templates
  const assessmentTemplates = await prisma.assessmentTemplate.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      createdAt: true,
      domains: {
        select: {
          domainTemplate: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`📋 Assessment Templates: ${assessmentTemplates.length} found\n`);
  assessmentTemplates.forEach((template) => {
    console.log(
      `   ${template.isActive ? "✅" : "❌"} ${template.name} (${template.slug})`
    );
    console.log(`      ID: ${template.id}`);
    console.log(`      Domains: ${template.domains.length}`);
    template.domains.forEach((d) => {
      console.log(`         - ${d.domainTemplate.name}`);
    });
    console.log(`      Created: ${template.createdAt.toISOString()}\n`);
  });

  // Check domain templates
  const domainTemplates = await prisma.domainTemplate.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      questions: true,
      version: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log(`📋 Domain Templates: ${domainTemplates.length} found\n`);
  domainTemplates.forEach((template) => {
    const questions = Array.isArray(template.questions)
      ? template.questions
      : [];
    console.log(`   📝 ${template.name} (${template.slug})`);
    console.log(`      Questions: ${questions.length}`);
    console.log(`      Version: ${template.version}`);
    console.log(`      Created: ${template.createdAt.toISOString()}\n`);
  });

  await prisma.$disconnect();
}

checkTemplates().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
