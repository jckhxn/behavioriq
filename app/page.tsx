"use client";

import { useState } from "react";
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
  ChevronDown,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScoringSidebar } from "@/components/scoring/ScoringSidebar";
import { LandingPage } from "@/components/landing/LandingPage";
import { AssessmentsView } from "@/components/assessment/AssessmentsView";
import { CompactRecommendationsWithModal } from "@/components/recommendations/CompactRecommendationsWithModal";
import { ThemeToggle } from "@/components/theme-toggle";
import SettingsPane from "@/components/settings/SettingsPane";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
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
            <AssessmentsView />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ user }: { user: any }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
                  Assessments
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    Settings
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <div className="mt-2 border rounded-lg bg-muted/30">
                  <SettingsPane />
                </div>
              </CollapsibleContent>
            </Collapsible>
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
