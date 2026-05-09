"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Download,
  Zap,
  Check,
  ClipboardList,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { AssessmentTester } from "./AssessmentTester";
import { BulkUploadDialog } from "./BulkUploadDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions: any;
  resources?: any;
  scoringConfig?: any;
  createdAt: string;
  createdBy: { name: string; email: string };
  _count: { assessmentTemplates: number };
}

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: { name: string; email: string };
  domains: { order: number; domainTemplate: DomainTemplate }[];
  _count: { assessments: number };
}

interface AssessmentFormValues {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  isActive: boolean;
  selectedDomains: { id: string; order: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getTrialQuestionCount = (questions: any[]): number =>
  Array.isArray(questions) ? questions.filter((q) => q.isTrial === true).length : 0;

// ─── DomainTrialEditor ────────────────────────────────────────────────────────

interface DomainTrialEditorProps {
  isOpen: boolean;
  domainName: string;
  questions: any[];
  onClose: () => void;
  onSave: () => void;
  onUpdateQuestion: (index: number, isTrial: boolean) => void;
  onToggleAll: (isTrial: boolean) => void;
}

const DomainTrialEditor: React.FC<DomainTrialEditorProps> = ({
  isOpen,
  domainName,
  questions,
  onClose,
  onSave,
  onUpdateQuestion,
  onToggleAll,
}) => {
  const trialCount = questions.filter((q) => q.isTrial === true).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Trial Questions — {domainName}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between px-1 py-2 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium px-2">
            {trialCount} of {questions.length} questions marked for trial
          </span>
          <div className="flex gap-2 pr-1">
            <Button variant="outline" size="sm" onClick={() => onToggleAll(true)}>
              Mark All
            </Button>
            <Button variant="outline" size="sm" onClick={() => onToggleAll(false)}>
              Unmark All
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-2 py-2">
            {questions.map((question, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors border ${
                  question.isTrial
                    ? "bg-primary/5 border-primary/30"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  id={`trial-q-${index}`}
                  checked={question.isTrial || false}
                  onCheckedChange={(checked) => onUpdateQuestion(index, !!checked)}
                  className="mt-0.5 shrink-0"
                />
                <Label
                  htmlFor={`trial-q-${index}`}
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  <span className="font-medium text-muted-foreground mr-1.5">
                    {index + 1}.
                  </span>
                  {question.text || question.title || "Untitled"}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Trial Configuration</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── DomainEditDialog ─────────────────────────────────────────────────────────

interface DomainEditDialogProps {
  domain: DomainTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain: DomainTemplate) => void;
}

const DomainEditDialog: React.FC<DomainEditDialogProps> = ({
  domain,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedDomain, setEditedDomain] = useState<DomainTemplate>(domain);

  useEffect(() => {
    setEditedDomain(domain);
  }, [domain]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Domain: {domain.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Domain Name</Label>
                <Input
                  value={editedDomain.name}
                  onChange={(e) =>
                    setEditedDomain({ ...editedDomain, name: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={editedDomain.slug}
                  onChange={(e) =>
                    setEditedDomain({ ...editedDomain, slug: e.target.value })
                  }
                  className="h-10 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editedDomain.description || ""}
                onChange={(e) =>
                  setEditedDomain({ ...editedDomain, description: e.target.value })
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Questions (JSON)</Label>
              <p className="text-xs text-muted-foreground">
                For a better editing experience, use the Domain Library tab.
              </p>
              <Textarea
                value={JSON.stringify(editedDomain.questions, null, 2)}
                onChange={(e) => {
                  try {
                    const questions = JSON.parse(e.target.value);
                    setEditedDomain({ ...editedDomain, questions });
                  } catch {
                    // invalid JSON, don't update
                  }
                }}
                rows={14}
                className="font-mono text-sm resize-none"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedDomain)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── AssessmentForm ───────────────────────────────────────────────────────────

interface AssessmentFormProps {
  initial?: AssessmentTemplate | null;
  domainTemplates: DomainTemplate[];
  onSave: (values: AssessmentFormValues) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initial,
  domainTemplates,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [instructions, setInstructions] = useState(initial?.instructions || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [selectedDomains, setSelectedDomains] = useState<
    { id: string; order: number }[]
  >(
    initial?.domains.map((d, i) => ({
      id: d.domainTemplate.id,
      order: d.order || i + 1,
    })) || []
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial) setSlug(generateSlug(val));
  };

  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) => {
      const isSelected = prev.some((d) => d.id === domainId);
      if (isSelected) {
        const filtered = prev.filter((d) => d.id !== domainId);
        return filtered.map((d, i) => ({ ...d, order: i + 1 }));
      }
      return [...prev, { id: domainId, order: prev.length + 1 }];
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter an assessment name");
      return;
    }
    if (selectedDomains.length === 0) {
      toast.error("Please select at least one domain");
      return;
    }
    await onSave({
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      description: description.trim(),
      instructions: instructions.trim(),
      isActive,
      selectedDomains,
    });
  };

  const totalQuestions = selectedDomains.reduce((sum, sd) => {
    const domain = domainTemplates.find((d) => d.id === sd.id);
    return sum + (Array.isArray(domain?.questions) ? domain.questions.length : 0);
  }, 0);

  const formSections = [
    { id: "assessment-info", label: "Assessment Info" },
    { id: "clinical-domains", label: "Clinical Domains" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full px-10 py-10 space-y-10">
          <div className="sticky top-0 z-10 -mx-10 mb-2 border-b bg-background/95 px-10 pb-4 pt-1 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Form Sections
            </p>
            <nav className="flex flex-wrap gap-2">
              {formSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Assessment info */}
          <section id="assessment-info" className="space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Assessment Information</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Name and describe this assessment template
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Assessment Name{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. ADHD Comprehensive Evaluation"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Slug{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (auto-generated, URL-safe identifier)
                  </span>
                </Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="adhd-comprehensive-evaluation"
                  className="h-10 font-mono text-sm text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this assessment measure? Who is it designed for?"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Patient Instructions</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions shown to the patient before they begin the assessment..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <div>
                  <p className="text-sm font-medium leading-none">Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inactive templates won't appear in assignment lists
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Domain selector */}
          <section id="clinical-domains" className="space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Clinical Domains</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select the domains to include. Each domain contributes a structured
                set of validated questions.
              </p>
            </div>

            {domainTemplates.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl p-8 text-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No domain templates available. Create domains in the Domain
                  Library first.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {domainTemplates.map((domain) => {
                  const isSelected = selectedDomains.some((d) => d.id === domain.id);
                  const selectedDomain = selectedDomains.find(
                    (d) => d.id === domain.id
                  );
                  const questionCount = Array.isArray(domain.questions)
                    ? domain.questions.length
                    : 0;

                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className={`w-full text-left border rounded-xl p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/30 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">
                              {domain.name}
                            </span>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                #{selectedDomain?.order}
                              </Badge>
                            )}
                          </div>
                          {domain.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {domain.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            {questionCount} questions
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedDomains.length > 0 && (
              <div className="bg-muted/50 rounded-xl px-4 py-3 border">
                <p className="text-xs font-medium text-muted-foreground">
                  {selectedDomains.length} domain
                  {selectedDomains.length !== 1 ? "s" : ""} selected ·{" "}
                  {totalQuestions} total questions
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[...selectedDomains]
                    .sort((a, b) => a.order - b.order)
                    .map((sd) => {
                      const domain = domainTemplates.find((d) => d.id === sd.id);
                      return (
                        <span
                          key={sd.id}
                          className="text-xs bg-background border rounded-md px-2 py-0.5 font-medium"
                        >
                          {sd.order}. {domain?.name}
                        </span>
                      );
                    })}
                </div>
              </div>
            )}
          </section>

          <div className="h-2" />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t px-6 py-4 bg-background flex items-center justify-between shrink-0">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="min-w-40">
          {isSaving
            ? "Saving..."
            : initial
            ? "Update Assessment"
            : "Create Assessment"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AssessmentTemplateManager: React.FC = () => {
  const [assessmentTemplates, setAssessmentTemplates] = useState<
    AssessmentTemplate[]
  >([]);
  const [domainTemplates, setDomainTemplates] = useState<DomainTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialAssessmentId, setTrialAssessmentId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<AssessmentTemplate | null>(null);

  // Sheet state (create + edit)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Other dialogs
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDomainEditDialogOpen, setIsDomainEditDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainTemplate | null>(null);

  // Trial editor
  const [isTrialEditorOpen, setIsTrialEditorOpen] = useState(false);
  const [trialEditorDomainId, setTrialEditorDomainId] = useState<string | null>(
    null
  );
  const [trialEditorQuestions, setTrialEditorQuestions] = useState<any[]>([]);

  // Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessmentTemplates();
    fetchDomainTemplates();
    fetchPlatformSettings();
  }, []);

  const fetchAssessmentTemplates = async () => {
    try {
      const response = await fetch("/api/admin/assessment-templates");
      if (response.ok) {
        setAssessmentTemplates(await response.json());
      } else {
        toast.error("Failed to fetch assessment templates");
      }
    } catch {
      toast.error("Error fetching assessment templates");
    }
  };

  const fetchDomainTemplates = async () => {
    try {
      const response = await fetch("/api/admin/domain-templates");
      if (response.ok) {
        setDomainTemplates(await response.json());
      } else {
        toast.error("Failed to fetch domain templates");
      }
    } catch {
      toast.error("Error fetching domain templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformSettings = async () => {
    try {
      const response = await fetch("/api/admin/platform-settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.globalTrialAssessment?.id) {
          setTrialAssessmentId(data.settings.globalTrialAssessment.id);
        }
      }
    } catch {
      console.error("Error fetching platform settings");
    }
  };

  const getTotalQuestionCount = (template: AssessmentTemplate): number =>
    template.domains.reduce((total, { domainTemplate }) => {
      const count = Array.isArray(domainTemplate.questions)
        ? domainTemplate.questions.length
        : 0;
      return total + count;
    }, 0);

  const openCreate = () => {
    setSelectedTemplate(null);
    setIsSheetOpen(true);
  };

  const openEdit = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    if (isSaving) return;
    setIsSheetOpen(false);
    setSelectedTemplate(null);
  };

  const handleSave = async (values: AssessmentFormValues) => {
    setIsSaving(true);
    try {
      const method = selectedTemplate ? "PUT" : "POST";
      const body = selectedTemplate
        ? {
            id: selectedTemplate.id,
            name: values.name,
            slug: values.slug,
            description: values.description,
            instructions: values.instructions,
            isActive: values.isActive,
            domains: values.selectedDomains
              .sort((a, b) => a.order - b.order)
              .map((d) => ({ domainTemplateId: d.id, order: d.order })),
          }
        : {
            name: values.name,
            slug: values.slug,
            description: values.description,
            instructions: values.instructions,
            isActive: values.isActive,
            domainIds: values.selectedDomains
              .sort((a, b) => a.order - b.order)
              .map((d) => d.id),
          };

      const response = await fetch("/api/admin/assessment-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          selectedTemplate ? "Assessment updated" : "Assessment created successfully"
        );
        closeSheet();
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save assessment");
      }
    } catch {
      toast.error("Error saving assessment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this assessment template?"))
      return;
    try {
      const response = await fetch(
        `/api/admin/assessment-templates/${templateId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        toast.success("Assessment template deleted");
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting assessment template");
    }
  };

  const handleExportTemplate = async (
    templateId: string,
    templateSlug: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/assessment-templates/${templateId}/export`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${templateSlug}-assessment-template.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Exported successfully");
      } else {
        toast.error("Failed to export assessment template");
      }
    } catch {
      toast.error("Error exporting assessment template");
    }
  };

  // Trial editor
  const openDomainTrialEditor = (domain: DomainTemplate) => {
    if (Array.isArray(domain.questions)) {
      setTrialEditorDomainId(domain.id);
      setTrialEditorQuestions(
        domain.questions.map((q) => ({ ...q, isTrial: q.isTrial === true }))
      );
      setIsTrialEditorOpen(true);
    }
  };

  const saveTrialChanges = async () => {
    if (!trialEditorDomainId || !selectedTemplate) return;
    try {
      const response = await fetch("/api/admin/assessment-templates/trial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedTemplate.id,
          domainId: trialEditorDomainId,
          questions: trialEditorQuestions,
        }),
      });
      if (response.ok) {
        toast.success("Trial configuration updated");
        setIsTrialEditorOpen(false);
        setTrialEditorDomainId(null);
        setTrialEditorQuestions([]);
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update trial configuration");
      }
    } catch {
      toast.error("Error updating trial configuration");
    }
  };

  // Domain edit (from within assessment context)
  const handleEditDomain = (domain: DomainTemplate) => {
    setEditingDomain(domain);
    setIsDomainEditDialogOpen(true);
  };

  const handleUpdateDomain = async (updatedDomain: DomainTemplate) => {
    try {
      const response = await fetch("/api/admin/domain-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDomain),
      });
      if (response.ok) {
        toast.success("Domain updated");
        setIsDomainEditDialogOpen(false);
        setEditingDomain(null);
        fetchDomainTemplates();
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update domain");
      }
    } catch {
      toast.error("Error updating domain");
    }
  };

  // File upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const response = await fetch("/api/admin/assessment-templates/upload", {
        method: "POST",
        body: fd,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Assessment template uploaded");
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        fetchAssessmentTemplates();
      } else {
        setUploadError(result.error || "Failed to upload");
      }
    } catch {
      setUploadError("Error uploading assessment template");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (template: AssessmentTemplate) => {
    try {
      const res = await fetch(`/api/admin/assessment-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      if (res.ok) {
        setAssessmentTemplates((prev) =>
          prev.map((t) =>
            t.id === template.id ? { ...t, isActive: !template.isActive } : t
          )
        );
        toast.success(`Assessment ${!template.isActive ? "enabled" : "disabled"}`);
      } else {
        toast.error("Failed to update assessment");
      }
    } catch {
      toast.error("Failed to update assessment");
    }
  };

  const handleBulkUploadSuccess = () => {
    fetchAssessmentTemplates();
    fetchDomainTemplates();
    toast.success("Bulk upload completed successfully");
  };

  const handleSetTrialAssessment = async (template: AssessmentTemplate) => {
    if (template.id === trialAssessmentId) return;
    try {
      const res = await fetch("/api/admin/assessment-templates/set-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (res.ok) {
        setTrialAssessmentId(template.id);
        toast.success(`"${template.name}" is now the trial assessment`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to set trial assessment");
      }
    } catch {
      toast.error("Failed to set trial assessment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Assessment Templates</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Build full assessments by combining clinical domains. Each template
            defines which domains are included and in what order.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {/* Upload JSON */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Assessment Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a JSON file previously exported from this system.
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadSubmit}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <BulkUploadDialog onUploadComplete={handleBulkUploadSuccess} />

          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Assessment list */}
      {assessmentTemplates.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first assessment template by combining clinical domains.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Assessment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {assessmentTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.id === trialAssessmentId && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30 text-xs"
                        >
                          Trial
                        </Badge>
                      )}
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(template);
                        }}
                      >
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => handleToggleActive(template)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    {template.description && (
                      <CardDescription className="mt-1.5 text-sm leading-relaxed line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewDialogOpen(true);
                      }}
                      title="Preview"
                      className="h-9 w-9 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleExportTemplate(template.id, template.slug)
                      }
                      title="Export JSON"
                      className="h-9 w-9 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetTrialAssessment(template)}
                      title={
                        template.id === trialAssessmentId
                          ? "Current trial assessment"
                          : "Set as trial assessment"
                      }
                      disabled={template.id === trialAssessmentId}
                      className={`h-9 w-9 p-0 ${
                        template.id === trialAssessmentId
                          ? "text-primary opacity-60"
                          : "hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <FlaskConical className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(template)}
                      title="Edit assessment"
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete assessment"
                      className="h-9 w-9 p-0 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>By {template.createdBy.name}</span>
                  <span>·</span>
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{template._count.assessments} assessments</span>
                  <span>·</span>
                  <span className="font-medium">
                    {getTotalQuestionCount(template)} total questions
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {template.domains.map(({ domainTemplate }) => {
                    const totalCount = Array.isArray(domainTemplate.questions)
                      ? domainTemplate.questions.length
                      : 0;
                    const trialCount = getTrialQuestionCount(
                      domainTemplate.questions
                    );

                    return (
                      <div key={domainTemplate.id} className="flex items-center">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs pr-1"
                        >
                          {domainTemplate.name} ({totalCount}
                          {trialCount > 0 && (
                            <span className="text-primary font-medium">
                              /{trialCount}
                            </span>
                          )}
                          )
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                              openDomainTrialEditor(domainTemplate);
                            }}
                            className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors"
                            title={`Configure trial questions for ${domainTemplate.name}`}
                          >
                            <Zap className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDomain(domainTemplate);
                            }}
                            className="p-0.5 hover:bg-muted rounded transition-colors"
                            title={`Edit ${domainTemplate.name} domain`}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <DialogContent className="w-[96vw] max-w-[92vw] h-[90vh] p-0 flex flex-col overflow-hidden lg:max-w-[94vw] xl:max-w-[96rem]">
          <DialogHeader className="px-8 pt-7 pb-5 border-b shrink-0">
            <DialogTitle className="text-xl">
              {selectedTemplate
                ? `Edit: ${selectedTemplate.name}`
                : "New Assessment Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Update domains and settings for this assessment."
                : "Compose a clinical assessment by selecting domains."}
            </DialogDescription>
          </DialogHeader>

          <AssessmentForm
            key={selectedTemplate?.id || "new"}
            initial={selectedTemplate}
            domainTemplates={domainTemplates}
            onSave={handleSave}
            onCancel={closeSheet}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="w-[96vw] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-500" />
              Preview: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Walk through this assessment as a respondent would. No data is saved.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTemplate && isPreviewDialogOpen && (
              <AssessmentTester key={selectedTemplate.id} templateId={selectedTemplate.id} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Editor */}
      {trialEditorDomainId && (
        <DomainTrialEditor
          isOpen={isTrialEditorOpen}
          domainName={
            domainTemplates.find((d) => d.id === trialEditorDomainId)?.name || ""
          }
          questions={trialEditorQuestions}
          onClose={() => {
            setIsTrialEditorOpen(false);
            setTrialEditorDomainId(null);
            setTrialEditorQuestions([]);
          }}
          onSave={saveTrialChanges}
          onUpdateQuestion={(index, isTrial) =>
            setTrialEditorQuestions((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], isTrial };
              return updated;
            })
          }
          onToggleAll={(isTrial) =>
            setTrialEditorQuestions((prev) => prev.map((q) => ({ ...q, isTrial })))
          }
        />
      )}

      {/* Domain Edit Dialog */}
      {editingDomain && (
        <DomainEditDialog
          domain={editingDomain}
          isOpen={isDomainEditDialogOpen}
          onClose={() => {
            setIsDomainEditDialogOpen(false);
            setEditingDomain(null);
          }}
          onSave={handleUpdateDomain}
        />
      )}
    </div>
  );
};

export default AssessmentTemplateManager;
