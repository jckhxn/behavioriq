"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Download,
  Mail,
  BarChart3,
  Brain,
  CheckCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { AssessmentDomain, RiskLevel } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAIRecommendations } from "@/lib/hooks/useAIRecommendations";
import { InteractiveText, ParsedLink } from "@/lib/utils/linkParser";

interface Score {
  id: string;
  domain: AssessmentDomain;
  rawScore: number;
  totalPossible: number;
  riskLevel: RiskLevel;
  confidence: number;
  timestamp: Date;
  questionsAnswered: number;
  wasTerminatedEarly: boolean;
}

interface AssessmentCompletionProps {
  assessmentId: string;
  subjectName: string;
  aiRecommendations?: string;
}

const DOMAIN_LABELS = {
  [AssessmentDomain.ANTISOCIAL]: "Antisocial Behavior",
  [AssessmentDomain.VIOLENCE]: "Violence Risk",
  [AssessmentDomain.ATTENTION]: "Attention Issues",
  [AssessmentDomain.EMOTIONAL]: "Emotional Regulation",
  [AssessmentDomain.CONDUCT]: "Conduct Disorder",
};

const RISK_COLORS = {
  [RiskLevel.LOW]: {
    bg: "bg-green-100",
    text: "text-green-800",
    chart: "#10b981",
  },
  [RiskLevel.MODERATE]: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    chart: "#f59e0b",
  },
  [RiskLevel.HIGH]: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    chart: "#ea580c",
  },
  [RiskLevel.VERY_HIGH]: {
    bg: "bg-red-100",
    text: "text-red-800",
    chart: "#dc2626",
  },
};

