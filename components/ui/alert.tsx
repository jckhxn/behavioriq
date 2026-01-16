"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

const alertVariants = cva("relative w-full rounded-xl border p-4 flex gap-3", {
  variants: {
    variant: {
      default: "bg-muted border-border text-foreground",
      info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      warning: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      error: "bg-red-500/10 border-red-500/20 text-red-500",
      destructive: "bg-red-500/10 border-red-500/20 text-red-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  destructive: AlertCircle,
};

const iconColorMap = {
  default: "text-muted-foreground",
  info: "text-blue-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  destructive: "text-red-500",
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      title,
      icon,
      dismissible,
      onDismiss,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = iconMap[variant || "default"];
    const iconColor = iconColorMap[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>
          {icon || <Icon className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0">
          {title && <h5 className="font-semibold mb-1">{title}</h5>}
          <div className="text-sm opacity-90">{children}</div>

          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-3 text-sm font-medium underline-offset-4 hover:underline",
                variant === "error" && "text-red-700",
                variant === "warning" && "text-amber-700",
                variant === "success" && "text-emerald-700",
                variant === "info" && "text-blue-700",
                (!variant || variant === "default") && "text-slate-700"
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors",
              iconColor
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

// Inline Alert for forms
interface InlineAlertProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
}

function InlineAlert({ type, message }: InlineAlertProps) {
  const config = {
    error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    success: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
  };

  const { icon: Icon, color, bg } = config[type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
        bg,
        color
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Banner Alert for page-level notifications
interface BannerAlertProps {
  type: "info" | "warning" | "success" | "error";
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function BannerAlert({
  type,
  title,
  message,
  dismissible,
  onDismiss,
  action,
}: BannerAlertProps) {
  const config = {
    info: { bg: "bg-blue-600", text: "text-white", hover: "hover:bg-blue-700" },
    warning: {
      bg: "bg-amber-500",
      text: "text-white",
      hover: "hover:bg-amber-600",
    },
    success: {
      bg: "bg-emerald-600",
      text: "text-white",
      hover: "hover:bg-emerald-700",
    },
    error: { bg: "bg-red-600", text: "text-white", hover: "hover:bg-red-700" },
  };

  const { bg, text, hover } = config[type];

  return (
    <div className={cn("w-full px-4 py-3", bg, text)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && <span className="font-semibold mr-2">{title}</span>}
          <span className="text-sm opacity-90">{message}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg bg-white/20 backdrop-blur-sm",
                hover,
                "transition-colors"
              )}
            >
              {action.label}
            </button>
          )}
          {dismissible && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy components for backward compatibility
const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export {
  Alert,
  alertVariants,
  AlertTitle,
  AlertDescription,
  InlineAlert,
  BannerAlert,
};
