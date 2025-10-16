import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  SparklesIcon,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

const trialBenefits = [
  {
    icon: Brain,
    title: "Personalized Behavior Snapshot",
    description:
      "Surface the patterns our clinicians watch for and understand the intensity of each behavior in a single glance.",
  },
  {
    icon: ListChecks,
    title: "Action Plan You Can Use Tonight",
    description:
      "Get scripts, conversation starters, and follow-up questions to try with your child, caregivers, and educators.",
  },
  {
    icon: ShieldCheck,
    title: "Professional-Grade & Confidential",
    description:
      "Built with licensed specialists. Your responses stay encrypted and private—no credit card required to start.",
  },
];

const steps = [
  {
    icon: FileText,
    label: "Step 1",
    title: "Tell us what you're seeing",
    description:
      "Answer guided prompts (5 minutes) about routines, triggers, and behaviors using language parents actually use.",
  },
  {
    icon: SparklesIcon,
    label: "Step 2",
    title: "AI organizes the patterns",
    description:
      "Our engine compares your responses against clinical frameworks, highlighting potential areas to watch closely.",
  },
  {
    icon: CheckCircle,
    label: "Step 3",
    title: "Review your starter plan",
    description:
      "Instantly unlock a dashboard with next steps, resource library matches, and a shareable report to bring to specialists.",
  },
];

const heroHighlights = [
  "Behavior clusters ranked by urgency with plain-language explanations.",
  "Next-step checklist with scripts you can try tonight.",
  "Shareable summary for spouses, teachers, or pediatricians.",
];

const deliverables = [
  "Behavior clusters ranked by urgency with plain-language explanations.",
  "Next-step checklist for home, school, and when to connect with a clinician.",
  "Email-ready summary you can share with spouses, teachers, or pediatricians.",
  "Resource library curated to your child’s profile with evidence-based tools.",
];

const testimonials = [
  {
    name: "Kim S.",
    role: "Parent of a 7-year-old",
    location: "Houston, TX",
    quote:
      "The free trial gave us direction the same night. We walked into our pediatrician visit feeling prepared instead of panicked.",
  },
  {
    name: "Marcus R.",
    role: "School Counselor",
    location: "Portland, OR",
    quote:
      "I now ask every family to complete the AI Diagnostic trial before our intake. The report cuts my prep time in half.",
  },
  {
    name: "Alisha P.",
    role: "Parent & PTO Leader",
    location: "Charlotte, NC",
    quote:
      "BehaviorIQ translated what we were observing into clinician language. Sharing the PDF with our school team sped up services.",
  },
];

