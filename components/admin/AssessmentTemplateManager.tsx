import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import AssessmentPreview from "./AssessmentPreview";
import { BulkUploadDialog } from "./BulkUploadDialog";

interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions: any;
  resources?: any;
  scoringConfig?: any;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  _count: {
    assessmentTemplates: number;
  };
}

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  domains: {
    order: number;
    domainTemplate: DomainTemplate;
  }[];
  _count: {
    assessments: number;
  };
}

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

  const handleSave = () => {
    onSave(editedDomain);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Domain: {domain.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain-name">Domain Name</Label>
              <Input
                id="domain-name"
                value={editedDomain.name}
                onChange={(e) =>
                  setEditedDomain({ ...editedDomain, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="domain-slug">Domain Slug</Label>
              <Input
                id="domain-slug"
                value={editedDomain.slug}
                onChange={(e) =>
                  setEditedDomain({ ...editedDomain, slug: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="domain-description">Description</Label>
            <Textarea
              id="domain-description"
              value={editedDomain.description || ""}
              onChange={(e) =>
                setEditedDomain({
                  ...editedDomain,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="domain-questions">Questions (JSON)</Label>
            <Textarea
              id="domain-questions"
              value={JSON.stringify(editedDomain.questions, null, 2)}
              onChange={(e) => {
                try {
                  const questions = JSON.parse(e.target.value);
                  setEditedDomain({ ...editedDomain, questions });
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          {editedDomain.resources && (
            <div>
              <Label htmlFor="domain-resources">Resources (JSON)</Label>
              <Textarea
                id="domain-resources"
                value={JSON.stringify(editedDomain.resources, null, 2)}
                onChange={(e) => {
                  try {
                    const resources = JSON.parse(e.target.value);
                    setEditedDomain({ ...editedDomain, resources });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          )}

          {editedDomain.scoringConfig && (
            <div>
              <Label htmlFor="domain-scoring">Scoring Config (JSON)</Label>
              <Textarea
                id="domain-scoring"
                value={JSON.stringify(editedDomain.scoringConfig, null, 2)}
                onChange={(e) => {
                  try {
                    const scoringConfig = JSON.parse(e.target.value);
                    setEditedDomain({ ...editedDomain, scoringConfig });
                  } catch (error) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssessmentTemplateManager: React.FC = () => {
  const [assessmentTemplates, setAssessmentTemplates] = useState<
    AssessmentTemplate[]
  >([]);
  const [domainTemplates, setDomainTemplates] = useState<DomainTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialAssessmentId, setTrialAssessmentId] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<AssessmentTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isDomainEditDialogOpen, setIsDomainEditDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainTemplate | null>(
    null
  );

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Bulk operations state
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    instructions: "",
    isActive: true,
    selectedDomains: [] as { id: string; order: number }[],
  });

  useEffect(() => {
    fetchAssessmentTemplates();
    fetchDomainTemplates();
    fetchPlatformSettings();
  }, []);

  const fetchAssessmentTemplates = async () => {
    try {
      const response = await fetch("/api/admin/assessment-templates");
      if (response.ok) {
        const data = await response.json();
        setAssessmentTemplates(data);
      } else {
        toast.error("Failed to fetch assessment templates");
      }
    } catch (error) {
      toast.error("Error fetching assessment templates");
    }
  };

  const fetchDomainTemplates = async () => {
    try {
      const response = await fetch("/api/admin/domain-templates");
      if (response.ok) {
        const data = await response.json();
        setDomainTemplates(data);
      } else {
        toast.error("Failed to fetch domain templates");
      }
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching platform settings:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (
      !formData.name ||
      !formData.slug ||
      formData.selectedDomains.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and select at least one domain"
      );
      return;
    }

    try {
      const response = await fetch("/api/admin/assessment-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          domainIds: formData.selectedDomains
            .sort((a, b) => a.order - b.order)
            .map((d) => d.id),
        }),
      });

      if (response.ok) {
        toast.success("Assessment template created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create assessment template");
      }
    } catch (error) {
      toast.error("Error creating assessment template");
    }
  };

  const handleUpdateTemplate = async () => {
    if (
      !selectedTemplate ||
      !formData.name ||
      !formData.slug ||
      formData.selectedDomains.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and select at least one domain"
      );
      return;
    }

    try {
      const response = await fetch("/api/admin/assessment-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate.id,
          ...formData,
          domains: formData.selectedDomains
            .sort((a, b) => a.order - b.order)
            .map((d) => ({
              domainTemplateId: d.id,
              order: d.order,
            })),
        }),
      });

      if (response.ok) {
        toast.success("Assessment template updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update assessment template");
      }
    } catch (error) {
      toast.error("Error updating assessment template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this assessment template?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/assessment-templates/${templateId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Assessment template deleted successfully");
        fetchAssessmentTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete assessment template");
      }
    } catch (error) {
      toast.error("Error deleting assessment template");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      instructions: "",
      isActive: true,
      selectedDomains: [],
    });
    setSelectedTemplate(null);
  };

  const openEditDialog = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      instructions: template.instructions || "",
      isActive: template.isActive,
      selectedDomains: template.domains.map((d, index) => ({
        id: d.domainTemplate.id,
        order: d.order || index + 1,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (template: AssessmentTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
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
        toast.success("Assessment template exported successfully");
      } else {
        toast.error("Failed to export assessment template");
      }
    } catch (error) {
      toast.error("Error exporting assessment template");
    }
  };

  const handleDomainToggle = (domainId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedDomains: checked
        ? [
            ...prev.selectedDomains,
            { id: domainId, order: prev.selectedDomains.length + 1 },
          ]
        : prev.selectedDomains.filter((domain) => domain.id !== domainId),
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/assessment-templates/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Assessment template uploaded successfully");
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        fetchAssessmentTemplates();
      } else {
        setUploadError(result.error || "Failed to upload assessment template");
      }
    } catch (error) {
      setUploadError("Error uploading assessment template");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUploadSuccess = () => {
    fetchAssessmentTemplates();
    fetchDomainTemplates();
    toast.success("Bulk upload completed successfully");
  };

  const handleBulkSelect = (templateId: string, selected: boolean) => {
    const newSelected = new Set(selectedTemplates);
    if (selected) {
      newSelected.add(templateId);
    } else {
      newSelected.delete(templateId);
    }
    setSelectedTemplates(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTemplates(new Set(assessmentTemplates.map((t) => t.id)));
      setShowBulkActions(true);
    } else {
      setSelectedTemplates(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTemplates.size} assessment templates?`
      )
    ) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedTemplates).map((templateId) =>
        fetch(`/api/admin/assessment-templates/${templateId}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failures === 0) {
        toast.success(
          `Successfully deleted ${selectedTemplates.size} assessment templates`
        );
      } else {
        toast.warning(
          `Deleted ${results.length - failures} templates, ${failures} failed`
        );
      }

      setSelectedTemplates(new Set());
      setShowBulkActions(false);
      fetchAssessmentTemplates();
    } catch (error) {
      toast.error("Error performing bulk delete");
    }
  };

  const handleBulkToggleActive = async (active: boolean) => {
    if (selectedTemplates.size === 0) return;

    try {
      const updatePromises = Array.from(selectedTemplates).map((templateId) => {
        const template = assessmentTemplates.find((t) => t.id === templateId);
        if (!template) return Promise.resolve();

        return fetch("/api/admin/assessment-templates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: templateId,
            name: template.name,
            slug: template.slug,
            description: template.description,
            instructions: template.instructions,
            isActive: active,
            domainIds: template.domains.map((d) => d.domainTemplate.id),
            changeDescription: `Bulk ${active ? "activated" : "deactivated"}`,
          }),
        });
      });

      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failures === 0) {
        toast.success(
          `Successfully ${active ? "activated" : "deactivated"} ${selectedTemplates.size} templates`
        );
      } else {
        toast.warning(
          `Updated ${results.length - failures} templates, ${failures} failed`
        );
      }

      setSelectedTemplates(new Set());
      setShowBulkActions(false);
      fetchAssessmentTemplates();
    } catch (error) {
      toast.error("Error performing bulk update");
    }
  };

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
        toast.success("Domain updated successfully");
        setIsDomainEditDialogOpen(false);
        setEditingDomain(null);
        fetchDomainTemplates();
        fetchAssessmentTemplates(); // Refresh to show updated domain names
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update domain");
      }
    } catch (error) {
      toast.error("Error updating domain");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">
            Assessment Templates
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage assessment templates and their associated domains. The trial
            assessment appears here as a regular template.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload JSON</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Upload Assessment Template
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a JSON file containing assessment template data. The
                  file should include name, slug, domains array (domain slugs),
                  and optionally description, instructions, and isActive.
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
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

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden xs:inline">Create </span>Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Create Assessment Template
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Assessment name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="assessment-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Assessment description"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Instructions for taking the assessment"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: !!checked }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <Separator />

                <div>
                  <Label>Select Domains *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Choose domains for this assessment. Selected domains will be
                    ordered automatically.
                  </p>

                  {/* Available Domains */}
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                    {domainTemplates.map((domain) => {
                      const isSelected = formData.selectedDomains.some(
                        (d) => d.id === domain.id
                      );
                      const selectedDomain = formData.selectedDomains.find(
                        (d) => d.id === domain.id
                      );
                      return (
                        <div
                          key={domain.id}
                          className={`flex items-center justify-between p-2 rounded transition-colors ${
                            isSelected
                              ? "bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50"
                              : "hover:bg-accent dark:hover:bg-accent/50"
                          }`}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <Checkbox
                              id={`domain-${domain.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleDomainToggle(domain.id, !!checked)
                              }
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`domain-${domain.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {domain.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {Array.isArray(domain.questions)
                                  ? domain.questions.length
                                  : 0}{" "}
                                questions
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="text-xs bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground px-2 py-1 rounded font-medium">
                              Order: {selectedDomain?.order}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Domains Summary */}
                  {formData.selectedDomains.length > 0 && (
                    <div className="mt-2 p-2 bg-accent/50 dark:bg-accent/30 rounded border border-border">
                      <p className="text-xs font-medium mb-1">
                        Selected Domains ({formData.selectedDomains.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedDomains
                          .sort((a, b) => a.order - b.order)
                          .map((selectedDomain) => {
                            const domain = domainTemplates.find(
                              (d) => d.id === selectedDomain.id
                            );
                            return (
                              <span
                                key={selectedDomain.id}
                                className="text-xs bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground px-2 py-1 rounded font-medium"
                              >
                                {selectedDomain.order}. {domain?.name}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-muted p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedTemplates.size} template
                {selectedTemplates.size !== 1 ? "s" : ""} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggleActive(true)}
              >
                Activate Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggleActive(false)}
              >
                Deactivate Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          id="select-all"
          checked={
            selectedTemplates.size === assessmentTemplates.length &&
            assessmentTemplates.length > 0
          }
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
        <Label htmlFor="select-all" className="text-sm">
          Select all templates
        </Label>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {assessmentTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <Checkbox
                    checked={selectedTemplates.has(template.id)}
                    onCheckedChange={(checked) =>
                      handleBulkSelect(template.id, !!checked)
                    }
                    className="mt-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                      <span className="truncate">{template.name}</span>
                      {template.id === trialAssessmentId && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground border-primary/30 dark:border-primary/50 text-[10px] sm:text-xs shrink-0"
                        >
                          Trial
                        </Badge>
                      )}
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                        className="text-[10px] sm:text-xs shrink-0"
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                      Slug: {template.slug}
                    </p>
                    {template.description && (
                      <p className="text-xs sm:text-sm mt-2 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPreviewDialog(template)}
                    className="h-8 w-8 p-0"
                    title="Preview"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExportTemplate(template.id, template.slug)
                    }
                    className="h-8 w-8 p-0"
                    title="Export"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                    className="h-8 w-8 p-0"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="h-8 w-8 p-0"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="truncate">By {template.createdBy.name}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="shrink-0">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="shrink-0">
                    {template._count.assessments} assessments
                  </span>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                    Domains ({template.domains.length}):
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {template.domains.map(({ domainTemplate }) => (
                      <div
                        key={domainTemplate.id}
                        className="flex items-center gap-1"
                      >
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {domainTemplate.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDomain(domainTemplate);
                            }}
                            className="ml-1 p-0.5 hover:bg-accent dark:hover:bg-accent/50 rounded transition-colors"
                            title={`Edit ${domainTemplate.name} domain`}
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assessment Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Assessment name"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="assessment-slug"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Assessment description"
              />
            </div>

            <div>
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                placeholder="Instructions for taking the assessment"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: !!checked }))
                }
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>

            <Separator />

            <div>
              <Label>Select Domains *</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                {domainTemplates.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent dark:hover:bg-accent/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-domain-${domain.id}`}
                        checked={formData.selectedDomains.some(
                          (d) => d.id === domain.id
                        )}
                        onCheckedChange={(checked) =>
                          handleDomainToggle(domain.id, !!checked)
                        }
                      />
                      <div>
                        <Label
                          htmlFor={`edit-domain-${domain.id}`}
                          className="text-sm font-medium"
                        >
                          {domain.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {Array.isArray(domain.questions)
                            ? domain.questions.length
                            : 0}{" "}
                          questions
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleEditDomain(domain);
                      }}
                      className="h-8 w-8 p-0"
                      title={`Edit ${domain.name} questions`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate}>Update Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <AssessmentPreview
          template={selectedTemplate}
          isOpen={isPreviewDialogOpen}
          onClose={() => setIsPreviewDialogOpen(false)}
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
