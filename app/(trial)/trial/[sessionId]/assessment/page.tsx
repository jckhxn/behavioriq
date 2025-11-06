'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackTelemetry } from '@/lib/utils/telemetry';
import { LoadingPage } from '@/components/ui/loading';

interface Question {
  qid: string;
  text: string;
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

export default function TrialAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const ref = searchParams.get('ref');

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [isRetryingQuestion, setIsRetryingQuestion] = useState(false);

  // Start assessment on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Load trial session data and questions
        const sessionResponse = await fetch(
          `/api/trial/session?sessionId=${sessionId}`
        );

        if (!sessionResponse.ok) {
          throw new Error('Failed to load trial session');
        }

        const sessionData = await sessionResponse.json();
        setAssessmentId(sessionId); // Use session ID as assessment ID for trial
        setProgress(sessionData.progress);

        if (sessionData.next) {
          setCurrentQuestion(sessionData.next);
        }

        trackTelemetry('trial.assessment_started', {
          sessionId,
        });
      } catch (error) {
        console.error('Failed to start assessment:', error);
        toast.error('Unable to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const handleAnswer = useCallback(
    async (value: boolean) => {
      if (!assessmentId || !currentQuestion) return;

      try {
        setSubmitting(true);

        // Save answer to trial session
        const answerValue = value ? 3 : 0; // Convert boolean to Likert scale
        const response = await fetch('/api/trial/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: assessmentId,
            questionId: currentQuestion.qid,
            answer: answerValue,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save answer');
        }

        const data = await response.json();
        setAnswers({ ...answers, [currentQuestion.qid]: value });

        trackTelemetry('trial.question_answered', {
          sessionId,
          assessmentId,
          domain: currentQuestion.context.domain,
          value: value ? 'yes' : 'no',
        });

        // Load next question
        try {
          const nextResponse = await fetch(
            `/api/trial/session?sessionId=${assessmentId}`
          );
          if (!nextResponse.ok) {
            throw new Error('Failed to load next question');
          }

          const nextData = await nextResponse.json();
          setProgress(nextData.progress);
          setQuestionLoadError(null);

          if (nextData.next) {
            setCurrentQuestion(nextData.next);
          } else {
            // Trial is complete - calculate scores and redirect
            trackTelemetry('trial.completed', {
              sessionId,
              assessmentId,
              questionCount: nextData.progress.required,
            });

            // Calculate scores
            const scoreResponse = await fetch('/api/trial/score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: assessmentId }),
            });

            const scoreData = await scoreResponse.json();
            // Redirect to results
            router.push(`/results/${assessmentId}`);
          }
        } catch (loadError) {
          console.error('Error loading next question:', loadError);
          setQuestionLoadError('Unable to load the next question. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting answer:', err);
        toast.error('Failed to save answer. Please try again.');
        setQuestionLoadError('Failed to save your answer. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [assessmentId, sessionId, router, answers, currentQuestion]
  );

  // Retry loading the question
  const retryQuestion = useCallback(async () => {
    if (!assessmentId) return;

    try {
      setIsRetryingQuestion(true);
      setQuestionLoadError(null);

      const nextResponse = await fetch(`/api/assessment/${assessmentId}/next`);
      if (!nextResponse.ok) {
        throw new Error('Failed to load question');
      }

      const nextData = await nextResponse.json();
      setProgress(nextData.progress);

      if (nextData.next) {
        setCurrentQuestion(nextData.next);
      }
    } catch (error) {
      console.error('Error retrying question load:', error);
      setQuestionLoadError('Still unable to load the question. Please refresh the page and try again.');
    } finally {
      setIsRetryingQuestion(false);
    }
  }, [assessmentId]);

  // Keyboard shortcuts: Y/N/Enter
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

  if (loading) {
    return <LoadingPage text="Loading trial assessment..." />;
  }

  if (!assessmentId || !currentQuestion || !progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Assessment Unavailable</h2>
              <p className="text-sm text-muted-foreground">
                The assessment is not available. Please try again later.
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
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
              <CardTitle>Question {progress.answered + 1} of {progress.required}</CardTitle>
            </div>
            <div className="w-8" />
          </div>

          {/* Progress bar */}
          <Progress value={progress.percent} className="h-2" />
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

          {questionLoadError && (
            <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {questionLoadError}
                </p>
              </div>
              <Button
                onClick={retryQuestion}
                disabled={isRetryingQuestion || submitting}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isRetryingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
