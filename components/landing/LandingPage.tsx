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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <nav className="border-b border-white/20 bg-white/80 dark:bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-75" />
                <div className="relative p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BehaviorIQ™
              </span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
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
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl opacity-20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 mb-8">
                <SparklesIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Start your free AI behavior trial
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Clarity on your child&apos;s behavior in one free session
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl">
                BehaviorIQ™ turns the hard-to-explain moments into a guided
                action plan. Answer a few prompts, see which patterns matter,
                and walk away with recommendations you can try tonight.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Button
                  size="lg"
                  asChild
                  className="group text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="text-lg px-8 py-4 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300"
                >
                  <Link href="#sample-report">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Preview the report
                  </Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>5-7 minutes, guided prompts</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Upgrade only when you&apos;re ready</span>
                </div>
              </div>
            </div>
            <Card className="border-2 border-blue-200/70 dark:border-blue-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <Badge className="w-fit bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
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
                    className="flex items-start gap-3 rounded-xl border border-blue-100/70 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
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
        className="py-20 bg-white/70 dark:bg-black/30 backdrop-blur-sm border-y border-white/40 dark:border-slate-900/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Why families start the free trial
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Turn “something feels off” into a confident game plan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Instant insight, guided next steps, and clinician-backed resources
              designed to remove the guesswork.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {trialBenefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="h-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-shadow hover:shadow-xl"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-white/60 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              How the free trial works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              A guided path from questions to clarity
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              We respect your time. Every step is designed to fit in the margin
              of a busy day while capturing the detail clinicians need.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <Card
                key={step.title}
                className="relative border-2 border-blue-100/70 dark:border-blue-900/40 bg-white/80 dark:bg-slate-950/40 backdrop-blur-sm hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <CardHeader className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 dark:bg-blue-900/60 px-4 py-1 text-sm text-blue-700 dark:text-blue-200 w-fit">
                    {step.label}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
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
        className="py-20 bg-white/80 dark:bg-black/30 backdrop-blur-md border-t border-white/40 dark:border-slate-900/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Inside the free trial
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                Everything you need to take the next step
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
                The dashboard and email summary show exactly what to watch,
                what to try, and how to talk about it with educators and
                providers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Conversation-ready language
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Share tailored talking points with your pediatrician,
                      teacher, or therapist so everyone is aligned on next
                      steps.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Collaborative dashboard access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Invite co-parents or educators to view the free trial
                      insights so everyone stays on the same page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Upgrade when you&apos;re ready
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
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
                    className="flex items-start gap-3 rounded-xl border border-blue-100/80 dark:border-blue-900/50 bg-white/80 dark:bg-slate-950/50 px-4 py-3"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Results families are seeing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              “This gave us next steps the same day.”
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Join thousands of families and professionals using the free trial
              to lead more confident conversations.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
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
                  <CardDescription className="text-base italic text-gray-700 dark:text-gray-300 leading-relaxed">
                    “{testimonial.quote}”
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Common questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Everything you need to know before starting
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We built the trial to be transparent and easy. Still curious?
              Here are the questions we hear most.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="h-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
        className="py-28 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white"
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
                className="group text-lg px-10 py-6 bg-white text-blue-700 hover:text-blue-800 transition-all duration-300 shadow-xl"
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
                className="text-lg px-10 py-6 border-2 border-white/70 hover:bg-white/10 transition-all duration-300"
              >
                <Link href="/conversational-trial">Try the chat-guided demo</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 text-sm text-white/80">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Finish in minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>HIPAA-ready platform</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Invite co-parents for free</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
