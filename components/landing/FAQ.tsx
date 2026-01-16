"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";

const faqs = [
  {
    icon: Clock,
    question: "How long does the assessment take?",
    answer:
      "The Behavioral Snapshot takes about 5–7 minutes. It's designed to be quick but thorough, using research-backed questions to identify key behavioral patterns without overwhelming you or your child.",
  },
  {
    icon: Sparkles,
    question: "What age range is this assessment designed for?",
    answer:
      "Our assessments are designed for children ages 4–18. The questions and analysis are calibrated for different developmental stages to ensure accurate, age-appropriate insights.",
  },
  {
    icon: Shield,
    question: "Is my child's information kept private?",
    answer:
      "Absolutely. We use bank-level encryption and never share or sell your data. Your child's assessment results are only visible to you, and you can delete your data at any time.",
  },
  {
    icon: MessageCircle,
    question: "How accurate is the AI-powered analysis?",
    answer:
      "Our AI has been trained on thousands of clinical assessments and reviewed by child psychology experts. While it provides valuable insights, it's designed to complement—not replace—professional evaluation when needed.",
  },
  {
    icon: HelpCircle,
    question: "What if I disagree with the results?",
    answer:
      "The assessment provides insights based on your responses. If something doesn't feel right, we encourage you to re-take sections or consult with a professional. Our full report includes guidance on when to seek additional support.",
  },
  {
    icon: Sparkles,
    question: "Can I use this for multiple children?",
    answer:
      "Yes! Our Family Plan allows unlimited assessments for up to 5 children, each with their own profile and progress tracking. It's perfect for parents with multiple kids at different ages.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our behavioral assessment platform
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className={`
                    w-full text-left p-6 rounded-2xl transition-all duration-300
                    ${
                      isOpen
                        ? "bg-card shadow-lg ring-2 ring-primary/20"
                        : "bg-card hover:bg-muted shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                    `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-foreground text-left">
                          {faq.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </motion.div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@aidiagnostic.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
