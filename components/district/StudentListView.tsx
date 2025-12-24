"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  anonymousId: string;
  gradeLevel?: string;
  school?: string;
  classrooms: string[];
  assessmentStatus: "none" | "trial" | "full";
  assessmentId?: string;
  flaggedDomains: string[];
  consentGiven: boolean;
  isAnonymous: boolean;
  completedAt?: Date;
}

interface StudentListViewProps {
  students: Student[];
  userRole: string;
  onRefresh: () => void;
}

export function StudentListView({
  students,
  userRole,
  onRefresh,
}: StudentListViewProps) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No students found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student List</CardTitle>
        <CardDescription>
          {students.length} student{students.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Student ID */}
                <div>
                  <div className="text-sm font-medium">
                    {student.isAnonymous
                      ? student.anonymousId
                      : `Student ${student.anonymousId}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {student.gradeLevel
                      ? `Grade ${student.gradeLevel}`
                      : "No grade"}
                  </div>
                </div>

                {/* School/Classroom */}
                <div>
                  <div className="text-sm">{student.school || "No school"}</div>
                  <div className="text-xs text-muted-foreground">
                    {student.classrooms.length > 0
                      ? student.classrooms.slice(0, 2).join(", ")
                      : "No classroom"}
                  </div>
                </div>

                {/* Assessment Status */}
                <div className="flex items-center gap-2">
                  {student.assessmentStatus === "none" && (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Not screened
                      </span>
                    </>
                  )}
                  {student.assessmentStatus === "trial" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Trial completed</span>
                    </>
                  )}
                  {student.assessmentStatus === "full" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Full completed</span>
                    </>
                  )}
                </div>

                {/* Flagged Domains */}
                <div className="md:col-span-2">
                  {student.flaggedDomains.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {student.flaggedDomains.map((domain) => (
                        <Badge
                          key={domain}
                          variant="destructive"
                          className="text-xs"
                        >
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No flags
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {student.assessmentId ? (
                  <Link href={`/district/student/${student.id}`}>
                    <Button variant="outline" size="sm" className="ml-4">
                      <Eye className="h-4 w-4 mr-1" />
                      View Report
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" disabled className="ml-4">
                    No data
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
