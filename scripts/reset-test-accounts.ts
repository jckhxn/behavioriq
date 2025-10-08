/**
 * Reset passwords for all test accounts
 * This sets a default password for all users except the super admin
 */

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

async function resetAllTestAccounts() {
  const defaultPassword = process.argv[2] || "TestPass123!";
  const excludeEmail = "tjhixon@gmail.com";

  console.log(`\n🔧 Resetting passwords for all test accounts...`);
  console.log(`   Default password: ${defaultPassword}`);
  console.log(`   Excluding: ${excludeEmail}\n`);

  // Get all users from database
  const users = await prisma.user.findMany({
    where: {
      email: {
        not: excludeEmail,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`📋 Found ${users.length} test accounts to reset:\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      console.log(`🔄 Resetting: ${user.email} (${user.name})`);

      // Update password using admin API
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password: defaultPassword,
        }
      );

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Password reset successful`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`\n🔑 Login credentials for test accounts:`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`\n📝 Test account emails:`);
  users.forEach((user) => {
    console.log(`   - ${user.email}`);
  });

  await prisma.$disconnect();
}

async function main() {
  await resetAllTestAccounts();
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
