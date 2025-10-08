/**
 * Supabase Auth Hooks for Client Components
 *
 * These hooks replace NextAuth's useSession() with Supabase equivalents.
 * Use these in any client component that needs auth state.
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseUserResult {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get the current Supabase user
 * Replaces: const { data: session } = useSession()
 * Use: const { user, isLoading } = useUser()
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setError(error);
      } else {
        setUser(data.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, error };
}

/**
 * Hook to get full user data including role and database fields
 * Replaces: useSession() when you need full user data
 * Use: const { userData, isLoading } = useUserData()
 */
interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  // Add other fields as needed
}

interface UseUserDataResult {
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
}

export function useUserData(): UseUserDataResult {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, isLoading, error };
}

/**
 * Hook to sign out
 * Replaces: import { signOut } from "next-auth/react"
 * Use: const { signOut } = useSignOut()
 */
export function useSignOut() {
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return { signOut };
}
