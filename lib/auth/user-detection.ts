/**
 * User Detection Utility
 * Checks if a user exists in the database by email
 * Used to determine if a magic link login is for an existing or new user
 */

/**
 * Check if a user exists by email
 * @param email - Email address to check
 * @returns Promise<boolean> - True if user exists
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.error("[user-detection] check-email failed:", response.status);
      return false;
    }

    const data = await response.json();
    return data.exists === true;
  } catch (error) {
    console.error("[user-detection] Error checking user existence:", error);
    return false;
  }
}

/**
 * Get the current user's email from Supabase session
 * @returns Promise<string | null> - User email or null if not authenticated
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.email ?? null;
  } catch (error) {
    console.error("[user-detection] Error getting current user:", error);
    return null;
  }
}
