"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Assessment {
  id: string;
  subjectName: string;
  mode: string;
}

interface Student {
  id: string;
  anonymousId: string;
  gradeLevel: string;
}

interface AssignAssessmentFormProps {
  student: Student;
  assessments: Assessment[];
}

export function AssignAssessmentForm({
  student,
  assessments,
}: AssignAssessmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssessment) {
      setError("Please select an assessment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/teacher/assessments/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.id,
          assessmentId: selectedAssessment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign assessment");
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
          <CardTitle>Select Assessment</CardTitle>
          <CardDescription>
            Choose a behavioral wellness assessment to assign to Student{" "}
            {student.anonymousId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {assessments.length === 0 ? (
            <Alert>
              <AlertDescription>
                No assessments are currently available. Please contact your
                administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <RadioGroup
              value={selectedAssessment}
              onValueChange={setSelectedAssessment}
              disabled={loading}
            >
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <RadioGroupItem
                      value={assessment.id}
                      id={assessment.id}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={assessment.id}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {assessment.subjectName}
                        </span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {assessment.mode}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Next Steps:</strong> After assignment, the student will be
              able to complete this assessment. Results will be available in
              your dashboard with non-diagnostic insights and support
              recommendations.
            </AlertDescription>
          </Alert>
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
          <Button
            type="submit"
            disabled={
              loading || !selectedAssessment || assessments.length === 0
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Assessment
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
