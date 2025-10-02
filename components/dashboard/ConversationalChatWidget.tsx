"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConversationalAssessment } from "@/components/assessment/ConversationalAssessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Download, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ConversationalChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId?: string;
}

export default function ConversationalChatWidget({
  isOpen,
  onClose,
  assessmentId,
}: ConversationalChatWidgetProps) {
  const router = useRouter();
  const [showUpsell, setShowUpsell] = useState(false);
  const [completedAssessmentId, setCompletedAssessmentId] = useState<string | null>(null);
  const [isCreatingMock, setIsCreatingMock] = useState(false);

  const handleComplete = async (responses: Record<string, boolean>) => {
    console.log("Assessment completed with responses:", responses);
    
    // In a real implementation, you'd save this to the database
    // and get back the assessment ID
    // For now, we'll use the passed assessmentId or generate one
    const newAssessmentId = assessmentId || `temp_${Date.now()}`;
    setCompletedAssessmentId(newAssessmentId);
    
    // Show upsell instead of redirecting
    setShowUpsell(true);
  };

  // 🐛 DEBUG: Create real mock assessment in database and skip to upsell
  const handleDebugCreateAndSkip = async () => {
    setIsCreatingMock(true);
    try {
      const response = await fetch("/api/debug/create-mock-conversational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: "Demo Child" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompletedAssessmentId(data.assessmentId);
        setShowUpsell(true);
        console.log("✅ Created mock assessment:", data.assessmentId);
      } else {
        const error = await response.json();
        console.error("Failed to create mock:", error);
        alert("Failed to create mock assessment. Check console for details.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create mock assessment. Check console for details.");
    } finally {
      setIsCreatingMock(false);
    }
  };

  // 🐛 DEBUG: Skip to upsell with temp ID (old method)
  const handleDebugSkipToUpsell = () => {
    const debugAssessmentId = assessmentId || `debug_${Date.now()}`;
    setCompletedAssessmentId(debugAssessmentId);
    setShowUpsell(true);
  };

  const handleCloseUpsell = () => {
    setShowUpsell(false);
    onClose();
    // Refresh the page to update the dashboard widget
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {!showUpsell ? (
          <>
            <DialogHeader className="p-6 pb-4 shrink-0 border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">Conversational Assessment</DialogTitle>
                  <DialogDescription>
                    Answer questions naturally in your own words
                  </DialogDescription>
                </div>
                {/* 🐛 DEBUG BUTTONS - Remove in production */}
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDebugCreateAndSkip}
                    disabled={isCreatingMock}
                    className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                  >
                    {isCreatingMock ? "Creating..." : "🐛 Create Real Mock"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDebugSkipToUpsell}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                  >
                    🐛 Quick Preview
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <ConversationalAssessment onComplete={handleComplete} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upsell Content After Completion */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Assessment Complete! 🎉</h2>
              <p className="text-muted-foreground">
                Great job! You've completed the conversational trial.
              </p>
            </div>

            {/* Preview Section */}
            <Card className="border-primary/50 bg-primary/5 mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Preview of Your Responses</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Here's a glimpse of how your responses look. Want the full analysis with AI insights?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Response Preview */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Sample Question:</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    "How often does your child have trouble focusing on tasks?"
                  </p>
                  <div className="bg-background rounded p-3 border">
                    <p className="text-sm">
                      <span className="font-medium text-primary">Your response:</span> "They struggle with homework but can focus on video games for hours..."
                    </p>
                  </div>
                </div>

                {/* What's Inside Box */}
                <div className="rounded-lg border p-4 bg-background">
                  <p className="text-sm font-medium mb-3">Unlock the Full Enhanced Report for $9:</p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Complete transcript of all your responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>AI-powered analysis and insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Expanded recommendations tailored to your responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Professional PDF report for schools/specialists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>Lifetime access to your enhanced report</span>
                    </li>
                  </ul>
                </div>

                {/* Pricing & CTA */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">One-time payment</p>
                    <p className="text-3xl font-bold text-primary mb-2">$9</p>
                    <p className="text-xs text-muted-foreground">No subscription • Instant access</p>
                  </div>

                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full"
                  >
                    <Link href={completedAssessmentId ? `/checkout-enhanced/${completedAssessmentId}` : "#"}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Unlock Enhanced Report – $9
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={handleCloseUpsell}
                  >
                    No thanks, I'll view the basic report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseUpsell}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
