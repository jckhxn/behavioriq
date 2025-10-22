"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Brain, CheckCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import clsx from "clsx";
import { trackTelemetry } from "@/lib/utils/telemetry";

interface TrialQuestion {
  id: string;
  text: string;
  order: number;
  domain: string;
  domainSlug: string;
}

interface TrialAssessmentData {
  assessment: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    totalQuestions: number;
  };
  domains: Array<{ id: string; name: string; slug: string; description: string }>;
  questions: TrialQuestion[];
}

interface SnapshotDomain {
  domain: string;
  slug: string;
  score: number;
  level: "low" | "moderate" | "elevated";
}

interface SnapshotResult {
  indicators: number;
  domains: SnapshotDomain[];
  recommendationPreview: string;
}

type Step = "landing" | "consent" | "profile" | "screener" | "snapshot";
type LikertValue = 0 | 3;

type AgeBand = "3-5" | "6-8" | "9-12" | "13-18";
type GradeBand =
  | "pre_k"
  | "grade_1_2"
  | "grade_3_5"
  | "grade_6_8"
  | "grade_9_12";

const AGE_OPTIONS: Array<{ label: string; value: AgeBand }> = [
  { label: "3 – 5", value: "3-5" },
  { label: "6 – 8", value: "6-8" },
  { label: "9 – 12", value: "9-12" },
  { label: "13 – 18", value: "13-18" },
];

const GRADE_OPTIONS: Array<{ label: string; value: GradeBand }> = [
  { label: "Pre-K / Kindergarten", value: "pre_k" },
  { label: "1st – 2nd Grade", value: "grade_1_2" },
  { label: "3rd – 5th Grade", value: "grade_3_5" },
  { label: "6th – 8th Grade", value: "grade_6_8" },
  { label: "9th – 12th Grade", value: "grade_9_12" },
];

const YES_NO_OPTIONS: Array<{ label: string; value: LikertValue; tone: "yes" | "no" }>
  = [
    { label: "Yes", value: 3, tone: "yes" },
    { label: "No", value: 0, tone: "no" },
  ];

function TrustFooter() {
  return (
    <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
      AI stores no data • Anonymous mode available • Encrypted
    </div>
  );
}

