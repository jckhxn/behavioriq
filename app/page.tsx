"use client";
// import LandingPagePricing from "../components/landing/LandingPagePricing";

import { useState, useEffect, Suspense } from "react";
import { useUserData, useSignOut } from "@/lib/hooks/use-supabase-user";
import { useSearchParams, useRouter } from "next/navigation";
import { UnifiedChat } from "@/components/chat/UnifiedChat";
import { Button } from "@/components/ui/button";
import {
  Brain,
  LogOut,
  Settings,
  Menu,
  FileText,
  Lightbulb,
  Star,
  Shield,
  Loader2,
  Library,
} from "lucide-react";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScoringSidebar } from "@/components/scoring/ScoringSidebar";
import { LandingPage } from "@/components/landing/LandingPage";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CompactRecommendationsWithModal } from "@/components/recommendations/CompactRecommendationsWithModal";
import { ThemeToggle } from "@/components/theme-toggle";
import SettingsPane from "@/components/settings/SettingsPane";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SuperAdminPlatformSettings } from "@/components/admin/SuperAdminPlatformSettings";
import UserResourceLibrary from "@/components/resources/UserResourceLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnboardingProvider } from "@/lib/contexts/OnboardingContext";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";

function HomeContent() {
  const { userData, isLoading } = useUserData();
  const { signOut } = useSignOut();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { showWelcome, startTour, skipTour } = useOnboarding();

  const handleStartSnapshot = () => {
    // Preserve affiliate ref parameter if present
    const ref = searchParams.get("ref");
    const consentUrl = ref ? `/consent?ref=${encodeURIComponent(ref)}` : "/consent";
    router.push(consentUrl);
  };

  useEffect(() => {
    // Check URL parameters for tab and upgrade status
    const tab = searchParams.get("tab");
    const upgraded = searchParams.get("upgraded");
    const purchase = searchParams.get("purchase");
    const subtab = searchParams.get("subtab");

    if (tab === "settings") {
      setActiveTab("settings");
    }

    // Show success message for subscription upgrades
    if (upgraded === "true") {
      const { toast } = require("sonner");
      toast.success("🎉 Membership Upgraded!", {
        description:
          "Welcome to your BehaviorIQ™ Membership! You can now create unlimited assessments.",
        duration: 5000,
      });

      // Clean up URL, but preserve tab/subtab parameters
      const newParams = new URLSearchParams();
      if (tab) newParams.set("tab", tab);
      if (subtab) newParams.set("subtab", subtab);
      const newUrl = newParams.toString()
        ? `?${newParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    // Show success message for assessment purchases
    if (purchase === "success") {
      const { toast } = require("sonner");
      toast.success("🎉 Purchase Successful!", {
        description:
          "Your assessment credit has been added. You can now create a new assessment.",
        duration: 5000,
      });

      // Clean up URL, but preserve tab/subtab parameters
      const newParams = new URLSearchParams();
      if (tab) newParams.set("tab", tab);
      if (subtab) newParams.set("subtab", subtab);
      const newUrl = newParams.toString()
        ? `?${newParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    // Show message for cancelled purchases
    if (purchase === "cancelled") {
      const { toast } = require("sonner");
      toast.info("Purchase Cancelled", {
        description: "Your payment was cancelled. No charges were made.",
        duration: 4000,
      });

      // Clean up URL, but preserve tab/subtab parameters
      const newParams = new URLSearchParams();
      if (tab) newParams.set("tab", tab);
      if (subtab) newParams.set("subtab", subtab);
      const newUrl = newParams.toString()
        ? `?${newParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <>
        <LandingPage onStartSnapshot={handleStartSnapshot} />
      </>
    );
  }

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onStartTour={startTour}
        onSkip={skipTour}
      />
      <OnboardingTour />

      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Responsive Sidebar */}
          <AppSidebar user={userData} />

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-screen w-full min-w-0 overflow-hidden">
            {/* Header */}
            <header className="glass-effect border-b sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-4 px-3 sm:px-4">
              <SidebarTrigger className="lg:hidden shrink-0" />

              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 rounded-lg gradient-primary shrink-0">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h1 className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                  AI Assessment Platform
                </h1>
              </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <span className="text-sm font-medium text-foreground">
                    Welcome, {userData.name || userData.email}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="hover-lift"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <div className="border-b px-4 md:px-6 py-3">
                  <TabsList
                    className={`grid w-full sm:w-fit ${userData.role === "SUPER_ADMIN" ? "grid-cols-4" : "grid-cols-3"}`}
                  >
                    <TabsTrigger
                      value="dashboard"
                      className="flex items-center gap-2"
                      data-tab-id="dashboard"
                    >
                      <FileText className="h-4 w-4" />
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="library"
                      className="flex items-center gap-2"
                      data-tab-id="library"
                    >
                      <Library className="h-4 w-4" />
                      Library
                    </TabsTrigger>
                    {userData.role === "SUPER_ADMIN" && (
                      <TabsTrigger
                        value="admin"
                        className="flex items-center gap-2"
                        data-tab-id="admin"
                      >
                        <Shield className="h-4 w-4" />
                        Super Admin
                      </TabsTrigger>
                    )}
                    <TabsTrigger
                      value="settings"
                      className="flex items-center gap-2"
                      data-tab-id="settings"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="dashboard"
                  className="flex-1 overflow-hidden mt-0"
                >
                  <div id="assessments-list">
                    <DashboardShell />
                  </div>
                </TabsContent>

                <TabsContent
                  value="library"
                  className="flex-1 overflow-auto mt-0 p-4 md:p-6"
                >
                  <div className="max-w-7xl mx-auto w-full">
                    <UserResourceLibrary />
                  </div>
                </TabsContent>

                {userData.role === "SUPER_ADMIN" && (
                  <TabsContent
                    value="admin"
                    className="flex-1 overflow-auto mt-0 p-4 md:p-6"
                  >
                    <div className="max-w-7xl mx-auto w-full">
                      <SuperAdminPlatformSettings />
                    </div>
                  </TabsContent>
                )}

                <TabsContent
                  value="settings"
                  className="flex-1 overflow-auto mt-0 p-4 md:p-6"
                >
                  <div className="max-w-4xl mx-auto w-full">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      }
                    >
                      <SettingsPane />
                    </Suspense>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

function AppSidebar({ user }: { user: any }) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg gradient-primary">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">AI Assessment</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <div className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user.role === "ADMIN" && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>

        {/* Recommendations Section */}
        <div className="flex-1 border-t px-4 py-2 overflow-hidden">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Recommendations
          </h3>
          <div className="h-full overflow-y-auto">
            <CompactRecommendationsWithModal />
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Theme</div>
            <ThemeToggle />
          </div>
          <div className="text-xs text-muted-foreground">Signed in as:</div>
          <div className="text-sm font-medium truncate">
            {user.name || user.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const supabase = require("@/lib/supabase/client").createClient();
              supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Home() {
  return (
    <OnboardingProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }
      >
        <HomeContent />
        {/* <LandingPagePricing /> */}
      </Suspense>
    </OnboardingProvider>
  );
}
