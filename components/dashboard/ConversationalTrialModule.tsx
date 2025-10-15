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
  const [conversationalCredits, setConversationalCredits] = useState(0);
  const [hasViewedReport, setHasViewedReport] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(() => {
    // Check if we should show the success banner (just after purchase)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("enhanced_unlocked") === "true" ||
             urlParams.get("conversational_purchased") === "true";
    }
    return false;
  });

  // Check if user has already viewed the enhanced report
  useEffect(() => {
    if (assessmentId && typeof window !== "undefined") {
      const viewedKey = `enhanced_report_viewed_${assessmentId}`;
      const hasViewed = localStorage.getItem(viewedKey) === "true";
      setHasViewedReport(hasViewed);
    }
  }, [assessmentId]);

  useEffect(() => {
    // Check if user has conversational AI or credits
    const checkAccess = async () => {
      try {
        // Check license for unlimited conversational AI
        const licenseResponse = await fetch("/api/user/license");
        if (licenseResponse.ok) {
          const data = await licenseResponse.json();
          if (data.hasLicense && data.license?.features) {
            setHasConversationalAI(
              data.license.features.conversationalAI === true
            );
          }
        }

        // Check credits for pay-per-use conversational assessments
        const creditsResponse = await fetch("/api/user/credits");
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          setConversationalCredits(creditsData.conversationalCredits || 0);
        }
      } catch (error) {
        console.error("Failed to check conversational access:", error);
      }
    };
    checkAccess();
  }, []);

  const hasActiveSession = Boolean(assessmentId && !hasCompletedTrial);
  const isButtonDisabled = hasActiveSession || isChatOpen;

  // Enhanced Report Active State - DISABLED FOR NOW
  // if (hasEnhancedReport && assessmentId) {
  //   return (
  //     <>
  //       {/* Success Banner - Shows once after purchase */}
  //       {showSuccessBanner && (
  //         <Card className="border-green-500 bg-green-500/10 mb-4">
  //           <CardContent className="py-4">
  //             <div className="flex items-start justify-between">
  //               <div className="flex items-start gap-3">
  //                 <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
  //                 <div>
  //                   <h3 className="font-semibold text-green-900 dark:text-green-100">
  //                     🎉 Enhanced Report Unlocked!
  //                   </h3>
  //                   <p className="text-sm text-green-800 dark:text-green-200 mt-1">
  //                     Your child's voice has been added to the assessment. View
  //                     the enhanced report below.
  //                   </p>
  //                 </div>
  //               </div>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={() => {
  //                   setShowSuccessBanner(false);
  //                   // Remove the query parameter
  //                   const url = new URL(window.location.href);
  //                   url.searchParams.delete("enhanced_unlocked");
  //                   window.history.replaceState({}, "", url.toString());
  //                 }}
  //                 className="text-green-700 hover:text-green-900 dark:text-green-300"
  //               >
  //                 ✕
  //               </Button>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       )}

  //       {/* Regular enhanced report card - conditionally visible */}
  //       {!hasViewedReport && (
  //         <Card className="border-muted">
  //           <CardHeader>
  //             <div className="flex items-center gap-2">
  //               <Sparkles className="h-5 w-5 text-primary" />
  //               <CardTitle className="text-lg">
  //                 Enhanced Conversational Report
  //               </CardTitle>
  //               <Badge
  //                 variant="secondary"
  //                 className="bg-green-500/10 text-green-700 dark:text-green-400"
  //               >
  //                 ✓ Active
  //               </Badge>
  //             </div>
  //             <CardDescription>
  //               View your child's responses alongside yours.
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Button
  //               asChild
  //               className="w-full"
  //               onClick={() => {
  //                 // Mark as viewed when clicked
  //                 if (assessmentId && typeof window !== "undefined") {
  //                   const viewedKey = `enhanced_report_viewed_${assessmentId}`;
  //                   localStorage.setItem(viewedKey, "true");
  //                   setHasViewedReport(true);
  //                 }
  //               }}
  //             >
  //               <Link href={`/assessment/${assessmentId}`}>
  //                 <Eye className="mr-2 h-4 w-4" />
  //                 View Enhanced Report
  //               </Link>
  //             </Button>
  //           </CardContent>
  //         </Card>
  //       )}

  //       {/* Conversational Chat Widget */}
  //       <ConversationalChatWidget
  //         isOpen={isChatOpen}
  //         onClose={() => setIsChatOpen(false)}
  //         assessmentId={assessmentId}
  //       />
  //     </>
  //   );
  // }

  // Trial Complete - Upsell State - DISABLED FOR NOW
  // if (hasCompletedTrial && assessmentId) {
  //   return (
  //     <>
  //       <Card className="border-primary/50 bg-primary/5">
  //         <CardHeader>
  //           <div className="flex items-center gap-2">
  //             <Sparkles className="h-5 w-5 text-primary" />
  //             <CardTitle className="text-lg">
  //               Preview of Your Child's Responses
  //             </CardTitle>
  //             <Badge variant="secondary">Trial Complete</Badge>
  //           </div>
  //           <CardDescription className="text-sm">
  //             Here's a sample of how your child answered the 15 trial questions.
  //             Want to unlock the full Conversational Report Add-On with AI
  //             insights, direct quotes, and a school-ready PDF?
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent className="space-y-4">
  //           {/* What's Inside Box */}
  //           <div className="rounded-lg border p-4 bg-muted/50">
  //             <p className="text-sm font-medium mb-3 flex items-center justify-between">
  //               <span>
  //                 What's Inside the{" "}
  //                 {hasConversationalAI
  //                   ? "Included"
  //                   : formatPrice(PRICING.ENHANCED_REPORT)}{" "}
  //                 Upgrade:
  //               </span>
  //               {hasConversationalAI && (
  //                 <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
  //                   ✓ Included in Subscription
  //                 </Badge>
  //               )}
  //             </p>
  //             <ul className="text-sm space-y-2 text-muted-foreground">
  //               <li className="flex items-start gap-2">
  //                 <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
  //                 <span>Your child's voice documented in their own words</span>
  //               </li>
  //               <li className="flex items-start gap-2">
  //                 <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
  //                 <span>AI analysis comparing parent vs child responses</span>
  //               </li>
  //               <li className="flex items-start gap-2">
  //                 <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
  //                 <span>Expanded recommendations</span>
  //               </li>
  //               <li className="flex items-start gap-2">
  //                 <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
  //                 <span>Enhanced PDF for school use</span>
  //               </li>
  //             </ul>
  //           </div>

  //           {/* CTA Buttons */}
  //           <div className="flex flex-col gap-2">
  //             <Button asChild size="lg" className="w-full">
  //               <Link href={`/checkout-enhanced/${assessmentId}`}>
  //                 <Sparkles className="mr-2 h-4 w-4" />
  //                 {hasConversationalAI
  //                   ? "Activate Enhanced Report (Included)"
  //                   : `Unlock Enhanced Report – ${formatPrice(PRICING.ENHANCED_REPORT)}`}
  //               </Link>
  //             </Button>
  //             <Button asChild variant="ghost" size="sm" className="w-full">
  //               <Link href="/dashboard">
  //                 No thanks, I'll stick with the standard report
  //               </Link>
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>

  //       {/* Conversational Chat Widget */}
  //       <ConversationalChatWidget
  //         isOpen={isChatOpen}
  //         onClose={() => setIsChatOpen(false)}
  //         assessmentId={assessmentId}
  //       />
  //     </>
  //   );
  // }

  // If user has conversational AI or credits, show full version button
  if (hasConversationalAI || conversationalCredits > 0) {
    const isUnlimited = hasConversationalAI;

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
                      🎉 Conversational Assessment {isUnlimited ? "Activated" : "Credit Added"}!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      {isUnlimited
                        ? "You now have unlimited conversational assessments."
                        : `You have ${conversationalCredits} conversational assessment${conversationalCredits === 1 ? "" : "s"} available.`
                      } Click "Start Conversational Assessment" below to get started.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSuccessBanner(false);
                    // Remove the query parameters
                    const url = new URL(window.location.href);
                    url.searchParams.delete("conversational_purchased");
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

        <Card className="border-primary/30 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Conversational Assessment
              </CardTitle>
              {isUnlimited ? (
                <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  ✓ Unlimited
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {conversationalCredits} Credit{conversationalCredits === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              Create conversational assessments that let children express themselves
              naturally. Results are saved to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {isUnlimited ? (
                  <>
                    <span className="font-semibold text-green-600">Included in your subscription:</span>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>• Unlimited conversational assessments</li>
                      <li>• Choose any assessment template</li>
                      <li>• Results saved to dashboard</li>
                      <li>• Enhanced report compatibility</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-primary">What's included:</span>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>• Full conversational assessment experience</li>
                      <li>• Choose from available templates</li>
                      <li>• Results saved to dashboard</li>
                      <li>• Professional PDF report</li>
                    </ul>
                  </>
                )}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setIsChatOpen(true)}
                disabled={isButtonDisabled}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {hasActiveSession
                  ? "Conversation In Progress"
                  : "Start Conversational Assessment"}
              </Button>
              {hasActiveSession && (
                <p className="text-xs text-muted-foreground">
                  Resume the active conversation from the assessment sidebar.
                </p>
              )}
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

  // Initial Trial Teaser State (for users without conversational AI)
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
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              See their perspective —{" "}
              <span className="font-semibold text-foreground">free trial</span>.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Want unlimited conversational assessments?</strong> Upgrade to 
                Professional or Enterprise to create assessments with any template and 
                save results to your dashboard.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => setIsChatOpen(true)}
              disabled={isButtonDisabled}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {isChatOpen ? "Chat Active" : "Start Free Trial"}
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
