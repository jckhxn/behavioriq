"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface AddStudentFormProps {
  classroomId: string;
  districtId: string;
}

export function AddStudentForm({
  classroomId,
  districtId,
}: AddStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gradeLevel: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/teacher/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classroomId,
          districtId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gradeLevel: formData.gradeLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create student");
      }

      // Success - redirect back to teacher dashboard
      router.push("/teacher");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Students are identified by anonymous IDs to protect privacy (FERPA
            compliance)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Privacy Notice:</strong> Names are optional and for your
              reference only. The system will assign an anonymous ID (e.g.,
              STU-A3F9B2C1) that will be used in all assessments and reports
              (FERPA-compliant).
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gradeLevel">
              Grade Level <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gradeLevel"
              type="text"
              placeholder="e.g., K, 1, 2, 3..."
              value={formData.gradeLevel}
              onChange={(e) =>
                setFormData({ ...formData, gradeLevel: e.target.value })
              }
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the student's current grade level (K-12)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.gradeLevel}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Student
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
