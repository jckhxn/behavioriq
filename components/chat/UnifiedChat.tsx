"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AssessmentChat } from "./AssessmentChat";
import { ScoringSidebar } from "@/components/scoring/ScoringSidebar";
import { useSession } from "next-auth/react";
import { Brain, BarChart3 } from "lucide-react";
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
  className?: string;
}

export function UnifiedChat({ className }: UnifiedChatProps) {
  const { data: session } = useSession();
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const [scoringSheetOpen, setScoringSheetOpen] = useState(false);

  // Initialize assessment when component mounts
  useEffect(() => {
    if (!session?.user || assessmentId) return;

    const initializeAssessment = async () => {
      setIsLoading(true);
      try {
        // Create new assessment
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectName: `Assessment ${new Date().toLocaleDateString()}`,
          }),
        });

        if (response.ok) {
          const assessment = await response.json();
          setAssessmentId(assessment.id);
        }
      } catch (error) {
        console.error("Error creating assessment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAssessment();
  }, [session?.user, assessmentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <div className="p-3 rounded-full gradient-primary inline-block animate-scale-in">
            <Brain className="h-6 w-6 text-white animate-pulse" />
          </div>
          <p className="text-lg font-medium">Initializing assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 ${className || ""}`}>
      <div className="w-full h-full flex flex-col">
        {/* Header with Assessment Title and Mobile Scoring Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                AI Behavioral Assessment
              </h1>
              <p className="text-muted-foreground">
                Structured clinical evaluation
              </p>
            </div>
          </div>

          {/* Mobile Scoring Button */}
          {assessmentId && isMobile && (
            <Sheet open={scoringSheetOpen} onOpenChange={setScoringSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-12 px-3">
                  <BarChart3 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Scores</span>
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
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Main Assessment Chat */}
          <div className="flex-1 min-w-0">
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
                      Starting assessment...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop-only Scoring Sidebar */}
          {assessmentId && !isMobile && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="card-gradient rounded-xl p-4 animate-slide-up sticky top-6 h-fit">
                <ScoringSidebar assessmentId={assessmentId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}