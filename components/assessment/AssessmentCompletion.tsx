"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import EnhancedReportView from "@/components/reports/EnhancedReportView";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Download,
  BarChart3,
  Brain,
  CheckCircle,
  FileText,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
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
import { DOMAIN_LABELS, RISK_COLORS } from "@/lib/constants/domains";
import { toast } from "sonner";
import EmailReportButton from "@/components/reports/EmailReportButton";
import ReactMarkdown, {
  type Components as MarkdownComponents,
} from "react-markdown";
import remarkGfm from "remark-gfm";

interface Score {
  id: string;
  domain: AssessmentDomain;
  domainName?: string; // Dynamic domain name from template
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

export function AssessmentCompletion({
  assessmentId,
  subjectName,
  aiRecommendations: initialRecommendations,
}: AssessmentCompletionProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedLinks, setSavedLinks] = useState<string[]>([]);
  const [existingRecommendations, setExistingRecommendations] = useState<any[]>(
    []
  );
  const [hasExistingReport, setHasExistingReport] = useState(false);
  const [isConversational, setIsConversational] = useState(false);
  const [hasEnhancedReport, setHasEnhancedReport] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const isExistingReportRef = useRef(false);

  // Use AI SDK for streaming recommendations
  const {
    recommendations: aiRecommendations,
    isGenerating: isGeneratingRecommendations,
    generateRecommendations,
    skipToEnd,
    isComplete: recommendationsComplete,
    isExistingReport,
  } = useAIRecommendations({
    assessmentId,
    onComplete: (recommendations) => {
      if (isExistingReportRef.current) {
        return;
      }

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
    isExistingReportRef.current = isExistingReport;
  }, [isExistingReport]);

  const recommendationsContent =
    (aiRecommendations && aiRecommendations.trim()) ||
    (initialRecommendations && initialRecommendations.trim()) ||
    "";
  const sanitizedRecommendations = recommendationsContent
    .replace(/\uFFFD/g, "")
    .trim();

  const structuredSections = useMemo(
    () => parseRecommendationSections(sanitizedRecommendations),
    [sanitizedRecommendations]
  );
  const showStructuredRecommendations = structuredSections.length > 0;

  useEffect(() => {
    fetchAssessmentData();
    fetchScores();
    fetchSavedLinks();
    checkExistingRecommendations();
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAssessmentData(data);
        setIsConversational(data.isConversational || false);
        setHasEnhancedReport(data.hasEnhancedReport || false);
      }
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    }
  };

