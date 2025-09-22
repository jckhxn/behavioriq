"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Settings, AlertCircle } from "lucide-react";

interface ReportOptions {
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeDetailedResponses: boolean;
  includeTrends: boolean;
  organizationName?: string;
  reportTitle?: string;
}

interface PDFReportButtonProps {
  assessmentId: string;
  subjectName: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function PDFReportButton({
  assessmentId,
  subjectName,
  disabled = false,
  variant = "default",
  size = "default",
}: PDFReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<ReportOptions>({
    includeCharts: true,
    includeRecommendations: true,
    includeDetailedResponses: false,
    includeTrends: false,
    organizationName: "AI Diagnostic System",
    reportTitle: "Behavioral Assessment Report",
  });

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessmentId,
          options,
        }),
      });

      if (response.ok) {
        // Handle PDF download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `assessment-report-${subjectName.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setOpen(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate report");
      }
    } catch (error) {
      setError("Network error occurred while generating report");
      console.error("Error generating PDF report:", error);
    } finally {
      setGenerating(false);
    }
  };

  const updateOption = (key: keyof ReportOptions, value: boolean | string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div>
                  Subject:{" "}
                  <span className="font-medium text-foreground">
                    {subjectName}
                  </span>
                </div>
                <div>
                  Assessment ID:{" "}
                  <span className="font-mono text-xs">{assessmentId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportTitle">Report Title</Label>
                  <Input
                    id="reportTitle"
                    value={options.reportTitle}
                    onChange={(e) =>
                      updateOption("reportTitle", e.target.value)
                    }
                    placeholder="Behavioral Assessment Report"
                  />
                </div>
                <div>
                  <Label htmlFor="organizationName">Organization</Label>
                  <Input
                    id="organizationName"
                    value={options.organizationName}
                    onChange={(e) =>
                      updateOption("organizationName", e.target.value)
                    }
                    placeholder="Your Organization Name"
                  />
                </div>
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Include in Report</Label>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={options.includeCharts}
                      onCheckedChange={(checked: boolean) =>
                        updateOption("includeCharts", checked)
                      }
                    />
                    <Label
                      htmlFor="includeCharts"
                      className="text-sm font-normal"
                    >
                      Visual Charts and Graphs
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRecommendations"
                      checked={options.includeRecommendations}
                      onCheckedChange={(checked: boolean) =>
                        updateOption("includeRecommendations", checked)
                      }
                    />
                    <Label
                      htmlFor="includeRecommendations"
                      className="text-sm font-normal"
                    >
                      AI-Generated Clinical Recommendations
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeDetailedResponses"
                      checked={options.includeDetailedResponses}
                      onCheckedChange={(checked: boolean) =>
                        updateOption("includeDetailedResponses", checked)
                      }
                    />
                    <Label
                      htmlFor="includeDetailedResponses"
                      className="text-sm font-normal"
                    >
                      Detailed Question Responses
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTrends"
                      checked={options.includeTrends}
                      onCheckedChange={(checked: boolean) =>
                        updateOption("includeTrends", checked)
                      }
                    />
                    <Label
                      htmlFor="includeTrends"
                      className="text-sm font-normal"
                    >
                      Assessment Trends Analysis
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
