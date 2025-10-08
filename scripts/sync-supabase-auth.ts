/**
 * Sync user from database to Supabase Auth
 * This creates or updates a user in Supabase Auth to match the database
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

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

async function syncUserToSupabaseAuth(email: string) {
  console.log(`\n🔍 Looking up user: ${email}`);

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!dbUser) {
    console.error(`❌ User not found in database: ${email}`);
    return;
  }

  console.log("✅ Found in database:", {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  });

  // Check if user exists in Supabase Auth
  console.log("\n🔍 Checking Supabase Auth...");
  const { data: existingUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error listing Supabase users:", listError);
    return;
  }

  const existingUser = existingUsers.users.find((u) => u.email === email);

  if (existingUser) {
    console.log("✅ User exists in Supabase Auth:", existingUser.id);

    // Check if ID matches
    if (existingUser.id !== dbUser.id) {
      console.warn("⚠️  WARNING: Supabase Auth ID doesn't match database ID!");
      console.warn("   Database ID:", dbUser.id);
      console.warn("   Supabase ID:", existingUser.id);
      console.warn("\n   Updating database to match Supabase Auth ID...");

      await prisma.user.update({
        where: { email },
        data: { id: existingUser.id },
      });

      console.log("✅ Database updated with Supabase Auth ID");
    }

    // Send password reset email
    console.log("\n📧 Sending password reset email...");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?type=recovery`,
      }
    );

    if (resetError) {
      console.error("❌ Error sending password reset:", resetError);
      return;
    }

    console.log("✅ Password reset email sent!");
    console.log(
      "\n📬 Check your email and click the link to set a new password."
    );
  } else {
    console.log("⚠️  User does NOT exist in Supabase Auth");
    console.log("\n🔧 Creating user in Supabase Auth...");

    // Create user in Supabase Auth with the same ID from database
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: dbUser.name,
        },
      });

    if (createError) {
      console.error("❌ Error creating user:", createError);
      return;
    }

    console.log("✅ User created in Supabase Auth:", newUser.user.id);

    // Update database with the Supabase Auth ID
    console.log("🔧 Updating database with Supabase Auth ID...");
    await prisma.user.update({
      where: { email },
      data: { id: newUser.user.id },
    });

    console.log("✅ Database updated");

    // Send password reset to set initial password
    console.log("\n📧 Sending password setup email...");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?type=recovery`,
      }
    );

    if (resetError) {
      console.error("❌ Error sending setup email:", resetError);
      return;
    }

    console.log("✅ Password setup email sent!");
    console.log(
      "\n📬 Check your email and click the link to set your password."
    );
  }
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("\nUsage: npx ts-node scripts/sync-supabase-auth.ts <email>");
    process.exit(1);
  }

  await syncUserToSupabaseAuth(email);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
