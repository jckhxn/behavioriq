"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EnhancedReportView from "@/components/reports/EnhancedReportView";
import { AssessmentCompletion } from "@/components/assessment/AssessmentCompletion";

export default function SharedAssessmentPage() {
  const params = useParams();
  const code = params.code as string;

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect running, code:", code);
    if (code) {
      fetchShareMetadata();
    }
  }, [code]);

  // Fetch metadata to check if password is required
  const fetchShareMetadata = async () => {
    try {
      console.log("Fetching share metadata for code:", code);
      const response = await fetch(`/api/share/${code}`);
      const data = await response.json();

      console.log("Share metadata response:", data);

      if (data.requiresPassword) {
        console.log("Password required, showing dialog");
        setShowPasswordDialog(true);
        setLoading(false);
        return;
      }

      // If no password required, fetch the full assessment data immediately
      console.log("No password required, fetching full assessment data");
      await fetchAssessmentData();
    } catch (error) {
      console.error("Error fetching share metadata:", error);
      setError("Error loading shared assessment. Please try again.");
      setLoading(false);
    }
  };

  // Fetch full assessment data without password
  const fetchAssessmentData = async () => {
    try {
      const response = await fetch(`/api/share/${code}?action=view`);
      const data = await response.json();

      if (response.ok && data.assessment) {
        console.log("Assessment data loaded successfully");
        setAssessmentData(data);
        setLoading(false);
      } else {
        console.error("Error loading assessment:", data.error);
        setError(data.error || "Error loading assessment. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
      setError("Error loading assessment. Please try again.");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      console.log("Submitting password:", password);
      const response = await fetch(
        `/api/share/${code}?action=view&password=${encodeURIComponent(password)}`
      );

      const data = await response.json();
      console.log("Password validation response:", data);

      if (response.ok && data.assessment) {
        console.log("Password correct! Assessment data received");
        setAssessmentData(data);
        setShowPasswordDialog(false);
        setLoading(false);
      } else {
        console.error("Password incorrect:", data.error);
        setError(data.error || "Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Error validating password:", error);
      setError("Error validating password. Please try again.");
    }
  };

  console.log("Component rendering, showPasswordDialog:", showPasswordDialog);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading shared assessment...
            </p>
            <p className="text-xs text-red-500 mt-2">
              DEBUG: showPasswordDialog = {String(showPasswordDialog)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show assessment data if loaded
  if (assessmentData) {
    // Enhanced reports disabled - always show regular report
    // Check if this is an enhanced report
    // const hasEnhancedReport = assessmentData.assessment.hasEnhancedReport;
    // const childResponses = assessmentData.assessment.childResponses;
    // const enhancedAnalysis = assessmentData.assessment.enhancedAnalysis;

    // Show enhanced report if available (childResponses are sufficient, analysis is optional)
    // if (hasEnhancedReport && childResponses) {
    //   return (
    //     <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
    //       <div className="max-w-4xl mx-auto">
    //         <div className="text-center mb-6">
    //           <h1 className="text-3xl font-bold text-foreground mb-2">
    //             Enhanced Assessment Report
    //           </h1>
    //           <p className="text-muted-foreground">
    //             Subject: {assessmentData.assessment.subjectName}
    //           </p>
    //           <p className="text-sm text-muted-foreground">
    //             Status: {assessmentData.assessment.status} • Created:{" "}
    //             {new Date(
    //               assessmentData.assessment.createdAt
    //             ).toLocaleDateString()}
    //           </p>
    //         </div>

    //         <EnhancedReportView
    //           assessment={{
    //             id: assessmentData.assessment.id,
    //             title: assessmentData.assessment.subjectName,
    //             completedAt: new Date(assessmentData.assessment.updatedAt),
    //             score: assessmentData.assessment.scores?.[0]?.rawScore || 0,
    //             enhancedReportPurchasedAt: assessmentData.assessment
    //               .enhancedReportPurchasedAt
    //               ? new Date(
    //                   assessmentData.assessment.enhancedReportPurchasedAt
    //                 )
    //               : null,
    //           }}
    //           childResponses={childResponses}
    //           enhancedAnalysis={
    //             enhancedAnalysis || {
    //               overallAlignment:
    //                 "AI analysis is being generated. Please check back later.",
    //               keyDifferences: [],
    //               insights: [],
    //               recommendations: [],
    //               quotes: [],
    //             }
    //           }
    //           onDownloadPdf={() => {
    //             console.log("PDF download not available for shared reports");
    //           }}
    //         />
    //       </div>
    //     </div>
    //   );
    // }

    // Show basic assessment report using AssessmentCompletion component
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Shared Assessment Results
              </h1>
              <p className="text-muted-foreground">
                Subject: {assessmentData.assessment.subjectName}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {assessmentData.assessment.status} • Created:{" "}
                {new Date(
                  assessmentData.assessment.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Use AssessmentCompletion component for consistent UI */}
          <div className="shadow-lg dark:shadow-xl border dark:border-border rounded-lg">
            <AssessmentCompletion
              assessmentId={assessmentData.assessment.id}
              subjectName={assessmentData.assessment.subjectName}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !showPasswordDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      {/* Password Modal */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Password Required</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This assessment is password protected. Please enter the password
              to view it.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit();
                    }
                  }}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handlePasswordSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
