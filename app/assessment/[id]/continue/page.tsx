'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AssessmentQuestion } from '@/components/assessment/AssessmentQuestion';
import { LoadingPage } from '@/components/ui/loading';

interface Question {
  qid: string;
  text: string;
  order: number;
  scale: 'yesno' | '0-4';
  context: {
    domain: string;
    order?: number;
  };
}

interface ProgressInfo {
  answered: number;
  required: number;
  percent: number;
  etaMinutes: number;
}

export default function ContinueAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'full' | 'done'>('full');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Load initial question on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assessment/${assessmentId}/next`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load assessment');
        }

        const data = await response.json();
        setPhase(data.phase);
        setProgress(data.progress);

        if (data.next) {
          setCurrentQuestion(data.next);
        } else if (data.phase === 'done') {
          // Assessment complete - redirect to results
          router.push(`/assessment/${assessmentId}/results`);
        }
      } catch (err) {
        console.error('Failed to load assessment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
        toast.error('Unable to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentId, router]);

  // Define hook callbacks at top level (before any conditional returns)
  const handleAnswer = useCallback(
    async (value: boolean) => {
      if (!currentQuestion) return;

      try {
        setSubmitting(true);

      // Save answer
      const response = await fetch(`/api/assessment/${assessmentId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qid: currentQuestion.qid,
          value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save answer');
      }

      const data = await response.json();
      setAnswers({ ...answers, [currentQuestion.qid]: value });
      setProgress(data.progress);

      // Check if done
      if (data.isDone) {
        // Assessment complete - redirect to results
        toast.success('Full Results ready — AI recommendations & confidence score updated.');
        router.push(`/assessment/${assessmentId}/results`);
      } else {
        // Load next question
        const nextResponse = await fetch(`/api/assessment/${assessmentId}/next`);
        if (!nextResponse.ok) {
          throw new Error('Failed to load next question');
        }

        const nextData = await nextResponse.json();
        setPhase(nextData.phase);
        setProgress(nextData.progress);

        if (nextData.next) {
          setCurrentQuestion(nextData.next);
        } else {
          // Done
          toast.success('Full Results ready — AI recommendations & confidence score updated.');
          router.push(`/assessment/${assessmentId}/results`);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      toast.error('Failed to save answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
    },
    [assessmentId, router, answers, currentQuestion]
  );

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case 'y':
          e.preventDefault();
          handleAnswer(true);
          break;
        case 'n':
          e.preventDefault();
          handleAnswer(false);
          break;
        case 'enter':
          // Default to "Yes" on Enter for faster workflow
          e.preventDefault();
          handleAnswer(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleAnswer]);

  const progressPercent = progress?.percent ?? 0;
  const answered = progress?.answered ?? 0;
  const required = progress?.required ?? 1;

  // Conditional returns AFTER all hooks
  if (loading) {
    return <LoadingPage text="Loading full assessment..." />;
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Assessment Error</h2>
              <p className="text-sm text-muted-foreground">
                {error || 'Unable to load assessment'}
              </p>
              <Button onClick={() => router.back()} className="w-full">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            ~12 minutes to unlock Full AI Recommendations & Confidence Score.
          </p>
        </div>

        {/* Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => router.back()}
                disabled={submitting}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <CardTitle>
                  Question {answered + 1} of {required}
                </CardTitle>
              </div>
              <div className="w-8" />
            </div>

            {/* Progress bar */}
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {progressPercent}% complete
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question text */}
            <div>
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                {currentQuestion.text}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Domain: {currentQuestion.context.domain}
              </p>
            </div>

            {/* Yes/No buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(true)}
                disabled={submitting}
                className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                title="Keyboard shortcut: Y or Enter"
              >
                Yes, often (Y)
              </button>
              <button
                onClick={() => handleAnswer(false)}
                disabled={submitting}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Keyboard shortcut: N"
              >
                No, rarely (N)
              </button>
            </div>

            {/* Tip */}
            <p className="text-xs text-muted-foreground italic text-center">
              💡 Tip: Press{' '}
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs dark:bg-gray-800 dark:border-gray-700">
                Y
              </kbd>{' '}
              or{' '}
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs dark:bg-gray-800 dark:border-gray-700">
                N
              </kbd>{' '}
              for quick answers
            </p>

            {submitting && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
