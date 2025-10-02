"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Settings,
  HelpCircle,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "LIKERT_5" | "LIKERT_7" | "YES_NO" | "TEXT" | "MULTIPLE_CHOICE";
  options?: string[];
  isRequired: boolean;
  order: number;
}

interface Domain {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  order: number;
}

interface TrialAssessment {
  id: string;
  name: string;
  description: string;
  domains: Domain[];
  isActive: boolean;
}

const TrialAssessmentCustomizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<TrialAssessment | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showDomainDialog, setShowDomainDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (assessment) {
        setIsSaving(true);
        try {
          await saveTrialAssessmentSilent();
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [assessment]);

  // Auto-save when assessment changes
  useEffect(() => {
    if (assessment) {
      debouncedAutoSave();
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [assessment, debouncedAutoSave]);

  useEffect(() => {
    loadTrialAssessment();
  }, []);

  const loadTrialAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/assessments/trial");
      if (response.ok) {
        const data = await response.json();
        console.log("Trial assessment API response:", data); // Debug log

        if (data.assessment && data.domains && data.questions) {
          // Group questions by domain
          const questionsByDomain: { [key: string]: any[] } = {};
          data.questions.forEach((question: any) => {
            const domainSlug = question.domainSlug;
            if (!questionsByDomain[domainSlug]) {
              questionsByDomain[domainSlug] = [];
            }
            questionsByDomain[domainSlug].push(question);
          });

          // Transform the API response to match our interface
          const transformedAssessment: TrialAssessment = {
            id: data.assessment.id || "trial-1",
            name: data.assessment.name || "Child Behavioral Assessment - Trial",
            description:
              data.assessment.description ||
              "Comprehensive behavioral assessment for children",
            isActive: true,
            domains: data.domains.map((domain: any, domainIndex: number) => ({
              id: domain.id || `domain-${domainIndex}`,
              name: domain.name,
              description: domain.description || "",
              order: domain.order || domainIndex + 1,
              questions: (questionsByDomain[domain.slug] || []).map(
                (q: any, qIndex: number) => ({
                  id: q.id || `q-${domainIndex}-${qIndex}`,
                  text: q.text,
                  type: "LIKERT_5" as const,
                  isRequired: q.required !== false,
                  order: q.order || qIndex + 1,
                  options: [],
                })
              ),
            })),
          };

          console.log("Transformed assessment:", transformedAssessment); // Debug log
          setAssessment(transformedAssessment);
        } else {
          console.error("Invalid API response structure:", data);
        }
      } else {
        console.error(
          "API request failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error loading trial assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTrialAssessment = async () => {
    if (!assessment) return;

    setLoading(true);
    try {
      // Save assessment template metadata
      const assessmentResponse = await fetch(
        `/api/admin/assessment-templates`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: assessment.id,
            name: assessment.name,
            description: assessment.description,
          }),
        }
      );

      if (!assessmentResponse.ok) {
        throw new Error("Failed to save assessment metadata");
      }

      // Save each domain template's questions
      for (const domain of assessment.domains) {
        const domainResponse = await fetch(`/api/admin/domain-templates`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: domain.id,
            name: domain.name,
            description: domain.description,
            questions: domain.questions.map((q) => ({
              id: q.id,
              text: q.text,
              type: q.type,
              options: q.options || [],
              required: q.isRequired,
              order: q.order,
              weight: 1,
            })),
          }),
        });

        if (!domainResponse.ok) {
          throw new Error(`Failed to save domain: ${domain.name}`);
        }
      }

      console.log("Trial assessment saved successfully");
      // Show success message
      const successDiv = document.createElement("div");
      successDiv.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successDiv.textContent = "Assessment saved successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error) {
      console.error("Error saving trial assessment:", error);
      // Show error message
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50";
      errorDiv.textContent = "Failed to save assessment";
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Silent save function for auto-save (no UI feedback)
  const saveTrialAssessmentSilent = async () => {
    if (!assessment) return;

    try {
      // Save assessment template metadata
      const assessmentResponse = await fetch(
        `/api/admin/assessment-templates`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: assessment.id,
            name: assessment.name,
            description: assessment.description,
          }),
        }
      );

      if (!assessmentResponse.ok) {
        throw new Error("Failed to auto-save assessment metadata");
      }

      // Save each domain template's questions
      for (const domain of assessment.domains) {
        const domainResponse = await fetch(`/api/admin/domain-templates`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: domain.id,
            name: domain.name,
            description: domain.description,
            questions: domain.questions.map((q) => ({
              id: q.id,
              text: q.text,
              type: q.type,
              options: q.options || [],
              required: q.isRequired,
              order: q.order,
              weight: 1,
            })),
          }),
        });

        if (!domainResponse.ok) {
          throw new Error(`Failed to auto-save domain: ${domain.name}`);
        }
      }

      console.log("Assessment auto-saved successfully");
    } catch (error) {
      console.error("Error auto-saving trial assessment:", error);
    }
  };

  const addDomain = () => {
    if (!assessment) return;

    const newDomain: Domain = {
      id: `domain-${Date.now()}`,
      name: "New Domain",
      description: "Domain description",
      questions: [],
      order: assessment.domains.length + 1,
    };

    setEditingDomain(newDomain);
    setShowDomainDialog(true);
  };

  const editDomain = (domain: Domain) => {
    setEditingDomain({ ...domain });
    setShowDomainDialog(true);
  };

  const saveDomain = () => {
    if (!assessment || !editingDomain) return;

    const updatedDomains = [...assessment.domains];
    const existingIndex = updatedDomains.findIndex(
      (d) => d.id === editingDomain.id
    );

    if (existingIndex >= 0) {
      updatedDomains[existingIndex] = editingDomain;
    } else {
      updatedDomains.push(editingDomain);
    }

    setAssessment({ ...assessment, domains: updatedDomains });
    setShowDomainDialog(false);
    setEditingDomain(null);
  };

  const deleteDomain = (domainId: string) => {
    if (!assessment) return;
    if (
      !confirm(
        "Are you sure you want to delete this domain and all its questions?"
      )
    )
      return;

    const updatedDomains = assessment.domains.filter((d) => d.id !== domainId);
    setAssessment({ ...assessment, domains: updatedDomains });
  };

  const addQuestion = (domainId: string) => {
    if (!assessment) return;

    const domain = assessment.domains.find((d) => d.id === domainId);
    if (!domain) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: "New question text",
      type: "LIKERT_5",
      isRequired: true,
      order: domain.questions.length + 1,
      options: [],
    };

    setEditingQuestion({ ...newQuestion, domainId } as any);
    setShowQuestionDialog(true);
  };

  const editQuestion = (domainId: string, question: Question) => {
    setEditingQuestion({ ...question, domainId } as any);
    setShowQuestionDialog(true);
  };

  const saveQuestion = () => {
    if (!assessment || !editingQuestion) return;

    const domainId = (editingQuestion as any).domainId;
    const updatedDomains = assessment.domains.map((domain) => {
      if (domain.id === domainId) {
        const updatedQuestions = [...domain.questions];
        const existingIndex = updatedQuestions.findIndex(
          (q) => q.id === editingQuestion.id
        );

        if (existingIndex >= 0) {
          updatedQuestions[existingIndex] = editingQuestion;
        } else {
          updatedQuestions.push(editingQuestion);
        }

        return { ...domain, questions: updatedQuestions };
      }
      return domain;
    });

    setAssessment({ ...assessment, domains: updatedDomains });
    setShowQuestionDialog(false);
    setEditingQuestion(null);
  };

  const deleteQuestion = (domainId: string, questionId: string) => {
    if (!assessment) return;
    if (!confirm("Are you sure you want to delete this question?")) return;

    const updatedDomains = assessment.domains.map((domain) => {
      if (domain.id === domainId) {
        return {
          ...domain,
          questions: domain.questions.filter((q) => q.id !== questionId),
        };
      }
      return domain;
    });

    setAssessment({ ...assessment, domains: updatedDomains });
  };

  const previewAssessment = () => {
    if (!assessment) return;

    // Open trial assessment in new tab
    window.open("/trial-assessment", "_blank");
  };

  if (loading && !assessment) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground">
            Loading trial assessment...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground">
            No trial assessment found
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalQuestions = assessment.domains.reduce(
    (sum, domain) => sum + domain.questions.length,
    0
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Trial Assessment Customization
          </div>
          {isSaving && (
            <Badge variant="secondary" className="text-xs">
              Auto-saving...
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          Customize the trial assessment that users see on the frontend
          (auto-saves changes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assessment Overview */}
        <div className="grid gap-3">
          <div>
            <Label htmlFor="assessmentName" className="text-xs">
              Assessment Name
            </Label>
            <Input
              id="assessmentName"
              value={assessment.name}
              onChange={(e) =>
                setAssessment({ ...assessment, name: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="assessmentDescription" className="text-xs">
              Description
            </Label>
            <Textarea
              id="assessmentDescription"
              value={assessment.description}
              onChange={(e) =>
                setAssessment({ ...assessment, description: e.target.value })
              }
              className="text-xs resize-none"
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Assessment Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded">
            <div className="text-sm font-semibold">
              {assessment.domains.length}
            </div>
            <div className="text-xs text-muted-foreground">Domains</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="text-sm font-semibold">{totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
          <div className="p-2 bg-muted rounded">
            <div className="text-sm font-semibold">
              {assessment.isActive ? "Active" : "Inactive"}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>

        <Separator />

        {/* Domains */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Assessment Domains</Label>
            <Button onClick={addDomain} size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add Domain
            </Button>
          </div>

          {assessment.domains.map((domain, domainIndex) => (
            <Card key={domain.id} className="border-muted">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-medium">
                      {domain.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {domain.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {domain.questions.length} questions
                    </Badge>
                    <Button
                      onClick={() => editDomain(domain)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteDomain(domain.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {domain.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-2 bg-muted rounded text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {questionIndex + 1}. {question.text}
                      </div>
                      <div className="text-muted-foreground">
                        {question.type}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => editQuestion(domain.id, question)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteQuestion(domain.id, question.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => addQuestion(domain.id)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={saveTrialAssessment}
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            <Save className="h-3 w-3 mr-1" />
            {loading ? "Saving..." : "Save Assessment"}
          </Button>
          <Button onClick={previewAssessment} size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>

        {/* Domain Edit Dialog */}
        <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editingDomain?.id.includes("domain-") &&
                editingDomain.id.includes(Date.now().toString())
                  ? "Add"
                  : "Edit"}{" "}
                Domain
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure domain details and description
              </DialogDescription>
            </DialogHeader>
            {editingDomain && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="domainName" className="text-xs">
                    Domain Name
                  </Label>
                  <Input
                    id="domainName"
                    value={editingDomain.name}
                    onChange={(e) =>
                      setEditingDomain({
                        ...editingDomain,
                        name: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="domainDescription" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="domainDescription"
                    value={editingDomain.description}
                    onChange={(e) =>
                      setEditingDomain({
                        ...editingDomain,
                        description: e.target.value,
                      })
                    }
                    className="text-xs resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setShowDomainDialog(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={saveDomain} size="sm">
                Save Domain
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Question Edit Dialog */}
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">
                {editingQuestion?.id.includes("question-") &&
                editingQuestion.id.includes(Date.now().toString())
                  ? "Add"
                  : "Edit"}{" "}
                Question
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure question text and response type
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="questionText" className="text-xs">
                    Question Text
                  </Label>
                  <Textarea
                    id="questionText"
                    value={editingQuestion.text}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        text: e.target.value,
                      })
                    }
                    className="text-xs resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="questionType" className="text-xs">
                    Response Type
                  </Label>
                  <Select
                    value={editingQuestion.type}
                    onValueChange={(value) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        type: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIKERT_5">
                        5-point Scale (Strongly Disagree - Strongly Agree)
                      </SelectItem>
                      <SelectItem value="LIKERT_7">7-point Scale</SelectItem>
                      <SelectItem value="YES_NO">Yes/No</SelectItem>
                      <SelectItem value="TEXT">Text Response</SelectItem>
                      <SelectItem value="MULTIPLE_CHOICE">
                        Multiple Choice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setShowQuestionDialog(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={saveQuestion} size="sm">
                Save Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TrialAssessmentCustomizer;
