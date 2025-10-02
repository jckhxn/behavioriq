"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  showText?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text = "Loading...",
  className,
  showText = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("text-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 border-primary mx-auto",
          sizeClasses[size],
          showText && "mb-2"
        )}
      />
      {showText && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({
  text = "Loading...",
  className,
}: LoadingPageProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center",
        className
      )}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

interface LoadingCardProps {
  text?: string;
  className?: string;
  height?: string;
}

export function LoadingCard({
  text = "Loading...",
  className,
  height = "h-32",
}: LoadingCardProps) {
  return (
    <div className={cn("flex justify-center items-center", height, className)}>
      <LoadingSpinner text={text} />
    </div>
  );
}
