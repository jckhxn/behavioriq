"use client";

import { useEffect } from "react";

interface AssessmentQuestionProps {
  question: {
    id: string;
    text: string;
    order: number;
  };
  onAnswer: (answer: boolean) => void;
  isLastQuestion: boolean;
}

export function AssessmentQuestion({
  question,
  onAnswer,
  isLastQuestion,
}: AssessmentQuestionProps) {
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "y":
          e.preventDefault();
          onAnswer(true);
          break;
        case "n":
          e.preventDefault();
          onAnswer(false);
          break;
        case "enter":
          // Default to "Yes" on Enter for faster workflow
          e.preventDefault();
          onAnswer(true);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onAnswer]);

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium text-gray-900">
        Question {question.order}
      </div>

      <p className="text-xl text-gray-800">{question.text}</p>

      <div className="flex gap-4">
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="Keyboard shortcut: Y or Enter"
        >
          Yes (Y)
        </button>
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          title="Keyboard shortcut: N"
        >
          No (N)
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          💡 Tip: Press{" "}
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
            Y
          </kbd>{" "}
          or{" "}
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
            N
          </kbd>{" "}
          for quick answers
        </p>
      </div>
    </div>
  );
}
