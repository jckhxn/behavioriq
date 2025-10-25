'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trackTelemetry } from '@/lib/utils/telemetry';
import { LoadingPage } from '@/components/ui/loading';

interface Question {
  id: string;
  text: string;
  order: number;
  domain: string;
  domainSlug: string;
}

interface AssessmentTemplate {
  questions: Question[];
}

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load questions on mount
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/assessments/trial');
        if (!response.ok) {
          throw new Error('Failed to load assessment');
        }
        const data: AssessmentTemplate = await response.json();
        setQuestions(data.questions || []);

        trackTelemetry('trial.assessment_loaded', {
          sessionId,
          questionCount: data.questions?.length || 0,
        });
      } catch (error) {
        console.error('Failed to load assessment:', error);
        toast.error('Unable to load assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return <LoadingPage text="Loading assessment..." />;
  }

  if (questions.length === 0) {
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isAnswered = currentIndex in answers;
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = async (value: number) => {
    const newAnswers = { ...answers, [currentIndex]: value };
    setAnswers(newAnswers);

    // Track question answer
    trackTelemetry('trial.question_answered', {
      sessionId,
      questionIndex: currentIndex + 1,
      domain: currentQuestion.domain,
      value,
    });

    // Auto-save answer
    try {
      await fetch('/api/trial/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          qid: currentQuestion.id,
          value,
        }),
      }).catch((err) => console.error('Auto-save error:', err));
    } catch (err) {
      console.error('Failed to save answer:', err);
    }

    // Auto-advance if answer is confirmed
    if (value === 0 || value === 3) {
      // Yes (3) or No (0) responses
      setTimeout(() => {
        if (isLast) {
          handleComplete();
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (!isAnswered) {
      toast.error('Please answer the question');
      return;
    }

    if (isLast) {
      handleComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);

      // Score the trial
      const scoreResponse = await fetch('/api/trial/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!scoreResponse.ok) {
        const error = await scoreResponse.json();
        throw new Error(error.error || 'Failed to score assessment');
      }

      const scoreData = await scoreResponse.json();
      const trialId = scoreData.snapshot?.trialId || sessionId;

      trackTelemetry('trial.complete', {
        sessionId,
        trialId,
        questionCount: questions.length,
      });

      // Redirect to results
      router.push(`/results/${trialId}`);
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Unable to complete assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0 || submitting}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
              <CardDescription>Assessment</CardDescription>
            </div>
            <div className="w-8" />
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question text */}
          <div>
            <p className="text-lg font-semibold text-foreground leading-relaxed">
              {currentQuestion.text}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Domain: {currentQuestion.domain}
            </p>
          </div>

          {/* Radio options: Yes/No */}
          <RadioGroup
            value={answers[currentIndex]?.toString() || ''}
            onValueChange={(value) => handleAnswer(parseInt(value))}
            disabled={submitting}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition">
                <RadioGroupItem value="3" id="yes" />
                <Label
                  htmlFor="yes"
                  className="text-base font-medium cursor-pointer flex-1"
                >
                  Yes, often
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition">
                <RadioGroupItem value="0" id="no" />
                <Label
                  htmlFor="no"
                  className="text-base font-medium cursor-pointer flex-1"
                >
                  No, rarely
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Hint */}
          <p className="text-xs text-muted-foreground italic text-center">
            Tip: Your answer will advance to the next question automatically
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleNext}
              disabled={!isAnswered || submitting}
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : isLast ? (
                <>
                  Complete Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
