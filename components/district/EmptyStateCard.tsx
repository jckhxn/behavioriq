"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, UserPlus, Mail } from "lucide-react";

interface EmptyStateCardProps {
  variant: "no-classrooms" | "no-students" | "no-assessments" | "all-screened";
  onAction?: () => void;
}

export default function EmptyStateCard({
  variant,
  onAction,
}: EmptyStateCardProps) {
  const getConfig = () => {
    switch (variant) {
      case "no-classrooms":
        return {
          icon: BookOpen,
          title: "No Classrooms Yet",
          description:
            "You haven't been assigned to any classrooms yet. Contact your school administrator to get access.",
          actionLabel: "Email Administrator",
          actionIcon: Mail,
          showAction: true,
        };
      case "no-students":
        return {
          icon: Users,
          title: "No Students Yet",
          description:
            "This classroom doesn't have any students assigned yet. Add your first student to start screening.",
          actionLabel: "Add Student",
          actionIcon: UserPlus,
          showAction: true,
        };
      case "no-assessments":
        return {
          icon: FileText,
          title: "Ready to Start Screening",
          description:
            "You have students but no completed assessments yet. Click 'Start Assessment' next to a student's name to begin.",
          actionLabel: "View Quick Start Guide",
          actionIcon: BookOpen,
          showAction: true,
        };
      case "all-screened":
        return {
          icon: FileText,
          title: "All Students Screened",
          description:
            "Great work! All students in this classroom have completed their initial screening. You can review results or assign follow-up assessments.",
          actionLabel: "View Reports",
          actionIcon: FileText,
          showAction: true,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {config.description}
        </p>
        {config.showAction && onAction && (
          <Button onClick={onAction}>
            <ActionIcon className="mr-2 h-4 w-4" />
            {config.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
