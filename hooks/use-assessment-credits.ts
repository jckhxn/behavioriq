"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { AssessmentCreditsInfo } from "@/lib/services/assessment-credits-service";

export function useAssessmentCredits() {
  const [credits, setCredits] = useState<AssessmentCreditsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
        return data;
      } else {
        throw new Error("Failed to fetch credits");
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast.error("Failed to load assessment credits");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const checkCreditsBeforeAction = async (): Promise<boolean> => {
    const latestCredits = await fetchCredits();

    if (!latestCredits || !latestCredits.hasCredits) {
      setIsDialogOpen(true);
      return false;
    }

    return true;
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const refreshCredits = () => {
    setIsLoading(true);
    fetchCredits();
  };

  return {
    credits,
    isLoading,
    isDialogOpen,
    closeDialog,
    checkCreditsBeforeAction,
    refreshCredits,
  };
}
