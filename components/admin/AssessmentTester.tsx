"use client";

import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import { computeDebugScores } from "@/lib/assessment/debugScoring";
import { QuestionPresenter } from "@/components/assessment/QuestionPresenter";
import {
  DynamicScoringCalculator,
  type DomainScore,
} from "@/lib/assessment/scoring-dynamic";
import type { QuestionSetConfig } from "@/lib/assessment/types";
import {
  getNextQuestion,
  computeProgress,
  type ResponseValue,
} from "@/lib/assessment/navigation";
import { evaluateDomainGatingSkip } from "@/lib/assessment/skip-logic";
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

function riskClass(level: RiskLevel): string {
  switch (level) {
    case "HIGH":
    case "VERY_HIGH": return "bg-dash-rose-50 text-dash-rose-700";
    case "MODERATE": return "bg-dash-amber-50 text-dash-amber-700";
    default: return "bg-dash-mint-50 text-dash-mint-700";
  }
}

interface AssessmentTesterProps {
  templateId?: string;
  onExit?: () => void;
}

export function AssessmentTester({ templateId: initialTemplateId, onExit }: AssessmentTesterProps = {}) {
  const [phase, setPhase] = useState<Phase>(initialTemplateId ? "loading" : "select");
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId ?? "");
  const [configs, setConfigs] = useState<QuestionSetConfig[]>([]);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  // history is a stack of response-maps so Back can restore the previous state
  const [history, setHistory] = useState<Record<string, ResponseValue>[]>([]);
  const [results, setResults] = useState<ScoredResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debugMode = useFeatureFlag("debug_assessment");

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
      if (!getNextQuestion(loaded, {})) throw new Error("No questions found in this assessment");

      setConfigs(loaded);
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
    async (questionId: string, response: ResponseValue) => {
      const newResponses = { ...responses, [questionId]: response };
      setHistory((prev) => [...prev, responses]);
      setResponses(newResponses);

      const next = getNextQuestion(configs, newResponses);
      if (!next) {
        const calculator = new DynamicScoringCalculator(configs);
        const qResponses = Object.entries(newResponses).map(([qId, resp]) => ({
          questionId: qId,
          response: resp,
        }));
        const answerMap = new Map(Object.entries(newResponses).map(([k, v]) => [k, String(v)]));
        const domainScores = calculator.getAllDomainScores(qResponses);
        const scored: ScoredResult[] = domainScores.map((ds, i) => {
          const cfg = configs[i];
          const wasGatingSkipped =
            !!cfg?.gatingLogic && evaluateDomainGatingSkip(cfg.gatingLogic, answerMap);
          return {
            ...ds,
            skipped: ds.skipped || wasGatingSkipped,
            skipReason: wasGatingSkipped ? "Gating question skipped domain" : ds.skipReason,
            riskLevel: calculator.mapScoreToRiskLevel(ds),
          };
        });
        setResults(scored);
        setPhase("results");
      }
    },
    [responses, configs]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    setResponses(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const reset = useCallback(() => {
    setConfigs([]);
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

  const activeQuestion = configs.length > 0 ? getNextQuestion(configs, responses) : null;
  const progress = computeProgress(configs, responses);

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
  if (phase === "taking" && activeQuestion) {
    return (
      <div className="space-y-3">
        {/* Test mode banner */}
        <div className="flex items-center justify-between px-3 py-2 bg-dash-amber-50 border border-dash-amber-700/20 rounded-lg">
          <div className="flex items-center gap-2">
            <FlaskConical size={13} strokeWidth={1.6} className="text-dash-amber-700 shrink-0" />
            <span className="text-xs font-semibold text-dash-amber-700">TEST MODE — No data is saved</span>
          </div>
          <button
            onClick={initialTemplateId && onExit ? onExit : reset}
            className="inline-flex items-center gap-1 text-xs font-medium text-dash-amber-700 border-none bg-transparent cursor-pointer py-1 px-2 rounded-md hover:bg-dash-amber-700/10 transition-colors"
          >
            <ArrowLeft size={12} strokeWidth={1.6} />
            Exit
          </button>
        </div>

        <QuestionPresenter
          questionId={activeQuestion.questionId}
          questionText={activeQuestion.text}
          currentDomain={activeQuestion.domain}
          progress={progress}
          onAnswer={handleAnswer}
          onBack={history.length > 0 ? handleBack : undefined}
          canGoBack={history.length > 0}
          assessmentConfigs={configs}
          responseType={activeQuestion.responseType}
          likertScale={activeQuestion.likertScale}
          debugMode={debugMode}
          debugResponses={debugMode ? Object.entries(responses).map(([questionId, response]) => ({ questionId, response })) : undefined}
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
              {Object.keys(responses).length} questions answered across {results.filter((r) => !r.skipped).length} domains
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
                    <p className="text-xs text-dash-ink-500">
                      Skipped — {result.skipReason ?? "prerequisite not met"}
                    </p>
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

        {/* Debug panel */}
        {debugMode && (() => {
          const debugResponseList = Object.entries(responses).map(([questionId, response]) => ({ questionId, response }));
          const debugData = configs.length > 0 ? computeDebugScores(configs, debugResponseList) : null;
          return (
            <details className="border border-dash-amber-300 rounded-xl overflow-hidden text-[11px] font-mono">
              <summary className="bg-dash-amber-100 px-4 py-2.5 cursor-pointer text-dash-amber-800 font-semibold select-none list-none flex items-center gap-2">
                <span className="text-[10px] bg-dash-amber-700 text-white px-1.5 py-0.5 rounded font-bold tracking-wide">DEBUG</span>
                Scoring breakdown — {Object.keys(responses).length} questions answered
              </summary>
              <div className="bg-dash-amber-50 px-4 py-4 space-y-5">
                {debugData && debugData.questionScores.length > 0 && (
                  <div>
                    <div className="text-dash-ink-500 mb-2 font-semibold uppercase tracking-wide text-[10px]">Per-question</div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-dash-ink-400 text-left">
                          <th className="pr-4 pb-1 font-normal">question id</th>
                          <th className="pr-4 pb-1 font-normal">domain</th>
                          <th className="pr-4 pb-1 font-normal">response</th>
                          <th className="pr-4 pb-1 font-normal">score</th>
                          <th className="pb-1 font-normal">max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debugData.questionScores.map((qs) => (
                          <tr key={qs.questionId} className="border-t border-dash-amber-200">
                            <td className="pr-4 py-0.5 text-dash-ink-600">{qs.questionId}</td>
                            <td className="pr-4 py-0.5 text-dash-ink-500">{qs.domainName}</td>
                            <td className="pr-4 py-0.5 text-dash-ink-700">{String(qs.response)}</td>
                            <td className="pr-4 py-0.5 text-dash-ink-900 font-semibold">{qs.score}</td>
                            <td className="py-0.5 text-dash-ink-500">{qs.maxScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div>
                  <div className="text-dash-ink-500 mb-2 font-semibold uppercase tracking-wide text-[10px]">Per-domain totals</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-dash-ink-400 text-left">
                        <th className="pr-4 pb-1 font-normal">domain</th>
                        <th className="pr-4 pb-1 font-normal">answered</th>
                        <th className="pr-4 pb-1 font-normal">raw</th>
                        <th className="pr-4 pb-1 font-normal">max</th>
                        <th className="pr-4 pb-1 font-normal">%</th>
                        <th className="pb-1 font-normal">risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-t border-dash-amber-200">
                          <td className="pr-4 py-0.5 text-dash-ink-600">{r.displayName || r.domain}</td>
                          <td className="pr-4 py-0.5 text-dash-ink-700">{r.skipped ? "—" : r.questionsAnswered}</td>
                          <td className="pr-4 py-0.5 text-dash-ink-900 font-semibold">{r.skipped ? "—" : r.score}</td>
                          <td className="pr-4 py-0.5 text-dash-ink-500">{r.skipped ? "—" : r.totalPossible}</td>
                          <td className="pr-4 py-0.5 text-dash-ink-700">{r.skipped ? "skipped" : `${r.percentage.toFixed(1)}%`}</td>
                          <td className="py-0.5 text-dash-ink-900 font-semibold">{r.riskLevel.replace("_", " ")}</td>
                        </tr>
                      ))}
                      {results.filter((r) => !r.skipped).length > 1 && (() => {
                        const activeResults = results.filter((r) => !r.skipped);
                        const totalRaw = activeResults.reduce((s, r) => s + r.score, 0);
                        const totalMax = activeResults.reduce((s, r) => s + r.totalPossible, 0);
                        const totalPct = totalMax > 0 ? (totalRaw / totalMax) * 100 : 0;
                        return (
                          <tr className="border-t-2 border-dash-amber-400 font-semibold">
                            <td className="pr-4 py-1 text-dash-ink-900">TOTAL</td>
                            <td className="pr-4 py-1 text-dash-ink-700">—</td>
                            <td className="pr-4 py-1 text-dash-ink-900">{totalRaw}</td>
                            <td className="pr-4 py-1 text-dash-ink-500">{totalMax}</td>
                            <td className="pr-4 py-1 text-dash-ink-700">{totalPct.toFixed(1)}%</td>
                            <td className="py-1 text-dash-ink-400">—</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          );
        })()}
      </div>
    );
  }

  return null;
}
