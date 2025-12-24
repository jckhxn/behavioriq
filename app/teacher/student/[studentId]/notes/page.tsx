import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { IntentGate } from "@/components/district/IntentGate";
import { TeacherObservationForm } from "@/components/district/TeacherObservationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

async function getObservations(studentId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/teacher/student/${studentId}/observations`,
    { cache: "no-store" }
  );
  if (!response.ok) return null;
  return response.json();
}

export default async function TeacherObservationsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
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
    <IntentGate studentId={studentId} action="VIEW_OBSERVATIONS">
      <Suspense fallback={<div>Loading...</div>}>
        <ObservationsContent studentId={studentId} />
      </Suspense>
    </IntentGate>
  );
}

async function ObservationsContent({ studentId }: { studentId: string }) {
  const data = await getObservations(studentId);

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load observations.</AlertDescription>
      </Alert>
    );
  }

  const { observations } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>NOT A DIAGNOSIS:</strong> Teacher observations are contextual
          notes only. They do not constitute medical or psychological
          assessment.
        </AlertDescription>
      </Alert>

      {/* Add New Observation */}
      <Card>
        <CardHeader>
          <CardTitle>Add Teacher Observation</CardTitle>
          <CardDescription>
            Record behavioral observations, classroom context, or other relevant
            notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherObservationForm studentId={studentId} />
        </CardContent>
      </Card>

      {/* Previous Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Observations</CardTitle>
          <CardDescription>
            Your past observations for this student
          </CardDescription>
        </CardHeader>
        <CardContent>
          {observations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No observations recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {observations.map((obs: any) => (
                <div key={obs.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(obs.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{obs.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={`/teacher/student/${studentId}`}>
          <Button variant="outline">Back to Student Detail</Button>
        </Link>
      </div>
    </div>
  );
}
