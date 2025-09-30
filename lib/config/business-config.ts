/**
 * Centralized Business Configuration
 * Contains pricing, messaging, and business logic constants
 */

export const BUSINESS_CONFIG = {
  // Core Pricing Structure
  PRICING: {
    CORE_OFFER: {
      amount: 9700, // $97.00 in cents
      display: "$97",
      name: "Full AI Report",
      description: "Comprehensive static assessment with AI-generated report",
    },
    MEMBERSHIP: {
      amount: 2900, // $29.00 in cents
      display: "$29",
      name: "Monthly Membership",
      description: "Ongoing assessment and tracking for $29/month",
    },
    CONVERSATIONAL_AI: {
      amount: 900, // $9.00 in cents
      display: "$9",
      name: "Conversational AI Mode",
      description: "Interactive session where child interacts directly with AI",
    },
    // Upsell calculations
    UPSELL: {
      MEMBERSHIP_3_MONTHS: {
        regular: 8700, // $87.00 (3 x $29)
        discounted: 4350, // $43.50 (50% off)
        display_regular: "$87.00",
        display_discounted: "$43.50",
        monthly_display: "$14.50",
      },
    },
    // Traditional cost comparison
    TRADITIONAL_COST: {
      session_range: "$300-500",
      annual_range: "$2,000-5,000+",
    },
  },

  // Call-to-Action Messages
  CTA: {
    TRIAL_TO_PURCHASE: "Get Your Full AI Report - $97",
    MEMBERSHIP_UPSELL: "Yes! Upgrade to Membership for $14.50/month",
    CONVERSATIONAL_ADD_ON: "Add Conversational AI Session - $9",
    CHECKOUT_CONTINUE: "Continue to Payment",
    RETAKE_ASSESSMENT: "Retake Assessment",
    START_NEW_ASSESSMENT: "Start New Assessment",
  },

  // Feature Descriptions
  FEATURES: {
    CORE_OFFER: [
      "Comprehensive static assessment (30-50 questions)",
      "AI recommendations with cited sources (Mayo Clinic, CDC, APA)",
      "School-ready PDF format",
      "Instant report generation",
      "Professional-grade analysis",
    ],
    MEMBERSHIP: [
      "1 new static full report per month (fresh assessment)",
      "Progress tracking graphs over time",
      "School-ready updates anytime",
      "Parent resource library access",
      "Assessment history and trends",
      "Add conversational AI sessions for $9 each",
    ],
    CONVERSATIONAL_AI: [
      "Direct child-AI interaction",
      "Richer behavioral insights",
      "Enhanced report generation",
      "Single session use",
    ],
  },

  // Value Propositions
  VALUE_PROPS: {
    TRADITIONAL_VS_PLATFORM: {
      traditional: {
        title: "❌ Traditional Route (What Most Parents Do)",
        items: [
          "Wait 3-6 months for specialist appointment",
          "Pay $300-500 per session",
          "Limited to specific timeframes",
          "One-time snapshot only",
          "No progress tracking",
          "No school-ready documentation",
        ],
        cost: "Total Cost: $2,000-5,000+ per year",
      },
      platform: {
        title: "✅ Our Solution (Smart Parents Choose This)",
        items: [
          "1 fresh assessment report every month",
          "Progress tracking graphs over time",
          "School-ready updates anytime",
          "Complete parent resource library",
          "Identify changes before they become problems",
          "Add conversational AI sessions for $9 each",
        ],
        cost: "Your Cost: Just $29/month",
      },
    },
  },

  // Assessment Configuration
  ASSESSMENT: {
    TRIAL: {
      question_count: 7,
      duration_minutes: 5,
      description: "Quick behavioral screening",
    },
    FULL: {
      question_count_range: "30-50",
      description: "Comprehensive static assessment",
    },
  },

  // UI Messages
  MESSAGES: {
    SUCCESS: {
      PAYMENT_COMPLETE: "Payment Successful!",
      ACCOUNT_CREATED: "Account created successfully!",
      ASSESSMENT_COMPLETE: "Assessment Complete!",
    },
    LOADING: {
      PAYMENT_PROCESSING: "Processing payment...",
      GENERATING_REPORT: "Generating your report...",
      ANALYZING_RESPONSES: "Analyzing responses...",
    },
    UPSELL: {
      HEADLINE: "🎉 Congratulations! You've Just Saved Your Family $1,000s",
      SUBHEADLINE: "But wait... I have something even better for you",
      LIMITED_TIME: "Limited Time: 50% OFF Your First 3 Months",
      EXPIRES_IN:
        "This offer expires in 24 hours and won't be available at this price again.",
    },
  },

  // Business Logic
  BUSINESS_RULES: {
    AI_REPORT_GENERATION: {
      max_generations_per_assessment: 1,
      save_for_recall: true,
    },
    MEMBERSHIP_BENEFITS: {
      reports_per_month: 1,
      resource_library_access: true,
      progress_tracking: true,
    },
  },
} as const;

// Type exports for TypeScript
export type PricingTier = keyof typeof BUSINESS_CONFIG.PRICING;
export type CTAType = keyof typeof BUSINESS_CONFIG.CTA;
export type FeatureSet = keyof typeof BUSINESS_CONFIG.FEATURES;
