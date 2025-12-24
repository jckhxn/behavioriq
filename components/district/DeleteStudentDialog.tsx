"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DeleteStudentDialogProps {
  student: {
    id: string;
    anonymousId: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export default function DeleteStudentDialog({
  student,
  onSuccess,
  trigger,
}: DeleteStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/teacher/student/${student.id}/delete`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete student");
      }

      toast.success(
        `Student ${student.anonymousId} has been permanently deleted.`
      );

      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    student.firstName || student.lastName
      ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
      : student.anonymousId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{displayName}</strong> (
            {student.anonymousId})?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action cannot be undone. Students
              with existing assessments cannot be deleted and must be archived
              instead.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
