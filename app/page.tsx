"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { AssessmentsView } from "@/components/assessment/AssessmentsView";
import { CompactRecommendationsWithModal } from "@/components/recommendations/CompactRecommendationsWithModal";
import { ThemeToggle } from "@/components/theme-toggle";
import SettingsPane from "@/components/settings/SettingsPane";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check URL parameters for tab and upgrade status
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    const upgraded = urlParams.get("upgraded");

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

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (status === "loading") {
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

  if (!session?.user) {
    return <LandingPage />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Responsive Sidebar */}
        <AppSidebar user={session.user} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="glass-effect border-b sticky top-0 z-40 flex h-16 items-center gap-4 px-4">
            <SidebarTrigger className="md:hidden" />

            <div className="flex items-center gap-3 flex-1">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Assessment Platform
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <span className="text-sm font-medium text-foreground">
                  Welcome, {session.user.name || session.user.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(session.user.role as string) === "SUPER_ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("admin")}
                    className="hover-lift"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Admin Tools
                  </Button>
                )}
                {session.user.role === "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover-lift"
                  >
                    <Link href="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ redirectTo: "/login" })}
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
              <div className="border-b px-6 py-3">
                <TabsList
                  className={`grid w-fit ${(session.user.role as string) === "SUPER_ADMIN" ? "grid-cols-3" : "grid-cols-2"}`}
                >
                  <TabsTrigger
                    value="dashboard"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  {(session.user.role as string) === "SUPER_ADMIN" && (
                    <TabsTrigger
                      value="admin"
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Admin Tools
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {(session.user.role as string) === "SUPER_ADMIN"
                      ? "Super Admin"
                      : "Settings"}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="dashboard"
                className="flex-1 overflow-hidden mt-0"
              >
                <AssessmentsView />
              </TabsContent>

              {(session.user.role as string) === "SUPER_ADMIN" && (
                <TabsContent
                  value="admin"
                  className="flex-1 overflow-auto mt-0 p-6"
                >
                  <AdminDashboard />
                </TabsContent>
              )}

              <TabsContent
                value="settings"
                className="flex-1 overflow-auto mt-0 p-6"
              >
                <div className="max-w-4xl mx-auto">
                  <SettingsPane />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
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
            onClick={() => signOut({ redirectTo: "/login" })}
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