export function TrialAssessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useUser();

  const [step, setStep] = useState<Step>("landing");
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [consentScreening, setConsentScreening] = useState(false);
  const [consentGuardian, setConsentGuardian] = useState(false);

  const [profile, setProfile] = useState({
    childFirstName: "",
    ageBand: null as AgeBand | null,
    gradeBand: null as GradeBand | null,
  });

  const [trialData, setTrialData] = useState<TrialAssessmentData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, LikertValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snapshot, setSnapshot] = useState<SnapshotResult | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const utmParams = useMemo(() => {
    const utm: Record<string, string> = {};
    searchParams?.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        utm[key] = value;
      }
    });
    return Object.keys(utm).length ? utm : undefined;
  }, [searchParams]);

  const loadTrial = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/assessments/trial");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Trial unavailable");
      }
      const data: TrialAssessmentData = await response.json();
      const questions = [...data.questions].sort(
        (a, b) => a.order - b.order
      );
      setTrialData({ ...data, questions });
    } catch (error) {
      console.error("Failed to load trial template", error);
      toast.error("Trial assessment is unavailable right now. Please try later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    trackTelemetry("view_landing", { source: "trial" });
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/assessment/new");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      loadTrial();
    }
  }, [authLoading, user, loadTrial]);

  const currentQuestion = trialData?.questions[currentIndex];
  const totalQuestions = trialData?.questions.length ?? 0;
  const progress = totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleStart = () => {
    setStep("consent");
    trackTelemetry("click_start_snapshot", { source: "trial" });
  };

  const handleConsentContinue = () => {
    if (!consentScreening || !consentGuardian) {
      toast.error("Please accept both consent statements");
      return;
    }
    setStep("profile");
    trackTelemetry("accept_consent", { anonymous: anonymousMode });
  };

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    const response = await fetch("/api/trial/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymous: anonymousMode,
        region: "us",
        utm: utmParams,
      }),
    });
    if (!response.ok) {
      throw new Error("Unable to start trial session");
    }
    const data = await response.json();
    setSessionId(data.sessionId);
    trackTelemetry("trial_start", { sessionId: data.sessionId });
    return data.sessionId as string;
  }, [anonymousMode, sessionId, utmParams]);

  const handleProfileSubmit = async () => {
    try {
      const activeSessionId = await ensureSession();
      if (!profile.ageBand || !profile.gradeBand) {
        toast.error("Select an age band and grade band, or skip this step.");
        return;
      }
      const payload = {
        sessionId: activeSessionId,
        childFirstName: anonymousMode ? undefined : profile.childFirstName.trim() || undefined,
        ageBand: profile.ageBand,
        gradeBand: profile.gradeBand,
        region: "us",
      };
      const response = await fetch("/api/trial/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Unable to save profile");
      }
      trackTelemetry("trial_profile_submitted", {
        sessionId: activeSessionId,
        ageBand: profile.ageBand,
        gradeBand: profile.gradeBand,
      });
      setStep("screener");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to start snapshot");
    }
  };

  const handleProfileSkip = async () => {
    try {
      const activeSessionId = await ensureSession();
      await fetch("/api/trial/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, region: "us" }),
      }).catch(() => {});
      setStep("screener");
      trackTelemetry("trial_profile_skipped", { sessionId: activeSessionId });
    } catch (error) {
      console.error(error);
      toast.error("Unable to skip right now");
    }
  };

 const handleAnswer = async (value: LikertValue) => {
    if (!trialData || !currentQuestion) return;
    try {
      const activeSessionId = await ensureSession();
      const response = await fetch("/api/trial/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          qid: currentQuestion.id,
          value,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to save response");
      }
      setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }));
      trackTelemetry("trial_question_answered", {
        sessionId: activeSessionId,
        qid: currentQuestion.id,
        value,
      });
     if (currentIndex < (trialData.questions.length - 1)) {
        setCurrentIndex((index) => index + 1);
      } else {
        await computeSnapshot(activeSessionId);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to record response");
    }
  };

 const computeSnapshot = async (activeSessionId: string) => {
    if (!trialData) return;
    setScoring(true);
    try {
      trackTelemetry("trial_complete", { sessionId: activeSessionId });
      const response = await fetch("/api/trial/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to score snapshot");
      }
      const data = await response.json();
      setSnapshot(data.snapshot as SnapshotResult);
      setStep("snapshot");
      trackTelemetry("trial_snapshot_view", {
        sessionId: activeSessionId,
        indicators: data.snapshot?.indicators ?? 0,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to score snapshot");
    } finally {
      setScoring(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!sessionId) return;
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLeadSubmitting(true);
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consentMarketing: marketingOptIn,
          sessionId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Unable to submit email");
      }
      setEmailDialogOpen(false);
      toast.success("Snapshot sent! Check your inbox (and spam folder)." );
      trackTelemetry("lead_created", { sessionId, email });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to email snapshot");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      if (!sessionId) {
        toast.error("Session not ready yet");
        return;
      }

      trackTelemetry("checkout_started", {
        sessionId,
        product: "full_assessment",
        source: "snapshot",
      });

      let response: Response;

      if (user) {
        response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planType: "payment",
            planId: "SINGLE",
            plan: "SINGLE",
            sessionId,
            fromDashboard: false,
          }),
        });
      } else {
        if (!email) {
          setEmailDialogOpen(true);
          toast.error("Enter your email so we can send the report link.");
          return;
        }

        const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const parentName =
          profile.childFirstName?.trim()
            ? `${profile.childFirstName.trim()}'s Parent`
            : "Trial Parent";

        response = await fetch("/api/stripe/checkout-anonymous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userData: {
              email,
              name: parentName,
              password: randomPassword,
            },
            planId: "SINGLE",
            plan: "SINGLE",
            childName: profile.childFirstName || "",
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Checkout unavailable");
      }

      const data = await response.json();
      if (data.url) {
        trackTelemetry("click_upgrade_from_snapshot", { sessionId });
        window.location.href = data.url;
      } else {
        toast.error("Checkout response missing redirect URL");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to start checkout");
    }
  };

  const renderStep = () => {
    if (loading || authLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!trialData) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Snapshot unavailable</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't load the free snapshot at the moment. Please try again later.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Return home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (step) {
      case "landing":
        return (
          <section className="max-w-3xl mx-auto px-6 py-16 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
              <Brain className="h-5 w-5" />
              Free 2-minute screener
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">
              Instant behavior snapshot. School-ready clarity without the wait.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Free 2-minute screener → optional $97 full report (instant PDF).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button size="lg" onClick={handleStart}>
                Start Free Snapshot
              </Button>
              <Button variant="outline" onClick={() => router.push("/checkout/single")}>Get Full Report — $97</Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>AI stores no data</span>
              <span>•</span>
              <span>Anonymous Mode available</span>
              <span>•</span>
              <span>Encrypted</span>
              <span>•</span>
              <span>Designed to support FERPA/HIPAA</span>
            </div>
            <TrustFooter />
          </section>
        );
      case "consent":
        return (
          <section className="max-w-2xl mx-auto px-6 py-12">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Before we start</CardTitle>
                <CardDescription>
                  This is a screening tool, not a medical diagnosis. Designed to support FERPA/HIPAA. The AI stores no data; the app stores minimal metadata or can be fully anonymous.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Label className="flex items-start gap-3 text-sm">
                  <Switch checked={consentScreening} onCheckedChange={setConsentScreening} />
                  <span>
                    I understand this is a screening tool and agree to the privacy statement above.
                  </span>
                </Label>
                <Label className="flex items-start gap-3 text-sm">
                  <Switch checked={consentGuardian} onCheckedChange={setConsentGuardian} />
                  <span>I am the parent/guardian or have consent to complete this snapshot.</span>
                </Label>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">Anonymous Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Hide names everywhere. We'll generate a report code instead.
                    </p>
                  </div>
                  <Switch
                    checked={anonymousMode}
                    onCheckedChange={(checked) => {
                      setAnonymousMode(checked);
                      trackTelemetry("toggle_anonymous", { enabled: checked });
                    }}
                    aria-label="Toggle anonymous mode"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep("landing")}>Back</Button>
                  <Button onClick={handleConsentContinue}>Continue</Button>
                </div>
              </CardContent>
            </Card>
            <TrustFooter />
          </section>
        );
      case "profile":
        return (
          <section className="max-w-2xl mx-auto px-6 py-12">
            <Card>
              <CardHeader>
                <CardTitle>Tell us about your child</CardTitle>
                <CardDescription>
                  Age and grade help the AI tune the snapshot (no grade-level data is stored).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!anonymousMode && (
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child first name (optional)</Label>
                    <Input
                      id="childName"
                      placeholder="Add a first name or nickname"
                      value={profile.childFirstName}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, childFirstName: event.target.value }))
                      }
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Age band</Label>
                    <div className="mt-2 grid gap-2">
                      {AGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProfile((prev) => ({ ...prev, ageBand: option.value }))}
                          className={clsx(
                            "rounded-lg border p-3 text-left text-sm",
                            profile.ageBand === option.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Grade band</Label>
                    <div className="mt-2 grid gap-2">
                      {GRADE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProfile((prev) => ({ ...prev, gradeBand: option.value }))}
                          className={clsx(
                            "rounded-lg border p-3 text-left text-sm",
                            profile.gradeBand === option.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep("consent")}>Back</Button>
                    <Button variant="outline" onClick={handleProfileSkip}>Skip</Button>
                  </div>
                  <Button onClick={handleProfileSubmit}>Continue</Button>
                </div>
              </CardContent>
            </Card>
            <TrustFooter />
          </section>
        );
      case "screener":
        const handleBack = () => {
          if (currentIndex === 0) {
            setStep("profile");
          } else {
            setCurrentIndex((index) => Math.max(0, index - 1));
          }
        };
        return (
          <section className="max-w-3xl mx-auto px-6 py-12">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    {currentIndex === 0 ? "Back" : "Previous"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {totalQuestions}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <CardTitle className="text-lg">
                  {currentQuestion?.text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {YES_NO_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleAnswer(option.value)}
                      className={clsx(
                        "rounded-xl border p-6 text-lg font-semibold transition-colors",
                        responses[currentQuestion?.id ?? ""] === option.value
                          ? option.tone === "yes"
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-500 bg-slate-600 text-white"
                          : "border-border hover:border-primary/60"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground text-center">
                  Tap or click Yes/No. You can go back to change an answer anytime.
                </p>
              </CardContent>
            </Card>
            <TrustFooter />
          </section>
        );
      case "snapshot":
        return (
          <section className="max-w-4xl mx-auto px-6 py-12">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Here’s your instant snapshot.</CardTitle>
                <CardDescription>
                  {snapshot
                    ? `${snapshot.indicators} of ${snapshot.domains.length} early indicators observed (not a diagnosis).`
                    : "We couldn't generate your snapshot. Please try again."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {snapshot ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {snapshot.domains.map((domain) => (
                      <div
                        key={domain.slug}
                        className={clsx(
                          "rounded-xl border p-4",
                          domain.level === "elevated"
                            ? "border-destructive bg-destructive/10"
                            : domain.level === "moderate"
                              ? "border-amber-500 bg-amber-500/10"
                              : "border-emerald-500 bg-emerald-500/10"
                        )}
                      >
                        <p className="font-medium flex items-center gap-2">
                          <Brain className="h-4 w-4" /> {domain.domain}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Score: {domain.score} ({domain.level})
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted p-6">
                    <p className="text-sm text-muted-foreground">
                      Snapshot data unavailable. Please retake the screener.
                    </p>
                  </div>
                )}

                {snapshot && (
                  <div className="rounded-lg border p-4 bg-muted/40">
                    <h3 className="text-sm font-semibold mb-2">What this means</h3>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.recommendationPreview}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" onClick={handleUpgrade}>
                    Unlock Full Report — $97 (Instant PDF)
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setEmailDialogOpen(true)}
                  >
                    Email my snapshot + tips (free)
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => router.push("/docs/sample-full-report.pdf")}
                  >
                    Preview sample full report
                  </Button>
                </div>

                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Is this a diagnosis?</p>
                      <p className="text-sm text-muted-foreground">
                        No. It’s a screening snapshot to guide next steps while you wait for a full evaluation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">What happens to my data?</p>
                      <p className="text-sm text-muted-foreground">
                        The AI stores no data. The app stores only minimal metadata—or nothing if you choose Anonymous Mode.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Can I cancel?</p>
                      <p className="text-sm text-muted-foreground">
                        Absolutely. If you purchase the full report, you still control how often you use it. Memberships can be cancelled anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <TrustFooter />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderStep()}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email my snapshot + tips</DialogTitle>
            <DialogDescription>
              See your instant snapshot now. We'll also email it with tips.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <Label className="flex items-center gap-2 text-xs">
              <Switch
                checked={marketingOptIn}
                onCheckedChange={setMarketingOptIn}
                aria-label="Consent to product updates"
              />
              Send me product updates and offers
            </Label>
            <input
              type="text"
              tabIndex={-1}
              aria-hidden
              className="hidden"
              defaultValue=""
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSubmit} disabled={leadSubmitting}>
              {leadSubmitting ? "Sending..." : "Email my snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {scoring && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70">
          <div className="rounded-2xl bg-background border border-border shadow-lg p-6 text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Generating your snapshot...</p>
          </div>
        </div>
      )}
    </div>
  );
}
