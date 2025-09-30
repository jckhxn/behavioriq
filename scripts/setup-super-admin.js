/**
 * Super Admin Setup Script
 * Creates the super admin user with global platform access
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setupSuperAdmin() {
  const SUPER_ADMIN_EMAIL = "tjhixon@gmail.com";
  const SUPER_ADMIN_PASSWORD = "Apple11258a!";
  const SUPER_ADMIN_NAME = "Tyler Hixon";

  console.log("🚀 Setting up Super Admin user...");

  try {
    // Check if super admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingUser) {
      // Update existing user to super admin
      console.log("👤 Existing user found, updating to SUPER_ADMIN role...");

      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      const updatedUser = await prisma.user.update({
        where: { email: SUPER_ADMIN_EMAIL },
        data: {
          name: SUPER_ADMIN_NAME,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });

      console.log("✅ Super Admin user updated successfully!");
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`👤 Name: ${updatedUser.name}`);
      console.log(`🔐 Role: ${updatedUser.role}`);
    } else {
      // Create new super admin user
      console.log("🆕 Creating new Super Admin user...");

      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      const newUser = await prisma.user.create({
        data: {
          email: SUPER_ADMIN_EMAIL,
          name: SUPER_ADMIN_NAME,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });

      console.log("✅ Super Admin user created successfully!");
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Name: ${newUser.name}`);
      console.log(`🔐 Role: ${newUser.role}`);
    }

    // Display access information
    console.log("\n🎯 Super Admin Access:");
    console.log(
      "- Global assessment management (trial/regular for all parents)"
    );
    console.log("- District oversight and management");
    console.log("- Platform-wide configuration");
    console.log("- Full admin dashboard access");

    console.log("\n🔑 Login Credentials:");
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(
      "\n⚠️  Please change the password after first login for security!"
    );
  } catch (error) {
    console.error("❌ Error setting up Super Admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupSuperAdmin()
  .then(() => {
    console.log("\n🎉 Super Admin setup completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Super Admin setup failed:", error);
    process.exit(1);
  });
