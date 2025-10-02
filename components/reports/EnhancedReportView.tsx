"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, Users, MessageSquare, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Question {
  id: string;
  text: string;
  category: string;
}

interface Response {
  questionId: string;
  question: string;
  parentAnswer: string;
  childAnswer: string;
  timestamp: string;
}

interface EnhancedAnalysis {
  overallAlignment: string;
  keyDifferences: Array<{
    area: string;
    parentView: string;
    childView: string;
    significance: string;
  }>;
  insights: string[];
  recommendations: string[];
  quotes: Array<{
    speaker: "parent" | "child";
    text: string;
    context: string;
  }>;
}

interface EnhancedReportViewProps {
  assessment: {
    id: string;
    title: string;
    completedAt: Date | null;
    score: number;
    enhancedReportPurchasedAt: Date | null;
  };
  childResponses: Response[] | { responses: Response[] } | any;
  enhancedAnalysis: EnhancedAnalysis;
  onDownloadPdf: () => void;
}

export default function EnhancedReportView({
  assessment,
  childResponses,
  enhancedAnalysis,
  onDownloadPdf,
}: EnhancedReportViewProps) {
  // Extract responses array from the JSON structure
  const responses: Response[] = Array.isArray(childResponses)
    ? childResponses
    : childResponses?.responses || [];

  // Group responses by category if possible
  const groupedResponses = responses.reduce(
    (acc: Record<string, Response[]>, response: Response) => {
      const category = response.question?.split(":")[0] || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(response);
      return acc;
    },
    {} as Record<string, Response[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{assessment.title}</h1>
          <p className="text-muted-foreground mt-2">
            Enhanced Report with Child Responses
          </p>
          {assessment.enhancedReportPurchasedAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Unlocked on{" "}
              {new Date(
                assessment.enhancedReportPurchasedAt
              ).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button onClick={onDownloadPdf} size="lg">
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Comparative Analysis</CardTitle>
          </div>
          <CardDescription>
            How parent and child perspectives align and differ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{enhancedAnalysis.overallAlignment}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">
            <Users className="mr-2 h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="differences">
            <MessageSquare className="mr-2 h-4 w-4" />
            Key Differences
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="mr-2 h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="quotes">Notable Quotes</TabsTrigger>
        </TabsList>

        {/* Side-by-Side Comparison */}
        <TabsContent value="comparison" className="space-y-4">
          {Object.entries(groupedResponses).map(([category, responses]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {responses.map((response, idx) => (
                  <div key={idx} className="space-y-3">
                    <p className="font-medium text-sm">{response.question}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Parent Response */}
                      <div className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 dark:bg-blue-900"
                          >
                            Parent
                          </Badge>
                        </div>
                        <p className="text-sm">{response.parentAnswer}</p>
                      </div>

                      {/* Child Response */}
                      <div className="border rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-green-100 dark:bg-green-900"
                          >
                            Child
                          </Badge>
                        </div>
                        <p className="text-sm">{response.childAnswer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Key Differences */}
        <TabsContent value="differences" className="space-y-4">
          {enhancedAnalysis.keyDifferences.map((diff, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{diff.area}</CardTitle>
                <CardDescription>{diff.significance}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">
                      Parent's Perspective
                    </h4>
                    <p className="text-sm">{diff.parentView}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400">
                      Child's Perspective
                    </h4>
                    <p className="text-sm">{diff.childView}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insights & Recommendations */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                What the comparison reveals about your child's experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {enhancedAnalysis.insights.map((insight, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-primary mt-1">•</span>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enhanced Recommendations</CardTitle>
              <CardDescription>
                Actionable steps based on both perspectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {enhancedAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-primary font-bold mt-1">
                      {idx + 1}.
                    </span>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{rec}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notable Quotes */}
        <TabsContent value="quotes" className="space-y-4">
          {enhancedAnalysis.quotes.map((quote, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <blockquote className="border-l-4 border-primary pl-4 italic text-lg mb-3">
                  "{quote.text}"
                </blockquote>
                <div className="flex items-center justify-between text-sm">
                  <Badge
                    variant={
                      quote.speaker === "parent" ? "outline" : "secondary"
                    }
                  >
                    {quote.speaker === "parent" ? "Parent" : "Child"}
                  </Badge>
                  <span className="text-muted-foreground">{quote.context}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
