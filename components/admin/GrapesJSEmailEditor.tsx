"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save, Eye, Code } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailTemplateEditorProps {
  templateId?: string;
}

export function GrapesJSEmailEditor({ templateId }: EmailTemplateEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("GENERIC");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [variables, setVariables] = useState<Record<string, any>>({});

  const [mode, setMode] = useState<"visual" | "html" | "code">("visual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const templateTypes = [
    "ASSESSMENT_REPORT",
    "LICENSE_NOTIFICATION",
    "LICENSE_RENEWED",
    "WELCOME",
    "PASSWORD_RESET",
    "MAGIC_LINK",
    "EMAIL_VERIFICATION",
    "EMAIL_CHANGE",
    "AFFILIATE_WELCOME",
    "AFFILIATE_COMMISSION",
    "AFFILIATE_PAYOUT",
    "AFFILIATE_FRAUD_ALERT",
    "SYSTEM_NOTIFICATION",
    "GENERIC",
  ];

  // Load GrapesJS on mount
  useEffect(() => {
    if (mode === "visual" && editorRef.current && !editor) {
      loadGrapesJS();
    }
  }, [mode, editor]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadGrapesJS = async () => {
    try {
      const grapesjs = await import("grapesjs");
      const grapesjsWebPreset = await import("grapesjs-preset-webpage");
      const grapesjsBlocksBasic = await import("grapesjs-blocks-basic");

      if (!editorRef.current) return;

      const editorInstance = grapesjs.default.init({
        container: editorRef.current,
        fromElement: true,
        height: "600px",
        width: "auto",
        plugins: [
          {
            id: "grapesjs-preset-webpage",
            plugin: grapesjsWebPreset.default,
          },
          {
            id: "grapesjs-blocks-basic",
            plugin: grapesjsBlocksBasic.default,
          },
        ],
        pluginsOpts: {
          "grapesjs-preset-webpage": {},
          "grapesjs-blocks-basic": {},
        },
      });

      setEditor(editorInstance);

      // Load template content if editing
      if (selectedTemplate) {
        editorInstance.setComponents(selectedTemplate.html);
      }
    } catch (err) {
      console.error("Failed to load GrapesJS:", err);
      setError("Failed to load visual editor. Try code mode instead.");
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateType(template.type);
    setSubject(template.subject);
    setPreheader(template.preheader || "");
    setVariables(template.variables || {});

    if (editor && mode === "visual") {
      editor.setComponents(template.html);
    }
    setSuccess(`Loaded template: ${template.name}`);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      let html = "";
      if (mode === "visual" && editor) {
        html = editor.getHtml();
      } else {
        html = selectedTemplate?.html || "";
      }

      const payload = {
        name: templateName,
        type: templateType,
        subject,
        preheader,
        html,
        variables,
      };

      const url = selectedTemplate
        ? `/api/admin/email-templates/${selectedTemplate.id}`
        : "/api/admin/email-templates";

      const method = selectedTemplate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setSelectedTemplate(saved);
        setSuccess(`Template "${templateName}" saved successfully!`);
        fetchTemplates();
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to save template");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCanvaImport = async () => {
    const html = prompt("Paste Canva HTML export here:");
    if (!html) return;

    try {
      // Basic sanitization (remove dangerous tags)
      const sanitized = html
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "");

      if (editor) {
        editor.setComponents(sanitized);
      }
      setSuccess("Canva HTML imported successfully");
    } catch (err) {
      setError("Failed to import HTML");
    }
  };

  const handleTestEmail = async () => {
    if (!selectedTemplate) {
      setError("Select a template first");
      return;
    }

    try {
      const testEmail = prompt("Enter test email address:");
      if (!testEmail) return;

      setLoading(true);
      const res = await fetch(
        `/api/admin/email-templates/${selectedTemplate.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testEmail,
            variables: {},
          }),
        }
      );

      if (res.ok) {
        setSuccess(`Test email sent to ${testEmail}`);
      } else {
        throw new Error("Failed to send test email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test email failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Template Editor</CardTitle>
        <CardDescription>
          Design and manage email templates with visual editor or code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Template Selection */}
        <div className="space-y-3">
          <Label>Select Template</Label>
          <Select value={selectedTemplate?.id || ""} onValueChange={(value) => {
            const template = templates.find(t => t.id === value);
            if (template) selectTemplate(template);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Welcome Email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-type">Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger id="template-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templateTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preheader">Preheader Text</Label>
          <Input
            id="preheader"
            value={preheader}
            onChange={(e) => setPreheader(e.target.value)}
            placeholder="Preview text shown in inbox list"
          />
        </div>

        {/* Editor Mode Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual">
              <Eye className="w-4 h-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="code">
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          {/* Visual Editor */}
          <TabsContent value="visual" className="space-y-3">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCanvaImport}
                disabled={loading}
              >
                Import Canva HTML
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestEmail}
                disabled={!selectedTemplate || loading}
              >
                Send Test Email
              </Button>
            </div>
            <div
              ref={editorRef}
              className="border rounded-lg bg-white"
              style={{ minHeight: "600px" }}
            />
          </TabsContent>

          {/* HTML Editor */}
          <TabsContent value="html">
            <div className="space-y-2">
              <Label>HTML Body</Label>
              <Textarea
                value={selectedTemplate?.html || ""}
                onChange={(e) => {
                  if (selectedTemplate) {
                    setSelectedTemplate({
                      ...selectedTemplate,
                      html: e.target.value,
                    });
                  }
                }}
                className="font-mono h-96"
                placeholder="Email HTML code"
              />
            </div>
          </TabsContent>

          {/* Code Editor (Monaco-like preview) */}
          <TabsContent value="code">
            <div className="space-y-2">
              <Label>Preview Code</Label>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {selectedTemplate?.html || "No template selected"}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateName("");
              setSubject("");
              setPreheader("");
            }}
            disabled={loading}
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !templateName}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
