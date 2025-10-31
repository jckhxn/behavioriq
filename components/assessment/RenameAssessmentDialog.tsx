"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RenameAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  currentName: string;
  onSuccess: (newName: string) => void;
}

export function RenameAssessmentDialog({
  open,
  onOpenChange,
  assessmentId,
  currentName,
  onSuccess,
}: RenameAssessmentDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      toast.error("Assessment name cannot be empty");
      return;
    }

    if (trimmedName === currentName) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: trimmedName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to rename assessment");
      }

      const updated = await response.json();
      toast.success("Assessment renamed successfully");
      onSuccess(updated.subjectName);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setNewName(currentName);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Assessment</DialogTitle>
          <DialogDescription>
            Enter a new name for this assessment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assessment-name">Assessment Name</Label>
            <Input
              id="assessment-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter assessment name"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleRename();
                }
              }}
              maxLength={255}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {newName.length} / 255 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={isLoading || !newName.trim()}
          >
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
