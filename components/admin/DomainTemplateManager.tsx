"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Download,
  ChevronUp,
  ChevronDown,
  Brain,
  ClipboardList,
  X,
  BookOpen,
  Activity,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionOption {
  value: number | string;
  label: string;
}

type QuestionType =
  | "likert4"
  | "likert5"
  | "likert7"
  | "likert10"
  | "yes_no"
  | "multiple_choice"
  | "text";

// Questions are now just text items — type/options live at the domain level
interface Question {
  id: string;
  text: string;
  isTrial?: boolean;
}

interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions: any;
  resources?: any;
  scoringConfig?: any;
  createdAt: string;
  createdBy: { name: string; email: string };
  _count: { assessmentTemplates: number };
}

type Comparator = ">=" | ">" | "<=" | "<" | "=";
type SkipWhen = "met" | "not_met";
type Aggregation = "sum" | "any" | "all";

interface DomainThresholdRule {
  enabled: boolean;
  comparator: Comparator;
  threshold: number;
  skipWhen: SkipWhen;
}

interface QuestionSubsetRule {
  enabled: boolean;
  questionIndexes: number[];
  questionIds?: string[];
  aggregation: Aggregation;
  comparator: Comparator;
  threshold: number;
  skipWhen: SkipWhen;
}

interface RiskThresholdConfig {
  moderate?: number;
  high?: number;
  very_high?: number;
}

// ─── Default response options per question type ───────────────────────────────

