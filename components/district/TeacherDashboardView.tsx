"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FeatureGate,
  DisabledFeatureOverlay,
} from "@/components/district/FeatureGate";
import { PlusCircle, Users, BookOpen, AlertCircle } from "lucide-react";
import type {
  Teacher,
  Classroom,
  Student,
  StudentAssessment,
  StudentClassroom,
  School,
} from "@prisma/client";

type StudentWithAssessments = Student & {
  assessments: (StudentAssessment & {
    assessment: {
      id: string;
      status: string;
      subjectName: string;
    };
  })[];
};

type ClassroomWithDetails = Classroom & {
  students: (StudentClassroom & {
    student: StudentWithAssessments;
  })[];
  school: { name: string };
};

type TeacherClassroomWithDetails = {
  id: string;
  teacherId: string;
  classroomId: string;
  isPrimary: boolean;
  assignedAt: Date;
  classroom: ClassroomWithDetails;
};

type TeacherWithClassrooms = Teacher & {
  classrooms: TeacherClassroomWithDetails[];
};

interface TeacherDashboardViewProps {
  teacher: TeacherWithClassrooms | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  featureFlags: Record<string, boolean>;
}

export function TeacherDashboardView({
  teacher,
  user,
  featureFlags,
}: TeacherDashboardViewProps) {
  const router = useRouter();
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    teacher?.classrooms[0]?.classroom.id || null
  );

  if (!teacher) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Teacher Profile Not Found
            </CardTitle>
            <CardDescription>
              Your account is not linked to a teacher profile. Please contact
              your district administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentClassroom = teacher.classrooms.find(
    (tc) => tc.classroom.id === selectedClassroom
  )?.classroom;

  const totalStudents = teacher.classrooms.reduce(
    (sum, tc) => sum + tc.classroom.students.length,
    0
  );
  const assessedStudents = teacher.classrooms.reduce(
    (sum, tc) =>
      sum +
      tc.classroom.students.filter((sc) => sc.student.assessments.length > 0)
        .length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user.name || "Teacher"}
        </h1>
        <p className="text-muted-foreground">
          Manage your classroom and support student behavioral wellness
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classrooms</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacher.classrooms.length}
            </div>
            <p className="text-xs text-muted-foreground">Active classrooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classrooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessments Complete
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessedStudents} / {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0
                ? `${Math.round((assessedStudents / totalStudents) * 100)}% completion`
                : "No students yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classroom Selector */}
      {teacher.classrooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Classroom</CardTitle>
            <CardDescription>
              Choose a classroom to view and manage students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {teacher.classrooms.map((tc) => (
                <Button
                  key={tc.classroom.id}
                  variant={
                    selectedClassroom === tc.classroom.id
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedClassroom(tc.classroom.id)}
                >
                  {tc.classroom.name}
                  <span className="ml-2 text-xs opacity-70">
                    ({tc.classroom.students.length} students)
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Management */}
      {currentClassroom && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentClassroom.name}</CardTitle>
                <CardDescription>
                  {currentClassroom.school.name} •{" "}
                  {currentClassroom.students.length} students
                </CardDescription>
              </div>
              <FeatureGate
                flagKey="student_creation"
                isEnabled={featureFlags.student_creation || false}
                hideWhenDisabled={false}
              >
                <Button
                  onClick={() =>
                    router.push(
                      `/teacher/classroom/${currentClassroom.id}/add-student`
                    )
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </FeatureGate>
            </div>
          </CardHeader>
          <CardContent>
            <DisabledFeatureOverlay
              show={!featureFlags.student_creation}
              message="Student management will be available soon"
            >
              {currentClassroom.students.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">
                    No students yet
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding students to this classroom
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentClassroom.students.map((studentClassroom) => {
                    const student = studentClassroom.student;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            Student {student.anonymousId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Grade {student.gradeLevel}
                            {student.assessments.length > 0 && (
                              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                ✓ Assessment:{" "}
                                {student.assessments[0].assessment.status}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <FeatureGate
                            flagKey="assessment_assignment"
                            isEnabled={
                              featureFlags.assessment_assignment || false
                            }
                            hideWhenDisabled={false}
                          >
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/teacher/student/${student.id}/assign-assessment`
                                )
                              }
                            >
                              Assign Assessment
                            </Button>
                          </FeatureGate>
                          <FeatureGate
                            flagKey="student_detail_view"
                            isEnabled={
                              featureFlags.student_detail_view || false
                            }
                            fallback={
                              <span className="text-xs text-muted-foreground">
                                Details unavailable
                              </span>
                            }
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/teacher/student/${student.id}`)
                              }
                            >
                              View Details
                            </Button>
                          </FeatureGate>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DisabledFeatureOverlay>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {teacher.classrooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No classrooms assigned
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Contact your district administrator to be assigned to a classroom
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
