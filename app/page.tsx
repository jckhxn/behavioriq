"use client";

import { useEffect, Suspense } from "react";
import { useUserData } from "@/lib/hooks/use-supabase-user";
import { useSearchParams, useRouter } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { Brain } from "lucide-react";

const DISTRICT_REDIRECTS: Record<string, string> = {
  TEACHER: "/teacher",
  COUNSELOR: "/counselor",
  PRINCIPAL: "/principal",
  DISTRICT_ADMIN: "/district",
};

function HomeContent() {
  const { userData, isLoading } = useUserData();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !userData) return;

    const role = userData.role;

    // District roles go to their specialized dashboards
    if (DISTRICT_REDIRECTS[role]) {
      router.replace(DISTRICT_REDIRECTS[role]);
      return;
    }

    // All other authenticated users go to the main dashboard
    // Preserve any affiliate ref parameter
    const ref = searchParams.get("ref");
    const tab = searchParams.get("tab");

    // Map legacy tab params to new routes
    if (tab === "settings") {
      router.replace("/dashboard/settings");
    } else if (tab === "library") {
      router.replace("/dashboard/library");
    } else if (tab === "admin") {
      router.replace("/dashboard/overview");
    } else {
      router.replace("/dashboard/overview");
    }
  }, [userData, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Brain className="h-10 w-10 animate-pulse text-indigo-500" />
      </div>
    );
  }

  // Authenticated users are being redirected — show nothing (or brief spinner)
  if (userData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF8F3" }}>
        <Brain className="h-10 w-10 animate-pulse" style={{ color: "#6366F1" }} />
      </div>
    );
  }

  // Unauthenticated — show landing page
  const handleStartSnapshot = () => {
    const ref = searchParams.get("ref");
    router.push(ref ? `/consent?ref=${encodeURIComponent(ref)}` : "/consent");
  };

  return <LandingPage onStartSnapshot={handleStartSnapshot} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF8F3" }}>
          <Brain className="h-10 w-10 animate-pulse" style={{ color: "#6366F1" }} />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
