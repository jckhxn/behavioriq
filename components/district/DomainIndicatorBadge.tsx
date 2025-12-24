"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface DomainIndicatorBadgeProps {
  domainName: string;
  flagged: boolean;
  showScore?: boolean;
  rawScore?: number;
  percentile?: number;
}

export function DomainIndicatorBadge({
  domainName,
  flagged,
  showScore = false,
  rawScore,
  percentile,
}: DomainIndicatorBadgeProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        {flagged ? (
          <AlertCircle className="h-4 w-4 text-amber-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        <span className="font-medium">{domainName}</span>
      </div>
      <div className="flex items-center gap-2">
        {flagged ? (
          <Badge variant="destructive">May warrant follow-up</Badge>
        ) : (
          <Badge variant="outline" className="text-green-700 border-green-700">
            Within expected range
          </Badge>
        )}
        {showScore && rawScore !== undefined && percentile !== undefined && (
          <span className="text-xs text-muted-foreground ml-2">
            Score: {rawScore.toFixed(1)} ({percentile}th percentile)
          </span>
        )}
      </div>
    </div>
  );
}
