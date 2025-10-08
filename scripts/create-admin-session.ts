/**
 * Create a temporary admin session by generating a magic link URL
 * This bypasses email timing issues for local development
 */

import { createClient } from "@supabase/supabase-js";
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

async function createAdminPassword(email: string, password: string) {
  console.log(`\n🔧 Setting password for: ${email}`);

  // Update user with new password
  const { data, error } = await supabase.auth.admin.updateUserById(
    "7a79e16b-242f-4a34-b660-45d76273807a", // Your user ID
    { password }
  );

  if (error) {
    console.error("❌ Error setting password:", error);
    return;
  }

  console.log("✅ Password set successfully!");
  console.log("\n📝 You can now login with:");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("\n🌐 Go to: http://localhost:3000/login");
}

async function main() {
  const email = "tjhixon@gmail.com";
  const password = process.argv[2];

  if (!password) {
    console.error("❌ Please provide a password");
    console.log(
      "\nUsage: npx ts-node scripts/create-admin-session.ts <password>"
    );
    console.log(
      "Example: npx ts-node scripts/create-admin-session.ts MySecurePass123!"
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ Password must be at least 6 characters");
    process.exit(1);
  }

  await createAdminPassword(email, password);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
