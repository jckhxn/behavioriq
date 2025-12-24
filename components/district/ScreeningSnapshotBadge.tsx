"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScreeningSnapshotBadgeProps {
  snapshot: "NEUTRAL" | "MONITOR" | "ELEVATED" | "NOT_STARTED";
  flaggedDomainsCount?: number;
}

export default function ScreeningSnapshotBadge({
  snapshot,
  flaggedDomainsCount = 0,
}: ScreeningSnapshotBadgeProps) {
  const getConfig = () => {
    switch (snapshot) {
      case "NEUTRAL":
        return {
          dot: "bg-green-400",
          text: "Within Range",
          variant: "outline" as const,
          className:
            "text-green-600 border-green-300 dark:text-green-400 dark:border-green-800",
          tooltip: "No elevated screening indicators detected.",
        };
      case "MONITOR":
        return {
          dot: "bg-amber-400",
          text: "Monitor",
          variant: "outline" as const,
          className:
            "text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-800",
          tooltip: `${flaggedDomainsCount} domain${flaggedDomainsCount !== 1 ? "s" : ""} showing patterns that may warrant follow-up.`,
        };
      case "ELEVATED":
        return {
          dot: "bg-orange-400",
          text: "Elevated Indicators",
          variant: "outline" as const,
          className:
            "text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-800",
          tooltip: `${flaggedDomainsCount} domains showing elevated indicators. Review screening summary to plan next steps.`,
        };
      default:
        return {
          dot: "bg-gray-400",
          text: "Not Screened",
          variant: "outline" as const,
          className:
            "text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-800",
          tooltip: "No completed screening assessments yet.",
        };
    }
  };

  const config = getConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={config.className}>
            <span className={`mr-2 h-2 w-2 rounded-full ${config.dot}`} />
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{config.tooltip}</p>
          <p className="mt-1 text-xs text-muted-foreground italic">
            Not a diagnosis. For support planning only.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
