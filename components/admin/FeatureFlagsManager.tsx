"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Flag, Loader2 } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  displayName: string;
  description: string | null;
  scope: string;
  isEnabled: boolean;
  enabledForRoles: string[];
  enabledForOrgs: string[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

const ROLES = [
  "USER",
  "ADMIN",
  "DISTRICT_ADMIN",
  "TEACHER",
  "COUNSELOR",
  "PRINCIPAL",
  "SUB_ACCOUNT",
  "SUPER_ADMIN",
];

export function FeatureFlagsManager() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    displayName: "",
    description: "",
    scope: "global",
    isEnabled: false,
    enabledForRoles: [] as string[],
  });

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    try {
      const response = await fetch("/api/admin/feature-flags");
      if (response.ok) {
        const data = await response.json();
        setFlags(data.flags);
      } else {
        toast.error("Failed to load feature flags");
      }
    } catch (error) {
      console.error("Error fetching flags:", error);
      toast.error("Failed to load feature flags");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingFlag(null);
    setFormData({
      key: "",
      displayName: "",
      description: "",
      scope: "global",
      isEnabled: false,
      enabledForRoles: [],
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(flag: FeatureFlag) {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      displayName: flag.displayName,
      description: flag.description || "",
      scope: flag.scope,
      isEnabled: flag.isEnabled,
      enabledForRoles: flag.enabledForRoles,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (editingFlag) {
        // Update existing flag
        const response = await fetch(
          `/api/admin/feature-flags/${editingFlag.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: formData.displayName,
              description: formData.description || null,
              scope: formData.scope,
              isEnabled: formData.isEnabled,
              enabledForRoles: formData.enabledForRoles,
            }),
          }
        );

        if (response.ok) {
          toast.success("Feature flag updated");
          fetchFlags();
          setIsDialogOpen(false);
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to update feature flag");
        }
      } else {
        // Create new flag
        const response = await fetch("/api/admin/feature-flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success("Feature flag created");
          fetchFlags();
          setIsDialogOpen(false);
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to create feature flag");
        }
      }
    } catch (error) {
      console.error("Error saving flag:", error);
      toast.error("Failed to save feature flag");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(flag: FeatureFlag) {
    try {
      const response = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !flag.isEnabled }),
      });

      if (response.ok) {
        toast.success(
          `${flag.displayName} ${!flag.isEnabled ? "enabled" : "disabled"}`
        );
        fetchFlags();
      } else {
        toast.error("Failed to toggle feature flag");
      }
    } catch (error) {
      console.error("Error toggling flag:", error);
      toast.error("Failed to toggle feature flag");
    }
  }

  async function handleDelete(flag: FeatureFlag) {
    if (
      !confirm(
        `Are you sure you want to delete "${flag.displayName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Feature flag deleted");
        fetchFlags();
      } else {
        toast.error("Failed to delete feature flag");
      }
    } catch (error) {
      console.error("Error deleting flag:", error);
      toast.error("Failed to delete feature flag");
    }
  }

  function toggleRole(role: string) {
    setFormData((prev) => ({
      ...prev,
      enabledForRoles: prev.enabledForRoles.includes(role)
        ? prev.enabledForRoles.filter((r) => r !== role)
        : [...prev.enabledForRoles, role],
    }));
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Manage feature flags to control functionality across the platform
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingFlag ? "Edit Feature Flag" : "Create Feature Flag"}
                </DialogTitle>
                <DialogDescription>
                  {editingFlag
                    ? "Update the feature flag settings"
                    : "Add a new feature flag to control platform functionality"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      }))
                    }
                    placeholder="e.g., ai_recommendations"
                    disabled={!!editingFlag}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (cannot be changed after creation)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    placeholder="e.g., AI Recommendations"
                  />
                </div>
                <div className="grid gap-2">
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
                    placeholder="What does this flag control?"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, scope: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (all users)</SelectItem>
                      <SelectItem value="role">Role-based</SelectItem>
                      <SelectItem value="organization">
                        Organization-based
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.scope === "role" && (
                  <div className="grid gap-2">
                    <Label>Enabled for Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((role) => (
                        <Badge
                          key={role}
                          variant={
                            formData.enabledForRoles.includes(role)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleRole(role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isEnabled: checked }))
                    }
                  />
                  <Label htmlFor="isEnabled">Enable this feature</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingFlag ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feature flags configured</p>
            <p className="text-sm mt-1">Click "Add Flag" to create one</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{flag.displayName}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {flag.key}
                      </div>
                      {flag.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {flag.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{flag.scope}</Badge>
                    {flag.scope === "role" &&
                      flag.enabledForRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {flag.enabledForRoles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() => handleToggle(flag)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(flag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(flag)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
