import { createBrowserClient } from "@supabase/ssr";

type CreateBrowserClientOptions = Parameters<typeof createBrowserClient>[2];

export type SupabaseStoragePreference = "local" | "session";

export const SUPABASE_STORAGE_PREFERENCE_KEY =
  "supabase-auth-storage-preference";

function readPreferenceFromStorage(
  storage: Storage | undefined,
  key: string
): SupabaseStoragePreference | null {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(key);
    if (value === "local" || value === "session") {
      return value;
    }
  } catch {
    // Access to storage can fail (Safari private mode, etc.)
  }

  return null;
}

function getStoragePreference(): SupabaseStoragePreference {
  if (typeof window === "undefined") {
    return "local";
  }

  return (
    readPreferenceFromStorage(
      window.sessionStorage,
      SUPABASE_STORAGE_PREFERENCE_KEY
    ) ??
    readPreferenceFromStorage(
      window.localStorage,
      SUPABASE_STORAGE_PREFERENCE_KEY
    ) ??
    "local"
  );
}

export function createClient(options?: CreateBrowserClientOptions) {
  const isBrowser = typeof window !== "undefined";
  const preference = isBrowser ? getStoragePreference() : "local";
  const resolvedStorage =
    options?.auth?.storage ??
    (isBrowser
      ? preference === "session"
        ? window.sessionStorage
        : window.localStorage
      : undefined);

  // Extract project ID from Supabase URL for proper cookie naming
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectIdMatch = supabaseUrl.match(/^https:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
  const projectId = projectIdMatch ? projectIdMatch[1] : "supabase";
  const storageKey = `sb-${projectId}-auth-token`;

  const authOptions = {
    ...options?.auth,
    storage: resolvedStorage,
    storageKey: storageKey,
    flowType: "pkce" as const,
  };

  return createBrowserClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...options,
      auth: authOptions,
    } as CreateBrowserClientOptions
  );
}
