"use client";

import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { QuestionPresenter } from "@/components/assessment/QuestionPresenter";
import {
  DynamicScoringCalculator,
  type DomainScore,
} from "@/lib/assessment/scoring-dynamic";
import type { QuestionSetConfig } from "@/lib/assessment/types";
import { RiskLevel } from "@prisma/client";
import {
  BarChart3, FileText, CheckCircle, RotateCcw, FlaskConical,
  ArrowLeft, Loader2, AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type Phase = "select" | "loading" | "taking" | "results";

interface AssessmentTemplate {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  domains: Array<{ order: number; domainTemplate: { name: string } }>;
}

interface ScoredResult extends DomainScore {
  riskLevel: RiskLevel;
}

interface NavState {
  domainIndex: number;
  questionIndex: number;
}

function riskClass(level: RiskLevel): string {
  switch (level) {
    case "HIGH":
    case "VERY_HIGH": return "bg-dash-rose-50 text-dash-rose-700";
    case "MODERATE": return "bg-dash-amber-50 text-dash-amber-700";
    default: return "bg-dash-mint-50 text-dash-mint-700";
  }
}

function findFirstQuestionInDomain(
  configs: QuestionSetConfig[],
  domainIndex: number,
  responses: Record<string, boolean>
): NavState | null {
  if (domainIndex >= configs.length) return null;
  const domain = configs[domainIndex];
  for (const prereq of domain.prerequisites) {
    if (responses[prereq.questionId] !== prereq.requiredValue) {
      return findFirstQuestionInDomain(configs, domainIndex + 1, responses);
    }
  }
  if (domain.questions.length === 0) {
    return findFirstQuestionInDomain(configs, domainIndex + 1, responses);
  }
  return { domainIndex, questionIndex: 0 };
}

function getNextNavState(
  configs: QuestionSetConfig[],
  current: NavState,
  responses: Record<string, boolean>
): NavState | null {
  const domain = configs[current.domainIndex];
  const question = domain.questions[current.questionIndex];
  const answer = responses[question.id];

  const skipCondition = domain.skipConditions.find(
    (sc) => sc.questionId === question.id && sc.skipValue === answer
  );
  if (skipCondition?.skipToQuestion) {
    const targetIdx = domain.questions.findIndex(
      (q) => q.id === skipCondition.skipToQuestion
    );
    if (targetIdx > current.questionIndex) {
      return { domainIndex: current.domainIndex, questionIndex: targetIdx };
    }
  }

  const answeredInDomain = domain.questions.slice(0, current.questionIndex + 1);
  const yesCount = answeredInDomain.filter((q) => responses[q.id] === true).length;
  for (const rule of domain.terminationRules) {
    if (current.questionIndex + 1 >= rule.checkAfterQuestion) {
      if (yesCount < rule.minimumYesToContinue) {
        return findFirstQuestionInDomain(configs, current.domainIndex + 1, responses);
      }
    }
  }

  if (current.questionIndex + 1 < domain.questions.length) {
    return { domainIndex: current.domainIndex, questionIndex: current.questionIndex + 1 };
  }

  return findFirstQuestionInDomain(configs, current.domainIndex + 1, responses);
}

interface AssessmentTesterProps {
  templateId?: string;
}

export function AssessmentTester({ templateId: initialTemplateId }: AssessmentTesterProps = {}) {
  const [phase, setPhase] = useState<Phase>(initialTemplateId ? "loading" : "select");
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId ?? "");
  const [configs, setConfigs] = useState<QuestionSetConfig[]>([]);
  const [navState, setNavState] = useState<NavState>({ domainIndex: 0, questionIndex: 0 });
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<NavState[]>([]);
  const [results, setResults] = useState<ScoredResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTemplateId) return;
    fetch("/api/admin/assessment-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load assessment templates"));
  }, [initialTemplateId]);

  useEffect(() => {
    if (initialTemplateId) startTest(initialTemplateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  const startTest = useCallback(async (idOverride?: string) => {
    const id = idOverride ?? selectedTemplateId;
    if (!id) return;
    setPhase("loading");
    setError(null);

    try {
      const res = await fetch(`/api/admin/assessment-preview/${id}`);
      if (!res.ok) throw new Error("Failed to load assessment config");
      const data = await res.json();
      const loaded: QuestionSetConfig[] = data.configs || [];

      if (loaded.length === 0) throw new Error("This assessment has no configured domains/questions");

      const first = findFirstQuestionInDomain(loaded, 0, {});
      if (!first) throw new Error("No questions found in this assessment");

      setConfigs(loaded);
      setNavState(first);
      setResponses({});
      setHistory([]);
      setResults([]);
      setPhase("taking");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start test");
      setPhase(initialTemplateId ? "loading" : "select");
    }
  }, [selectedTemplateId]);

  const handleAnswer = useCallback(
    async (questionId: string, response: boolean) => {
      const newResponses = { ...responses, [questionId]: response };
      setResponses(newResponses);
      setHistory((prev) => [...prev, navState]);

      const next = getNextNavState(configs, navState, newResponses);
      if (!next) {
        const calculator = new DynamicScoringCalculator(configs);
        const qResponses = Object.entries(newResponses).map(([qId, resp]) => ({
          questionId: qId,
          response: resp,
        }));
        const domainScores = calculator.getAllDomainScores(qResponses);
        const scored: ScoredResult[] = domainScores.map((ds) => ({
          ...ds,
          riskLevel: calculator.mapScoreToRiskLevel(ds),
        }));
        setResults(scored);
        setPhase("results");
      } else {
        setNavState(next);
      }
    },
    [responses, navState, configs]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const currentQ = configs[navState.domainIndex]?.questions[navState.questionIndex];
    if (currentQ) {
      setResponses((r) => {
        const copy = { ...r };
        delete copy[currentQ.id];
        return copy;
      });
    }
    setHistory((h) => h.slice(0, -1));
    setNavState(prev);
  }, [history, navState, configs]);

  const reset = useCallback(() => {
    setConfigs([]);
    setNavState({ domainIndex: 0, questionIndex: 0 });
    setResponses({});
    setHistory([]);
    setResults([]);
    setError(null);
    if (initialTemplateId) {
      setPhase("loading");
      startTest(initialTemplateId);
    } else {
      setPhase("select");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  const totalQuestions = configs.reduce((sum, d) => sum + d.questions.length, 0);
  const answeredCount = Object.keys(responses).length;
  const progress = {
    totalQuestions,
    answeredQuestions: answeredCount,
    completedDomains: navState.domainIndex,
    overallProgress: totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0,
  };

  const currentDomain = configs[navState.domainIndex];
  const currentQuestion = currentDomain?.questions[navState.questionIndex];

  const chartConfig = {
    score: { label: "Risk Score (%)", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const chartData = results.map((r) => ({
    domain: r.displayName || r.domain,
    score: Math.round(r.percentage * 10) / 10,
  }));

  // ── Select phase ──────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 text-[13px] text-dash-rose-700 bg-dash-rose-50 border border-dash-rose-700/20 px-3 py-2 rounded-lg">
            <AlertCircle size={14} strokeWidth={1.6} className="shrink-0" />
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg border border-dash-ink-200 bg-dash-canvas text-[13px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500 cursor-pointer"
          >
            <option value="">Select an assessment to preview…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{!t.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => startTest()}
            disabled={!selectedTemplateId}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-dash-indigo-500 text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dash-indigo-600 transition-colors shrink-0"
          >
            <FlaskConical size={14} strokeWidth={1.6} />
            Preview
          </button>
        </div>
        {templates.length === 0 && !error && (
          <p className="text-xs text-dash-ink-500">
            No assessment templates found. Create one first.
          </p>
        )}
      </div>
    );
  }

  // ── Loading phase ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        {error ? (
          <>
            <div className="flex items-center gap-2 text-[13px] text-dash-rose-700 bg-dash-rose-50 border border-dash-rose-700/20 px-4 py-3 rounded-lg text-center max-w-sm">
              <AlertCircle size={14} strokeWidth={1.6} className="shrink-0" />
              {error}
            </div>
            <button
              onClick={() => startTest()}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-dash-indigo-500 text-white text-[13px] font-semibold border-none cursor-pointer hover:bg-dash-indigo-600 transition-colors"
            >
              Retry
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-dash-ink-500">
            <Loader2 size={16} className="animate-spin text-dash-indigo-500" strokeWidth={1.6} />
            Loading assessment…
          </div>
        )}
      </div>
    );
  }

  // ── Taking phase ──────────────────────────────────────────────────────────
  if (phase === "taking" && currentQuestion) {
    return (
      <div className="space-y-3">
        {/* Test mode banner */}
        <div className="flex items-center justify-between px-3 py-2 bg-dash-amber-50 border border-dash-amber-700/20 rounded-lg">
          <div className="flex items-center gap-2">
            <FlaskConical size={13} strokeWidth={1.6} className="text-dash-amber-700 shrink-0" />
            <span className="text-xs font-semibold text-dash-amber-700">TEST MODE — No data is saved</span>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-medium text-dash-amber-700 hover:text-dash-amber-700 border-none bg-transparent cursor-pointer py-1 px-2 rounded-md hover:bg-dash-amber-700/10 transition-colors"
          >
            <ArrowLeft size={12} strokeWidth={1.6} />
            Exit
          </button>
        </div>

        <QuestionPresenter
          questionId={currentQuestion.id}
          questionText={currentQuestion.text}
          currentDomain={currentDomain?.name || ""}
          progress={progress}
          onAnswer={handleAnswer}
          onBack={history.length > 0 ? handleBack : undefined}
          canGoBack={history.length > 0}
          assessmentConfigs={configs}
        />
      </div>
    );
  }

  // ── Results phase ─────────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <div className="space-y-4">
        {/* Test banner */}
        <div className="flex items-center justify-between px-3 py-2 bg-dash-amber-50 border border-dash-amber-700/20 rounded-lg">
          <div className="flex items-center gap-2">
            <FlaskConical size={13} strokeWidth={1.6} className="text-dash-amber-700 shrink-0" />
            <span className="text-xs font-semibold text-dash-amber-700">TEST RESULTS — Scored using live assessment logic</span>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs font-medium text-dash-amber-700 border-none bg-transparent cursor-pointer py-1 px-2 rounded-md hover:bg-dash-amber-700/10 transition-colors"
          >
            <RotateCcw size={12} strokeWidth={1.6} />
            Test Again
          </button>
        </div>

        {/* Completion summary */}
        <div className="flex items-center gap-3 px-4 py-3 bg-dash-mint-50 border border-dash-mint-700/20 rounded-lg">
          <CheckCircle size={18} strokeWidth={1.6} className="text-dash-mint-700 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-dash-mint-700">Preview Complete</p>
            <p className="text-xs text-dash-mint-700 opacity-80">
              {answeredCount} questions answered across {results.filter((r) => !r.skipped).length} domains
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-dash-ink-900 mb-4">
            <BarChart3 size={15} strokeWidth={1.6} className="text-dash-ink-500" />
            Domain Risk Scores
          </div>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-ink-100)" />
                <XAxis
                  dataKey="domain"
                  angle={-35}
                  textAnchor="end"
                  height={65}
                  tick={{ fontSize: 11, fill: "var(--dash-ink-500)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--dash-ink-500)" }}
                  label={{ value: "Risk %", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, "Risk Score"]}
                      labelFormatter={(label) => `Domain: ${label}`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--dash-indigo-500)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--dash-indigo-500)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-[13px] text-dash-ink-500 py-4">No scores to display.</p>
          )}
        </div>

        {/* Detailed results */}
        <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-5">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-dash-ink-900 mb-4">
            <FileText size={15} strokeWidth={1.6} className="text-dash-ink-500" />
            Detailed Results
          </div>
          <div className="grid gap-2">
            {results.map((result, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-3.5 border border-dash-ink-100 rounded-xl",
                  result.skipped && "opacity-50",
                )}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-dash-ink-900 truncate mb-0.5">
                    {result.displayName || result.domain}
                  </h4>
                  {result.skipped ? (
                    <p className="text-xs text-dash-ink-500">Skipped — prerequisite not met</p>
                  ) : (
                    <>
                      <p className="text-xs text-dash-ink-500">
                        {result.score} / {result.totalPossible} questions ({result.percentage.toFixed(1)}%)
                      </p>
                      <p className="text-xs text-dash-ink-500">
                        Threshold: {result.clinicallySignificantScore}
                        {result.isClinicallySignificant ? " · clinically significant" : " · not met"}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  {!result.skipped && (
                    <Progress value={result.percentage} className="w-14 h-1.5" />
                  )}
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    riskClass(result.riskLevel),
                  )}>
                    {result.riskLevel.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-dash-ink-500 mt-4 text-center">
            Scoring: clinically significant threshold → HIGH · ≥60% → MODERATE · else LOW
          </p>
        </div>
      </div>
    );
  }

  return null;
}
