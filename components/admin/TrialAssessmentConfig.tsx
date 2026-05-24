"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FlaskConical,
  ChevronDown,
  Edit2,
  Check,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  questions: any;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  domains: { order: number; domainTemplate: DomainTemplate }[];
}

// ─── DomainTrialEditorDialog ──────────────────────────────────────────────────

interface DomainTrialEditorDialogProps {
  isOpen: boolean;
  domainName: string;
  questions: any[];
  onClose: () => void;
  onSave: () => void;
  onUpdateQuestion: (index: number, isTrial: boolean) => void;
  onToggleAll: (isTrial: boolean) => void;
  isSaving: boolean;
}

const DomainTrialEditorDialog: React.FC<DomainTrialEditorDialogProps> = ({
  isOpen,
  domainName,
  questions,
  onClose,
  onSave,
  onUpdateQuestion,
  onToggleAll,
  isSaving,
}) => {
  const trialCount = questions.filter((q) => q.isTrial === true).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-dash-indigo-600" />
            Trial questions — {domainName}
          </DialogTitle>
        </DialogHeader>

        {/* Summary bar */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-dash-sunk rounded-lg border border-dash-ink-100">
          <span className="text-sm font-medium text-dash-ink-700">
            <span className="text-dash-ink-900 font-semibold">{trialCount}</span>
            {" of "}
            <span className="text-dash-ink-900 font-semibold">{questions.length}</span>
            {" questions marked for trial"}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(true)}
              className="h-7 text-xs"
            >
              Mark all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAll(false)}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        </div>

        {/* Question list */}
        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-1.5 py-1">
            {questions.map((question, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  question.isTrial
                    ? "bg-dash-indigo-50 border-dash-indigo-100"
                    : "border-transparent hover:bg-dash-sunk/60",
                )}
                onClick={() => onUpdateQuestion(index, !question.isTrial)}
              >
                <Checkbox
                  id={`trial-q-${index}`}
                  checked={question.isTrial || false}
                  onCheckedChange={(checked) => onUpdateQuestion(index, !!checked)}
                  className="mt-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <Label
                  htmlFor={`trial-q-${index}`}
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  <span className="font-medium text-dash-ink-400 mr-1.5 tabular-nums">
                    {index + 1}.
                  </span>
                  <span className={question.isTrial ? "text-dash-ink-900" : "text-dash-ink-700"}>
                    {question.text || question.title || "Untitled question"}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-3 border-t border-dash-ink-100">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="min-w-[140px]">
            {isSaving ? "Saving…" : "Save configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── DomainTrialCard ──────────────────────────────────────────────────────────

interface DomainTrialCardProps {
  order: number;
  domain: DomainTemplate;
  onEdit: (domain: DomainTemplate) => void;
}

const DomainTrialCard: React.FC<DomainTrialCardProps> = ({ order, domain, onEdit }) => {
  const questions: any[] = Array.isArray(domain.questions) ? domain.questions : [];
  const total = questions.length;
  const trialCount = questions.filter((q) => q.isTrial === true).length;
  const hasTrialQuestions = trialCount > 0;
  const allMarked = trialCount === total && total > 0;

  return (
    <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-4 flex items-start gap-4">
      {/* Order badge */}
      <div className="w-7 h-7 rounded-lg bg-dash-sunk flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[11px] font-semibold text-dash-ink-500">{order}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[14px] font-semibold text-dash-ink-900 leading-snug">
              {domain.name}
            </h3>
            {domain.description && (
              <p className="text-xs text-dash-ink-500 mt-0.5 line-clamp-1">
                {domain.description}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(domain)}
            className="h-7 shrink-0 text-xs gap-1.5"
          >
            <Edit2 size={11} strokeWidth={1.8} />
            Edit questions
          </Button>
        </div>

        {/* Progress bar + count */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-dash-ink-500">
              <span
                className={cn(
                  "font-semibold",
                  hasTrialQuestions ? "text-dash-indigo-600" : "text-dash-ink-500",
                )}
              >
                {trialCount}
              </span>
              {" / "}
              <span className="font-medium text-dash-ink-700">{total}</span>
              {" questions selected for trial"}
            </span>
            {allMarked && (
              <span className="text-[11px] font-semibold text-dash-mint-700 bg-dash-mint-50 border border-dash-mint-100 px-2 py-0.5 rounded-full">
                All included
              </span>
            )}
            {!hasTrialQuestions && (
              <span className="text-[11px] font-semibold text-dash-amber-700 bg-dash-amber-50 border border-dash-amber-100 px-2 py-0.5 rounded-full">
                None selected
              </span>
            )}
          </div>

          {/* Progress track */}
          <div className="h-1.5 rounded-full bg-dash-sunk overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                hasTrialQuestions ? "bg-dash-indigo-400" : "bg-dash-ink-200",
              )}
              style={{ width: total > 0 ? `${(trialCount / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TrialAssessmentConfig ────────────────────────────────────────────────────

const TrialAssessmentConfig: React.FC = () => {
  const [assessmentTemplates, setAssessmentTemplates] = useState<AssessmentTemplate[]>([]);
  const [trialAssessmentId, setTrialAssessmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingTrial, setSettingTrial] = useState(false);

  // Per-domain editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDomainId, setEditorDomainId] = useState<string | null>(null);
  const [editorAssessmentId, setEditorAssessmentId] = useState<string | null>(null);
  const [editorDomainName, setEditorDomainName] = useState("");
  const [editorQuestions, setEditorQuestions] = useState<any[]>([]);
  const [editorSaving, setEditorSaving] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [templatesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/assessment-templates"),
        fetch("/api/admin/platform-settings"),
      ]);
      if (templatesRes.ok) setAssessmentTemplates(await templatesRes.json());
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setTrialAssessmentId(data.settings?.globalTrialAssessment?.id ?? null);
      }
    } catch {
      toast.error("Failed to load trial configuration");
    } finally {
      setLoading(false);
    }
  };

  const trialAssessment = assessmentTemplates.find((t) => t.id === trialAssessmentId) ?? null;
  const sortedDomains = trialAssessment
    ? [...trialAssessment.domains].sort((a, b) => a.order - b.order)
    : [];

  const totalTrialQuestions = sortedDomains.reduce((sum, { domainTemplate }) => {
    const qs: any[] = Array.isArray(domainTemplate.questions) ? domainTemplate.questions : [];
    return sum + qs.filter((q) => q.isTrial === true).length;
  }, 0);

  const handleSetTrialAssessment = async (template: AssessmentTemplate) => {
    if (template.id === trialAssessmentId) return;
    setSettingTrial(true);
    try {
      const res = await fetch("/api/admin/assessment-templates/set-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      if (res.ok) {
        setTrialAssessmentId(template.id);
        toast.success(`"${template.name}" is now the trial assessment`);
        // Reload templates to get fresh question data
        const r = await fetch("/api/admin/assessment-templates");
        if (r.ok) setAssessmentTemplates(await r.json());
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to set trial assessment");
      }
    } catch {
      toast.error("Failed to set trial assessment");
    } finally {
      setSettingTrial(false);
    }
  };

  const openEditor = (domain: DomainTemplate, assessmentId: string) => {
    const questions: any[] = Array.isArray(domain.questions) ? domain.questions : [];
    setEditorDomainId(domain.id);
    setEditorAssessmentId(assessmentId);
    setEditorDomainName(domain.name);
    setEditorQuestions(questions.map((q) => ({ ...q, isTrial: q.isTrial === true })));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorDomainId(null);
    setEditorAssessmentId(null);
    setEditorDomainName("");
    setEditorQuestions([]);
  };

  const saveEditorChanges = async () => {
    if (!editorDomainId || !editorAssessmentId) return;
    setEditorSaving(true);
    try {
      const res = await fetch("/api/admin/assessment-templates/trial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: editorAssessmentId,
          domainId: editorDomainId,
          questions: editorQuestions,
        }),
      });
      if (res.ok) {
        toast.success("Trial questions updated");
        closeEditor();
        // Refresh templates so the card counts update
        const r = await fetch("/api/admin/assessment-templates");
        if (r.ok) setAssessmentTemplates(await r.json());
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save trial configuration");
      }
    } catch {
      toast.error("Error saving trial configuration");
    } finally {
      setEditorSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading trial configuration…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-dash-ink-900 [font-family:var(--font-display,Georgia,serif)]">
            Trial assessment
          </h2>
          <p className="text-[13px] text-dash-ink-500 mt-1 max-w-lg leading-relaxed">
            Select which assessment serves as the trial, then choose specific questions
            from each domain to include. Trial questions are scored the same as their
            full domain counterparts.
          </p>
        </div>
      </div>

      {/* Active trial selector */}
      <div className="bg-dash-surface border border-dash-ink-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={15} strokeWidth={1.6} className="text-dash-indigo-600" />
          <span className="text-[13px] font-semibold text-dash-ink-700 uppercase tracking-[0.06em]">
            Active trial assessment
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 mt-3">
          {/* Current selection */}
          <div className="flex-1 min-w-0">
            {trialAssessment ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-semibold text-dash-ink-900 leading-snug">
                  {trialAssessment.name}
                </span>
                <span className="text-[11px] font-semibold text-dash-indigo-600 bg-dash-indigo-50 border border-dash-indigo-100 px-2 py-0.5 rounded-full">
                  Trial
                </span>
                {totalTrialQuestions > 0 && (
                  <span className="text-[12px] text-dash-ink-500 flex items-center gap-1">
                    <ListChecks size={13} strokeWidth={1.6} />
                    {totalTrialQuestions} questions selected
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-dash-amber-700">
                <AlertCircle size={15} strokeWidth={1.6} />
                <span className="text-[14px] font-medium">No trial assessment set</span>
              </div>
            )}
            {trialAssessment && (
              <p className="text-xs text-dash-ink-400 mt-1">
                {sortedDomains.length} domain{sortedDomains.length !== 1 ? "s" : ""} ·{" "}
                {sortedDomains.reduce((s, { domainTemplate }) => {
                  const qs: any[] = Array.isArray(domainTemplate.questions) ? domainTemplate.questions : [];
                  return s + qs.length;
                }, 0)}{" "}
                total questions
              </p>
            )}
          </div>

          {/* Change assessment */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={settingTrial} className="shrink-0">
                {settingTrial ? "Updating…" : trialAssessment ? "Change" : "Select assessment"}
                <ChevronDown size={13} strokeWidth={1.8} className="ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {assessmentTemplates.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No assessment templates found
                </div>
              ) : (
                assessmentTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleSetTrialAssessment(template)}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-dash-ink-900 leading-snug truncate">
                        {template.name}
                      </div>
                      <div className="text-xs text-dash-ink-500 mt-0.5">
                        {template.domains.length} domains
                      </div>
                    </div>
                    {template.id === trialAssessmentId && (
                      <Check size={14} className="text-dash-indigo-600 shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Domain question configuration */}
      {trialAssessment && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-dash-ink-900">
                Configure trial questions by domain
              </h3>
              <p className="text-[12px] text-dash-ink-500 mt-0.5">
                Select which questions from each domain appear in the trial assessment.
              </p>
            </div>
          </div>

          {sortedDomains.length === 0 ? (
            <div className="border-2 border-dashed border-dash-ink-200 rounded-xl p-10 text-center">
              <ListChecks className="h-8 w-8 text-dash-ink-300 mx-auto mb-3" strokeWidth={1.4} />
              <p className="text-sm text-dash-ink-500">
                This assessment has no domains configured.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {sortedDomains.map(({ order, domainTemplate }) => (
                <DomainTrialCard
                  key={domainTemplate.id}
                  order={order}
                  domain={domainTemplate}
                  onEdit={(domain) => openEditor(domain, trialAssessment.id)}
                />
              ))}
            </div>
          )}

          {/* Summary footer */}
          {sortedDomains.length > 0 && (
            <div className="bg-dash-sunk border border-dash-ink-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-dash-ink-500">
                <span className="font-semibold text-dash-ink-900">{totalTrialQuestions}</span>
                {" trial questions across "}
                <span className="font-semibold text-dash-ink-900">{sortedDomains.length}</span>
                {" domain"}
                {sortedDomains.length !== 1 ? "s" : ""}
              </div>
              {sortedDomains.some(({ domainTemplate }) => {
                const qs: any[] = Array.isArray(domainTemplate.questions) ? domainTemplate.questions : [];
                return qs.filter((q) => q.isTrial === true).length === 0;
              }) && (
                <div className="flex items-center gap-1.5 text-dash-amber-700">
                  <AlertCircle size={13} strokeWidth={1.6} />
                  <span className="text-xs font-medium">Some domains have no trial questions</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No assessment set — empty state */}
      {!trialAssessment && assessmentTemplates.length > 0 && (
        <div className="border-2 border-dashed border-dash-ink-200 rounded-2xl p-14 text-center">
          <FlaskConical className="h-10 w-10 text-dash-ink-300 mx-auto mb-4" strokeWidth={1.4} />
          <h3 className="text-[15px] font-semibold text-dash-ink-900 mb-1.5">
            No trial assessment configured
          </h3>
          <p className="text-[13px] text-dash-ink-500 mb-6 max-w-sm mx-auto">
            Select an existing assessment template above to use as the trial. You can
            then choose which questions from each domain are included.
          </p>
        </div>
      )}

      {/* Per-domain question editor dialog */}
      <DomainTrialEditorDialog
        isOpen={editorOpen}
        domainName={editorDomainName}
        questions={editorQuestions}
        onClose={closeEditor}
        onSave={saveEditorChanges}
        onUpdateQuestion={(index, isTrial) =>
          setEditorQuestions((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], isTrial };
            return updated;
          })
        }
        onToggleAll={(isTrial) =>
          setEditorQuestions((prev) => prev.map((q) => ({ ...q, isTrial })))
        }
        isSaving={editorSaving}
      />
    </div>
  );
};

export default TrialAssessmentConfig;
