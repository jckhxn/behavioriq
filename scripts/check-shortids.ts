import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkShortIds() {
  console.log("🔍 Checking current shortId values in database...");

  try {
    const assessments = await prisma.assessment.findMany({
      select: {
        id: true,
        shortId: true,
        subjectName: true,
        startedAt: true
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    console.log(`\nFound ${assessments.length} assessments:`);
    
    assessments.forEach((assessment, index) => {
      console.log(`${index + 1}. ${assessment.subjectName}`);
      console.log(`   shortId: ${assessment.shortId || 'NULL'}`);
      console.log(`   uuid: ${assessment.id.slice(0, 12)}...`);
      console.log(`   created: ${assessment.startedAt?.toLocaleDateString() || 'unknown'}`);
      console.log('');
    });

    // Count by prefix
    const assCount = await prisma.assessment.count({
      where: { shortId: { startsWith: 'ASS-' } }
    });
    
    const biqCount = await prisma.assessment.count({
      where: { shortId: { startsWith: 'BIQ-' } }
    });
    
    const nullCount = await prisma.assessment.count({
      where: { shortId: null }
    });

    console.log('\n📊 ShortId Statistics:');
    console.log(`   ASS- prefix: ${assCount}`);
    console.log(`   BIQ- prefix: ${biqCount}`);
    console.log(`   NULL/empty: ${nullCount}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkShortIds();