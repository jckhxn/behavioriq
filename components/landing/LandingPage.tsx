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
  Brain,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  FileText,
  SparklesIcon,
  Globe,
  Award,
  BarChart3,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/80 dark:bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-75"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Diagnostic
              </span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                Beta
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
                  Try Free Assessment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl opacity-20"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 mb-8">
              <SparklesIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                AI-Powered Behavioral Assessment
              </span>
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                New
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Get clarity on your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                child's behavior
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                in minutes
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered assessment helps parents identify potential
              concerns early. Get instant insights and personalized
              recommendations from qualified professionals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                asChild
                className="group text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="#trial">
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
                <Link href="#how-it-works">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Takes 5-10 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Completely confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span>No diagnosis claims</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-y border-white/20 dark:border-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Trusted by parents and professionals worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                10,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Assessments completed
              </div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                95%
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Parent satisfaction rate
              </div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                Instant
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Assessment dashboard access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to get clarity on your child's behavioral
              patterns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative text-center border-2 border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <CardHeader className="pt-8 pb-6">
                  <div className="relative mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <FileText className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                    01
                  </div>
                  <CardTitle className="text-xl mb-4">
                    Take Assessment
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Answer simple questions about your child's behavior patterns
                    in a secure, confidential environment
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative text-center border-2 border-indigo-100 dark:border-indigo-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <CardHeader className="pt-8 pb-6">
                  <div className="relative mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-2 text-indigo-600 dark:text-indigo-400">
                    02
                  </div>
                  <CardTitle className="text-xl mb-4">AI Analysis</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Our AI analyzes responses against validated behavioral
                    indicators and clinical frameworks
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <Card className="relative text-center border-2 border-purple-100 dark:border-purple-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <CardHeader className="pt-8 pb-6">
                  <div className="relative mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-2 text-purple-600 dark:text-purple-400">
                    03
                  </div>
                  <CardTitle className="text-xl mb-4">Get Results</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Receive personalized insights and next-step recommendations
                    from qualified professionals
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Why parents choose AI Diagnostic
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with parents in mind, validated by professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <Card className="h-full border-2 border-blue-100 dark:border-blue-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">Science-Backed</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Built on validated psychological frameworks and clinical
                    best practices for accurate insights
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full border-2 border-green-100 dark:border-green-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">Expert Support</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Connect with qualified professionals for follow-up
                    consultations and guidance
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full border-2 border-yellow-100 dark:border-yellow-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-yellow-200 dark:hover:border-yellow-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">
                    Instant Insights
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Get immediate snapshot results, with instant access to your
                    full assessment dashboard
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full border-2 border-purple-100 dark:border-purple-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">
                    Confidential & Secure
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Your data is encrypted and never shared without your
                    explicit consent
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full border-2 border-indigo-100 dark:border-indigo-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">
                    Detailed Reports
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Comprehensive PDF reports with charts, recommendations, and
                    actionable resources
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="group">
              <Card className="h-full border-2 border-teal-100 dark:border-teal-900/50 bg-white/80 dark:bg-black/40 backdrop-blur-sm hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-3">Available 24/7</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Take assessments anytime, anywhere with our responsive web
                    platform
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trial CTA */}
      <section id="trial" className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Ready to get clarity on your child's behavior?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Take our free 5-minute assessment and get instant insights.
              Discover if your child shows behavioral patterns that may benefit
              from professional support.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="group text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/trial-assessment">
                  <SparklesIcon className="mr-3 h-6 w-6" />
                  Start Free Assessment Now
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>5-10 minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>100% confidential</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Perfect for first-time users</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />1
                    assessment snapshot
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Basic insights
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    General recommendations
                  </li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="#trial">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>Basic Report</CardTitle>
                <CardDescription>Comprehensive analysis</CardDescription>
                <div className="text-3xl font-bold">$29</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Full assessment report
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    AI-powered recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    PDF download
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resource library access
                  </li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For ongoing monitoring</CardDescription>
                <div className="text-3xl font-bold">$99</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited assessments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Professional consultation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full mt-6">
                  <Link href="/register">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What parents are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription>
                  "This gave me the confidence to seek professional help for my
                  son. The results were accurate and the recommendations were
                  spot-on."
                </CardDescription>
                <div className="text-sm font-medium">
                  - Sarah M., Mother of 8-year-old
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription>
                  "Quick, easy, and surprisingly thorough. It helped me
                  understand which behaviors were normal and which needed
                  attention."
                </CardDescription>
                <div className="text-sm font-medium">
                  - Michael R., Father of twin 6-year-olds
                </div>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <CardDescription>
                  "As a pediatric psychologist, I recommend this tool to parents
                  who want to prepare for their first consultation."
                </CardDescription>
                <div className="text-sm font-medium">
                  - Dr. Emily Chen, Child Psychologist
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="trial" className="py-20 px-4">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get clarity on your child's behavior?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our free assessment. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/trial-assessment">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="text-lg px-8"
            >
              <Link href="/register">View Full Pricing</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-6">
            ⚡ Results in 5-10 minutes &nbsp;&nbsp; 🔒 100% confidential
            &nbsp;&nbsp; 📞 Support available
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-blue-900 dark:from-gray-950 dark:to-blue-950 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-75"></div>
                  <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  AI Diagnostic
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Helping parents understand their children's behavioral patterns
                with AI-powered insights and professional guidance.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>HIPAA Compliant & Secure</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="#trial"
                    className="hover:text-blue-300 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <SparklesIcon className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    Free Assessment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-white">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/professionals"
                    className="hover:text-blue-300 transition-colors duration-300"
                  >
                    For Professionals
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 AI Diagnostic. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                SOC 2 Certified
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Available Worldwide
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
