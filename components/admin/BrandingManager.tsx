"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Globe,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { OrganizationBranding } from "@/lib/branding/branding-service";

interface BrandingManagerProps {
  organizationId: string;
}

interface BrandingData {
  customDomain?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  headerTitle?: string;
  footerText?: string;
}

export function BrandingManager({ organizationId }: BrandingManagerProps) {
  const [branding, setBranding] = useState<BrandingData>({});
  const [originalBranding, setOriginalBranding] = useState<BrandingData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, [organizationId]);

  useEffect(() => {
    setHasChanges(
      JSON.stringify(branding) !== JSON.stringify(originalBranding)
    );
  }, [branding, originalBranding]);

  const fetchBranding = async () => {
    try {
      const response = await fetch(
        `/api/admin/branding?organizationId=${organizationId}`
      );
      if (response.ok) {
        const data = await response.json();
        const brandingData = data.branding || {};
        setBranding({
          customDomain: brandingData.customDomain || "",
          logo: brandingData.logo || "",
          primaryColor: brandingData.primaryColor || "#2563eb",
          secondaryColor: brandingData.secondaryColor || "#64748b",
          headerTitle: brandingData.headerTitle || "",
          footerText: brandingData.footerText || "",
        });
        setOriginalBranding({
          customDomain: brandingData.customDomain || "",
          logo: brandingData.logo || "",
          primaryColor: brandingData.primaryColor || "#2563eb",
          secondaryColor: brandingData.secondaryColor || "#64748b",
          headerTitle: brandingData.headerTitle || "",
          footerText: brandingData.footerText || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          branding: {
            customDomain: branding.customDomain || null,
            logo: branding.logo || null,
            primaryColor: branding.primaryColor || null,
            secondaryColor: branding.secondaryColor || null,
            headerTitle: branding.headerTitle || null,
            footerText: branding.footerText || null,
          },
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Branding settings saved successfully!",
        });
        setOriginalBranding({ ...branding });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to save branding settings",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Failed to save branding settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BrandingData, value: string) => {
    setBranding((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const previewStyle = {
    "--brand-primary": branding.primaryColor,
    "--brand-secondary": branding.secondaryColor,
  } as React.CSSProperties;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Organization Branding
          </CardTitle>
          <CardDescription>
            Customize the appearance and branding for this organization's
            assessments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="customDomain" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Custom Domain
            </Label>
            <Input
              id="customDomain"
              value={branding.customDomain || ""}
              onChange={(e) =>
                handleInputChange("customDomain", e.target.value)
              }
              placeholder="assessments.yourcompany.com"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              The custom domain where this organization's assessments will be
              accessible.
            </p>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Logo URL
            </Label>
            <Input
              id="logo"
              value={branding.logo || ""}
              onChange={(e) => handleInputChange("logo", e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
            />
            <p className="text-sm text-muted-foreground">
              URL to the organization's logo. Should be a publicly accessible
              image URL.
            </p>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={branding.primaryColor || "#2563eb"}
                  onChange={(e) =>
                    handleInputChange("primaryColor", e.target.value)
                  }
                  className="w-20 h-10 p-1 border rounded"
                />
                <Input
                  value={branding.primaryColor || "#2563eb"}
                  onChange={(e) =>
                    handleInputChange("primaryColor", e.target.value)
                  }
                  placeholder="#2563eb"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={branding.secondaryColor || "#64748b"}
                  onChange={(e) =>
                    handleInputChange("secondaryColor", e.target.value)
                  }
                  className="w-20 h-10 p-1 border rounded"
                />
                <Input
                  value={branding.secondaryColor || "#64748b"}
                  onChange={(e) =>
                    handleInputChange("secondaryColor", e.target.value)
                  }
                  placeholder="#64748b"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <Label htmlFor="headerTitle">Header Title</Label>
            <Input
              id="headerTitle"
              value={branding.headerTitle || ""}
              onChange={(e) => handleInputChange("headerTitle", e.target.value)}
              placeholder="Organization Assessment System"
            />
            <p className="text-sm text-muted-foreground">
              Custom title shown in the application header. Leave empty to use
              organization name.
            </p>
          </div>

          {/* Footer Text */}
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={branding.footerText || ""}
              onChange={(e) => handleInputChange("footerText", e.target.value)}
              placeholder="© 2024 Your Organization. All rights reserved."
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Color Preview</Label>
            <div className="p-4 border rounded-lg" style={previewStyle}>
              <div className="space-y-2">
                <div
                  className="inline-block px-3 py-1 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Primary Color
                </div>
                <div
                  className="inline-block px-3 py-1 rounded text-white text-sm font-medium ml-2"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  Secondary Color
                </div>
              </div>
              {branding.headerTitle && (
                <div
                  className="mt-3 text-lg font-semibold"
                  style={{ color: branding.primaryColor }}
                >
                  {branding.headerTitle}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
