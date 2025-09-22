"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { AssessmentDomain } from "@prisma/client";

interface Question {
  text: string;
  order: number;
  isGatingQuestion?: boolean;
  weight?: number;
}

interface TerminationRule {
  name: string;
  description?: string;
  minimumYesToContinue: number;
  checkAfterQuestion: number;
}

interface AssessmentConfig {
  domain: AssessmentDomain;
  name: string;
  displayName?: string;
  description?: string;
  order: number;
  totalPossibleScore?: number;
  clinicallySignificantScore?: number;
  questions: Question[];
  terminationRules?: TerminationRule[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface AssessmentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export function AssessmentUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: AssessmentUploadDialogProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "manual">("file");
  const [jsonContent, setJsonContent] = useState("");
  const [parsedConfig, setParsedConfig] = useState<AssessmentConfig | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);

  // Manual form fields
  const [domain, setDomain] = useState<AssessmentDomain | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);

  const domains = [
    { value: "ANTISOCIAL", label: "Antisocial Behavior" },
    { value: "VIOLENCE", label: "Violence Risk" },
    { value: "ATTENTION", label: "Attention/Hyperactivity" },
    { value: "EMOTIONAL", label: "Emotional Regulation" },
    { value: "CONDUCT", label: "Conduct Disorder" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonContent(content);
      parseJsonContent(content);
    };
    reader.readAsText(file);
  };

  const parseJsonContent = (content: string) => {
    try {
      const config = JSON.parse(content) as AssessmentConfig;
      setParsedConfig(config);
      validateConfig(config);
    } catch (error) {
      setValidationErrors([{ field: "json", message: "Invalid JSON format" }]);
      setParsedConfig(null);
    }
  };

  const validateConfig = (config: AssessmentConfig) => {
    const errors: ValidationError[] = [];

    // Required fields
    if (!config.domain)
      errors.push({ field: "domain", message: "Domain is required" });
    if (!config.name)
      errors.push({ field: "name", message: "Name is required" });
    if (!config.questions || config.questions.length === 0) {
      errors.push({
        field: "questions",
        message: "At least one question is required",
      });
    }

    // Validate domain enum
    if (
      config.domain &&
      !Object.values(AssessmentDomain).includes(config.domain)
    ) {
      errors.push({
        field: "domain",
        message: `Invalid domain. Must be one of: ${Object.values(AssessmentDomain).join(", ")}`,
      });
    }

    // Validate questions
    if (config.questions) {
      config.questions.forEach((question, index) => {
        if (!question.text) {
          errors.push({
            field: `questions[${index}].text`,
            message: `Question ${index + 1} text is required`,
          });
        }
        if (question.order === undefined || question.order < 1) {
          errors.push({
            field: `questions[${index}].order`,
            message: `Question ${index + 1} order must be >= 1`,
          });
        }
      });

      // Check for duplicate orders
      const orders = config.questions.map((q) => q.order);
      const duplicates = orders.filter(
        (order, index) => orders.indexOf(order) !== index
      );
      if (duplicates.length > 0) {
        errors.push({
          field: "questions",
          message: `Duplicate question orders found: ${duplicates.join(", ")}`,
        });
      }
    }

    // Validate termination rules
    if (config.terminationRules) {
      config.terminationRules.forEach((rule, index) => {
        if (!rule.name) {
          errors.push({
            field: `terminationRules[${index}].name`,
            message: `Termination rule ${index + 1} name is required`,
          });
        }
        if (rule.minimumYesToContinue < 0) {
          errors.push({
            field: `terminationRules[${index}].minimumYesToContinue`,
            message: `Minimum yes to continue must be >= 0`,
          });
        }
        if (rule.checkAfterQuestion < 1) {
          errors.push({
            field: `terminationRules[${index}].checkAfterQuestion`,
            message: `Check after question must be >= 1`,
          });
        }
      });
    }

    setValidationErrors(errors);
  };

  const handleUpload = async () => {
    if (
      uploadMethod === "file" &&
      (!parsedConfig || validationErrors.length > 0)
    ) {
      return;
    }

    setIsUploading(true);

    try {
      const config =
        uploadMethod === "file"
          ? parsedConfig
          : {
              domain,
              name,
              description,
              order,
              questions: [], // We'll add questions in a follow-up interface
            };

      const response = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        onUploadSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        const error = await response.json();
        setValidationErrors([
          { field: "upload", message: error.message || "Upload failed" },
        ]);
      }
    } catch (error) {
      setValidationErrors([
        { field: "upload", message: "Network error during upload" },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setJsonContent("");
    setParsedConfig(null);
    setValidationErrors([]);
    setDomain("");
    setName("");
    setDescription("");
    setOrder(1);
  };

  const isValid =
    uploadMethod === "file"
      ? parsedConfig && validationErrors.length === 0
      : domain && name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Assessment Configuration</DialogTitle>
          <DialogDescription>
            Add a new assessment by uploading a JSON configuration or creating
            one manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Method Selection */}
          <div className="flex gap-4">
            <Button
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => setUploadMethod("file")}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              JSON Upload
            </Button>
            <Button
              variant={uploadMethod === "manual" ? "default" : "outline"}
              onClick={() => setUploadMethod("manual")}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Manual Entry
            </Button>
          </div>

          {uploadMethod === "file" ? (
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <Label htmlFor="json-file">Assessment JSON File</Label>
                <Input
                  id="json-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>

              {/* JSON Content Preview */}
              {jsonContent && (
                <div>
                  <Label>JSON Content Preview</Label>
                  <Textarea
                    value={jsonContent}
                    onChange={(e) => {
                      setJsonContent(e.target.value);
                      parseJsonContent(e.target.value);
                    }}
                    className="mt-1 font-mono text-sm h-32"
                    placeholder="Paste JSON configuration here..."
                  />
                </div>
              )}

              {/* Parsed Configuration Preview */}
              {parsedConfig && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Configuration Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Domain</Label>
                        <Badge variant="secondary">{parsedConfig.domain}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{parsedConfig.name}</p>
                      </div>
                    </div>

                    {parsedConfig.description && (
                      <div>
                        <Label className="text-sm font-medium">
                          Description
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {parsedConfig.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs">Questions</Label>
                        <p className="font-medium">
                          {parsedConfig.questions?.length || 0}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Order</Label>
                        <p className="font-medium">{parsedConfig.order}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Termination Rules</Label>
                        <p className="font-medium">
                          {parsedConfig.terminationRules?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Manual Entry Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain">Assessment Domain *</Label>
                  <Select
                    value={domain}
                    onValueChange={(value: AssessmentDomain) =>
                      setDomain(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Assessment Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Antisocial Behavior Screening"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the assessment..."
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After creating the assessment, you'll
                  be able to add questions and termination rules through the
                  management interface.
                </p>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      <strong>{error.field}:</strong> {error.message}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!isValid || isUploading}
            className="gradient-primary"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Assessment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
