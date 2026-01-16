"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  onStartCore?: () => void;
  onStartFamily?: () => void;
  onCompare?: () => void;
}

export function PricingCards({
  onStartCore,
  onStartFamily,
  onCompare,
}: PricingCardsProps) {
  const plans = [
    {
      name: "Free Snapshot",
      price: "$0",
      period: "",
      description: "Quick behavioral screening to get started",
      features: [
        "2-minute screening",
        "Basic behavioral indicators",
        "Instant results summary",
        "Anonymous option available",
      ],
      cta: "Start Free",
      ctaAction: onStartCore,
      variant: "outline" as const,
      popular: false,
    },
    {
      name: "Full Report",
      price: "$97",
      period: "one-time",
      description: "Comprehensive analysis with actionable recommendations",
      features: [
        "Everything in Free",
        "Detailed PDF report",
        "Domain-specific insights",
        "School-ready documentation",
        "Recommended next steps",
        "Classroom accommodation ideas",
      ],
      cta: "Get Full Report",
      ctaAction: onStartCore,
      variant: "default" as const,
      popular: true,
    },
    {
      name: "Family Plan",
      price: "$19",
      period: "/month",
      description: "Ongoing support for multiple children",
      features: [
        "Everything in Full Report",
        "Up to 3 child profiles",
        "Monthly progress tracking",
        "Unlimited screenings",
        "Priority support",
        "Early access to new features",
      ],
      cta: "Start Family Plan",
      ctaAction: onStartFamily,
      variant: "outline" as const,
      popular: false,
    },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeIn}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl p-8 transition-all duration-300",
                plan.popular
                  ? "bg-card border-2 border-primary shadow-lg shadow-primary/10 scale-105"
                  : "bg-card border border-border hover:border-border/80"
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant}
                size="lg"
                className="w-full"
                onClick={plan.ctaAction}
              >
                {plan.popular && <Zap className="w-4 h-4" />}
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Compare link */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mt-12"
        >
          <button
            onClick={onCompare}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Compare all features
          </button>
        </motion.div>
      </div>
    </section>
  );
}
