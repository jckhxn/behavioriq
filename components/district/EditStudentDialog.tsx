"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EditStudentDialogProps {
  student: {
    id: string;
    anonymousId: string;
    firstName?: string | null;
    lastName?: string | null;
    gradeLevel: string;
  };
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const GRADE_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

export default function EditStudentDialog({
  student,
  onSuccess,
  trigger,
}: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: student.firstName || "",
    lastName: student.lastName || "",
    gradeLevel: student.gradeLevel,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        gradeLevel: student.gradeLevel,
      });
      setError(null);
    }
  }, [open, student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/teacher/student/${student.id}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName.trim() || null,
            lastName: formData.lastName.trim() || null,
            gradeLevel: formData.gradeLevel,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update student");
      }

      toast.success(
        `Student ${student.anonymousId} has been updated successfully.`
      );

      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information. Anonymous ID: {student.anonymousId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name (Optional)</Label>
              <Input
                id="edit-firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Names are encrypted and only visible to you for convenience.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name (Optional)</Label>
              <Input
                id="edit-lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-gradeLevel">
                Grade Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gradeLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, gradeLevel: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.gradeLevel}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