const QUESTION_TYPE_OPTIONS: Record<QuestionType, QuestionOption[]> = {
  likert4: [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" },
  ],
  likert5: [
    { value: 0, label: "Never" },
    { value: 1, label: "Rarely" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Often" },
    { value: 4, label: "Always" },
  ],
  likert7: [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Somewhat Disagree" },
    { value: 4, label: "Neutral" },
    { value: 5, label: "Somewhat Agree" },
    { value: 6, label: "Agree" },
    { value: 7, label: "Strongly Agree" },
  ],
  likert10: Array.from({ length: 11 }, (_, value) => ({
    value,
    label: String(value),
  })),
  yes_no: [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ],
  multiple_choice: [],
  text: [],
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  likert4: "Likert 4-pt — Not at all → Nearly every day (PHQ/GAD)",
  likert5: "Likert 5-pt — Never → Very Often",
  likert7: "Likert 7-pt — Strongly Disagree → Strongly Agree",
  likert10: "Likert 11-pt — 0 to 10 (numeric scale)",
  yes_no: "Yes / No",
  multiple_choice: "Multiple Choice (custom options)",
  text: "Free Text Response",
};

// Rich metadata for the domain-level response type selector
const RESPONSE_TYPE_META: {
  type: QuestionType;
  label: string;
  description: string;
  preview: string;
}[] = [
  {
    type: "yes_no",
    label: "Yes / No",
    description: "Binary clinical screening",
    preview: "No · Yes",
  },
  {
    type: "likert4",
    label: "Likert 4-pt",
    description: "PHQ-9 / GAD-7 frequency scale",
    preview: "Not at all · Several days · More than half the days · Nearly every day",
  },
  {
    type: "likert5",
    label: "Likert 5-pt",
    description: "Behavioral frequency scale",
    preview: "Never · Rarely · Sometimes · Often · Very Often",
  },
  {
    type: "likert7",
    label: "Likert 7-pt",
    description: "Agreement / attitude scale",
    preview: "Strongly Disagree → Strongly Agree",
  },
  {
    type: "likert10",
    label: "0 – 10 Scale",
    description: "Numeric clinician-rated scale",
    preview: "0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10",
  },
  {
    type: "text",
    label: "Free Text",
    description: "Open-ended written response",
    preview: "Patient types a free-form answer",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Custom options you define",
    preview: "Define your own answer options below",
  },
];

// ─── Pre-built validated instruments ─────────────────────────────────────────

interface PsychTemplate {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  slug: string;
  scoringNote: string;
  responseType: QuestionType;
  questions: { text: string }[];
}

const makeQ = (text: string): { text: string } => ({ text });

const PSYCH_INSTRUMENTS: PsychTemplate[] = [
  {
    id: "phq9",
    name: "Patient Health Questionnaire-9",
    shortName: "PHQ-9",
    description: "Validated 9-item depression screen",
    icon: <Activity className="h-5 w-5" />,
    slug: "phq-9-depression",
    scoringNote:
      "0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe depression",
    responseType: "likert4",
    questions: [
      makeQ("Little interest or pleasure in doing things"),
      makeQ("Feeling down, depressed, or hopeless"),
      makeQ("Trouble falling or staying asleep, or sleeping too much"),
      makeQ("Feeling tired or having little energy"),
      makeQ("Poor appetite or overeating"),
      makeQ(
        "Feeling bad about yourself—or that you are a failure or have let yourself or your family down"
      ),
      makeQ(
        "Trouble concentrating on things, such as reading the newspaper or watching television"
      ),
      makeQ(
        "Moving or speaking so slowly that other people could have noticed. Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual"
      ),
      makeQ(
        "Thoughts that you would be better off dead, or of hurting yourself in some way"
      ),
    ],
  },
  {
    id: "gad7",
    name: "Generalized Anxiety Disorder-7",
    shortName: "GAD-7",
    description: "Validated 7-item anxiety screen",
    icon: <Brain className="h-5 w-5" />,
    slug: "gad-7-anxiety",
    scoringNote:
      "0–4 minimal, 5–9 mild, 10–14 moderate, 15–21 severe anxiety",
    responseType: "likert4",
    questions: [
      makeQ("Feeling nervous, anxious, or on edge"),
      makeQ("Not being able to stop or control worrying"),
      makeQ("Worrying too much about different things"),
      makeQ("Trouble relaxing"),
      makeQ("Being so restless that it is hard to sit still"),
      makeQ("Becoming easily annoyed or irritable"),
      makeQ("Feeling afraid as if something awful might happen"),
    ],
  },
  {
    id: "adhd",
    name: "ADHD Self-Report Scale (Screener)",
    shortName: "ASRS-v1.1",
    description: "WHO Adult ADHD screener — Part A (6 items)",
    icon: <ClipboardList className="h-5 w-5" />,
    slug: "adhd-asrs-screener",
    scoringNote:
      "≥4 positive responses (items 1–3: Never/Rarely/Sometimes; items 4–6: Often/Very Often) suggests probable ADHD",
    responseType: "likert5",
    questions: [
      makeQ("How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?"),
      makeQ("How often do you have difficulty getting things in order when you have to do a task that requires organization?"),
      makeQ("How often do you have problems remembering appointments or obligations?"),
      makeQ("When you have a task that requires a lot of thought, how often do you avoid or delay getting started?"),
      makeQ("How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?"),
      makeQ("How often do you feel overly active and compelled to do things, like you were driven by a motor?"),
    ],
  },
  {
    id: "pcptsd",
    name: "Primary Care PTSD Screen",
    shortName: "PC-PTSD-5",
    description: "5-item PTSD screen for primary care (DSM-5)",
    icon: <AlertCircle className="h-5 w-5" />,
    slug: "pc-ptsd-5",
    scoringNote:
      "Score ≥3 is the recommended cut-off for further PTSD assessment",
    responseType: "yes_no",
    questions: [
      makeQ("In the past month, have you had nightmares about it or thought about it when you did not want to?"),
      makeQ("Tried hard not to think about it or went out of your way to avoid situations that reminded you of it?"),
      makeQ("Were constantly on guard, watchful, or easily startled?"),
      makeQ("Felt numb or detached from people, activities, or your surroundings?"),
      makeQ("Felt guilty or unable to stop blaming yourself or others for the event or problems it caused?"),
    ],
  },
  {
    id: "custom",
    name: "Custom Domain",
    shortName: "Custom",
    description: "Start blank and build your own question set",
    icon: <BookOpen className="h-5 w-5" />,
    slug: "",
    scoringNote: "",
    responseType: "yes_no",
    questions: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = () =>
  `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Type and options now live at domain level — questions are just text items
const questionsToJson = (questions: Question[]): any[] =>
  questions.map((q) => ({
    id: q.id,
    text: q.text,
    ...(q.isTrial !== undefined ? { isTrial: q.isTrial } : {}),
  }));

const jsonToQuestions = (json: any): Question[] | null => {
  if (!Array.isArray(json)) return null;
  try {
    return json.map(
      (q: any): Question => ({
        id: q.id || generateId(),
        text: q.text || q.title || "",
        isTrial: q.isTrial,
      })
    );
  } catch {
    return null;
  }
};

// ─── QuestionCard ─────────────────────────────────────────────────────────────
// Simplified — type/options are domain-level, so each card is just the question text

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => (
  <div className="border rounded-xl bg-card p-4 shadow-sm">
    <div className="flex items-start gap-3">
      {/* Number + reorder controls */}
      <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
        <span className="text-xs font-bold text-muted-foreground bg-muted w-7 h-7 rounded-full flex items-center justify-center mb-1">
          {index + 1}
        </span>
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          title="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Question text */}
      <Textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter your question here..."
        className="flex-1 text-sm resize-none leading-relaxed min-h-[72px]"
        rows={3}
      />

      {/* Delete */}
      <button
        onClick={onDelete}
        className="mt-1 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
        title="Remove question"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// ─── Instrument selector ──────────────────────────────────────────────────────

interface InstrumentSelectorProps {
  onSelect: (instrument: PsychTemplate) => void;
  onCancel: () => void;
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  onSelect,
  onCancel,
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-auto px-6 py-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          Start from a validated instrument
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Questions are pre-populated from evidence-based tools. You can edit
          them after selecting.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PSYCH_INSTRUMENTS.map((instrument) => (
          <button
            key={instrument.id}
            onClick={() => onSelect(instrument)}
            className="text-left border rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-primary/60 group-hover:text-primary transition-colors">
                {instrument.icon}
              </span>
              <span className="text-sm font-bold text-primary">
                {instrument.shortName}
              </span>
            </div>
            <p className="text-sm font-semibold leading-snug mb-1">
              {instrument.name}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {instrument.description}
            </p>
            {instrument.questions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {instrument.questions.length} questions included
              </p>
            )}
          </button>
        ))}
      </div>
    </div>

    <div className="border-t px-6 py-4 bg-muted/30 shrink-0">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
);

// ─── Domain form ──────────────────────────────────────────────────────────────

interface DomainFormProps {
  initial?: DomainTemplate | null;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const DomainForm: React.FC<DomainFormProps> = ({
  initial,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [stage, setStage] = useState<"instrument" | "build">(
    initial ? "build" : "instrument"
  );

  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [scoringNote, setScoringNote] = useState(
    (initial?.resources as any)?.scoringNote || ""
  );

  // Domain-level response type (single type applies to all questions)
  const [responseType, setResponseType] = useState<QuestionType>(
    (initial?.scoringConfig as any)?.responseType || "yes_no"
  );
  // Custom options — only used when responseType === "multiple_choice"
  const [customOptions, setCustomOptions] = useState<QuestionOption[]>(
    (initial?.scoringConfig as any)?.responseOptions &&
    (initial?.scoringConfig as any)?.responseType === "multiple_choice"
      ? (initial?.scoringConfig as any).responseOptions
      : []
  );

  const [scoringConfigJson, setScoringConfigJson] = useState(
    initial?.scoringConfig
      ? JSON.stringify(initial.scoringConfig, null, 2)
      : ""
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const initialRiskThresholds = (initial?.scoringConfig as any)?.riskThresholds
    || (initial?.scoringConfig as any)?.thresholds
    || {};
  const [riskThresholds, setRiskThresholds] = useState<RiskThresholdConfig>({
    moderate:
      Number.isFinite(Number(initialRiskThresholds?.moderate))
        ? Number(initialRiskThresholds.moderate)
        : undefined,
    high:
      Number.isFinite(Number(initialRiskThresholds?.high))
        ? Number(initialRiskThresholds.high)
        : undefined,
    very_high:
      Number.isFinite(Number(initialRiskThresholds?.very_high))
        ? Number(initialRiskThresholds.very_high)
        : undefined,
  });

  const initialSkipLogic = (initial?.scoringConfig as any)?.skipLogic || {};
  const initialQuestions = initial?.questions ? jsonToQuestions(initial.questions) || [] : [];
  const [domainThresholdRule, setDomainThresholdRule] = useState<DomainThresholdRule>({
    enabled: Boolean(initialSkipLogic?.domainThreshold?.enabled),
    comparator: (initialSkipLogic?.domainThreshold?.comparator as Comparator) || "<",
    threshold: Number(initialSkipLogic?.domainThreshold?.threshold ?? 0),
    skipWhen: (initialSkipLogic?.domainThreshold?.skipWhen as SkipWhen) || "met",
  });
  const [questionSubsetRule, setQuestionSubsetRule] = useState<QuestionSubsetRule>({
    enabled: Boolean(initialSkipLogic?.questionSubsetThreshold?.enabled),
    questionIndexes: Array.isArray(initialSkipLogic?.questionSubsetThreshold?.questionIndexes)
      ? initialSkipLogic.questionSubsetThreshold.questionIndexes
      : [],
    questionIds: Array.isArray(initialSkipLogic?.questionSubsetThreshold?.questionIds)
      ? initialSkipLogic.questionSubsetThreshold.questionIds
      : [],
    aggregation: (initialSkipLogic?.questionSubsetThreshold?.aggregation as Aggregation) || "sum",
    comparator:
      (initialSkipLogic?.questionSubsetThreshold?.comparator as Comparator) || "<",
    threshold: Number(initialSkipLogic?.questionSubsetThreshold?.threshold ?? 0),
    skipWhen: (initialSkipLogic?.questionSubsetThreshold?.skipWhen as SkipWhen) || "met",
  });

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedSubsetQuestionIds, setSelectedSubsetQuestionIds] = useState<string[]>(() => {
    const configuredIds: string[] = Array.isArray(initialSkipLogic?.questionSubsetThreshold?.questionIds)
      ? initialSkipLogic.questionSubsetThreshold.questionIds
      : [];

    if (configuredIds.length > 0) return configuredIds;

    const configuredIndexes: number[] = Array.isArray(initialSkipLogic?.questionSubsetThreshold?.questionIndexes)
      ? initialSkipLogic.questionSubsetThreshold.questionIndexes
      : [];

    return configuredIndexes
      .map((oneBasedIndex) => initialQuestions[oneBasedIndex - 1]?.id)
      .filter((id): id is string => Boolean(id));
  });

  useEffect(() => {
    const validIds = new Set(questions.map((q) => q.id));
    setSelectedSubsetQuestionIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [questions]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial) setSlug(generateSlug(val));
  };

  const applyInstrument = (instrument: PsychTemplate) => {
    if (instrument.id !== "custom") {
      setName(instrument.name);
      setSlug(instrument.slug);
      setDescription(instrument.description);
      setScoringNote(instrument.scoringNote);
      // Set the domain-level response type from the instrument definition
      setResponseType(instrument.responseType);
      // Strip per-question type/options — store only text
      setQuestions(
        instrument.questions.map((q) => ({ id: generateId(), text: q.text }))
      );
    }
    setStage("build");
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: generateId(), text: "" },
    ]);
  };

  const updateQuestion = (index: number, q: Question) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = q;
      return next;
    });
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a domain name");
      return;
    }
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      toast.error("All questions must have text");
      return;
    }

    // Build the domain-level response options
    const responseOptions =
      responseType === "multiple_choice"
        ? customOptions
        : responseType === "text"
        ? []
        : QUESTION_TYPE_OPTIONS[responseType] ?? [];

    const payload: any = {
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      description: description.trim() || undefined,
      questions: questionsToJson(questions),
    };

    if (scoringNote.trim()) {
      payload.resources = { scoringNote: scoringNote.trim() };
    }

    let parsedScoringConfig: any = {};
    if (scoringConfigJson.trim()) {
      try {
        parsedScoringConfig = JSON.parse(scoringConfigJson);
      } catch {
        toast.error("Invalid JSON in scoring configuration");
        return;
      }
    }

    // Always write responseType + responseOptions at the domain level
    parsedScoringConfig = {
      ...parsedScoringConfig,
      responseType,
      responseOptions,
    };

    const nextSkipLogic: any = {};
    if (domainThresholdRule.enabled && questionSubsetRule.enabled) {
      toast.error("Choose only one skip logic mode: whole domain OR question subset");
      return;
    }

    if (domainThresholdRule.enabled) {
      nextSkipLogic.domainThreshold = {
        enabled: true,
        comparator: domainThresholdRule.comparator,
        threshold: Number(domainThresholdRule.threshold),
        skipWhen: domainThresholdRule.skipWhen,
      };
    }

    if (questionSubsetRule.enabled) {
      if (selectedSubsetQuestionIds.length === 0) {
        toast.error("Question subset rule requires selecting at least one authored question");
        return;
      }

      const selectedSet = new Set(selectedSubsetQuestionIds);
      const mappedIndexes = questions
        .map((question, index) => (selectedSet.has(question.id) ? index + 1 : -1))
        .filter((index) => index > 0);

      if (mappedIndexes.length === 0) {
        toast.error("Selected subset questions are invalid. Please reselect and try again.");
        return;
      }

      nextSkipLogic.questionSubsetThreshold = {
        enabled: true,
        questionIndexes: mappedIndexes,
        questionIds: selectedSubsetQuestionIds,
        aggregation: questionSubsetRule.aggregation,
        comparator: questionSubsetRule.comparator,
        threshold: Number(questionSubsetRule.threshold),
        skipWhen: questionSubsetRule.skipWhen,
      };
    }

    if (Object.keys(nextSkipLogic).length > 0) {
      payload.scoringConfig = {
        ...parsedScoringConfig,
        skipLogic: {
          ...(parsedScoringConfig?.skipLogic || {}),
          ...nextSkipLogic,
        },
      };
    } else if (Object.keys(parsedScoringConfig).length > 0) {
      payload.scoringConfig = parsedScoringConfig;
    }

    const nextRiskThresholds: RiskThresholdConfig = {};
    if (typeof riskThresholds.moderate === "number") {
      nextRiskThresholds.moderate = riskThresholds.moderate;
    }
    if (typeof riskThresholds.high === "number") {
      nextRiskThresholds.high = riskThresholds.high;
    }
    if (typeof riskThresholds.very_high === "number") {
      nextRiskThresholds.very_high = riskThresholds.very_high;
    }

    if (Object.keys(nextRiskThresholds).length > 0) {
      payload.scoringConfig = {
        ...(payload.scoringConfig || parsedScoringConfig),
        riskThresholds: nextRiskThresholds,
      };
    }

    await onSave(payload);
  };

  const formSections = [
    { id: "domain-info", label: "Domain Info" },
    { id: "response-format", label: "Response Format" },
    { id: "scoring-reference", label: "Scoring Reference" },
    { id: "risk-thresholds", label: "Risk Thresholds" },
    { id: "skip-logic", label: "Skip Logic" },
    { id: "questions", label: "Questions" },
    { id: "advanced-config", label: "Advanced Config" },
  ];

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    // Find the Radix ScrollArea viewport (the actual scrolling element)
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    const target = document.getElementById(id);
    if (!target) return;
    if (viewport) {
      // Scroll within the ScrollArea viewport, offset by the sticky nav height (~88px)
      const targetTop =
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop -
        100;
      viewport.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (stage === "instrument") {
    return (
      <InstrumentSelector
        onSelect={applyInstrument}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" ref={scrollAreaRef}>
      <ScrollArea className="flex-1 min-h-0">
        <div className="w-full px-10 py-10 space-y-10">
          <div className="sticky top-0 z-10 -mx-10 mb-2 border-b bg-background/95 px-10 pb-4 pt-1 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Form Sections
            </p>
            <nav className="flex flex-wrap gap-2">
              {formSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground"
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Domain info */}
          <section id="domain-info" className="space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Domain Information</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Identify this clinical domain or subscale
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="d-name" className="text-sm font-medium">
                  Domain Name{" "}
                  <span className="text-destructive" aria-hidden>*</span>
                </Label>
                <Input
                  id="d-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. PHQ-9 Depression Screen"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="d-slug" className="text-sm font-medium">
                  Slug{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (auto-generated, URL-safe identifier)
                  </span>
                </Label>
                <Input
                  id="d-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="phq-9-depression-screen"
                  className="h-10 font-mono text-sm text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="d-desc" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="d-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this domain measure? Who is it for?"
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Response Format — domain-level, applies to ALL questions */}
          <section id="response-format" className="space-y-5 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Response Format</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                One response type applies to every question in this domain.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {RESPONSE_TYPE_META.map((meta) => (
                <button
                  key={meta.type}
                  type="button"
                  onClick={() => setResponseType(meta.type)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    responseType === meta.type
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "hover:border-muted-foreground/30 hover:bg-muted/40"
                  }`}
                >
                  <p className="text-sm font-semibold leading-tight">{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {meta.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2 leading-relaxed">
                    {meta.preview}
                  </p>
                </button>
              ))}
            </div>

            {/* Options preview / custom editor */}
            {responseType === "text" ? (
              <div className="bg-muted/40 rounded-xl px-4 py-3 border">
                <p className="text-xs text-muted-foreground italic">
                  Patient will type a free-form written answer — no score is collected.
                </p>
              </div>
            ) : responseType === "multiple_choice" ? (
              <div className="bg-muted/40 rounded-xl p-4 border space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Define the answer options patients will see:
                </p>
                {customOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={String(opt.value ?? i)}
                      onChange={(e) => {
                        const updated = [...customOptions];
                        updated[i] = { ...updated[i], value: Number(e.target.value) };
                        setCustomOptions(updated);
                      }}
                      placeholder="Score"
                      className="h-8 w-20 text-sm font-mono"
                    />
                    <Input
                      value={opt.label}
                      onChange={(e) => {
                        const updated = [...customOptions];
                        updated[i] = { ...updated[i], label: e.target.value };
                        setCustomOptions(updated);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="h-8 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomOptions(customOptions.filter((_, j) => j !== i))}
                      className="shrink-0 p-1 hover:text-destructive text-muted-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomOptions([
                      ...customOptions,
                      { value: customOptions.length, label: "" },
                    ])
                  }
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add option
                </Button>
              </div>
            ) : (
              <div className="bg-muted/40 rounded-xl px-4 py-3 border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Patient responds with:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(QUESTION_TYPE_OPTIONS[responseType] ?? []).map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-background border rounded-md px-2.5 py-1"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {opt.value}
                      </span>
                      <span className="text-xs">{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* Scoring guide */}
          <section id="scoring-reference" className="space-y-3 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">
                Clinical Scoring Reference
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Interpretation thresholds for clinicians — shown alongside
                results (optional)
              </p>
            </div>
            <Textarea
              value={scoringNote}
              onChange={(e) => setScoringNote(e.target.value)}
              placeholder="e.g. 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe"
              className="resize-none text-sm"
              rows={2}
            />
          </section>

          <Separator />

          <section id="risk-thresholds" className="space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Risk Thresholds</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Set domain score cutoffs in the UI. These values drive runtime risk mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Moderate from score</Label>
                <Input
                  type="number"
                  value={riskThresholds.moderate ?? ""}
                  onChange={(e) =>
                    setRiskThresholds((prev) => ({
                      ...prev,
                      moderate:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 5"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">High from score</Label>
                <Input
                  type="number"
                  value={riskThresholds.high ?? ""}
                  onChange={(e) =>
                    setRiskThresholds((prev) => ({
                      ...prev,
                      high:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 10"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Very High from score</Label>
                <Input
                  type="number"
                  value={riskThresholds.very_high ?? ""}
                  onChange={(e) =>
                    setRiskThresholds((prev) => ({
                      ...prev,
                      very_high:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  placeholder="e.g. 15"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </section>

          <Separator />

          <section id="skip-logic" className="space-y-4 scroll-mt-24">
            <div>
              <h3 className="text-base font-semibold">Skip Logic Rules</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configure when a domain should be skipped based on score thresholds.
              </p>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Whole Domain Threshold</p>
                  <p className="text-xs text-muted-foreground">
                    Evaluate score across the entire domain.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={domainThresholdRule.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const nextEnabled = !domainThresholdRule.enabled;
                    setDomainThresholdRule((prev) => ({
                      ...prev,
                      enabled: nextEnabled,
                    }));
                    if (nextEnabled) {
                      setQuestionSubsetRule((prev) => ({
                        ...prev,
                        enabled: false,
                      }));
                    }
                  }}
                >
                  {domainThresholdRule.enabled ? "Enabled" : "Enable"}
                </Button>
              </div>

              {domainThresholdRule.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Condition</Label>
                    <Select
                      value={domainThresholdRule.comparator}
                      onValueChange={(v) =>
                        setDomainThresholdRule((prev) => ({
                          ...prev,
                          comparator: v as Comparator,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Threshold</Label>
                    <Input
                      type="number"
                      value={domainThresholdRule.threshold}
                      onChange={(e) =>
                        setDomainThresholdRule((prev) => ({
                          ...prev,
                          threshold: Number(e.target.value || 0),
                        }))
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Skip Domain When</Label>
                    <Select
                      value={domainThresholdRule.skipWhen}
                      onValueChange={(v) =>
                        setDomainThresholdRule((prev) => ({
                          ...prev,
                          skipWhen: v as SkipWhen,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="met">Condition is met</SelectItem>
                        <SelectItem value="not_met">Condition is not met</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Question Subset Threshold</p>
                  <p className="text-xs text-muted-foreground">
                    Evaluate only selected authored questions from this domain.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={questionSubsetRule.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const nextEnabled = !questionSubsetRule.enabled;
                    setQuestionSubsetRule((prev) => ({
                      ...prev,
                      enabled: nextEnabled,
                    }));
                    if (nextEnabled) {
                      setDomainThresholdRule((prev) => ({
                        ...prev,
                        enabled: false,
                      }));
                    }
                  }}
                >
                  {questionSubsetRule.enabled ? "Enabled" : "Enable"}
                </Button>
              </div>

              {questionSubsetRule.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Select Questions</Label>
                    {questions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Add questions first, then choose which ones participate in the subset threshold.
                      </p>
                    ) : (
                      <div className="max-h-44 overflow-auto rounded-md border p-2 space-y-1">
                        {questions.map((question, index) => {
                          const isSelected = selectedSubsetQuestionIds.includes(question.id);
                          return (
                            <button
                              key={question.id}
                              type="button"
                              onClick={() => {
                                setSelectedSubsetQuestionIds((prev) =>
                                  prev.includes(question.id)
                                    ? prev.filter((id) => id !== question.id)
                                    : [...prev, question.id]
                                );
                              }}
                              className={`w-full text-left rounded-md border px-2.5 py-2 text-xs transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                              }`}
                            >
                              <span className="font-medium">Q{index + 1}.</span>{" "}
                              {question.text.trim() || "Untitled question"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Aggregation</Label>
                    <Select
                      value={questionSubsetRule.aggregation}
                      onValueChange={(v) =>
                        setQuestionSubsetRule((prev) => ({
                          ...prev,
                          aggregation: v as Aggregation,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum of subset scores</SelectItem>
                        <SelectItem value="any">Any question score</SelectItem>
                        <SelectItem value="all">All question scores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Condition</Label>
                    <Select
                      value={questionSubsetRule.comparator}
                      onValueChange={(v) =>
                        setQuestionSubsetRule((prev) => ({
                          ...prev,
                          comparator: v as Comparator,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="<=">&lt;=</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value=">=">&gt;=</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Threshold</Label>
                    <Input
                      type="number"
                      value={questionSubsetRule.threshold}
                      onChange={(e) =>
                        setQuestionSubsetRule((prev) => ({
                          ...prev,
                          threshold: Number(e.target.value || 0),
                        }))
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Skip Domain When</Label>
                    <Select
                      value={questionSubsetRule.skipWhen}
                      onValueChange={(v) =>
                        setQuestionSubsetRule((prev) => ({
                          ...prev,
                          skipWhen: v as SkipWhen,
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="met">Condition is met</SelectItem>
                        <SelectItem value="not_met">Condition is not met</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Question builder */}
          <section id="questions" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Questions</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {questions.length === 0
                    ? "No questions yet — add your first one below"
                    : `${questions.length} question${questions.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {!initial && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStage("instrument")}
                  className="text-xs text-muted-foreground h-8"
                >
                  ← Change instrument
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  total={questions.length}
                  onChange={(updated) => updateQuestion(i, updated)}
                  onDelete={() => deleteQuestion(i)}
                  onMoveUp={() => moveQuestion(i, i - 1)}
                  onMoveDown={() => moveQuestion(i, i + 1)}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="w-full h-12 border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </section>

          {/* Advanced scoring config */}
          <Separator />
          <section id="advanced-config" className="space-y-3 scroll-mt-24">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
              Advanced: Machine-readable Scoring Config (JSON)
            </button>

            {showAdvanced && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Optional. Structured scoring rules consumed by the AI
                  reporting engine. Leave blank if not needed.
                </p>
                <Textarea
                  value={scoringConfigJson}
                  onChange={(e) => setScoringConfigJson(e.target.value)}
                  placeholder='{"thresholds": {"minimal": [0,4], "mild": [5,9], "moderate": [10,14]}}'
                  className="font-mono text-sm resize-none"
                  rows={6}
                />
              </div>
            )}
          </section>

          <div className="h-2" />
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="border-t px-6 py-4 bg-background flex items-center justify-between shrink-0">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="min-w-36"
        >
          {isSaving
            ? "Saving..."
            : initial
            ? "Update Domain"
            : "Create Domain"}
        </Button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DomainTemplateManager: React.FC = () => {
  const [domainTemplates, setDomainTemplates] = useState<DomainTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DomainTemplate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchDomainTemplates();
  }, []);

  const fetchDomainTemplates = async () => {
    try {
      const response = await fetch("/api/admin/domain-templates");
      if (response.ok) {
        const data = await response.json();
        setDomainTemplates(data);
      } else {
        toast.error("Failed to fetch domain templates");
      }
    } catch {
      toast.error("Error fetching domain templates");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedTemplate(null);
    setIsSheetOpen(true);
  };

  const openEdit = (template: DomainTemplate) => {
    setSelectedTemplate(template);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    if (isSaving) return;
    setIsSheetOpen(false);
    setSelectedTemplate(null);
  };

  const handleSave = async (payload: any) => {
    setIsSaving(true);
    try {
      const method = selectedTemplate ? "PUT" : "POST";
      const body = selectedTemplate
        ? { id: selectedTemplate.id, ...payload }
        : payload;

      const response = await fetch("/api/admin/domain-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          selectedTemplate ? "Domain updated" : "Domain created successfully"
        );
        setIsSheetOpen(false);
        setSelectedTemplate(null);
        fetchDomainTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save domain");
      }
    } catch {
      toast.error("Error saving domain");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (
      !confirm(
        "Delete this domain template? This cannot be undone and will affect any assessments using it."
      )
    )
      return;
    try {
      const response = await fetch(
        `/api/admin/domain-templates/${templateId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        toast.success("Domain template deleted");
        fetchDomainTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting domain template");
    }
  };

  const handleExport = async (templateId: string, templateSlug: string) => {
    try {
      const response = await fetch(
        `/api/admin/domain-templates/${templateId}/export`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${templateSlug}-domain-template.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Exported successfully");
      } else {
        toast.error("Failed to export domain template");
      }
    } catch {
      toast.error("Error exporting domain template");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const response = await fetch("/api/admin/domain-templates/upload", {
        method: "POST",
        body: fd,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Domain template uploaded");
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        fetchDomainTemplates();
      } else {
        setUploadError(result.error || "Failed to upload");
      }
    } catch {
      setUploadError("Error uploading domain template");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Domain Library</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Build and manage clinical assessment domains. Each domain is a
            focused set of questions targeting a specific area — depression,
            anxiety, attention, and so on.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import Domain Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a JSON file previously exported from this system.
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadSubmit}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Domain
          </Button>
        </div>
      </div>

      {/* Domain list */}
      {domainTemplates.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center">
          <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No domains yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first clinical domain. Start from a validated instrument
            like PHQ-9 or GAD-7, or build from scratch.
          </p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Domain
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {domainTemplates.map((template) => {
            const questionCount = Array.isArray(template.questions)
              ? template.questions.length
              : 0;

            return (
              <Card
                key={template.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1 text-sm leading-relaxed">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsPreviewDialogOpen(true);
                        }}
                        title="Preview questions"
                        className="h-9 w-9 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(template.id, template.slug)}
                        title="Export JSON"
                        className="h-9 w-9 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(template)}
                        title="Edit domain"
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                        title="Delete domain"
                        className="h-9 w-9 p-0 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="font-normal">
                      {questionCount} question
                      {questionCount !== 1 ? "s" : ""}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Used in {template._count.assessmentTemplates} assessment
                      {template._count.assessmentTemplates !== 1 ? "s" : ""}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs text-muted-foreground">
                      {template.createdBy.name}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {template.slug}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <DialogContent className="w-[96vw] max-w-[92vw] h-[92vh] p-0 flex flex-col overflow-hidden lg:max-w-[94vw] xl:max-w-384">
          <DialogHeader className="px-10 pt-8 pb-6 border-b shrink-0">
            <DialogTitle className="text-xl">
              {selectedTemplate
                ? `Edit: ${selectedTemplate.name}`
                : "Create New Domain"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Update questions and settings for this clinical domain."
                : "Define a new clinical domain with structured questions."}
            </DialogDescription>
          </DialogHeader>

          <DomainForm
            key={selectedTemplate?.id || "new"}
            initial={selectedTemplate}
            onSave={handleSave}
            onCancel={closeSheet}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.name} — Questions Preview
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-3 py-2">
              {selectedTemplate && (() => {
                const domainResponseType = (selectedTemplate.scoringConfig as any)?.responseType as QuestionType | undefined;
                const domainOptions: QuestionOption[] = (selectedTemplate.scoringConfig as any)?.responseOptions
                  ?? (domainResponseType ? QUESTION_TYPE_OPTIONS[domainResponseType] : []);
                return (jsonToQuestions(selectedTemplate.questions) || []).map(
                  (q, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <p className="text-sm leading-relaxed">
                        <span className="text-muted-foreground font-medium mr-2">
                          {i + 1}.
                        </span>
                        {q.text || (
                          <span className="italic text-muted-foreground">
                            No text
                          </span>
                        )}
                      </p>
                      {domainResponseType !== "text" && domainOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-5">
                          {domainOptions.map((opt, j) => (
                            <span
                              key={j}
                              className="text-xs bg-muted px-2 py-1 rounded"
                            >
                              {opt.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                );
              })()}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DomainTemplateManager;
