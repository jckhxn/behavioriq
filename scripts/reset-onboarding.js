const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetOnboarding() {
  try {
    const email = "basic@example.com";

    const result = await prisma.user.update({
      where: { email },
      data: {
        onboardingCompleted: false,
        onboardingSkipped: false,
        onboardingStep: 0,
      },
      select: {
        email: true,
        onboardingCompleted: true,
        onboardingSkipped: true,
        onboardingStep: true,
      },
    });

    console.log("✅ Onboarding reset successfully for:", email);
    console.log("Current status:", result);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetOnboarding();
