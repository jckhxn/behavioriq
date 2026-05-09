"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionSetConfig } from "@/lib/assessment/db-loader";

interface QuestionPresenterProps {
  questionId: string;
  questionText: string;
  currentDomain: string;
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  };
  isLoading?: boolean;
  onAnswer: (questionId: string, response: boolean) => Promise<void>;
  onBack?: () => void;
  canGoBack?: boolean;
  assessmentConfigs: QuestionSetConfig[];
}

export function QuestionPresenter({
  questionId,
  questionText,
  currentDomain,
  progress,
  isLoading = false,
  onAnswer,
  onBack,
  canGoBack = false,
  assessmentConfigs,
}: QuestionPresenterProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setSelected(null); }, [questionId]);

  const handleAnswer = useCallback(async (response: boolean) => {
    if (isSubmitting || selected !== null || isLoading) return;
    setSelected(response);
    setIsSubmitting(true);
    setTimeout(async () => {
      try {
        await onAnswer(questionId, response);
      } catch {
        setSelected(null);
      } finally {
        setIsSubmitting(false);
      }
    }, 250);
  }, [isSubmitting, selected, isLoading, onAnswer, questionId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "y" || k === "enter") { e.preventDefault(); handleAnswer(true); }
      else if (k === "n") { e.preventDefault(); handleAnswer(false); }
      else if ((k === "backspace" || k === "arrowleft") && canGoBack && onBack && !isLoading && !isSubmitting) {
        e.preventDefault(); onBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAnswer, canGoBack, onBack, isLoading, isSubmitting]);

  const domainConfig = useMemo(() => {
    return assessmentConfigs.find((d) => d.name === currentDomain) ?? { name: currentDomain };
  }, [assessmentConfigs, currentDomain]);

  const pct = Math.round(progress.overallProgress);

  return (
    <div className="h-full flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-lg">
        {/* Top row: back + counter */}
        <div className="flex items-center justify-between mb-4">
          {canGoBack ? (
            <button
              onClick={onBack}
              disabled={isLoading || isSubmitting}
              className="flex items-center gap-1.5 text-[13px] font-medium text-dash-ink-500 hover:text-dash-ink-700 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-40"
            >
              <ArrowLeft size={13} strokeWidth={1.6} />
              Back
            </button>
          ) : <div />}
          <span className="text-[13px] font-medium text-dash-ink-500">
            {progress.answeredQuestions} / {progress.totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-dash-ink-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-dash-indigo-500 rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Domain label */}
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-ink-500 mb-4">
          {domainConfig.name}
        </div>

        {/* Question card */}
        <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-7 mb-5 shadow-sm">
          <p
            className="text-[19px] leading-[1.6] text-dash-ink-900"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            {questionText}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => handleAnswer(true)}
            disabled={selected !== null || isLoading}
            className={cn(
              "h-[60px] rounded-xl border-2 text-[15px] font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
              selected === true
                ? "bg-dash-mint-700 border-dash-mint-700 text-white shadow-sm"
                : "bg-dash-mint-50 border-dash-mint-700/25 text-dash-mint-700 hover:border-dash-mint-700/50 disabled:opacity-40",
            )}
          >
            Yes
          </button>
          <button
            onClick={() => handleAnswer(false)}
            disabled={selected !== null || isLoading}
            className={cn(
              "h-[60px] rounded-xl border-2 text-[15px] font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
              selected === false
                ? "bg-dash-rose-700 border-dash-rose-700 text-white shadow-sm"
                : "bg-dash-rose-50 border-dash-rose-700/25 text-dash-rose-700 hover:border-dash-rose-700/50 disabled:opacity-40",
            )}
          >
            No
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-dash-ink-400">
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">Y</kbd>
            {" "}Yes
          </span>
          <span className="text-dash-ink-200">·</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">N</kbd>
            {" "}No
          </span>
          {canGoBack && (
            <>
              <span className="text-dash-ink-200">·</span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">←</kbd>
                {" "}Back
              </span>
            </>
          )}
        </div>

        {/* Between-question loader */}
        {isLoading && !isSubmitting && (
          <div className="mt-5 text-center text-[12px] text-dash-ink-400 animate-pulse">
            Loading next question…
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="mt-8 flex items-center gap-8">
        <div className="text-center">
          <div className="text-[22px] font-semibold text-dash-ink-900 leading-none">{pct}%</div>
          <div className="text-[11px] text-dash-ink-500 mt-0.5">complete</div>
        </div>
        <div className="w-px h-8 bg-dash-ink-100" />
        <div className="text-center">
          <div className="text-[22px] font-semibold text-dash-ink-900 leading-none">{progress.completedDomains}</div>
          <div className="text-[11px] text-dash-ink-500 mt-0.5">domains done</div>
        </div>
      </div>
    </div>
  );
}
