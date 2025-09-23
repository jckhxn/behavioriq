"use client";

import { useStreamingText } from "@/lib/hooks/useStreamingText";
import { Button } from "@/components/ui/button";

interface StreamingTextProps {
  text: string;
  speed?: number;
  interval?: number;
  className?: string;
  showSkipButton?: boolean;
}

export function StreamingText({
  text,
  speed = 2,
  interval = 30,
  className = "",
  showSkipButton = true,
}: StreamingTextProps) {
  const { displayedText, isComplete, isStreaming, skipToEnd } =
    useStreamingText(text, {
      speed,
      interval,
    });

  return (
    <div className="relative">
      <div className={`${className} ${isStreaming ? "streaming" : ""}`}>
        {displayedText}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
        )}
      </div>

      {isStreaming && showSkipButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={skipToEnd}
          className="mt-2 text-xs opacity-70 hover:opacity-100"
        >
          Skip to end ⏩
        </Button>
      )}
    </div>
  );
}
