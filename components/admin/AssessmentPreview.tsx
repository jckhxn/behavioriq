import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ChevronRight, ChevronLeft, Play } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions: Question[];
  resources?: any;
  scoringConfig?: any;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  domains: {
    order: number;
    domainTemplate: DomainTemplate;
  }[];
}

interface AssessmentPreviewProps {
  template: AssessmentTemplate;
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"overview" | "walkthrough">(
    "overview"
  );

  // Sort domains by order
  const sortedDomains = [...template.domains].sort((a, b) => a.order - b.order);
  const currentDomain = sortedDomains[currentDomainIndex];
  const currentQuestion =
    currentDomain?.domainTemplate.questions[currentQuestionIndex];

  const totalQuestions = sortedDomains.reduce(
    (total, domain) => total + domain.domainTemplate.questions.length,
    0
  );

  const goToNextQuestion = () => {
    if (
      currentQuestionIndex <
      currentDomain.domainTemplate.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentDomainIndex < sortedDomains.length - 1) {
      setCurrentDomainIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentDomainIndex > 0) {
      setCurrentDomainIndex((prev) => prev - 1);
      setCurrentQuestionIndex(
        sortedDomains[currentDomainIndex - 1].domainTemplate.questions.length -
          1
      );
    }
  };

  const getCurrentQuestionNumber = () => {
    let questionNumber = 1;
    for (let i = 0; i < currentDomainIndex; i++) {
      questionNumber += sortedDomains[i].domainTemplate.questions.length;
    }
    questionNumber += currentQuestionIndex;
    return questionNumber;
  };

  const canGoNext = !(
    currentDomainIndex === sortedDomains.length - 1 &&
    currentQuestionIndex === currentDomain?.domainTemplate.questions.length - 1
  );

  const canGoPrevious = !(
    currentDomainIndex === 0 && currentQuestionIndex === 0
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentDomainIndex(0);
      setCurrentQuestionIndex(0);
      setViewMode("overview");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overview")}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === "walkthrough" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("walkthrough")}
            >
              <Play className="h-4 w-4 mr-1" />
              Walkthrough
            </Button>
          </div>

          <ScrollArea className="h-[60vh]">
            {viewMode === "overview" ? (
              <div className="space-y-6">
                {/* Assessment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Name:</strong> {template.name}
                    </div>
                    <div>
                      <strong>Slug:</strong> {template.slug}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {template.description && (
                      <div>
                        <strong>Description:</strong> {template.description}
                      </div>
                    )}
                    {template.instructions && (
                      <div>
                        <strong>Instructions:</strong> {template.instructions}
                      </div>
                    )}
                    <div>
                      <strong>Total Questions:</strong> {totalQuestions}
                    </div>
                    <div>
                      <strong>Domains:</strong> {sortedDomains.length}
                    </div>
                  </CardContent>
                </Card>

                {/* Domains Overview */}
                {sortedDomains.map((domain, index) => (
                  <Card key={domain.domainTemplate.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">Domain {index + 1}</Badge>
                        {domain.domainTemplate.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {domain.domainTemplate.description && (
                        <p className="text-sm text-muted-foreground">
                          {domain.domainTemplate.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span>
                            <strong>Questions:</strong>{" "}
                            {domain.domainTemplate.questions.length}
                          </span>
                          <span>
                            <strong>Slug:</strong> {domain.domainTemplate.slug}
                          </span>
                          {domain.domainTemplate.resources && (
                            <Badge variant="outline">Has Resources</Badge>
                          )}
                          {domain.domainTemplate.scoringConfig && (
                            <Badge variant="outline">Custom Scoring</Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="font-medium">Sample Questions:</h4>
                        {domain.domainTemplate.questions
                          .slice(0, 3)
                          .map((question, qIndex) => (
                            <div
                              key={question.id}
                              className="pl-4 border-l-2 border-muted"
                            >
                              <p className="text-sm">
                                <strong>Q{qIndex + 1}:</strong> {question.text}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Type: {question.type}
                                {question.required && " (Required)"}
                              </p>
                            </div>
                          ))}
                        {domain.domainTemplate.questions.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-4">
                            ... and {domain.domainTemplate.questions.length - 3}{" "}
                            more questions
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Walkthrough Mode */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Question {getCurrentQuestionNumber()} of{" "}
                          {totalQuestions}
                        </Badge>
                        <span>{currentDomain?.domainTemplate.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Domain {currentDomainIndex + 1} of{" "}
                        {sortedDomains.length}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentQuestion && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium mb-2">
                            {currentQuestion.text}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            <div>Type: {currentQuestion.type}</div>
                            <div>ID: {currentQuestion.id}</div>
                            {currentQuestion.required && (
                              <Badge variant="secondary" className="mt-1">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>

                        {currentQuestion.options && (
                          <div>
                            <h4 className="font-medium mb-2">Options:</h4>
                            <div className="space-y-1">
                              {currentQuestion.options.map((option, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-background border rounded"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={goToPreviousQuestion}
                        disabled={!canGoPrevious}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={goToNextQuestion}
                        disabled={!canGoNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close Preview</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentPreview;
