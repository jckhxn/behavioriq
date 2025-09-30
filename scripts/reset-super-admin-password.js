/**
 * Reset Super Admin Password Script
 * Resets the password for tjhixon@gmail.com super admin account
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetSuperAdminPassword() {
  const SUPER_ADMIN_EMAIL = "tjhixon@gmail.com";
  const NEW_PASSWORD = "Apple11258a!";

  console.log("🔄 Resetting Super Admin password...");

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (!existingUser) {
      console.log("❌ Super Admin user not found. Creating new user...");

      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

      const newUser = await prisma.user.create({
        data: {
          email: SUPER_ADMIN_EMAIL,
          name: "Tyler Hixon",
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });

      console.log("✅ Super Admin user created successfully!");
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Name: ${newUser.name}`);
      console.log(`🔐 Role: ${newUser.role}`);
    } else {
      console.log("👤 Found existing user, resetting password...");
      console.log(`Current role: ${existingUser.role}`);
      console.log(`Current active status: ${existingUser.isActive}`);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

      // Update the user with new password and ensure proper role/status
      const updatedUser = await prisma.user.update({
        where: { email: SUPER_ADMIN_EMAIL },
        data: {
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isActive: true,
          name: "Tyler Hixon", // Ensure name is set
        },
      });

      console.log("✅ Super Admin password reset successfully!");
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`👤 Name: ${updatedUser.name}`);
      console.log(`🔐 Role: ${updatedUser.role}`);
      console.log(`✅ Active: ${updatedUser.isActive}`);
    }

    // Test the password hash
    console.log("\n🧪 Testing password hash...");
    const user = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    const passwordMatches = await bcrypt.compare(NEW_PASSWORD, user.password);
    console.log(
      `Password validation: ${passwordMatches ? "✅ PASS" : "❌ FAIL"}`
    );

    if (!passwordMatches) {
      console.log(
        "⚠️ Password hash verification failed! There may be an issue with bcrypt."
      );
    }

    console.log("\n🔑 Login Credentials:");
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);
    console.log("\n📍 Try logging in at: http://localhost:3001/login");
  } catch (error) {
    console.error("❌ Error resetting Super Admin password:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetSuperAdminPassword()
  .then(() => {
    console.log("\n🎉 Super Admin password reset completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Super Admin password reset failed:", error);
    process.exit(1);
  });
