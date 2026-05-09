"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { ArrowLeft, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { useAssessmentCredits } from "@/hooks/use-assessment-credits";
import { AssessmentLimitDialog } from "@/components/assessment/AssessmentLimitDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssessmentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions?: string;
  createdAt: string;
  domains: Array<{
    domainTemplate: { id: string; name: string; description?: string };
    order: number;
  }>;
  _count: { assessments: number };
}

export default function NewAssessmentPage() {
  const [subjectName, setSubjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [availableAssessments, setAvailableAssessments] = useState<AssessmentTemplate[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const { credits, isDialogOpen, closeDialog, checkCreditsBeforeAction, refreshCredits } =
    useAssessmentCredits();

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await fetch("/api/assessments/available");
        if (res.ok) {
          const data = await res.json();
          setAvailableAssessments(data);
          if (data.length > 0) {
            const savedId = sessionStorage.getItem("selectedAssessmentId");
            const saved = savedId ? data.find((a: AssessmentTemplate) => a.id === savedId) : null;
            setSelectedAssessment(saved || data[0]);
          }
        }
      } catch {}
      finally { setLoading(false); }
    };
    if (user) fetchAvailable();
  }, [user]);

  const createAssessment = async () => {
    if (!subjectName.trim() || !selectedAssessment) return;
    const hasCredits = await checkCreditsBeforeAction();
    if (!hasCredits) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: subjectName.trim(), assessmentTemplateId: selectedAssessment.id }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.removeItem("selectedAssessmentId");
        refreshCredits();
        router.push(`/assessment/${data.id}`);
      } else {
        const data = await res.json();
        if (data.error === "NO_CREDITS") {
          await checkCreditsBeforeAction();
        } else {
          toast.error("Failed to create assessment");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && subjectName.trim() && !isCreating && selectedAssessment) {
      createAssessment();
    }
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-dash-canvas flex flex-col"
      style={{ fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)", color: "var(--dash-ink-900)" }}
    >
      {/* Nav */}
      <div className="h-[56px] border-b border-dash-ink-100 bg-dash-surface flex items-center px-5 shrink-0">
        <Link
          href="/dashboard/overview"
          className="flex items-center gap-1.5 text-[13px] font-medium text-dash-ink-500 hover:text-dash-ink-900 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.6} />
          Dashboard
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-[500px]">
          {/* Page header */}
          <div className="mb-8">
            <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-2">
              New assessment
            </div>
            <h1
              className="text-[30px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.15] m-0"
              style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
            >
              Who are you assessing?
            </h1>
            <p className="text-[15px] text-dash-ink-700 mt-2 leading-snug">
              Enter the name of the person being assessed to begin.
            </p>
          </div>

          {loading ? (
            <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-dash-indigo-500 opacity-60 animate-pulse" />
            </div>
          ) : availableAssessments.length === 0 ? (
            <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-8 text-center">
              <p className="text-[15px] text-dash-ink-700 mb-4">
                No assessments are available right now.
              </p>
              <Link
                href="/dashboard/overview"
                className="text-[13px] text-dash-indigo-600 font-medium underline underline-offset-2"
              >
                Back to dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Template picker — only if multiple */}
              {availableAssessments.length > 1 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-dash-ink-500 mb-2">
                    Assessment type
                  </div>
                  <div className="space-y-2">
                    {availableAssessments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedAssessment(a);
                          sessionStorage.setItem("selectedAssessmentId", a.id);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3.5 rounded-xl border transition-colors duration-[120ms] cursor-pointer font-[inherit] bg-transparent",
                          selectedAssessment?.id === a.id
                            ? "border-dash-indigo-500 bg-dash-indigo-50"
                            : "border-dash-ink-200 bg-dash-surface hover:border-dash-ink-300",
                        )}
                      >
                        <div className="text-[14px] font-semibold text-dash-ink-900">{a.name}</div>
                        {a.description && (
                          <div className="text-[13px] text-dash-ink-500 mt-0.5">{a.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 text-[12px] text-dash-ink-400">
                          <span>{a.domains.length} domain{a.domains.length !== 1 ? "s" : ""}</span>
                          <span>·</span>
                          <span>{a._count.assessments} completed</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject + start */}
              <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-6">
                <label
                  htmlFor="subject-name"
                  className="block text-[13px] font-semibold text-dash-ink-700 mb-2"
                >
                  Subject name
                </label>
                <input
                  id="subject-name"
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a name…"
                  autoFocus
                  className="w-full h-11 px-3 rounded-lg border border-dash-ink-200 bg-dash-canvas text-[15px] text-dash-ink-900 font-[inherit] outline-none focus:border-dash-indigo-500 transition-colors placeholder:text-dash-ink-300 mb-4"
                />

                {selectedAssessment?.instructions && (
                  <div className="p-3 bg-dash-sunk rounded-lg mb-4">
                    <p className="text-[13px] text-dash-ink-700 leading-relaxed">
                      {selectedAssessment.instructions}
                    </p>
                  </div>
                )}

                <button
                  onClick={createAssessment}
                  disabled={!subjectName.trim() || !selectedAssessment || isCreating}
                  className="w-full h-11 rounded-lg bg-dash-indigo-500 text-white text-[14px] font-semibold border-none cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Plus size={15} strokeWidth={2} />
                  {isCreating ? "Starting…" : "Start assessment"}
                </button>
              </div>

              {/* Info row */}
              {selectedAssessment && (
                <div className="flex items-center justify-center gap-1.5 text-[12px] text-dash-ink-500">
                  <Clock size={12} strokeWidth={1.6} />
                  <span>
                    {selectedAssessment.domains.length} domain{selectedAssessment.domains.length !== 1 ? "s" : ""}
                    {" · "}typically 15–25 minutes
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {credits && (
        <AssessmentLimitDialog
          open={isDialogOpen}
          onOpenChange={closeDialog}
          credits={credits}
          childName={subjectName}
        />
      )}
    </div>
  );
}