  const checkExistingRecommendations = async () => {
    try {
      const response = await fetch(
        `/api/recommendations?assessmentId=${assessmentId}&category=AI Generated`
      );
      if (response.ok) {
        const data = await response.json();
        setExistingRecommendations(data);
        const hasExisting = data.length > 0;
        setHasExistingReport(hasExisting);

        // Don't auto-load - let user click to view existing report
        if (hasExisting) {
          console.log("Found existing AI recommendations - ready to view");
        }
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
        "[SaveRecommendation] Saving with content length:",
        content.length,
        "category:",
        category
      );

      const response = await fetch("/api/recommendations", {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[SaveRecommendation] Failed to save:", {
          status: response.status,
          error: errorData,
        });
        return;
      }

      const saved = await response.json();
      console.log("[SaveRecommendation] Successfully saved:", saved.id);
    } catch (error) {
      console.error("[SaveRecommendation] Error saving recommendation:", error);
    }
  };

  const saveLinkAsResource = async (link: ParsedLink, assessmentId: string) => {
    try {
      // Don't save if already saved
      if (savedLinks.includes(link.url)) {
        toast.info("This resource has already been saved!");
        return;
      }

      // Check if we have a valid assessmentId
      if (
        !assessmentId ||
        assessmentId === "undefined" ||
        assessmentId === "null"
      ) {
        console.error("Invalid assessmentId:", assessmentId);
        toast.error(
          "Unable to save resource: Assessment ID is missing. Please try refreshing the page."
        );
        return;
      }

      const requestData = {
        assessmentId,
        title: link.title,
        content: `Resource Link: ${link.url}\n\nSaved from assessment recommendations.`,
        category: "Resource Link",
        priority: 2,
      };

      console.log("[SaveResource] Attempting to save resource:", {
        assessmentId,
        title: link.title,
        url: link.url,
        requestData,
      });

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("[SaveResource] Response received:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorData;
        let rawResponse = "";
        try {
          const responseText = await response.text();
          rawResponse = responseText;
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        console.error("Failed to save resource - Full details:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
          rawResponse,
          assessmentId,
          url: response.url,
          requestBody: {
            assessmentId,
            title: link.title,
            category: "Resource Link",
          },
        });

        const errorMessage =
          errorData.error ||
          errorData.details ||
          `HTTP ${response.status}: ${response.statusText || "Unknown error"}`;
        toast.error(`Failed to save resource: ${errorMessage}`, {
          description: "Check console for details.",
        });
        return;
      }

      // Update saved links state
      setSavedLinks((prev) => [...prev, link.url]);

      // Show success feedback
      toast.success(`Resource "${link.title}" saved successfully!`, {
        description: "You can find it in your Saved Recommendations.",
      });
    } catch (error) {
      console.error("Error saving resource link:", error);
      toast.error("Failed to save resource. Please try again.");
    }
  };

  const handleGenerateRecommendations = () => {
    generateRecommendations();
  };

  const downloadPDF = async () => {
    setIsDownloading(true);

    // Show immediate feedback that PDF generation has started
    toast.info("Generating PDF report...", {
      description: "This may take a few seconds. Please wait.",
      duration: 10000, // Show for 10 seconds
    });

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

        // Show success message
        toast.success("PDF downloaded successfully!", {
          description: `Report for ${subjectName} is ready.`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to generate PDF", {
          description: errorData.error || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to generate PDF", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Prepare chart data for Recharts
  const chartData = scores.map((score) => ({
    domain: score.domainName || DOMAIN_LABELS[score.domain], // Use dynamic domain name if available
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

  // Enhanced report disabled for now - always show regular report
  // Show enhanced report for conversational assessments with purchased report
  // if (isConversational && hasEnhancedReport && assessmentData?.childResponses) {
  //   const childResponses = assessmentData.childResponses;
  //   const enhancedAnalysis = assessmentData.enhancedAnalysis || {
  //     overallAlignment: "No analysis available yet.",
  //     keyDifferences: [],
  //     insights: [],
  //     recommendations: [],
  //     quotes: [],
  //   };

  //   const handleDownloadPdf = async () => {
  //     try {
  //       const res = await fetch(
  //         `/api/assessment/${assessmentId}/download-enhanced-pdf`
  //       );
  //       const blob = await res.blob();
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = `enhanced-report-${assessmentId}.pdf`;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     } catch (err) {
  //       console.error("PDF download failed:", err);
  //     }
  //   };

  //   return (
  //     <div className="w-full max-w-6xl mx-auto">
  //       <EnhancedReportView
  //         assessment={{
  //           id: assessmentId,
  //           title: subjectName,
  //           completedAt: assessmentData.completedAt,
  //           score: 0,
  //           enhancedReportPurchasedAt: assessmentData.enhancedReportPurchasedAt,
  //         }}
  //         childResponses={childResponses}
  //         enhancedAnalysis={enhancedAnalysis}
  //         onDownloadPdf={handleDownloadPdf}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <CardTitle className="text-3xl text-green-800 dark:text-green-400">
                Assessment Complete!
              </CardTitle>
              <p className="text-green-700 dark:text-green-300 mt-2">
                Assessment results for <strong>{subjectName}</strong>
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Disclaimer */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Important Assessment Information
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                The assessments on this page screen for different areas of
                mental health. They are not diagnostic tools and should not be
                used as the sole measure of risk for any condition. These
                results are intended for informational and educational purposes
                only.
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                <strong>
                  If you or someone you know is experiencing a mental health
                  crisis, please contact:
                </strong>
              </p>
              <ul className="text-amber-700 dark:text-amber-300 ml-4 space-y-1">
                <li>
                  • <strong>Emergency Services:</strong> 911
                </li>
                <li>
                  • <strong>National Suicide Prevention Lifeline:</strong> 988
                </li>
                <li>
                  • <strong>Crisis Text Line:</strong> Text HOME to 741741
                </li>
              </ul>
              <p className="text-amber-700 dark:text-amber-300">
                For professional evaluation and support, please consult with a
                qualified mental health professional who can provide proper
                assessment, diagnosis, and treatment recommendations.
              </p>
            </div>
          </div>
        </CardContent>
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
                    {score.domainName || DOMAIN_LABELS[score.domain]}
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
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400 dark:border-green-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-green-800 dark:text-green-400 font-semibold mb-2">
                          Recommendations Already Available
                        </h4>
                        <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                          AI-generated recommendations for this assessment have
                          already been created.
                        </p>
                        <Button
                          onClick={handleGenerateRecommendations}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          View Saved Recommendations
                        </Button>
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400">
                        💡 This prevents duplicate AI calls and reduces costs
                        while keeping your previous recommendations accessible.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                    {/* Show indicator for existing vs new recommendations */}
                    {isExistingReport && !isGeneratingRecommendations && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Previously Generated Report
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-xs">
                          (Saved • No additional AI costs)
                        </span>
                      </div>
                    )}

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
                    <div className="space-y-3">
                      {showStructuredRecommendations ? (
                        <div className="space-y-4">
                          {structuredSections.map((section, index) => (
                            <RecommendationSectionCard
                              key={`${section.title}-${index}`}
                              section={section}
                              index={index}
                              onSaveLink={saveLinkAsResource}
                              assessmentId={assessmentId}
                              savedLinks={savedLinks}
                            />
                          ))}
                        </div>
                      ) : sanitizedRecommendations ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                          <InteractiveText
                            content={sanitizedRecommendations}
                            onSaveLink={saveLinkAsResource}
                            assessmentId={assessmentId}
                            savedLinks={savedLinks}
                          />
                        </div>
                      ) : !isGeneratingRecommendations ? (
                        <p className="text-sm text-muted-foreground">
                          Recommendations will appear here once generated.
                        </p>
                      ) : null}
                      {isGeneratingRecommendations && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="inline-block w-2 h-4 bg-primary animate-pulse" />
                          Generating recommendations…
                        </div>
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
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGeneratingRecommendations ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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
              className={`flex-1 min-w-[200px] ${isDownloading ? "bg-primary/80 cursor-wait" : ""}`}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="animate-pulse">Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>

            <EmailReportButton
              assessmentId={assessmentId}
              defaultEmail={assessmentData?.user?.email || ""}
              className="flex-1 min-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StructuredRecommendationSection {
  title: string;
  body: string;
}

function parseRecommendationSections(
  content: string
): StructuredRecommendationSection[] {
  if (!content || !content.includes("##SECTION")) {
    return [];
  }

  const normalized = content.replace(/\r\n/g, "\n");
  const rawSections = normalized.split(/\n-{3,}\s*\n?/g);

  const sections: StructuredRecommendationSection[] = [];

  for (const raw of rawSections) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const firstLine = lines[0]?.trim() ?? "";
    const sectionMatch = firstLine.match(/^##SECTION:\s*(.+)$/i);

    let title = sectionMatch
      ? sectionMatch[1].trim()
      : firstLine.replace(/^##+\s*/, "").trim();
    let bodyLines = sectionMatch ? lines.slice(1) : lines.slice(1);

    if (!sectionMatch && !firstLine.startsWith("##")) {
      title = "Summary";
      bodyLines = lines;
    }

    const body = bodyLines.join("\n").trim();

    if (title || body) {
      sections.push({ title, body });
    }
  }

  return sections;
}

interface RecommendationSectionCardProps {
  section: StructuredRecommendationSection;
  index: number;
  onSaveLink?: (link: ParsedLink, assessmentId: string) => Promise<void>;
  assessmentId?: string;
  savedLinks?: string[];
}

const sectionAccentPalette = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
];

const RecommendationSectionCard = ({
  section,
  index,
  onSaveLink,
  assessmentId,
  savedLinks = [],
}: RecommendationSectionCardProps) => {
  const accent =
    sectionAccentPalette[index % sectionAccentPalette.length] ??
    sectionAccentPalette[0];

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 dark:bg-slate-900/70 p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${accent}`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {section.title}
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Key Insights
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-max text-[10px] tracking-widest">
          AI-Guided
        </Badge>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={createMarkdownComponents({
            onSaveLink,
            assessmentId,
            savedLinks,
          })}
        >
          {section.body}
        </ReactMarkdown>
      </div>
    </div>
  );
};

interface MarkdownRendererOptions {
  onSaveLink?: (link: ParsedLink, assessmentId: string) => Promise<void>;
  assessmentId?: string;
  savedLinks?: string[];
}

function createMarkdownComponents(
  options: MarkdownRendererOptions
): MarkdownComponents {
  const components: MarkdownComponents = {
    h2: (props: any) => (
      <h3 className="text-lg font-semibold text-foreground mt-6" {...props} />
    ),
    h3: (props: any) => (
      <h4
        className="text-base font-semibold text-foreground mt-4 flex items-center gap-2"
        {...props}
      />
    ),
    h4: (props: any) => (
      <h5 className="text-sm font-semibold text-foreground mt-4" {...props} />
    ),
    strong: (props: any) => (
      <span className="font-semibold text-foreground" {...props} />
    ),
    em: (props: any) => <em className="italic text-foreground/90" {...props} />,
    p: (props: any) => <p className="text-sm leading-relaxed" {...props} />,
    ul: (props: any) => <ul className="ml-5 list-disc space-y-2" {...props} />,
    ol: (props: any) => (
      <ol className="ml-5 list-decimal space-y-2" {...props} />
    ),
    li: (props: any) => <li className="pl-1" {...props} />,
    blockquote: (props: any) => (
      <div
        className="border-l-2 border-primary/40 pl-4 text-sm italic"
        {...props}
      />
    ),
    a: (props: any) => (
      <a
        {...props}
        className="underline text-primary hover:text-primary/80 transition-colors"
      />
    ),
  };
  return components;
}
