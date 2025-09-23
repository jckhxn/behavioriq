"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface TrialResults {
  childName: string;
  totalIndicators: number;
  identifiedIndicators: number;
  attentionConcerns: number;
  conductConcerns: number;
  emotionalConcerns: number;
  riskLevel: "low" | "moderate" | "high";
}

export function TrialResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<TrialResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const responsesStr = searchParams.get("responses");
    const childName = searchParams.get("childName") || "your child";

    if (responsesStr) {
      try {
        const responses = JSON.parse(responsesStr);
        const yesResponses = Object.values(responses).filter(Boolean).length;

        // Calculate domain-specific concerns
        const attentionQuestions = [1, 2, 3, 4]; // Questions 1-4 are attention-related
        const conductQuestions = [5]; // Question 5 is conduct-related
        const emotionalQuestions = [6, 7]; // Questions 6-7 are emotional-related

        const attentionConcerns = attentionQuestions.filter(
          (q) => responses[q]
        ).length;
        const conductConcerns = conductQuestions.filter(
          (q) => responses[q]
        ).length;
        const emotionalConcerns = emotionalQuestions.filter(
          (q) => responses[q]
        ).length;

        // Determine risk level
        let riskLevel: "low" | "moderate" | "high";
        if (yesResponses <= 2) {
          riskLevel = "low";
        } else if (yesResponses <= 4) {
          riskLevel = "moderate";
        } else {
          riskLevel = "high";
        }

        setResults({
          childName,
          totalIndicators: 7,
          identifiedIndicators: yesResponses,
          attentionConcerns,
          conductConcerns,
          emotionalConcerns,
          riskLevel,
        });
      } catch (error) {
        console.error("Error parsing results:", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing responses...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              We couldn't find your assessment results. Please try taking the
              assessment again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/trial-assessment">Retake Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "moderate":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Assessment Complete</h1>
          <p className="text-muted-foreground">
            Here's what we found for {results.childName}
          </p>
        </div>

        {/* Main Results Card */}
        <Card className="mb-8 border-2">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              {getRiskIcon(results.riskLevel)}
            </div>
            <CardTitle className="text-2xl mb-2">Snapshot Results</CardTitle>
            <div className="text-3xl font-bold mb-4">
              <span className={getRiskColor(results.riskLevel)}>
                {results.identifiedIndicators} out of {results.totalIndicators}
              </span>
            </div>
            <CardDescription className="text-lg">
              {results.childName} shows{" "}
              <strong>
                {results.identifiedIndicators} out of {results.totalIndicators}{" "}
                indicators
              </strong>{" "}
              that may warrant further review.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Domain Breakdown */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.attentionConcerns}
                </div>
                <div className="text-sm text-muted-foreground">
                  Attention indicators
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.conductConcerns}
                </div>
                <div className="text-sm text-muted-foreground">
                  Conduct indicators
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.emotionalConcerns}
                </div>
                <div className="text-sm text-muted-foreground">
                  Emotional indicators
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="text-center mb-6">
              <Badge
                variant={
                  results.riskLevel === "high"
                    ? "destructive"
                    : results.riskLevel === "moderate"
                      ? "secondary"
                      : "default"
                }
                className="text-sm px-4 py-2"
              >
                {results.riskLevel.charAt(0).toUpperCase() +
                  results.riskLevel.slice(1)}{" "}
                Priority Level
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimer */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Important Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 font-medium">
              This is not a diagnosis, but a first step to clarity.
            </p>
            <p className="text-amber-700 mt-2">
              These results are based on a brief screening and should not be
              considered a medical diagnosis. They are designed to help you
              understand whether a consultation with a qualified professional
              might be beneficial for {results.childName}.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">
              Want the complete picture?
            </CardTitle>
            <CardDescription className="text-lg">
              Get a comprehensive assessment dashboard with instant access to
              personalized AI recommendations, detailed analysis, and actionable
              next steps.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Detailed Report</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analysis with charts, trends, and professional
                  insights
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">AI Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Personalized strategies and resources tailored to{" "}
                  {results.childName}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Professional Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Optional consultation with qualified child development
                  specialists
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link
                  href={`/register?source=trial&childName=${encodeURIComponent(results.childName)}`}
                >
                  Get Your Complete Report - $29
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Instant access
                </div>
                <span>•</span>
                <div>100% satisfaction guarantee</div>
                <span>•</span>
                <div>Secure & confidential</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="text-center mt-8 space-y-4">
          <div className="text-muted-foreground">
            Not ready yet? That's okay.
          </div>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/trial-assessment">Retake Assessment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Over 10,000 parents have used our assessments to better understand
            their children's needs. Join them in taking the next step toward
            clarity and support.
          </p>
        </div>
      </div>
    </div>
  );
}
