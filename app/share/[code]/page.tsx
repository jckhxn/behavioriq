"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Assessment Results
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

          {/* Assessment Scores */}
          {assessmentData.assessment.scores &&
            assessmentData.assessment.scores.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assessmentData.assessment.scores.map((score: any) => (
                  <div
                    key={score.id}
                    className="bg-card rounded-lg p-4 shadow-sm border"
                  >
                    <h3 className="font-semibold text-lg capitalize mb-2">
                      {score.domain.toLowerCase().replace("_", " ")}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Score:</span>
                        <span className="font-medium">
                          {score.rawScore}/{score.totalPossible}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span
                          className={`font-medium px-2 py-1 rounded text-xs ${
                            score.riskLevel === "LOW"
                              ? "bg-green-100 text-green-700"
                              : score.riskLevel === "MODERATE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {score.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">
                          {(score.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
