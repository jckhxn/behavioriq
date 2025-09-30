"use client";

import { useState, useCallback } from "react";

interface UseAIRecommendationsProps {
  assessmentId: string;
  onComplete?: (recommendations: string) => void;
}

export function useAIRecommendations({
  assessmentId,
  onComplete,
}: UseAIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isExistingReport, setIsExistingReport] = useState(false);

  const generateRecommendations = useCallback(async () => {
    console.log("generateRecommendations called for assessment:", assessmentId);
    setIsGenerating(true);
    setError(null);
    setRecommendations("");

    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/recommendations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if this is an existing report
      const aiReportStatus = response.headers.get("X-AI-Report-Status");
      setIsExistingReport(aiReportStatus === "existing");

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setRecommendations(fullText);
      }

      console.log("Streaming completed. Total length:", fullText.length);
      onComplete?.(fullText);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  }, [assessmentId, onComplete]);

  const skipToEnd = () => {
    // For now, just set generating to false
    setIsGenerating(false);
  };

  return {
    recommendations,
    isGenerating,
    error,
    generateRecommendations,
    skipToEnd,
    isComplete: !isGenerating && recommendations.length > 0,
    isExistingReport,
  };
}
