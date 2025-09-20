"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AssessmentChat } from "./AssessmentChat";
import { KnowledgeChat } from "./KnowledgeChat";
import { ScoringSidebar } from "@/components/scoring/ScoringSidebar";
import { useSession } from "next-auth/react";
import { Brain, FileText, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface UnifiedChatProps {
  defaultTab?: "assessment" | "knowledge";
}

export function UnifiedChat({ defaultTab = "assessment" }: UnifiedChatProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const [scoringSheetOpen, setScoringSheetOpen] = useState(false);

  // Initialize sessions when tab changes
  useEffect(() => {
    if (!session?.user) return;

    const initializeSessions = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "assessment" && !assessmentId) {
          // Create new assessment
          const response = await fetch("/api/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subjectName: `Assessment ${new Date().toLocaleDateString()}`,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setAssessmentId(data.assessmentId);
          }
        } else if (activeTab === "knowledge" && !sessionId) {
          // Create new knowledge session
          const response = await fetch("/api/knowledge/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `Chat ${new Date().toLocaleDateString()}`,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setSessionId(data.sessionId);
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSessions();
  }, [activeTab, session?.user, assessmentId, sessionId]);

  if (!session?.user) {
    return (
      <div className="card-gradient p-8 text-center rounded-xl animate-fade-in">
        <div className="p-3 rounded-full gradient-primary inline-block mb-4">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <p className="text-lg font-medium">
          Please log in to access the chat features.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "assessment" | "knowledge")
        }
        className="w-full h-full flex flex-col"
      >
        {/* Mobile-optimized Tab List with Scoring Button */}
        <div className="flex items-center gap-2 mb-4">
          <TabsList className="grid flex-1 grid-cols-2 h-12 p-1 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <TabsTrigger
              value="assessment"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white transition-all duration-200"
            >
              <Brain className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">Assessment</span>
              <span className="font-medium sm:hidden">Assess</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              className="flex items-center gap-2 h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-white transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">Knowledge</span>
              <span className="font-medium sm:hidden">Know</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Scoring Button - Only show on assessment tab for mobile */}
          {activeTab === "assessment" && assessmentId && isMobile && (
            <Sheet open={scoringSheetOpen} onOpenChange={setScoringSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-12 px-3">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Assessment Scores</SheetTitle>
                  <SheetDescription>
                    Real-time scoring and risk assessment
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 h-full overflow-auto">
                  <ScoringSidebar assessmentId={assessmentId} />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Chat */}
          <div className="flex-1 min-w-0">
            <TabsContent value="assessment" className="h-full m-0">
              <div className="card-gradient rounded-xl h-[calc(100vh-12rem)] animate-slide-up">
                {assessmentId ? (
                  <AssessmentChat assessmentId={assessmentId} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="p-3 rounded-full gradient-primary inline-block animate-scale-in">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-lg font-medium">
                        Initializing assessment...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="h-full m-0">
              <div className="card-gradient rounded-xl h-[calc(100vh-12rem)] animate-slide-up">
                {sessionId ? (
                  <KnowledgeChat sessionId={sessionId} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="p-3 rounded-full gradient-accent inline-block animate-scale-in">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-lg font-medium">
                        Initializing knowledge chat...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>

          {/* Desktop-only Scoring Sidebar */}
          {activeTab === "assessment" && assessmentId && !isMobile && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="card-gradient rounded-xl p-4 animate-slide-up sticky top-6 h-fit">
                <ScoringSidebar assessmentId={assessmentId} />
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
