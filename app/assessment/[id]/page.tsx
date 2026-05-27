"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import { AssessmentChat } from "@/components/chat/AssessmentChat";
import { AssessmentCompletion } from "@/components/assessment/AssessmentCompletion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  userId: string | null;
  subjectName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  startedAt: string;
  completedAt?: string;
  isConversational?: boolean;
}

export default function AssessmentPage() {
  const params = useParams();
  const { isLoading } = useUser();
  const debugMode = useFeatureFlag("debug_assessment");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assessmentId = params.id as string;

  useEffect(() => {
    if (isLoading) return;
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (!res.ok) {
          if (res.status === 404) setError("Assessment not found");
          else if (res.status === 401) setError("You don't have access to this assessment");
          else setError("Failed to load assessment");
          return;
        }
        setAssessment(await res.json());
      } catch {
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId, isLoading]);

  const fontStyle = { fontFamily: "var(--font-text, 'Source Sans 3', -apple-system, sans-serif)" };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-dash-canvas flex items-center justify-center" style={fontStyle}>
        <div className="w-2 h-2 rounded-full bg-dash-indigo-500 opacity-60 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dash-canvas flex items-center justify-center" style={fontStyle}>
        <div className="bg-dash-surface border border-dash-ink-100 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
          <p className="text-[15px] text-dash-ink-700 mb-5">{error}</p>
          <Link
            href="/dashboard/overview"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-dash-indigo-600 hover:underline"
          >
            <ArrowLeft size={13} strokeWidth={1.6} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  const backLink = (
    <Link
      href="/dashboard/overview"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-dash-ink-500 hover:text-dash-ink-900 transition-colors"
    >
      <ArrowLeft size={13} strokeWidth={1.6} />
      Dashboard
    </Link>
  );

  // Completed assessment — show results
  if (assessment.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-dash-canvas" style={fontStyle}>
        {/* Nav */}
        <div className="h-[56px] border-b border-dash-ink-100 bg-dash-surface flex items-center px-5 shrink-0">
          {backLink}
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto px-5 pt-8 pb-2">
          <div className="text-[11px] font-semibold text-dash-ink-500 tracking-[0.08em] uppercase mb-1">
            Results
          </div>
          <h1
            className="text-[26px] font-semibold tracking-[-0.02em] text-dash-ink-900 leading-[1.2]"
            style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
          >
            {assessment.subjectName}
          </h1>
          {assessment.completedAt && (
            <p className="text-[13px] text-dash-ink-500 mt-1">
              Completed {new Date(assessment.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-5 py-6">
          <AssessmentCompletion
            assessmentId={assessmentId}
            subjectName={assessment.subjectName}
            isAnonymous={assessment.userId === null}
            debugMode={debugMode}
          />
        </div>
      </div>
    );
  }

  // In-progress assessment — show chat/question interface
  return (
    <div className="min-h-screen bg-dash-canvas flex flex-col" style={fontStyle}>
      {/* Nav */}
      <div className="h-[56px] border-b border-dash-ink-100 bg-dash-surface flex items-center justify-between px-5 shrink-0">
        {backLink}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-dash-amber-700 bg-dash-amber-50 px-2.5 py-1 rounded-lg">
            In progress
          </span>
        </div>
      </div>

      {/* Assessment label */}
      <div className="border-b border-dash-ink-100 px-5 py-3 bg-dash-surface shrink-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[15px] font-semibold text-dash-ink-900">
            Assessment — {assessment.subjectName}
          </h1>
          <p className="text-[12px] text-dash-ink-500 mt-0.5">
            Started {new Date(assessment.startedAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Chat / question interface */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full">
          <AssessmentChat assessmentId={assessmentId} />
        </div>
      </div>
    </div>
  );
}
