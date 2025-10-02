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
import { Plus, Edit, Trash2, Upload, Eye, Download } from "lucide-react";
import { toast } from "sonner";

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

const DomainTemplateManager: React.FC = () => {
  const [domainTemplates, setDomainTemplates] = useState<DomainTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DomainTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Bulk operations state
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    questionsJson: "",
    resourcesJson: "",
    scoringConfigJson: "",
  });

  useEffect(() => {
    fetchDomainTemplates();
  }, []);

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

  const validateJson = (jsonString: string): boolean => {
    if (!jsonString.trim()) return true; // Optional fields can be empty
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.name || !formData.slug || !formData.questionsJson) {
      toast.error("Please fill in name, slug, and questions");
      return;
    }

    // Validate JSON fields
    if (!validateJson(formData.questionsJson)) {
      toast.error("Invalid JSON in questions field");
      return;
    }
    if (formData.resourcesJson && !validateJson(formData.resourcesJson)) {
      toast.error("Invalid JSON in resources field");
      return;
    }
    if (
      formData.scoringConfigJson &&
      !validateJson(formData.scoringConfigJson)
    ) {
      toast.error("Invalid JSON in scoring config field");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        questions: JSON.parse(formData.questionsJson),
        resources: formData.resourcesJson
          ? JSON.parse(formData.resourcesJson)
          : undefined,
        scoringConfig: formData.scoringConfigJson
          ? JSON.parse(formData.scoringConfigJson)
          : undefined,
      };

      const response = await fetch("/api/admin/domain-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Domain template created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchDomainTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create domain template");
      }
    } catch (error) {
      toast.error("Error creating domain template");
    }
  };

  const handleUpdateTemplate = async () => {
    if (
      !selectedTemplate ||
      !formData.name ||
      !formData.slug ||
      !formData.questionsJson
    ) {
      toast.error("Please fill in name, slug, and questions");
      return;
    }

    // Validate JSON fields
    if (!validateJson(formData.questionsJson)) {
      toast.error("Invalid JSON in questions field");
      return;
    }
    if (formData.resourcesJson && !validateJson(formData.resourcesJson)) {
      toast.error("Invalid JSON in resources field");
      return;
    }
    if (
      formData.scoringConfigJson &&
      !validateJson(formData.scoringConfigJson)
    ) {
      toast.error("Invalid JSON in scoring config field");
      return;
    }

    try {
      const payload = {
        id: selectedTemplate.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        questions: JSON.parse(formData.questionsJson),
        resources: formData.resourcesJson
          ? JSON.parse(formData.resourcesJson)
          : undefined,
        scoringConfig: formData.scoringConfigJson
          ? JSON.parse(formData.scoringConfigJson)
          : undefined,
      };

      const response = await fetch("/api/admin/domain-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Domain template updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchDomainTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update domain template");
      }
    } catch (error) {
      toast.error("Error updating domain template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this domain template?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/domain-templates/${templateId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Domain template deleted successfully");
        fetchDomainTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete domain template");
      }
    } catch (error) {
      toast.error("Error deleting domain template");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      questionsJson: "",
      resourcesJson: "",
      scoringConfigJson: "",
    });
    setSelectedTemplate(null);
  };

  const openEditDialog = (template: DomainTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      questionsJson: JSON.stringify(template.questions, null, 2),
      resourcesJson: template.resources
        ? JSON.stringify(template.resources, null, 2)
        : "",
      scoringConfigJson: template.scoringConfig
        ? JSON.stringify(template.scoringConfig, null, 2)
        : "",
    });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (template: DomainTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleExportTemplate = async (
    templateId: string,
    templateSlug: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/domain-templates/${templateId}/export`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${templateSlug}-domain-template.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Domain template exported successfully");
      } else {
        toast.error("Failed to export domain template");
      }
    } catch (error) {
      toast.error("Error exporting domain template");
    }
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

      const response = await fetch("/api/admin/domain-templates/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Domain template uploaded successfully");
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        fetchDomainTemplates();
      } else {
        setUploadError(result.error || "Failed to upload domain template");
      }
    } catch (error) {
      setUploadError("Error uploading domain template");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkSelect = (domainId: string, selected: boolean) => {
    const newSelected = new Set(selectedDomains);
    if (selected) {
      newSelected.add(domainId);
    } else {
      newSelected.delete(domainId);
    }
    setSelectedDomains(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDomains(new Set(domainTemplates.map((t) => t.id)));
      setShowBulkActions(true);
    } else {
      setSelectedDomains(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDomains.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedDomains.size} domain templates?`
      )
    ) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedDomains).map((domainId) =>
        fetch(`/api/admin/domain-templates/${domainId}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failures === 0) {
        toast.success(
          `Successfully deleted ${selectedDomains.size} domain templates`
        );
      } else {
        toast.warning(
          `Deleted ${results.length - failures} domains, ${failures} failed`
        );
      }

      setSelectedDomains(new Set());
      setShowBulkActions(false);
      fetchDomainTemplates();
    } catch (error) {
      toast.error("Error performing bulk delete");
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Domain Templates</h2>
          <p className="text-muted-foreground">
            Manage domain templates that can be used in assessments
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Domain Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a JSON file containing domain template data. The file
                  should include name, slug, questions array, and optionally
                  description, resources, and scoringConfig.
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

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Domain Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Domain name"
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
                      placeholder="domain-slug"
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
                    placeholder="Domain description"
                  />
                </div>

                <div>
                  <Label htmlFor="questions">Questions JSON *</Label>
                  <Textarea
                    id="questions"
                    value={formData.questionsJson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        questionsJson: e.target.value,
                      }))
                    }
                    placeholder='[{"id": "q1", "text": "Question text", "type": "likert", "options": [...]}]'
                    className="h-32 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="resources">Resources JSON (Optional)</Label>
                  <Textarea
                    id="resources"
                    value={formData.resourcesJson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        resourcesJson: e.target.value,
                      }))
                    }
                    placeholder='{"helpText": "...", "links": [...]}'
                    className="h-24 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="scoring">
                    Scoring Config JSON (Optional)
                  </Label>
                  <Textarea
                    id="scoring"
                    value={formData.scoringConfigJson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scoringConfigJson: e.target.value,
                      }))
                    }
                    placeholder='{"weights": {...}, "thresholds": {...}}'
                    className="h-24 font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>Create Domain</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {domainTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Slug: {template.slug}
                  </p>
                  {template.description && (
                    <p className="text-sm mt-2">{template.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPreviewDialog(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleExportTemplate(template.id, template.slug)
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Created by {template.createdBy.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    Used in {template._count.assessmentTemplates} assessment
                    templates
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {Array.isArray(template.questions)
                      ? template.questions.length
                      : 0}{" "}
                    questions
                  </Badge>
                  {template.resources && (
                    <Badge variant="outline">Has resources</Badge>
                  )}
                  {template.scoringConfig && (
                    <Badge variant="outline">Custom scoring</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Domain Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Domain name"
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
                  placeholder="domain-slug"
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
                placeholder="Domain description"
              />
            </div>

            <div>
              <Label htmlFor="edit-questions">Questions JSON *</Label>
              <Textarea
                id="edit-questions"
                value={formData.questionsJson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    questionsJson: e.target.value,
                  }))
                }
                placeholder='[{"id": "q1", "text": "Question text", "type": "likert", "options": [...]}]'
                className="h-32 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="edit-resources">Resources JSON (Optional)</Label>
              <Textarea
                id="edit-resources"
                value={formData.resourcesJson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    resourcesJson: e.target.value,
                  }))
                }
                placeholder='{"helpText": "...", "links": [...]}'
                className="h-24 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="edit-scoring">
                Scoring Config JSON (Optional)
              </Label>
              <Textarea
                id="edit-scoring"
                value={formData.scoringConfigJson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scoringConfigJson: e.target.value,
                  }))
                }
                placeholder='{"weights": {...}, "thresholds": {...}}'
                className="h-24 font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate}>Update Domain</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Domain Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h3 className="font-semibold">Questions Preview</h3>
                <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(selectedTemplate.questions, null, 2)}
                </pre>
              </div>

              {selectedTemplate.resources && (
                <div>
                  <h3 className="font-semibold">Resources</h3>
                  <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
                    {JSON.stringify(selectedTemplate.resources, null, 2)}
                  </pre>
                </div>
              )}

              {selectedTemplate.scoringConfig && (
                <div>
                  <h3 className="font-semibold">Scoring Configuration</h3>
                  <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
                    {JSON.stringify(selectedTemplate.scoringConfig, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DomainTemplateManager;
