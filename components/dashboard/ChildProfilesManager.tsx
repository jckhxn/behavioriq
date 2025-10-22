"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserPlanResponse } from "@/types/plan";

interface ChildAssessmentSummary {
  id: string;
  status: string;
  subjectName: string | null;
  completedAt: string | null;
  startedAt: string | null;
}

interface ChildProfile {
  id: string;
  name: string | null;
  gradeband: string | null;
  birthdate: string | null;
  createdat?: string | null;
  assessments: ChildAssessmentSummary[];
}

interface ChildProfilesManagerProps {
  plan: UserPlanResponse;
  onChildrenChange?: () => void;
}

const MAX_CHILDREN_FAMILY_PLAN = 5;

export function ChildProfilesManager({
  plan,
  onChildrenChange,
}: ChildProfilesManagerProps) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    birthdate: "",
    gradeband: "",
  });

  const canManageChildren = plan.plan === "family";

  const childSlotsRemaining = useMemo(() => {
    if (!canManageChildren) return 0;
    return Math.max(MAX_CHILDREN_FAMILY_PLAN - children.length, 0);
  }, [canManageChildren, children.length]);

  const fetchChildren = useCallback(async () => {
    if (!canManageChildren) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/children", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load child profiles");
      }

      const data = (await response.json()) as ChildProfile[];
      setChildren(data);
    } catch (err) {
      console.error("Failed to load child profiles", err);
      setError("We couldn't load your child profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [canManageChildren]);

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  const handleDialogToggle = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormValues({ name: "", birthdate: "", gradeband: "" });
    }
  };

  const handleInputChange = (
    field: "name" | "birthdate" | "gradeband",
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateChild = async () => {
    if (!formValues.name.trim()) {
      toast.error("Please provide a name for the child profile.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/children", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formValues.name.trim(),
          birthdate: formValues.birthdate || null,
          gradeband: formValues.gradeband?.trim() || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to create child profile.";
        throw new Error(message);
      }

      const created = (await response.json()) as ChildProfile;
      setChildren((prev) => [...prev, created]);
      toast.success("Child profile added.");
      handleDialogToggle(false);
      onChildrenChange?.();
    } catch (err) {
      console.error("Failed to create child profile", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "We couldn't save that child profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManageChildren) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Child Profiles</CardTitle>
          <CardDescription>
            Manage the kids linked to your Family plan and keep their assessment
            history organized.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
          <DialogTrigger asChild>
            <Button disabled={childSlotsRemaining === 0}>Add Child</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Child Profile</DialogTitle>
              <DialogDescription>
                Create a profile so you can track assessments and progress for
                each child individually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="child-name">Child name</Label>
                <Input
                  id="child-name"
                  placeholder="e.g., Ava Johnson"
                  value={formValues.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child-birthdate">Birthdate</Label>
                <Input
                  id="child-birthdate"
                  type="date"
                  value={formValues.birthdate}
                  onChange={(event) =>
                    handleInputChange("birthdate", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child-gradeband">Grade / Age range</Label>
                <Input
                  id="child-gradeband"
                  placeholder="e.g., 4th Grade"
                  value={formValues.gradeband}
                  onChange={(event) =>
                    handleInputChange("gradeband", event.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogToggle(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateChild} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            {error}
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Add up to {MAX_CHILDREN_FAMILY_PLAN} children to your Family plan so
            each kid has their own dashboard and assessment history.
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => {
              const completedAssessments = child.assessments.filter(
                (assessment) => assessment.status === "COMPLETED"
              );
              const lastCompleted = completedAssessments
                .map((assessment) => assessment.completedAt)
                .filter(Boolean)
                .sort(
                  (a, b) => new Date(b!).getTime() - new Date(a!).getTime()
                )[0];

              const isActive = child.id === activeChildId;

              return (
                <div
                  key={child.id}
                  className={`rounded-lg border p-4 shadow-sm transition hover:border-primary/50 ${isActive ? "border-primary" : ""}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {child.name || "Unnamed child"}
                        </h3>
                        {child.gradeband && (
                          <Badge variant="secondary">{child.gradeband}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {child.birthdate
                          ? `Born ${format(new Date(child.birthdate), "MMMM d, yyyy")}`
                          : "Birthdate not provided"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {completedAssessments.length} completed assessment
                        {completedAssessments.length === 1 ? "" : "s"}
                      </div>
                      <div className="text-muted-foreground">
                        {lastCompleted
                          ? `Last completed ${format(new Date(lastCompleted), "MMM d, yyyy")}`
                          : "No completed assessments yet"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setActiveChildId(child.id)}
                    >
                      {isActive ? "Active" : "Switch to Child"}
                    </Button>
                    {isActive && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={async () => {
                          try {
                            // Fetch available assessment templates
                            const templateRes = await fetch(
                              "/api/assessments/available"
                            );
                            let assessmentTemplateId: string | undefined =
                              undefined;
                            if (templateRes.ok) {
                              const templates = await templateRes.json();
                              if (templates && templates.length > 0) {
                                assessmentTemplateId = templates[0].id;
                              }
                            }
                            const res = await fetch("/api/assessments", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                subjectName: child.name || "Child Assessment",
                                childProfileId: child.id,
                                ...(assessmentTemplateId
                                  ? { assessmentTemplateId }
                                  : {}),
                              }),
                            });
                            if (!res.ok) {
                              const error = await res.json();
                              toast.error(
                                error.message || "Failed to start assessment"
                              );
                              return;
                            }
                            const data = await res.json();
                            toast.success(
                              `Assessment started for ${child.name}`
                            );
                            window.location.href = `/assessment/${data.shortId}`;
                          } catch (err) {
                            toast.error("Error starting assessment");
                          }
                        }}
                      >
                        Start Assessment
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {childSlotsRemaining > 0
            ? `${childSlotsRemaining} open slot${childSlotsRemaining === 1 ? "" : "s"} remaining on your Family plan.`
            : "You've reached the maximum of five child profiles included with the Family plan."}
        </div>
      </CardContent>
    </Card>
  );
}
