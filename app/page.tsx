import { UnifiedChat } from "@/components/chat/UnifiedChat"
import { Button } from "@/components/ui/button"
import { auth, signOut } from "@/lib/auth/config"
import { Brain, FileText, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AI Assessment & Document Chat</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Conversational AI behavioral assessments with intelligent document-based chat
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Assessment & Document Chat</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {session.user.name || session.user.email}
            </span>
            
            <div className="flex items-center gap-2">
              {session.user.role === 'ADMIN' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" })
              }}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4">
        <UnifiedChat />
      </main>
    </div>
  )
}
