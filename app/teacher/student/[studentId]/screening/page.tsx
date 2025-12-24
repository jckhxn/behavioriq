import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { IntentGate } from "@/components/district/IntentGate";
import { DomainIndicatorBadge } from "@/components/district/DomainIndicatorBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";

async function getScreeningData(studentId: string, assessmentId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/teacher/student/${studentId}/screening?assessmentId=${assessmentId}`,
    { cache: "no-store" }
  );
  if (!response.ok) return null;
  return response.json();
}

export default async function ScreeningSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ assessmentId?: string }>;
}) {
  const { studentId } = await params;
  const { assessmentId } = await searchParams;

  if (!assessmentId) {
    redirect(`/teacher/student/${studentId}`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "TEACHER") {
    redirect("/");
  }

  return (
    <IntentGate studentId={studentId} action="VIEW_SCREENING_SUMMARY">
      <Suspense fallback={<div>Loading...</div>}>
        <ScreeningSummaryContent
          studentId={studentId}
          assessmentId={assessmentId}
        />
      </Suspense>
    </IntentGate>
  );
}

async function ScreeningSummaryContent({
  studentId,
  assessmentId,
}: {
  studentId: string;
  assessmentId: string;
}) {
  const data = await getScreeningData(studentId, assessmentId);

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Assessment not found or access denied.
        </AlertDescription>
      </Alert>
    );
  }

  const { assessment, featureFlags } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong className="block mb-2">THIS IS NOT A DIAGNOSIS</strong>
          The information below represents screening indicators only. Any
          flagged domains require professional evaluation by qualified mental
          health professionals.
        </AlertDescription>
      </Alert>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle>Screening Summary</CardTitle>
          <CardDescription>
            Student:{" "}
            {assessment.student.firstName && assessment.student.lastName
              ? `${assessment.student.firstName} ${assessment.student.lastName}`
              : assessment.student.anonymousId}{" "}
            | Completed: {new Date(assessment.completedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Domain Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Indicators</CardTitle>
          <CardDescription>
            Behavioral and emotional domains assessed in this screening
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.domainIndicators.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No domain indicators available for this assessment.
            </p>
          ) : (
            assessment.domainIndicators.map((domain: any) => (
              <DomainIndicatorBadge
                key={domain.domainName}
                domainName={domain.domainName}
                flagged={domain.flagged}
                showScore={featureFlags.showScores}
                rawScore={domain.rawScore}
                percentile={domain.percentile}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations (Feature-Flagged) */}
      {featureFlags.showAIRecommendations && assessment.recommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle>AI-Generated Recommendations</CardTitle>
            </div>
            <CardDescription>
              Suggested next steps based on screening results (requires
              professional validation)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                These recommendations are AI-generated and must be reviewed by
                qualified professionals before implementation.
              </AlertDescription>
            </Alert>
            <ul className="list-disc pl-6 space-y-2">
              {assessment.recommendations.map((rec: any) => (
                <li key={rec.id}>{rec.content}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Flagged domains:</strong> Consult with school counselor or
              psychologist for professional assessment
            </li>
            <li>
              <strong>Within expected range:</strong> Continue routine
              monitoring and support
            </li>
            <li>
              <strong>Documentation:</strong> Add teacher observations to
              provide context for follow-up professionals
            </li>
            <li>
              <strong>Parent communication:</strong> Share results with
              parents/guardians in accordance with school policy
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={`/teacher/student/${studentId}`}>
          <Button variant="outline">Back to Student Detail</Button>
        </Link>
        <Link href={`/teacher/student/${studentId}/notes`}>
          <Button>Add Teacher Observation</Button>
        </Link>
      </div>
    </div>
  );
}
