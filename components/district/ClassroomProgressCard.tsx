"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClassroomProgressCardProps {
  classroom: {
    id: string;
    name: string;
    school: {
      name: string;
    };
    _count: {
      students: number;
    };
    studentsScreened: number;
    flaggedCount: number;
    completionPercentage: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function ClassroomProgressCard({
  classroom,
  isSelected,
  onClick,
}: ClassroomProgressCardProps) {
  const totalStudents = classroom._count.students;
  const screened = classroom.studentsScreened;
  const percentage = classroom.completionPercentage;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="h-auto flex-col items-start p-4 text-left w-full"
      onClick={onClick}
    >
      <div className="w-full space-y-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <div className="font-semibold">{classroom.name}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground">
                    {classroom.school.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{classroom.school.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs mb-1">
            <span>
              {screened} / {totalStudents} screened
            </span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Flagged Students Warning */}
        {classroom.flaggedCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {classroom.flaggedCount} student
              {classroom.flaggedCount !== 1 ? "s" : ""} may need follow-up
            </span>
          </div>
        )}
      </div>
    </Button>
  );
}
