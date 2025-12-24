"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon, Info } from "lucide-react";

interface ActionableMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip: string;
  icon: LucideIcon;
  onClick?: () => void;
  progressValue?: number;
  progressMax?: number;
}

export default function ActionableMetricCard({
  title,
  value,
  subtitle,
  tooltip,
  icon: Icon,
  onClick,
  progressValue,
  progressMax,
}: ActionableMetricCardProps) {
  return (
    <Card
      className={
        onClick ? "cursor-pointer hover:border-primary transition-colors" : ""
      }
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {progressValue !== undefined &&
          progressMax !== undefined &&
          progressMax > 0 && (
            <div className="mt-3">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(progressValue / progressMax) * 100}%` }}
                />
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
