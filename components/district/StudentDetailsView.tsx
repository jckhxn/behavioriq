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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Share2,
  CheckCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  FileText,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentDetailsViewProps {
  studentId: string;
  user: {
    id: string;
    role: string;
  };
}

export function StudentDetailsView({
  studentId,
  user,
}: StudentDetailsViewProps) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  async function loadStudent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/district/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else {
        console.error("Failed to load student");
      }
    } catch (error) {
      console.error("Error loading student:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsReviewed() {
    if (!data?.student?.assessments?.[0]?.assessmentId) return;

    setMarking(true);
    try {
      const res = await fetch(`/api/district/students/${studentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: data.student.assessments[0].assessmentId,
        }),
      });

      if (res.ok) {
        await loadStudent();
      }
    } catch (error) {
      console.error("Error marking as reviewed:", error);
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.student) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Student not found</p>
        </CardContent>
      </Card>
    );
  }

  const { student, recommendations } = data;
  const latestAssessment = student.assessments[0];
  const assessment = latestAssessment?.assessment;
  const isFull = !latestAssessment?.isTrial;

  // Calculate risk tier
  let riskTier = "LOW";
  let riskColor = "text-green-600";
  if (assessment?.scores) {
    const maxScore = Math.max(...assessment.scores.map((s: any) => s.rawScore));
    if (maxScore >= 90) {
      riskTier = "VERY HIGH";
      riskColor = "text-red-600";
    } else if (maxScore >= 80) {
      riskTier = "HIGH";
      riskColor = "text-orange-600";
    } else if (maxScore >= 70) {
      riskTier = "MODERATE";
      riskColor = "text-yellow-600";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/district">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Student Report</h1>
            <p className="text-muted-foreground">
              {student.isAnonymous
                ? student.anonymousId
                : `Student ${student.anonymousId}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFull && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share Link
              </Button>
            </>
          )}
          {latestAssessment && !latestAssessment.reviewedAt && (
            <Button size="sm" onClick={markAsReviewed} disabled={marking}>
              {marking ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Mark as Reviewed
            </Button>
          )}
        </div>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Grade</div>
              <div className="font-medium">
                {student.gradeLevel || "Not specified"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">School</div>
              <div className="font-medium">
                {student.school?.name || "Not specified"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Consent Status
              </div>
              <div className="font-medium">
                {student.consentGiven ? (
                  <Badge variant="outline" className="text-green-600">
                    Consent Given
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-600">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Privacy Mode</div>
              <div className="font-medium">
                {student.isAnonymous ? "Anonymous" : "Identified"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!assessment && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No assessment completed yet</p>
          </CardContent>
        </Card>
      )}

      {assessment && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Assessment Results</TabsTrigger>
            {isFull && recommendations && (
              <TabsTrigger value="recommendations">
                AI Recommendations
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {/* Risk Tier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Overall Risk Level
                  <Badge variant="outline" className={riskColor}>
                    {riskTier}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Based on screening results across all behavioral domains
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Domain Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Scores</CardTitle>
                <CardDescription>
                  {isFull
                    ? "Full assessment results"
                    : "Trial assessment results (limited)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessment.scores.map((score: any) => {
                    const percentage =
                      (score.rawScore / score.totalPossible) * 100;
                    const isFlagged = score.rawScore >= 70;

                    return (
                      <div key={score.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {score.domainName || score.domain}
                            </span>
                            {isFlagged && (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {score.rawScore}/{score.totalPossible} (
                            {Math.round(percentage)}%)
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              percentage >= 90
                                ? "bg-red-600"
                                : percentage >= 80
                                  ? "bg-orange-600"
                                  : percentage >= 70
                                    ? "bg-yellow-600"
                                    : "bg-green-600"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {!isFull && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="py-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Trial Assessment:</strong> This is a preliminary
                    screening. Full assessment required for AI recommendations
                    and complete PDF report.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isFull && recommendations && (
            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <CardTitle>AI-Generated Recommendations</CardTitle>
                  </div>
                  <CardDescription>
                    Evidence-based strategies for school teams and families
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendations.summary}
                    </p>
                  </div>

                  <Separator />

                  {/* School Strategies */}
                  <div>
                    <h4 className="font-medium mb-2">School Strategies</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {recommendations.schoolStrategies.map(
                        (strategy: string, i: number) => (
                          <li key={i}>{strategy}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Classroom Accommodations */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Classroom Accommodations
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {recommendations.classroomAccommodations.map(
                        (acc: string, i: number) => (
                          <li key={i}>{acc}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Parent Next Steps */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Parent/Guardian Next Steps
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {recommendations.parentNextSteps.map(
                        (step: string, i: number) => (
                          <li key={i}>{step}</li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Referral Guidance */}
                  {recommendations.referralGuidance && (
                    <>
                      <Separator />
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium mb-2 text-blue-900">
                          Referral Guidance
                        </h4>
                        <p className="text-sm text-blue-800">
                          {recommendations.referralGuidance}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <p>
                      <strong>Disclaimer:</strong> These recommendations are
                      AI-generated and for guidance only. They do not constitute
                      a diagnosis. All decisions should be made by qualified
                      professionals in consultation with the student's support
                      team and family.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {latestAssessment?.reviewedAt && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Reviewed on{" "}
                {new Date(latestAssessment.reviewedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
