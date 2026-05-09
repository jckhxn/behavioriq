"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionPresenter } from "@/components/assessment/QuestionPresenter";
import {
  DynamicScoringCalculator,
  type DomainScore,
} from "@/lib/assessment/scoring-dynamic";
import type { QuestionSetConfig } from "@/lib/assessment/types";
import { RISK_COLORS } from "@/lib/constants/domains";
import { RiskLevel } from "@prisma/client";
import {
  BarChart3,
  FileText,
  CheckCircle,
  RotateCcw,
  FlaskConical,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

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

  // Apply skip conditions
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

  // Apply termination rules
  const answeredInDomain = domain.questions.slice(0, current.questionIndex + 1);
  const yesCount = answeredInDomain.filter((q) => responses[q.id] === true).length;
  for (const rule of domain.terminationRules) {
    if (current.questionIndex + 1 >= rule.checkAfterQuestion) {
      if (yesCount < rule.minimumYesToContinue) {
        return findFirstQuestionInDomain(configs, current.domainIndex + 1, responses);
      }
    }
  }

  // Next question in current domain
  if (current.questionIndex + 1 < domain.questions.length) {
    return { domainIndex: current.domainIndex, questionIndex: current.questionIndex + 1 };
  }

  // Next domain
  return findFirstQuestionInDomain(configs, current.domainIndex + 1, responses);
}

interface AssessmentTesterProps {
  /** When provided the select step is skipped and this template is loaded immediately. */
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

  // Load template list only when showing the select UI
  useEffect(() => {
    if (initialTemplateId) return;
    fetch("/api/admin/assessment-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load assessment templates"));
  }, [initialTemplateId]);

  // Auto-start when a templateId is injected from outside
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

      if (loaded.length === 0) {
        throw new Error("This assessment has no configured domains/questions");
      }

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
      setPhase("select");
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
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
          >
            <SelectTrigger className="flex-1 h-9 text-sm">
              <SelectValue placeholder="Select an assessment to preview…" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                  {!t.isActive && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (inactive)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => startTest()}
            disabled={!selectedTemplateId}
          >
            <FlaskConical className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
        {templates.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No assessment templates found. Create one in Assessment Templates above.
          </p>
        )}
      </div>
    );
  }

  // ── Loading phase ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">
          Loading assessment…
        </span>
      </div>
    );
  }

  // ── Taking phase ──────────────────────────────────────────────────────────
  if (phase === "taking" && currentQuestion) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
              TEST MODE — No data is saved
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-xs h-7"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Exit
          </Button>
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
        <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
              TEST RESULTS — Scored using live assessment logic
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={reset} className="h-7 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Test Again
          </Button>
        </div>

        {/* Completion summary */}
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-400">
              Preview Complete
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {answeredCount} questions answered across {results.filter((r) => !r.skipped).length} domains
            </p>
          </div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Domain Risk Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="domain"
                    angle={-35}
                    textAnchor="end"
                    height={65}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    label={{
                      value: "Risk %",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 10,
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [
                          `${Number(value).toFixed(1)}%`,
                          "Risk Score",
                        ]}
                        labelFormatter={(label) => `Domain: ${label}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No scores to display.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Detailed results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Detailed Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    result.skipped ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {result.displayName || result.domain}
                    </h4>
                    {result.skipped ? (
                      <p className="text-xs text-muted-foreground">
                        Skipped — prerequisite not met
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {result.score} / {result.totalPossible} questions ({result.percentage.toFixed(1)}%)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Clinical threshold: {result.clinicallySignificantScore}
                          {result.isClinicallySignificant
                            ? " · ✓ clinically significant"
                            : " · not met"}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    {!result.skipped && (
                      <Progress
                        value={result.percentage}
                        className="w-16 h-2"
                      />
                    )}
                    <Badge
                      className={`text-xs ${RISK_COLORS[result.riskLevel].bg} ${RISK_COLORS[result.riskLevel].text}`}
                    >
                      {result.riskLevel.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Scoring: clinically significant threshold → HIGH · ≥60% → MODERATE · else LOW
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