export function AssessmentCompletion({
  assessmentId,
  subjectName,
  aiRecommendations: initialRecommendations,
}: AssessmentCompletionProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [savedLinks, setSavedLinks] = useState<string[]>([]);
  const [existingRecommendations, setExistingRecommendations] = useState<any[]>(
    []
  );
  const [hasExistingReport, setHasExistingReport] = useState(false);

  // Use AI SDK for streaming recommendations
  const {
    recommendations: aiRecommendations,
    isGenerating: isGeneratingRecommendations,
    generateRecommendations,
    skipToEnd,
    isComplete: recommendationsComplete,
  } = useAIRecommendations({
    assessmentId,
    onComplete: (recommendations) => {
      // Save the recommendations when complete
      saveRecommendation(
        `Assessment Recommendations for ${subjectName}`,
        recommendations,
        "AI Generated",
        3
      );
    },
  });

  useEffect(() => {
    fetchScores();
    fetchSavedLinks();
    checkExistingRecommendations();
  }, [assessmentId]);

  const checkExistingRecommendations = async () => {
    try {
      const response = await fetch(
        `/api/recommendations?assessmentId=${assessmentId}&category=AI Generated`
      );
      if (response.ok) {
        const data = await response.json();
        setExistingRecommendations(data);
        setHasExistingReport(data.length > 0);
      }
    } catch (error) {
      console.error("Error checking existing recommendations:", error);
    }
  };

  const fetchScores = async () => {
    try {
      console.log("Fetching scores for assessment:", assessmentId);
      const response = await fetch(`/api/assessments/${assessmentId}/scores`);
      if (response.ok) {
        const data = await response.json();
        console.log("Scores API response:", data);
        setScores(data.scores || []);
      } else {
        console.error(
          "Failed to fetch scores:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedLinks = async () => {
    try {
      const response = await fetch(
        `/api/recommendations?assessmentId=${assessmentId}&category=Resource Link`
      );
      if (response.ok) {
        const data = await response.json();
        const urls = data
          .map((rec: any) => {
            const match = rec.content.match(
              /Resource Link: (https?:\/\/[^\s\n]+)/
            );
            return match ? match[1] : null;
          })
          .filter(Boolean);
        setSavedLinks(urls);
      }
    } catch (error) {
      console.error("Error fetching saved links:", error);
    }
  };

  const saveRecommendation = async (
    title: string,
    content: string,
    category?: string,
    priority?: number
  ) => {
    try {
      console.log(
        "saveRecommendation called with content length:",
        content.length
      );
      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId,
          title,
          content,
          category,
          priority,
        }),
      });
    } catch (error) {
      console.error("Error saving recommendation:", error);
    }
  };

  const saveLinkAsResource = async (link: ParsedLink, assessmentId: string) => {
    try {
      // Don't save if already saved
      if (savedLinks.includes(link.url)) {
        return;
      }

      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId,
          title: link.title,
          content: `Resource Link: ${link.url}\n\nSaved from assessment recommendations.`,
          category: "Resource Link",
          priority: 2,
        }),
      });

      // Update saved links state
      setSavedLinks((prev) => [...prev, link.url]);
    } catch (error) {
      console.error("Error saving resource link:", error);
    }
  };

  const handleGenerateRecommendations = () => {
    generateRecommendations();
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/pdf`, {
        method: "POST",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assessment-${subjectName}-${assessmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmailReport = async () => {
    const recipientEmail = prompt("Enter email address to send report to:");
    if (!recipientEmail) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/emails/assessment-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          recipientEmail,
          includePdf: true,
        }),
      });
      if (response.ok) {
        alert("Email sent successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to send email: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Prepare chart data for Recharts
  const chartData = scores.map((score) => ({
    domain: DOMAIN_LABELS[score.domain],
    score: (score.rawScore / score.totalPossible) * 100,
    riskLevel: score.riskLevel,
    rawScore: score.rawScore,
    totalPossible: score.totalPossible,
    questionsAnswered: score.questionsAnswered,
    color: RISK_COLORS[score.riskLevel].chart,
  }));

  const chartConfig = {
    score: {
      label: "Risk Score (%)",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
          <span>Loading assessment results...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 mr-3" />
            <div>
              <CardTitle className="text-3xl text-green-800">
                Assessment Complete!
              </CardTitle>
              <p className="text-green-700 mt-2">
                Assessment results for <strong>{subjectName}</strong>
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scores Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Domain Risk Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-96 w-full">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="domain"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: "Risk Score (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => [
                        `${Number(value).toFixed(1)}%`,
                        "Risk Score",
                      ]}
                      labelFormatter={(label) => `Domain: ${label}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-score)"
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No scores available for this assessment.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Detailed Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {scores.map((score) => (
              <div
                key={score.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {DOMAIN_LABELS[score.domain]}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Score: {score.rawScore} / {score.totalPossible} (
                    {((score.rawScore / score.totalPossible) * 100).toFixed(1)}
                    %)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Questions Answered: {score.questionsAnswered} | Confidence:{" "}
                    {(score.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress
                    value={(score.rawScore / score.totalPossible) * 100}
                    className="w-24"
                  />
                  <Badge
                    className={`${RISK_COLORS[score.riskLevel].bg} ${RISK_COLORS[score.riskLevel].text}`}
                  >
                    {score.riskLevel.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations and Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Professional Guidance & Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AI Recommendations Section */}
          <div className="w-full">
            {aiRecommendations ||
            isGeneratingRecommendations ||
            hasExistingReport ? (
              <div className="prose max-w-none">
                {hasExistingReport &&
                !aiRecommendations &&
                !isGeneratingRecommendations ? (
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-green-800 font-semibold mb-2">
                          Recommendations Already Available
                        </h4>
                        <p className="text-green-700 text-sm">
                          AI-generated recommendations for this assessment
                          already exist. Check your saved recommendations in the
                          sidebar or dashboard.
                        </p>
                      </div>
                      <div className="text-green-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        💡 This prevents duplicate AI calls and reduces costs
                        while keeping your previous recommendations accessible.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    {isGeneratingRecommendations &&
                      !recommendationsComplete && (
                        <div className="flex justify-end mb-2">
                          <Button
                            onClick={skipToEnd}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Skip to end
                          </Button>
                        </div>
                      )}
                    <div className="text-sm leading-relaxed">
                      <InteractiveText
                        content={aiRecommendations}
                        onSaveLink={saveLinkAsResource}
                        assessmentId={assessmentId}
                        savedLinks={savedLinks}
                      />
                      {isGeneratingRecommendations && (
                        <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1">
                          |
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : !hasExistingReport ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Generate personalized recommendations with embedded resources
                  based on the assessment results.
                </p>
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRecommendations}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingRecommendations ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Recommendations
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex-1 min-w-[200px]"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>

            <Button
              onClick={sendEmailReport}
              disabled={isSendingEmail}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              {isSendingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Email Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
