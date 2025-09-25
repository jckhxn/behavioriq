"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, Globe, Eye, Calendar, FileText, User } from "lucide-react";
import { getRiskLevel } from "@/lib/utils/risk-levels";

interface Assessment {
  id: string;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  scores?: Array<{
    categoryId: string;
    categoryName: string;
    rawScore: number;
    totalPossible: number;
    normalizedScore: number;
  }>;
  responses?: Array<{
    questionId: string;
    categoryId: string;
    response: string;
    score: number;
  }>;
}

interface ShareableLink {
  id: string;
  shareCode: string;
  privacy: "PUBLIC" | "PRIVATE" | "PASSWORD_PROTECTED";
  isActive: boolean;
  expiresAt?: string;
  viewCount: number;
  assessment: Assessment;
}

export default function SharedAssessmentPage() {
  const params = useParams();
  const code = params.code as string;

  const [shareData, setShareData] = useState<ShareableLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    if (code) {
      fetchSharedAssessment();
    }
  }, [code]);

  const fetchSharedAssessment = async () => {
    try {
      const response = await fetch(`/api/share/${code}`);

      if (response.status === 401) {
        // Password required
        setShowPasswordDialog(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load shared assessment");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setShareData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shared assessment:", error);
      setError("Failed to load shared assessment");
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch(`/api/share/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Invalid password");
        return;
      }

      const data = await response.json();
      setShareData(data);
      setShowPasswordDialog(false);
      setError(null);
    } catch (error) {
      console.error("Error validating password:", error);
      setError("Failed to validate password");
    }
  };

  const calculateAverageScore = (assessment: Assessment) => {
    if (!assessment.scores || assessment.scores.length === 0) return 0;

    const totalScore = assessment.scores.reduce(
      (sum, score) => sum + score.rawScore / score.totalPossible,
      0
    );
    return Math.round((totalScore / assessment.scores.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading shared assessment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card>
            <CardContent className="text-center p-8">
              <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card>
            <CardContent className="text-center p-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
              <p className="text-muted-foreground">
                This shared assessment link may have expired or been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { assessment } = shareData;
  const averageScore = calculateAverageScore(assessment);
  const riskLevel = getRiskLevel(averageScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Shared Assessment</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              {shareData.privacy === "PUBLIC" ? (
                <Globe className="h-4 w-4 mr-1" />
              ) : (
                <Lock className="h-4 w-4 mr-1" />
              )}
              {shareData.privacy}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {shareData.viewCount} views
            </div>
          </div>
        </div>

        {/* Assessment Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {assessment.subjectName}
                </CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Completed on{" "}
                  {new Date(assessment.updatedAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={
                  assessment.status === "COMPLETED" ? "default" : "secondary"
                }
              >
                {assessment.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Overall Score */}
        {assessment.status === "COMPLETED" && assessment.scores && (
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {averageScore}%
                </div>
                <Badge
                  variant={
                    riskLevel.level === "LOW"
                      ? "default"
                      : riskLevel.level === "MODERATE"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-lg px-4 py-2"
                >
                  {riskLevel.level} RISK
                </Badge>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {riskLevel.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Scores */}
        {assessment.scores && assessment.scores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessment.scores.map((score, index) => {
                  const percentage = Math.round(
                    (score.rawScore / score.totalPossible) * 100
                  );
                  const categoryRisk = getRiskLevel(percentage);

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{score.categoryName}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              categoryRisk.level === "LOW"
                                ? "default"
                                : categoryRisk.level === "MODERATE"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {categoryRisk.level}
                          </Badge>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            categoryRisk.level === "LOW"
                              ? "bg-green-500"
                              : categoryRisk.level === "MODERATE"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score: {score.rawScore} / {score.totalPossible}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This assessment was shared via AI Diagnostic Platform</p>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription>
              This assessment is password protected. Please enter the password
              to view it.
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
