// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setSuperAdmin() {
  // Get your email from command line args or use default
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/set-super-admin.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (current role: ${user.role})`);

    if (user.role === "SUPER_ADMIN") {
      console.log("✅ User is already a SUPER_ADMIN");
      process.exit(0);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "SUPER_ADMIN" },
    });

    console.log(`✅ Successfully upgraded ${user.email} to SUPER_ADMIN`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperAdmin();
