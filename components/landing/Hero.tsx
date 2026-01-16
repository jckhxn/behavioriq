"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps {
  onStartSnapshot: () => void;
  onSampleReport: () => void;
  foundersActive?: boolean;
  foundersCountdown?: string;
}

export function Hero({
  onStartSnapshot,
  onSampleReport,
  foundersActive,
  foundersCountdown,
}: HeroProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute inset-0 bg-dots opacity-30" />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center"
        >
          {/* Badge */}
          {foundersActive && foundersCountdown && (
            <motion.div variants={fadeIn} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Zap className="w-4 h-4" />
                Founders Pricing ends in {foundersCountdown}
              </span>
            </motion.div>
          )}

          {/* Main headline */}
          <motion.h1
            variants={fadeIn}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Understand your child's
            <br />
            <span className="text-gradient">behavior in minutes</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeIn}
            className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto mb-8"
          >
            Get instant, AI-powered insights into behavioral patterns. A
            2-minute screening that provides clarity parents and schools need.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="xl"
              onClick={onStartSnapshot}
              className="w-full sm:w-auto shadow-glow"
            >
              Start Free Screening
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={onSampleReport}
              className="w-full sm:w-auto"
            >
              See Sample Report
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground/60"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>FERPA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>No data stored</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent" />
              <span>AI-powered analysis</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero visual - Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 md:mt-24"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Browser frame */}
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-card">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                    behavioriq.com/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 p-6 relative overflow-hidden">
                {/* Simulated dashboard content */}
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Sidebar */}
                  <div className="col-span-2 bg-slate-800/50 rounded-lg p-3 space-y-3">
                    <div className="h-8 bg-primary/20 rounded-md" />
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-700/50 rounded-md" />
                      <div className="h-6 bg-slate-700/50 rounded-md" />
                      <div className="h-6 bg-primary/30 rounded-md" />
                      <div className="h-6 bg-slate-700/50 rounded-md" />
                    </div>
                  </div>
                  {/* Main content */}
                  <div className="col-span-10 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-48 bg-slate-700/50 rounded-md" />
                      <div className="h-8 w-32 bg-primary/30 rounded-md" />
                    </div>
                    {/* Stat cards */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                        <div className="h-4 w-16 bg-slate-700/60 rounded" />
                        <div className="h-8 w-12 bg-accent/40 rounded font-bold" />
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                        <div className="h-4 w-20 bg-slate-700/60 rounded" />
                        <div className="h-8 w-16 bg-primary/40 rounded" />
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                        <div className="h-4 w-14 bg-slate-700/60 rounded" />
                        <div className="h-8 w-10 bg-green-500/40 rounded" />
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                        <div className="h-4 w-18 bg-slate-700/60 rounded" />
                        <div className="h-8 w-14 bg-amber-500/40 rounded" />
                      </div>
                    </div>
                    {/* Chart area */}
                    <div className="flex-1 bg-slate-800/40 rounded-lg p-4">
                      <div className="h-4 w-32 bg-slate-700/60 rounded mb-4" />
                      <div className="flex items-end gap-2 h-24">
                        <div
                          className="flex-1 bg-primary/30 rounded-t"
                          style={{ height: "60%" }}
                        />
                        <div
                          className="flex-1 bg-primary/40 rounded-t"
                          style={{ height: "80%" }}
                        />
                        <div
                          className="flex-1 bg-primary/50 rounded-t"
                          style={{ height: "45%" }}
                        />
                        <div
                          className="flex-1 bg-accent/40 rounded-t"
                          style={{ height: "90%" }}
                        />
                        <div
                          className="flex-1 bg-accent/50 rounded-t"
                          style={{ height: "70%" }}
                        />
                        <div
                          className="flex-1 bg-primary/40 rounded-t"
                          style={{ height: "55%" }}
                        />
                        <div
                          className="flex-1 bg-primary/30 rounded-t"
                          style={{ height: "75%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute -left-4 md:-left-12 top-1/3 p-4 rounded-lg bg-card border border-border shadow-lg hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium">Analysis Complete</div>
                  <div className="text-xs text-muted-foreground">2 min ago</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-4 md:-right-12 bottom-1/4 p-4 rounded-lg bg-card border border-border shadow-lg hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Instant Results</div>
                  <div className="text-xs text-muted-foreground">
                    No waiting
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
