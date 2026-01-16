import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary",
        secondary: "bg-muted text-muted-foreground",
        success: "bg-emerald-500/10 text-emerald-500",
        warning: "bg-amber-500/10 text-amber-500",
        error: "bg-red-500/10 text-red-500",
        destructive: "bg-red-500/10 text-red-500",
        info: "bg-blue-500/10 text-blue-500",
        outline: "bg-transparent border border-border text-foreground",
        ghost: "bg-transparent text-muted-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({
  className,
  variant,
  size,
  icon,
  removable,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// Status Badge for specific use cases
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "error" | "success";
  label?: string;
  pulse?: boolean;
}

function StatusBadge({ status, label, pulse }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      color: "bg-emerald-500",
      text: "Active",
      bgColor: "bg-emerald-500/10 text-emerald-500",
    },
    inactive: {
      color: "bg-muted-foreground",
      text: "Inactive",
      bgColor: "bg-muted text-muted-foreground",
    },
    pending: {
      color: "bg-amber-500",
      text: "Pending",
      bgColor: "bg-amber-500/10 text-amber-500",
    },
    error: {
      color: "bg-red-500",
      text: "Error",
      bgColor: "bg-red-500/10 text-red-500",
    },
    success: {
      color: "bg-emerald-500",
      text: "Success",
      bgColor: "bg-emerald-500/10 text-emerald-500",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgColor
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.color,
          pulse && "animate-pulse"
        )}
      />
      {label || config.text}
    </span>
  );
}

// Risk Level Badge
interface RiskBadgeProps {
  level: "low" | "moderate" | "high" | "very_high";
  showLabel?: boolean;
}

function RiskBadge({ level, showLabel = true }: RiskBadgeProps) {
  const riskConfig = {
    low: {
      label: "Low Risk",
      color: "bg-emerald-500/10 text-emerald-500",
      dotColor: "bg-emerald-500",
    },
    moderate: {
      label: "Moderate",
      color: "bg-amber-500/10 text-amber-500",
      dotColor: "bg-amber-500",
    },
    high: {
      label: "High Risk",
      color: "bg-orange-500/10 text-orange-500",
      dotColor: "bg-orange-500",
    },
    very_high: {
      label: "Very High",
      color: "bg-red-500/10 text-red-500",
      dotColor: "bg-red-500",
    },
  };

  const config = riskConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.color
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      {showLabel && config.label}
    </span>
  );
}

export { Badge, badgeVariants, StatusBadge, RiskBadge };
