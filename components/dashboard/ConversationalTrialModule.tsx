"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MessageCircle,
  CheckCircle,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import ConversationalChatWidget from "./ConversationalChatWidget";
import { formatPrice, PRICING } from "@/lib/config/pricing";

interface ConversationalTrialModuleProps {
  hasCompletedTrial: boolean;
  hasEnhancedReport: boolean;
  assessmentId?: string;
}

export default function ConversationalTrialModule({
  hasCompletedTrial,
  hasEnhancedReport,
  assessmentId,
}: ConversationalTrialModuleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasConversationalAI, setHasConversationalAI] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(() => {
    // Check if we should show the success banner (just after purchase)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("enhanced_unlocked") === "true";
    }
    return false;
  });

  useEffect(() => {
    // Check if user has conversational AI included in their subscription
    const checkLicense = async () => {
      try {
        const response = await fetch("/api/user/license");
        if (response.ok) {
          const data = await response.json();
          if (data.hasLicense && data.license?.features) {
            setHasConversationalAI(
              data.license.features.conversationalAI === true
            );
          }
        }
      } catch (error) {
        console.error("Failed to check license:", error);
      }
    };
    checkLicense();
  }, []);

  // Enhanced Report Active State
  if (hasEnhancedReport && assessmentId) {
    return (
      <>
        {/* Success Banner - Shows once after purchase */}
        {showSuccessBanner && (
          <Card className="border-green-500 bg-green-500/10 mb-4">
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      🎉 Enhanced Report Unlocked!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      Your child's voice has been added to the assessment. View
                      the enhanced report below.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSuccessBanner(false);
                    // Remove the query parameter
                    const url = new URL(window.location.href);
                    url.searchParams.delete("enhanced_unlocked");
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className="text-green-700 hover:text-green-900 dark:text-green-300"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular enhanced report card - always visible */}
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Enhanced Conversational Report
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-700 dark:text-green-400"
              >
                ✓ Active
              </Badge>
            </div>
            <CardDescription>
              View your child's responses alongside yours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/assessment/${assessmentId}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Enhanced Report
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Conversational Chat Widget */}
        <ConversationalChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          assessmentId={assessmentId}
        />
      </>
    );
  }

  // Trial Complete - Upsell State
  if (hasCompletedTrial && assessmentId) {
    return (
      <>
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Preview of Your Child's Responses
              </CardTitle>
              <Badge variant="secondary">Trial Complete</Badge>
            </div>
            <CardDescription className="text-sm">
              Here's a sample of how your child answered the 15 trial questions.
              Want to unlock the full Conversational Report Add-On with AI
              insights, direct quotes, and a school-ready PDF?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* What's Inside Box */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-3 flex items-center justify-between">
                <span>
                  What's Inside the{" "}
                  {hasConversationalAI
                    ? "Included"
                    : formatPrice(PRICING.ENHANCED_REPORT)}{" "}
                  Upgrade:
                </span>
                {hasConversationalAI && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                    ✓ Included in Subscription
                  </Badge>
                )}
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Your child's voice documented in their own words</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>AI analysis comparing parent vs child responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Expanded recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>Enhanced PDF for school use</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href={`/checkout-enhanced/${assessmentId}`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {hasConversationalAI
                    ? "Activate Enhanced Report (Included)"
                    : `Unlock Enhanced Report – ${formatPrice(PRICING.ENHANCED_REPORT)}`}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/dashboard">
                  No thanks, I'll stick with the standard report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversational Chat Widget */}
        <ConversationalChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          assessmentId={assessmentId}
        />
      </>
    );
  }

  // Initial Trial Teaser State
  return (
    <>
      <Card className="border-primary/30 hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              ✨ Try Conversational Mode
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Children often reveal things in conversation that don't show up in
            parent-only questionnaires. Let your child answer the full
            15-question trial in a friendly, child-safe AI chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            See their perspective —{" "}
            <span className="font-semibold text-foreground">free</span>.
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Free Trial
          </Button>
        </CardContent>
      </Card>

      {/* Conversational Chat Widget */}
      <ConversationalChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        assessmentId={assessmentId}
      />
    </>
  );
}
