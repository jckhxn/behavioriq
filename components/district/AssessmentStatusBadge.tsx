"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Circle, FileText } from "lucide-react";

interface AssessmentStatusBadgeProps {
  status: string;
  mode?: string | null;
}

export default function AssessmentStatusBadge({
  status,
  mode,
}: AssessmentStatusBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case "COMPLETED":
        if (mode === "FULL") {
          return {
            icon: CheckCircle,
            text: "Completed (Full)",
            variant: "default" as const,
            className: "bg-green-600 text-white dark:bg-green-700",
          };
        }
        return {
          icon: CheckCircle,
          text: "Completed (Trial)",
          variant: "outline" as const,
          className:
            "text-green-600 border-green-300 dark:text-green-400 dark:border-green-800",
        };
      case "IN_PROGRESS":
        return {
          icon: Clock,
          text: "In Progress",
          variant: "outline" as const,
          className:
            "text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-800",
        };
      default:
        return {
          icon: Circle,
          text: "Not Started",
          variant: "outline" as const,
          className:
            "text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-800",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1.5 h-3 w-3" />
      {config.text}
    </Badge>
  );
}
