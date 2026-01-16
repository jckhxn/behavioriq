"use client";

import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Brain,
  FileText,
  ArrowRight,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: ClipboardCheck,
      title: "Complete Quick Screening",
      description:
        "Answer simple questions about behaviors you've observed. Takes just 2 minutes.",
      color: "primary",
    },
    {
      number: "02",
      icon: Brain,
      title: "AI Analysis",
      description:
        "Our AI analyzes patterns and provides instant insights based on validated frameworks.",
      color: "accent",
    },
    {
      number: "03",
      icon: FileText,
      title: "Get Your Report",
      description:
        "Receive a comprehensive, school-ready PDF with actionable recommendations.",
      color: "success",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Instant Results",
      description: "No waiting weeks for appointments. Get clarity in minutes.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description:
        "FERPA-compliant. Anonymous mode available. Your data is protected.",
    },
    {
      icon: Sparkles,
      title: "Evidence-Based",
      description: "Built on validated clinical frameworks and research.",
    },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-subtle" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple steps to clarity
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get actionable insights about your child's behavioral patterns in
            three easy steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-mono font-bold text-muted-foreground">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-${step.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <step.icon className={`w-6 h-6 text-${step.color}`} />
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
