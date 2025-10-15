"use client";

import { useState, useEffect } from "react";
import { useAssessmentCredits } from "@/hooks/use-assessment-credits";
import { ConversationalAssessment } from "./ConversationalAssessment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles, AlertCircle } from "lucide-react";

interface ConversationalAssessmentWrapperProps {
  onComplete: (responses: Record<string, boolean>) => void;
  assessmentId?: string; // If provided, resume existing assessment
  assessmentTemplateId?: string | null;
  subjectName?: string | null;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
}

export function ConversationalAssessmentWrapper({
  onComplete,
  assessmentId,
  assessmentTemplateId: providedTemplateId,
  subjectName: providedSubjectName,
}: ConversationalAssessmentWrapperProps) {
  // Debug wrapper to track onComplete calls
  const handleComplete = (responses: Record<string, boolean>) => {
    console.log("🔄 ConversationalAssessmentWrapper.handleComplete called with:", responses);
    onComplete(responses);
  };
  const { credits, isLoading: creditsLoading } = useAssessmentCredits();
  const [hasConversationalAI, setHasConversationalAI] = useState(false);
  const [assessmentTemplates, setAssessmentTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(providedTemplateId || "");
  const [subjectName, setSubjectName] = useState(providedSubjectName || "");
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If assessmentId is provided, skip setup and go straight to the assessment (resume)
  const isResuming = !!assessmentId;

  // Check if user has conversational AI license
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const response = await fetch("/api/user/license");
        if (response.ok) {
          const data = await response.json();
          if (data.hasLicense && data.license?.features) {
            setHasConversationalAI(
              data.license.features.conversationalAI === true
            );
          }
        }
      } catch (error) {
        console.error("Failed to check license:", error);
      }
    };
    checkLicense();
  }, []);

  useEffect(() => {
    if (providedTemplateId) {
      setSelectedTemplateId(providedTemplateId);
    }
  }, [providedTemplateId]);

  useEffect(() => {
    if (providedSubjectName) {
      setSubjectName(providedSubjectName);
    }
  }, [providedSubjectName]);

  // Load available assessment templates if user has credits/license
  useEffect(() => {
    const loadTemplates = async () => {
      // Check if user has unlimited conversational AI OR conversational credits
      const hasConversationalCredits = credits?.conversationalCredits && credits.conversationalCredits > 0;
      const canAccessFullAssessment = hasConversationalAI || hasConversationalCredits;

      if (canAccessFullAssessment) {
        try {
          const response = await fetch("/api/assessments/available");
          if (response.ok) {
            const templates = await response.json();
            setAssessmentTemplates(templates);
            if (templates.length > 0 && !providedTemplateId) {
              setSelectedTemplateId(templates[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to load assessment templates:", error);
        }
      }
      setIsLoading(false);
    };

    if (!creditsLoading) {
      loadTemplates();
    }
  }, [hasConversationalAI, credits, creditsLoading]);

  const handleStartAssessment = () => {
    setIsStarted(true);
  };

  // Check if user has conversational credits or subscription with conversational AI
  const hasConversationalCredits = credits?.conversationalCredits && credits.conversationalCredits > 0;
  const shouldUseTrial = !hasConversationalAI && !hasConversationalCredits;

  if (isLoading || creditsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If resuming, skip setup and go directly to the assessment
  if (isResuming) {
    return (
      <ConversationalAssessment
        onComplete={handleComplete}
        isTrial={false} // Resuming is always for full assessments
        assessmentId={assessmentId}
        assessmentTemplateId={providedTemplateId || undefined}
        subjectName={providedSubjectName || undefined}
      />
    );
  }

  if (isStarted) {
    return (
      <ConversationalAssessment
        onComplete={handleComplete}
        isTrial={shouldUseTrial}
        assessmentTemplateId={selectedTemplateId}
        subjectName={subjectName}
      />
    );
  }

  // Show trial setup
  if (shouldUseTrial) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversational Assessment Trial
            <Badge variant="secondary">Free Trial</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Try Our Conversational Assessment
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience how children can naturally express themselves through our AI-powered 
                conversation. This trial includes the same 15 questions from our regular assessment, 
                presented in a friendly, child-safe chat format.
              </p>
            </div>
          </div>

          {!hasConversationalAI && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Want Full Conversational Assessments?
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Upgrade to Professional or Enterprise to create unlimited conversational 
                    assessments with any of your custom templates and save results to your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleStartAssessment}
            size="lg"
            className="w-full"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Free Trial
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show full assessment setup
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          New Conversational Assessment
          <Badge variant="default">Full Version</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject-name">Child's Name</Label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Enter the child's name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="assessment-template">Assessment Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an assessment template" />
              </SelectTrigger>
              <SelectContent className="max-w-[400px]">
                {assessmentTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {hasConversationalAI ? "Conversational AI Included" : "Conversational Credits Available"}
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                {hasConversationalAI
                  ? "Your license includes unlimited conversational assessments. Results will be saved to your dashboard and can be used to generate enhanced reports."
                  : `You have ${credits?.conversationalCredits} conversational credit${credits?.conversationalCredits === 1 ? '' : 's'} available. Results will be saved to your dashboard and can be used to generate enhanced reports.`
                }
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartAssessment}
          size="lg"
          className="w-full"
          disabled={!subjectName.trim() || !selectedTemplateId}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Start Conversational Assessment
        </Button>
      </CardContent>
    </Card>
  );
}
