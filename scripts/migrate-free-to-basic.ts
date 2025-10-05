/**
 * Migration Script: Convert FREE licenses to BASIC
 *
 * This script converts all existing FREE license types to BASIC
 * since we're removing the FREE license type from the system.
 *
 * Run with: npx tsx scripts/migrate-free-to-basic.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Starting migration: FREE → BASIC...\n");

  try {
    // Find all FREE licenses
    const freeLicenses = await prisma.license.findMany({
      where: {
        type: "FREE" as any, // Cast since TypeScript doesn't know about FREE anymore
      },
      include: {
        users: true,
      },
    });

    console.log(`Found ${freeLicenses.length} FREE licenses to migrate\n`);

    if (freeLicenses.length === 0) {
      console.log("✅ No FREE licenses found. Migration complete!");
      return;
    }

    // Convert each FREE license to BASIC
    let converted = 0;
    for (const license of freeLicenses) {
      console.log(
        `Converting license ${license.id} (${license.users.length} users)...`
      );

      await prisma.license.update({
        where: { id: license.id },
        data: {
          type: "BASIC",
          maxAssessments: 0, // View-only by default
          status: "ACTIVE",
        },
      });

      converted++;
      console.log(`  ✅ Converted to BASIC (view-only)`);
    }

    console.log(
      `\n✅ Successfully converted ${converted} licenses from FREE to BASIC`
    );
    console.log("\nNext steps:");
    console.log(
      "1. Run: npx prisma migrate dev --name remove_free_license_type"
    );
    console.log("2. Test the application");
    console.log("3. Commit changes\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
