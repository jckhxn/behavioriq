import { UnifiedChat } from "@/components/chat/UnifiedChat";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth/config";
import { Brain, LogOut, Settings, Menu } from "lucide-react";
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

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Assessment & Document Chat
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Conversational AI behavioral assessments with intelligent
            document-based chat
          </p>
          <div className="space-x-4">
            <Button
              asChild
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="hover-lift">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
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
                AI Assessment & Document Chat
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

                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    className="hover-lift"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-4 md:p-6">
            <div className="animate-fade-in">
              <UnifiedChat />
            </div>
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

      <SidebarContent className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Assessment
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user.role === "ADMIN" && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Signed in as:</div>
          <div className="text-sm font-medium truncate">
            {user.name || user.email}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
