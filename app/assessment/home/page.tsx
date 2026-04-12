"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  Home,
  User,
  Shield,
  CheckCircle,
  Brain,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentInfo {
  anonymousId: string;
  gradeLevel: string | null;
  schoolName: string;
  classroomName: string;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
}

function HomeAssessmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("student");
  const linkCode = searchParams.get("code");

  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentTemplates, setAssessmentTemplates] = useState<
    AssessmentTemplate[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"verify" | "consent" | "select" | "start">(
    "verify"
  );
  const [guardianName, setGuardianName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (linkCode) {
      // Verify by link code (teacher-created link)
      fetchByLinkCode();
    } else if (studentId) {
      // Verify by student ID (legacy method)
      fetchStudentInfo();
    } else {
      setError(
        "Invalid assessment link. Please contact your teacher for a valid link."
      );
      setLoading(false);
    }
  }, [studentId, linkCode]);

  const fetchByLinkCode = async () => {
    try {
      const response = await fetch(
        `/api/assessment/home/verify?code=${linkCode}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to verify link. It may be invalid or expired."
        );
        setLoading(false);
        return;
      }

      setStudentInfo(data.student);
      setAssessmentId(data.assessmentId);
      setAssessmentTemplates(data.assessmentTemplates || []);
      // If link code exists, skip template selection since it's pre-selected
      setStep("verify");
      setLoading(false);
    } catch (err) {
      setError("Unable to load assessment. Please try again later.");
      setLoading(false);
    }
  };

  const fetchStudentInfo = async () => {
    try {
      const response = await fetch(
        `/api/assessment/home/verify?student=${studentId}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to verify student. Link may be invalid."
        );
        setLoading(false);
        return;
      }

      setStudentInfo(data.student);
      setAssessmentTemplates(data.assessmentTemplates || []);
      setLoading(false);
    } catch (err) {
      setError("Unable to load assessment. Please try again later.");
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    if (!consentChecked || !guardianName.trim() || !relationship.trim()) {
      setError("Please complete all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/assessment/home/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          templateId: selectedTemplate,
          guardianName: guardianName.trim(),
          relationship: relationship.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start assessment");
      }

      // Redirect to the assessment
      router.push(`/assessment/${data.assessmentId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start assessment"
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Verifying assessment link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !studentInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>
              This assessment link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Please contact your child&apos;s teacher for a new assessment
              link.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Home Assessment</CardTitle>
          <CardDescription>
            Complete a behavioral wellness assessment for your child
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Student Info Card */}
          {studentInfo && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Student {studentInfo.anonymousId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {studentInfo.classroomName} • {studentInfo.schoolName}
                    {studentInfo.gradeLevel &&
                      ` • Grade ${studentInfo.gradeLevel}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">
                  Your Name (Parent/Guardian) *
                </Label>
                <Input
                  id="guardianName"
                  placeholder="Enter your full name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to Child *</Label>
                <Input
                  id="relationship"
                  placeholder="e.g., Mother, Father, Guardian"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setStep("consent")}
                disabled={!guardianName.trim() || !relationship.trim()}
              >
                Continue
              </Button>
            </div>
          )}

          {step === "consent" && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Notice</strong>
                  <br />
                  This assessment is designed to help identify early behavioral
                  patterns. It is <strong>not a diagnostic tool</strong> and
                  results should be discussed with qualified professionals.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <h4 className="font-semibold">By proceeding, you confirm:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>You are the parent/guardian of this child</li>
                  <li>You consent to this behavioral screening</li>
                  <li>
                    Results will be shared with your child&apos;s teacher and
                    school counselor
                  </li>
                  <li>
                    You understand this is a screening tool, not a diagnosis
                  </li>
                </ul>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) =>
                    setConsentChecked(checked === true)
                  }
                />
                <Label
                  htmlFor="consent"
                  className="text-sm font-normal cursor-pointer leading-tight"
                >
                  I understand and consent to this behavioral wellness screening
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("verify")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep("select")}
                  disabled={!consentChecked}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "select" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Select Assessment Type</Label>
                {assessmentTemplates.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Using default behavioral wellness assessment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {assessmentTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            ~{template.estimatedTime} min
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("consent")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep("start")}
                  disabled={assessmentTemplates.length > 0 && !selectedTemplate}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "start" && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-green-50 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Ready to Begin</p>
                <p className="text-sm text-green-700">
                  You&apos;re about to start the behavioral wellness assessment.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-semibold">Before you begin:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Find a quiet space without distractions</li>
                  <li>Allow 15-20 minutes to complete the assessment</li>
                  <li>Answer based on your observations over the past month</li>
                  <li>Be honest - there are no wrong answers</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("select")}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleStartAssessment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start Assessment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomeAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HomeAssessmentContent />
    </Suspense>
  );
}
