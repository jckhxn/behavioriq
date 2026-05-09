"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionSetConfig } from "@/lib/assessment/db-loader";
import type { QuestionResponseType, LikertScale, LikertOption } from "@/lib/assessment/types";

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
  onAnswer: (questionId: string, response: boolean | number | string) => Promise<void>;
  onBack?: () => void;
  canGoBack?: boolean;
  assessmentConfigs: QuestionSetConfig[];
  responseType?: QuestionResponseType;
  likertScale?: LikertScale;
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
  responseType = "boolean",
  likertScale,
}: QuestionPresenterProps) {
  const [selected, setSelected] = useState<boolean | number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSelected(null);
    setTextValue("");
  }, [questionId]);

  // Focus textarea when a text question appears
  useEffect(() => {
    if (responseType === "text" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [questionId, responseType]);

  const submitAnswer = useCallback(async (response: boolean | number | string) => {
    if (isSubmitting || selected !== null || isLoading) return;
    setSelected(response);
    setIsSubmitting(true);
    const delay = responseType === "text" ? 0 : 250;
    setTimeout(async () => {
      try {
        await onAnswer(questionId, response);
      } catch {
        setSelected(null);
      } finally {
        setIsSubmitting(false);
      }
    }, delay);
  }, [isSubmitting, selected, isLoading, onAnswer, questionId, responseType]);

  // Keyboard shortcuts — only for boolean and likert
  useEffect(() => {
    if (responseType === "text") return;

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();

      if (responseType === "boolean") {
        if (k === "y" || k === "enter") { e.preventDefault(); submitAnswer(true); }
        else if (k === "n") { e.preventDefault(); submitAnswer(false); }
      } else if (responseType === "likert" && likertScale) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= likertScale.min && num <= likertScale.max) {
          e.preventDefault();
          submitAnswer(num);
        }
      }

      if ((k === "backspace" || k === "arrowleft") && canGoBack && onBack && !isLoading && !isSubmitting) {
        e.preventDefault(); onBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitAnswer, canGoBack, onBack, isLoading, isSubmitting, responseType, likertScale]);

  const domainConfig = useMemo(() => {
    return assessmentConfigs.find((d) => d.name === currentDomain) ?? { name: currentDomain };
  }, [assessmentConfigs, currentDomain]);

  const pct = Math.round(progress.overallProgress);

  const scale = likertScale ?? { min: 1, max: 5 };
  const likertOptions: LikertOption[] = scale.options?.length
    ? scale.options
    : Array.from(
        { length: Math.floor((scale.max - scale.min) / (scale.step ?? 1)) + 1 },
        (_, i) => ({ value: scale.min + i * (scale.step ?? 1), label: String(scale.min + i * (scale.step ?? 1)) })
      );
  const hasLabels = scale.options?.some((o) => o.label && o.label !== String(o.value));
  const isCompact = likertOptions.length > 6;

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

        {/* Answer UI — varies by responseType */}
        {responseType === "boolean" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => submitAnswer(true)}
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
                onClick={() => submitAnswer(false)}
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
          </>
        )}

        {responseType === "likert" && (
          <>
            {/* Min/max labels for numeric-only scales */}
            {!hasLabels && (scale.minLabel || scale.maxLabel) && (
              <div className="flex justify-between text-[12px] text-dash-ink-500 mb-2 px-1">
                <span>{scale.minLabel ?? ""}</span>
                <span>{scale.maxLabel ?? ""}</span>
              </div>
            )}

            {/* Compact numeric layout (0–10 etc.) */}
            {isCompact ? (
              <>
                {(scale.minLabel || scale.maxLabel) && (
                  <div className="flex justify-between text-[12px] text-dash-ink-500 mb-2 px-1">
                    <span>{scale.minLabel ?? ""}</span>
                    <span>{scale.maxLabel ?? ""}</span>
                  </div>
                )}
                <div className="flex gap-1.5 mb-5">
                  {likertOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => submitAnswer(opt.value)}
                      disabled={selected !== null || isLoading}
                      className={cn(
                        "flex-1 h-[48px] rounded-lg border-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
                        selected === opt.value
                          ? "bg-dash-indigo-500 border-dash-indigo-500 text-white shadow-sm"
                          : "bg-dash-surface border-dash-ink-200 text-dash-ink-700 hover:border-dash-indigo-400 hover:bg-dash-indigo-50 disabled:opacity-40",
                      )}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </>
            ) : hasLabels ? (
              /* Labeled options — stacked list */
              <div className="space-y-2 mb-5">
                {likertOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => submitAnswer(opt.value)}
                    disabled={selected !== null || isLoading}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
                      selected === opt.value
                        ? "bg-dash-indigo-500 border-dash-indigo-500 text-white shadow-sm"
                        : "bg-dash-surface border-dash-ink-200 hover:border-dash-indigo-400 hover:bg-dash-indigo-50 disabled:opacity-40",
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[12px] font-bold shrink-0",
                      selected === opt.value
                        ? "border-white/40 text-white"
                        : "border-dash-ink-300 text-dash-ink-500",
                    )}>
                      {opt.value}
                    </span>
                    <span className={cn(
                      "text-[14px] font-medium",
                      selected === opt.value ? "text-white" : "text-dash-ink-900",
                    )}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Plain numeric scale */
              <div className="flex gap-2 mb-5">
                {likertOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => submitAnswer(opt.value)}
                    disabled={selected !== null || isLoading}
                    className={cn(
                      "flex-1 h-[56px] rounded-xl border-2 text-[15px] font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed",
                      selected === opt.value
                        ? "bg-dash-indigo-500 border-dash-indigo-500 text-white shadow-sm"
                        : "bg-dash-surface border-dash-ink-200 text-dash-ink-700 hover:border-dash-indigo-400 hover:bg-dash-indigo-50 disabled:opacity-40",
                    )}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 text-[11px] text-dash-ink-400">
              {!hasLabels && !isCompact && (
                <span>Press <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">{scale.min}</kbd>–<kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">{scale.max}</kbd> to select</span>
              )}
              {canGoBack && (
                <>
                  {!hasLabels && !isCompact && <span className="text-dash-ink-200">·</span>}
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">←</kbd>
                    {" "}Back
                  </span>
                </>
              )}
            </div>
          </>
        )}

        {responseType === "text" && (
          <div className="mb-5">
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              disabled={selected !== null || isLoading}
              placeholder="Type your response…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-dash-ink-200 bg-dash-canvas text-[15px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500 transition-colors placeholder:text-dash-ink-300 resize-none disabled:opacity-40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && textValue.trim()) {
                  e.preventDefault();
                  submitAnswer(textValue.trim());
                }
              }}
            />
            <button
              onClick={() => submitAnswer(textValue.trim())}
              disabled={!textValue.trim() || selected !== null || isLoading}
              className="mt-3 w-full h-[52px] rounded-xl bg-dash-indigo-500 text-white text-[15px] font-semibold border-none cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Send size={15} strokeWidth={2} />
              Submit
            </button>
            <p className="mt-2 text-center text-[11px] text-dash-ink-400">
              Press <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">Enter</kbd> to submit
              {canGoBack && <> · <kbd className="px-1.5 py-0.5 rounded border border-dash-ink-200 bg-dash-surface font-mono text-[10px] text-dash-ink-500">←</kbd> to go back</>}
            </p>
          </div>
        )}

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
