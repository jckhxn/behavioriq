"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, PlayCircle, X } from "lucide-react";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function OnboardingChecklist() {
  const { startTour } = useOnboarding();
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "tour", label: "Complete dashboard tour", completed: false },
    {
      id: "assessment",
      label: "Create your first assessment",
      completed: false,
    },
    { id: "chat", label: "Try AI chat", completed: false },
    { id: "profile", label: "Complete your profile", completed: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchChecklistStatus();
  }, []);

  const fetchChecklistStatus = async () => {
    try {
      const res = await fetch("/api/user/onboarding-checklist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || items);
        setIsDismissed(data.dismissed || false);
      }
    } catch (error) {
      console.error("Failed to fetch checklist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      const res = await fetch("/api/user/onboarding-checklist", {
        method: "POST",
      });
      if (res.ok) {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error("Failed to dismiss checklist:", error);
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  if (isLoading) {
    return null;
  }

  // Hide when all complete or dismissed
  if (completedCount === items.length || isDismissed) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>
              {completedCount} of {items.length} completed
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startTour}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Replay Tour
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 ${
                  item.completed
                    ? "bg-green-500"
                    : "border-2 border-muted-foreground"
                }`}
              >
                {item.completed && <Check className="h-3 w-3 text-white" />}
              </div>
              <span
                className={
                  item.completed ? "text-muted-foreground line-through" : ""
                }
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