const faqs = [
  {
    question: "Do I need to enter payment details to start the free trial?",
    answer:
      "No. The assessment, starter report, and dashboard access are completely free. Decide to upgrade only after you review your results.",
  },
  {
    question: "Who created the prompts and recommendations?",
    answer:
      "Our clinical advisory board (school psychologists, BCBA, LCSW) designed every prompt and reviewed the AI guardrails so the insights stay responsible.",
  },
  {
    question: "What happens after I finish the assessment?",
    answer:
      "You’ll see your behavior snapshot immediately, unlock targeted resources, and receive an email with a shareable summary. No waiting on a specialist’s schedule.",
  },
  {
    question: "Can educators and clinicians use the trial?",
    answer:
      "Absolutely. Many professionals start with the free assessment to prep for meetings and then upgrade for collaborative tools and unlimited reports.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <nav className="border-b border-border bg-card/80 dark:bg-card/40 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 dark:supports-[backdrop-filter]:bg-card/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-xl blur opacity-75" />
                <div className="relative p-2 gradient-primary rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                BehaviorIQ™
              </span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground"
              >
                Free Trial
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="gradient-primary text-primary-foreground"
              >
                <Link href="#trial">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Start Free Assessment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary/10 dark:gradient-primary/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] gradient-primary rounded-full blur-3xl opacity-20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 dark:bg-card/40 backdrop-blur-sm border border-secondary/50 dark:border-secondary/50 mb-8">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Start your free AI behavior trial
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
                  Clarity on your child&apos;s behavior in one free session
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
                BehaviorIQ™ turns the hard-to-explain moments into a guided
                action plan. Answer a few prompts, see which patterns matter,
                and walk away with recommendations you can try tonight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Button
                  size="lg"
                  asChild
                  className="group text-lg px-8 py-4 gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/trial-assessment">
                    <SparklesIcon className="mr-2 h-5 w-5" />
                    Start Free Assessment
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="text-lg px-8 py-4 border-2 border-border hover:bg-secondary/20 dark:hover:bg-secondary/30 transition-all duration-300"
                >
                  <Link href="#sample-report">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Preview the report
                  </Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>5-7 minutes, guided prompts</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <span>Upgrade only when you&apos;re ready</span>
                </div>
              </div>
            </div>
            <Card className="border-2 border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <Badge className="w-fit bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
                  What you&apos;ll see first
                </Badge>
                <CardTitle className="text-2xl mt-4">
                  Your Behavior Snapshot
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  The dashboard organizes behaviors by intensity and flags the
                  ones specialists review first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {heroHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 dark:bg-secondary/20 px-4 py-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="py-20 bg-card/70 dark:bg-card/30 backdrop-blur-sm border-y border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
              Why families start the free trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              Turn “something feels off” into a confident game plan
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Instant insight, guided next steps, and clinician-backed resources
              designed to remove the guesswork.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {trialBenefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="h-full border-2 border-transparent hover:border-border transition-shadow hover:shadow-xl"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">
                    {benefit.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary/10 dark:gradient-primary/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
              How the free trial works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              A guided path from questions to clarity
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              We respect your time. Every step is designed to fit in the margin
              of a busy day while capturing the detail clinicians need.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <Card
                key={step.title}
                className="relative border-2 border-border bg-card/80 dark:bg-card/40 backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <CardHeader className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 dark:bg-blue-900/60 px-4 py-1 text-sm text-blue-700 dark:text-blue-200 w-fit">
                    <span className="text-primary">{step.label}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="sample-report"
        className="py-20 bg-card/80 dark:bg-card/30 backdrop-blur-md border-t border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-4 bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
                Inside the free trial
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
                Everything you need to take the next step
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">
                The dashboard and email summary show exactly what to watch, what
                to try, and how to talk about it with educators and providers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Conversation-ready language
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Share tailored talking points with your pediatrician,
                      teacher, or therapist so everyone is aligned on next
                      steps.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Collaborative dashboard access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Invite co-parents or educators to view the free trial
                      insights so everyone stays on the same page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Upgrade when you&apos;re ready
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Keep using the starter plan or unlock unlimited
                      assessments, printable packets, and professional
                      handoffs—only if it makes sense for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="border-2 border-blue-200/70 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Free Trial Deliverables
                </CardTitle>
                <CardDescription>
                  Complete the assessment and unlock these items instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliverables.map((item) => (
                  <div
                    key={`deliverable-${item}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card/80 dark:bg-card/40 px-4 py-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/80 dark:bg-card/30 backdrop-blur-md border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
              Results families are seeing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              “This gave us next steps the same day.”
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Join thousands of families and professionals using the free trial
              to lead more confident conversations.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-border bg-card/80 dark:bg-card/40"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.role}
                    </Badge>
                  </div>
                  <CardDescription className="text-base italic text-muted-foreground leading-relaxed">
                    “{testimonial.quote}”
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/80 dark:bg-black/30 backdrop-blur-md border-y border-white/40 dark:border-slate-900/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground">
              Common questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
              Everything you need to know before starting
            </h2>
            <p className="text-lg text-muted-foreground">
              We built the trial to be transparent and easy. Still curious? Here
              are the questions we hear most.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="h-full border-2 border-transparent hover:border-border transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="trial"
        className="py-28 relative overflow-hidden gradient-primary text-primary-foreground"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,white,transparent_55%)]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border border-white/30">
              Start the free trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
              Create your BehaviorIQ™ assessment now
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
              Answer the guided prompts, review your personalized dashboard, and
              feel equipped for your next conversation with a clinician or
              educator. It’s free, secure, and ready when you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="group text-lg px-10 py-6 bg-card text-primary hover:text-primary-foreground transition-all duration-300 shadow-xl"
              >
                <Link href="/trial-assessment">
                  Start Free Assessment
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="text-lg px-10 py-6 border-2 border-border hover:bg-card/10 transition-all duration-300"
              >
                <Link href="/conversational-trial">
                  Try the chat-guided demo
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 text-sm text-white/80">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-primary-foreground" />
                <span>Finish in minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                <span>HIPAA-ready platform</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-primary-foreground" />
                <span>Invite co-parents for free</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
