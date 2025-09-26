import { prisma } from "./lib/db/prisma.js";

async function createTestPasswordLink() {
  try {
    // Find an assessment to share
    const assessment = await prisma.assessment.findFirst({
      where: { status: "COMPLETED" },
    });

    if (!assessment) {
      console.log("No completed assessments found");
      return;
    }

    // Create a password-protected share link
    const shareLink = await prisma.shareableLink.create({
      data: {
        shareCode: "TEST" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        assessmentId: assessment.id,
        createdById: assessment.userId,
        privacy: "PASSWORD_PROTECTED",
        password: "test123",
        isActive: true,
        viewCount: 0,
      },
    });

    console.log(`Created password-protected share link: http://localhost:3000/share/${shareLink.shareCode}`);
    console.log(`Password: test123`);
    console.log(`Assessment: ${assessment.subjectName}`);
  } catch (error) {
    console.error("Error creating test share link:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPasswordLink();