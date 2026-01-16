import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { IntentGate } from "@/components/district/IntentGate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, FileText, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

async function getStudentData(studentId: string, teacherId: string) {
  // Verify teacher has access to this student through their classrooms
  const teacherClassroom = await prisma.teacherClassroom.findFirst({
    where: {
      teacherId,
      classroom: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
    },
  });

  if (!teacherClassroom) {
    return null;
  }

  // Fetch student data with assessments
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      assessments: {
        include: {
          assessment: {
            select: {
              id: true,
              status: true,
              completedAt: true,
              startedAt: true,
              scores: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  // Transform assessments to match expected format
  const assessmentsWithFlags = student.assessments.map((studentAssessment) => {
    const assessment = studentAssessment.assessment;
    const scores =
      assessment.scores && assessment.scores.length > 0
        ? assessment.scores[0]
        : null;
    const domainScores = (scores as any)?.domainScores || [];
    const flaggedDomains = domainScores.filter(
      (d: any) => d.riskLevel === "ELEVATED" || d.riskLevel === "HIGH"
    );

    return {
      id: assessment.id,
      status: assessment.status,
      completedAt: assessment.completedAt,
      assignedAt: assessment.startedAt,
      hasFlaggedDomains: flaggedDomains.length > 0,
      flaggedDomainCount: flaggedDomains.length,
    };
  });

  return {
    ...student,
    assessments: assessmentsWithFlags,
  };
}

export default async function TeacherStudentDetailPage({
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
    redirect("/login");
  }

  // Get teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });

  if (!teacher) {
    redirect("/dashboard");
  }

  return (
    <IntentGate studentId={studentId} action="VIEW_STUDENT_DETAIL">
      <Suspense fallback={<div>Loading...</div>}>
        <StudentDetailContent studentId={studentId} teacherId={teacher.id} />
      </Suspense>
    </IntentGate>
  );
}

async function StudentDetailContent({
  studentId,
  teacherId,
}: {
  studentId: string;
  teacherId: string;
}) {
  const student = await getStudentData(studentId, teacherId);

  if (!student) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Student not found or you do not have access to this student.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Not a diagnosis:</strong> This data represents early warning
          indicators only. Professional evaluation is required for any flagged
          domains.
        </AlertDescription>
      </Alert>

      {/* Student Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
          <CardDescription>
            Basic information and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Student ID</span>
              <p className="font-mono font-semibold">{student.anonymousId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-semibold">
                {student.firstName && student.lastName ? (
                  `${student.firstName} ${student.lastName}`
                ) : (
                  <span className="text-muted-foreground italic">
                    No name on file
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Grade Level</span>
              <p className="font-semibold">{student.gradeLevel || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">School ID</span>
              <p className="font-semibold">{student.schoolId || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Screening assessments assigned to this student
              </CardDescription>
            </div>
            <Link href={`/teacher/student/${studentId}/assign-assessment`}>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Assign Assessment
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {student.assessments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No assessments have been assigned to this student yet.
            </p>
          ) : (
            <div className="space-y-3">
              {student.assessments.map((assessment: any) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Assigned:{" "}
                        {new Date(assessment.assignedAt).toLocaleDateString()}
                      </span>
                      {assessment.completedAt && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            Completed:{" "}
                            {new Date(
                              assessment.completedAt
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          assessment.status === "COMPLETED"
                            ? "default"
                            : assessment.status === "IN_PROGRESS"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {assessment.status}
                      </Badge>
                      {assessment.hasFlaggedDomains && (
                        <Badge variant="destructive">
                          {assessment.flaggedDomainCount} domain(s) flagged
                        </Badge>
                      )}
                    </div>
                  </div>
                  {assessment.status === "COMPLETED" && (
                    <Link
                      href={`/teacher/student/${studentId}/screening?assessmentId=${assessment.id}`}
                    >
                      <Button variant="outline">View Summary</Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Observations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teacher Observations</CardTitle>
              <CardDescription>
                Your notes and observations (non-diagnostic)
              </CardDescription>
            </div>
            <Link href={`/teacher/student/${studentId}/notes`}>
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Add Observation
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-2">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
