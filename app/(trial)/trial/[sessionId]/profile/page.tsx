'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { trackTelemetry } from '@/lib/utils/telemetry';

const AGE_BANDS = [
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-12', label: '9-12 years' },
  { value: '13-18', label: '13-18 years' },
];

const GRADE_BANDS = [
  { value: 'pre_k', label: 'Pre-K / Preschool' },
  { value: 'grade_1_2', label: '1st-2nd grade' },
  { value: 'grade_3_5', label: '3rd-5th grade' },
  { value: 'grade_6_8', label: '6th-8th grade' },
  { value: 'grade_9_12', label: '9th-12th grade' },
];

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const ref = searchParams.get('ref');

  const [childName, setChildName] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [gradeBand, setGradeBand] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Fetch session to check anonymity setting
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/trial/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setIsAnonymous(data.anonymous || false);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ageBand || !gradeBand) {
      toast.error('Please select age and grade');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/trial/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          childFirstName: childName || undefined,
          ageBand,
          gradeBand,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      // Track profile submission
      trackTelemetry('trial.profile_submitted', {
        sessionId,
        ageBand,
        gradeBand,
        hasName: !!childName,
      });

      // Redirect to assessment (preserve ref param if present)
      const assessmentUrl = ref
        ? `/trial/${sessionId}/assessment?ref=${encodeURIComponent(ref)}`
        : `/trial/${sessionId}/assessment`;
      router.push(assessmentUrl);
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Unable to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!ageBand || !gradeBand) {
      toast.error('Please select age and grade');
      return;
    }

    try {
      setLoading(true);

      // Save profile without name
      const response = await fetch('/api/trial/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          childFirstName: undefined,
          ageBand,
          gradeBand,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      // Track skip
      trackTelemetry('trial.profile_submitted', {
        sessionId,
        ageBand,
        gradeBand,
        hasName: false,
      });

      // Redirect to assessment (preserve ref param if present)
      const assessmentUrl = ref
        ? `/trial/${sessionId}/assessment?ref=${encodeURIComponent(ref)}`
        : `/trial/${sessionId}/assessment`;
      router.push(assessmentUrl);
    } catch (error) {
      console.error('Profile skip error:', error);
      toast.error('Unable to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = ageBand && gradeBand;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <CardTitle className="text-2xl">About the child</CardTitle>
          <CardDescription>
            Help us personalize the assessment
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Child Name - Only show if not in anonymous mode */}
            {!isAnonymous && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Child's name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Sarah"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for anonymous assessment
                </p>
              </div>
            )}

            {/* Anonymous Mode Notice */}
            {isAnonymous && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Anonymous Mode:</strong> Your child's name will not be saved or displayed.
                </p>
              </div>
            )}

            {/* Age Band */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">
                Age <span className="text-destructive">*</span>
              </Label>
              <Select
                value={ageBand}
                onValueChange={setAgeBand}
                disabled={loading}
              >
                <SelectTrigger id="age">
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_BANDS.map((band) => (
                    <SelectItem key={band.value} value={band.value}>
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grade Band */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={gradeBand}
                onValueChange={setGradeBand}
                disabled={loading}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_BANDS.map((band) => (
                    <SelectItem key={band.value} value={band.value}>
                      {band.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                type="submit"
                disabled={!isComplete || loading || sessionLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
              >
                {loading || sessionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {sessionLoading ? 'Loading...' : 'Continuing...'}
                  </>
                ) : (
                  <>
                    Continue to Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleSkip}
                disabled={!isComplete || loading || sessionLoading}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Skip name
              </Button>
            </div>

            {/* Progress indicator */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Step 1 of 2
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
