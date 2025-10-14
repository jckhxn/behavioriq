/**
 * Supabase Auth Email Service
 *
 * Provides helper functions for magic links and password resets
 */

import { createClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Send a magic link to the user's email (client-side)
 */
export async function sendMagicLink(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Magic link sent to your email" };
}

/**
 * Send a password reset email (client-side)
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Password reset email sent" };
}

/**
 * Update user password (server-side)
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Password updated successfully" };
}

/**
 * Get current authenticated user (server-side)
 * Returns the Supabase auth user combined with database user data
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get current user with full database data including role
 */
export async function getCurrentUserWithRole() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Validate required environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
      throw new Error("Server configuration error");
    }

    // Use Supabase service role client to query database
    // Service role bypasses RLS policies
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Query user from database using Supabase (not Prisma)
    const { data: dbUser, error } = await supabaseAdmin
      .from("users")
      .select(
        `
      *,
      licenses:user_licenses(
        *,
        license:licenses(*)
      )
    `
      )
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user from database:", error);
      return null;
    }

    return dbUser as any;
  } catch (error) {
    console.error("Error in getCurrentUserWithRole:", error);
    throw error;
  }
}

/**
 * Sign out user (client-side)
 */
export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Verify if user's email is confirmed
 */
export async function isEmailConfirmed() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email_confirmed_at !== null;
}

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: "Confirmation email resent" };
}
