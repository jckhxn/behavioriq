import { useState, useEffect } from "react";

interface UseStreamingTextOptions {
  speed?: number; // Characters per interval
  interval?: number; // Milliseconds between updates
}

export function useStreamingText(
  text: string,
  options: UseStreamingTextOptions = {}
) {
  const { speed = 2, interval = 50 } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsComplete(false);
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setIsComplete(false);
    setDisplayedText("");

    let currentIndex = 0;
    const timer = setInterval(() => {
      currentIndex += speed;

      if (currentIndex >= text.length) {
        setDisplayedText(text);
        setIsComplete(true);
        setIsStreaming(false);
        clearInterval(timer);
      } else {
        setDisplayedText(text.slice(0, currentIndex));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, speed, interval]);

  const skipToEnd = () => {
    setDisplayedText(text);
    setIsComplete(true);
    setIsStreaming(false);
  };

  return {
    displayedText,
    isComplete,
    isStreaming,
    skipToEnd,
  };
}
