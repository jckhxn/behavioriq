"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  RotateCw,
  BarChart3,
  FileText,
  User,
  Pencil,
  Archive,
  Download,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ContextualActionMenuProps {
  student: {
    id: string;
    anonymousId: string;
    assessmentStatus: string;
    latestAssessmentMode?: string | null;
  };
  onEdit: () => void;
  onArchive: () => void;
}

export default function ContextualActionMenu({
  student,
  onEdit,
  onArchive,
}: ContextualActionMenuProps) {
  const router = useRouter();

  const getPrimaryAction = () => {
    const { assessmentStatus, latestAssessmentMode } = student;

    if (assessmentStatus === "NOT_STARTED") {
      return {
        label: "Start Assessment",
        icon: Play,
        onClick: () =>
          router.push(`/teacher/student/${student.id}/start-assessment`),
        variant: "default" as const,
      };
    }

    if (assessmentStatus === "IN_PROGRESS") {
      return {
        label: "Continue Assessment",
        icon: RotateCw,
        onClick: () =>
          router.push(`/teacher/student/${student.id}/continue-assessment`),
        variant: "default" as const,
      };
    }

    if (assessmentStatus === "COMPLETED" && latestAssessmentMode === "TRIAL") {
      return {
        label: "View Screening Summary",
        icon: BarChart3,
        onClick: () => router.push(`/teacher/student/${student.id}/screening`),
        variant: "outline" as const,
      };
    }

    if (assessmentStatus === "COMPLETED" && latestAssessmentMode === "FULL") {
      return {
        label: "View Full Report",
        icon: FileText,
        onClick: () => router.push(`/teacher/student/${student.id}/report`),
        variant: "outline" as const,
      };
    }

    return {
      label: "View Details",
      icon: User,
      onClick: () => router.push(`/teacher/student/${student.id}`),
      variant: "outline" as const,
    };
  };

  const primaryAction = getPrimaryAction();
  const PrimaryIcon = primaryAction.icon;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={primaryAction.variant}
        size="sm"
        onClick={primaryAction.onClick}
      >
        <PrimaryIcon className="mr-2 h-4 w-4" />
        {primaryAction.label}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/teacher/student/${student.id}`)}
          >
            <User className="mr-2 h-4 w-4" />
            View Student Profile
          </DropdownMenuItem>

          {student.assessmentStatus === "COMPLETED" && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/teacher/student/${student.id}/screening`)
                }
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Screening Summary
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/teacher/student/${student.id}/notes`)
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                View Observations
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Student Info
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onArchive} className="text-amber-600">
            <Archive className="mr-2 h-4 w-4" />
            Archive Student
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
