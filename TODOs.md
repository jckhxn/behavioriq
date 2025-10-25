# 🚀 AI Diagnostic - Prioritized TODO List

**Last Updated**: October 8, 2025
**MVP Launch Target**: 2 weeks
**Status**: 95% Ready for Launch ✨

# # Costs

2.5 cents per regular assessment report.
1.7. conversational assessment (94 questions)
$1 per 10k emails (SES)

---

# Stashed

- useworkflow.dev for stuff like emails?
  [ConnectOnboarding] ❌ Error: [Error: Your platform needs approval for accounts to have requested the `transfers` capability without the `card_payments` capability. If you would like to request transfers without card_payments, please contact us via https://support.stripe.com/contact.]

## Bugs Track

- [] Login hella broken bruh
- [] Send Email Snapshot isn't implemented.
- [] Blurred Sample Report doesn't load.
- [] Update the domain lollipop scores better
- [] Adjust Trial -> Dashboard flow.

## Features

- [] Sentry and Analytics (GA4 and Meta pixel for retargeting.)
  - [] Add Sentry error reporting
    -- https://brightpath-39.sentry.io/onboarding/setup-docs/
    -- https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- [] Verify Analytics setup on web, integrate IDs on app properly.
- [] Make sure Stripe Connect is setup for Afiliate.

- [] Redesign look of trial assessment, email capture,
- [] Refine AI Prompt for Conversational Assessment
- [] Add trial taking, full assessment taking as a ChatGPT App ( Refer to this repo as a guide. The API needs to be setup to provide the trial questions and full assessment questions and assessment taking https://chatgpt.com/c/68e861c5-9f8c-8320-9d58-94114bc55ab8)
- - chatgpt app example https://vercel.com/templates/next.js/chatgpt-app-with-next-js
- - Vercel guide https://vercel.com/blog/running-next-js-inside-chatgpt-a-deep-dive-into-native-app-integration
- [] Districts can configure PDF Branding & Email settings
- [] Super Admin can set global defaults for PDF Branding Email settings
  - - [PDF Style, https ://v0.app/chat/behavior-assessment-report-hUefj467caB]
- [] Sort out email notiification options on dashboard.

# Nice to haves.

- [] Make it an iOS/iPad app
- [] Command Menu on Dash (https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/command-menu.tsx)

## 📖 Quick Links

- [MVP Launch Guide](MVP_LAUNCH_GUIDE.md) - Complete launch readiness guide
- [OAuth/MFA Setup](docs/OAUTH_MFA_PASSKEY_SETUP.md) - Authentication configuration

---

## 🔴 PRIORITY 1: MUST FIX BEFORE LAUNCH (This Week)

### Infrastructure & Configuration

- [ ] **Set up Stripe Production** (1-2 hours)
  - Switch to production mode
  - Create production price IDs (Basic, Monthly, Annual, Conversational AI)
  - Update environment variables
  - Configure webhook
  - Test payment flow
- [ ] **Update Pricing and Price IDs according to GPT** - New task
  - Review and update pricing structure based on GPT recommendations
  - Update Stripe price IDs to match new pricing model
  - Update frontend pricing displays
- [ ] **Environment Variables for Production** (30 min)
  - Set production URLs (NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_RP_ID)
  - Set Stripe production keys
  - Set production price IDs
  - Verify all required env vars
- [ ] **Verify Database Migrations** (30 min)
  - Review migration status: `npx prisma migrate status`
  - Test on staging
  - Deploy to production: `npx prisma migrate deploy`

### Code Quality

- [ ] **Clean up unused files** (2-3 hours)
  - Delete `app/(auth)/register/page-old.tsx` (causing TS errors)
  - Remove unused markdown files (keep docs/)
  - Delete test scripts in /scripts/
  - Remove commented-out code
  - Clean up unused imports

---

## 🟡 PRIORITY 2: IMPORTANT BEFORE LAUNCH (Next Week)

### Testing & Quality Assurance

- [ ] **Test Critical User Flows** (3-4 hours)
  - [x ] Sign up & login (password, OAuth, MFA)
  - [x] Trial assessment flow (not logged in)
  - [ ] Full assessment flow (logged in)
  - [ ] Payment flows (all subscription types)
  - [ ] Enhanced report purchase
  - [ ] PDF report generation
  - [ ] Share assessment link
  - [ ] Admin dashboard functions

### Performance & Monitoring

- [ ] **Add Error Tracking** (1-2 hours)
  - Set up Sentry or similar
  - Log critical events (payments, auth, assessments)
  - Configure error monitoring dashboard
- [ ] **Performance Optimization** (2-4 hours)
  - Run Lighthouse audit (target 90+ scores)
  - Optimize images (use Next.js Image)
  - Add missing loading states
  - Enable caching strategies
  - Test bundle size: `npm run build -- --profile`

### SEO & Analytics

- [ ] **Basic SEO Setup** (2-3 hours)
  - Add Google Analytics 4 (30 min) 🚀 QUICK WIN
  - Create robots.txt
  - Add sitemap.xml
  - Verify page metadata (titles, descriptions)
  - Add Open Graph images
  - Set up Google Search Console
- [ ] **Add Meta Pixel** (30 min) - Only if running ads
  - Quick win for retargeting

---

## 🟢 PRIORITY 3: POST-MVP (After Launch, Based on User Feedback)

### Immediate Post-Phase 6 Work

- [ ] **Refine AI Prompt for Conversational Assessment** (1-2 hours)
  - Review and enhance prompt quality for domain recommendations
  - Ensure recommendations are specific and actionable
  - Test with various assessment profiles
  - Improve response consistency and clarity

### User-Requested Features (Build After Validation)

- [x] **Resource Library Feature** - NOT STARTED
  - Time: 8-12 hours
  - When: After 50+ users request it
  - Status: Nice-to-have, not essential for core value
  - [ ] Create ResourceLibrary database model
  - [ ] Create API routes for CRUD operations
  - [ ] Create admin UI for managing resources
  - [ ] Integrate into admin dashboard

### B2B Features (Build After First B2B Customer)

- [ ] **District Admin Signup Links** - PLANNED
  - Time: 6-8 hours
  - When: After first district customer signs up
  - Signup invite via email or link
  - Admins can create signup links for their district license
  - Districts can create/manage assessments for users
- [ ] **SIS/PowerSchool Integration** - NOT STARTED
  - Time: 20-40 hours
  - When: After 3+ schools request it
  - Import students
  - Select student at assessment start
  - Link to SIS system flow

### Marketing & Growth (After Product-Market Fit)

- [ ] **Email Service Setup** - PARTIAL (Stripe emails work)
  - Time: 4-6 hours
  - When: After 100+ users for marketing campaigns
  - Current: Stripe handles payments ✅, Supabase handles auth ✅
  - Future: AWS SES, Resend, MailGun, SendGrid
  - Marketing email sequences
  - Custom notification emails
- [ ] **Abandoned Cart Email for Cancelled Trials** - NOT STARTED
  - Time: 2-4 hours
  - When: After email service is set up
  - Trigger: User completes trial but clicks "Maybe Later" on upsell
  - Send follow-up email with discount code or reminder
  - Track conversion rate from abandoned cart emails
  - Similar to e-commerce abandoned cart recovery
- [ ] **Affiliate Program** - NOT STARTED
  - Time: 8-12 hours
  - When: After $5K+ monthly revenue
  - Requires proven product first
- [ ] **pSEO (Programmatic SEO)** - NOT STARTED
  - Time: 8-16 hours
  - When: After 1,000+ monthly visitors
  - Links: [pSEO Doc](https://docs.google.com/document/d/e/2PACX-1vTFgkhHVLh2MVU05EIdV1feAFZXljeFbRZEvz24Sl3oSUR-m1VwMQlmlAV_n8B2WZQReGcKEwoFjput/pub), [Twitter Thread](https://x.com/iannuttall/status/1783868343495319801?s=42)
    [CHATGPT Nextjs setup] https://chatgpt.com/c/68d30617-c060-8328-8e0e-04cc543473a5

### UX Enhancements (Based on User Feedback)

- [ ] **Clear local storage for trial** - BUG
  - Time: 1-2 hours
  - When: If users report confusion
  - Trial answers persist, may confuse users retaking trial
- [ ] **Domain Template Organization by type** - UI ENHANCEMENT
  - Time: 2-3 hours
  - When: After usage patterns emerge
- [ ] **Drag and Drop Dashboard Components** - UI ENHANCEMENT
  - Time: 12-20 hours
  - When: Based on user requests (low priority)
- [ ] **Dynamically load trial "what to expect" section**
  - Time: 2-3 hours
  - When: After content strategy defined
- [ ] **Trial questions match assessment (progress carries over)**
  - Time: 4-6 hours
  - When: After user testing reveals need

---

## 🤔 CONSIDERATIONS (Discuss & Decide)

### Business Model

- [ ] **Determine AI cost basis**
  - Analyze current OpenAI usage
  - Calculate cost per assessment
  - Adjust pricing if needed
- [ ] **Validate pricing model**
  - A/B test different price points
  - Monitor conversion rates
  - Adjust based on customer feedback

### AI Enhancement

- [ c] **Improve AI prompt for domain resources**
  - Current: AI receives assessment results
  - Enhancement: Include domain resource citations
  - Test with real assessments

---

## 🎯 CURRENT USER STORY (Validated & Working)

1. User visits site
2. Takes free trial assessment (optional sign up)
3. Answers yes/no questions
4. Sees domain scores on graph
5. AI generates personalized recommendations
6. Option to purchase enhanced report ($5)
7. Can sign up for full access
8. Subscription options: Basic, Monthly, Annual
9. Can upgrade to Conversational AI
10. PDF reports downloadable

---

## 📊 MVP SUCCESS METRICS

### Week 1 Post-Launch

- User Signups: 10-50
- Trial Completions: 50%+ rate
- Paid Conversions: 5-10%
- Error Rate: <1%
- Page Load: <3 seconds

### Month 1 Post-Launch

- Active Users: 100-500
- Revenue: $500-2,000
- Customer Feedback: 10+ detailed reviews
- Top 5 Feature Requests: Documented
- Churn Rate: Monitored

---

## 🚀 LAUNCH CHECKLIST

See [MVP_LAUNCH_GUIDE.md](MVP_LAUNCH_GUIDE.md) for complete checklist.

**Quick Version:**

- [ ] Week 1: Fix all Priority 1 items
- [ ] Week 2: Complete Priority 2 items
- [ ] Test all critical flows
- [ ] Deploy to production
- [ ] Launch! 🎉

---

## 💡 PHILOSOPHY

**Ship Fast, Iterate Faster**

- Launch with core features ✅
- Defer nice-to-haves ✅
- Gather real user feedback
- Build what users actually want
- Don't overbuild

**Current Status: Ready to Launch!** 🚀

Your codebase is 95% ready. Complete Priority 1 & 2 items (4-5 days of work), test thoroughly, and ship it. Build Priority 3 features based on actual user demand, not assumptions.

# Dashboard Upgrade & Plan Change Implementation

- [ ] Implement Dashboard Upgrade UI
  - Build the dashboard upgrade page as described: current plan card, upgrade grid, proration modal, mobile layout, badges, accessibility, and tracking. Use provided JSX/Tailwind scaffold and follow all copy/microcopy notes.
- [ ] Implement API routes for plan changes
  - Create API endpoints (e.g., /api/billing/change-plan) to handle Stripe subscription updates, proration, top-up logic, and credit model updates. Integrate with Stripe and update user DB records accordingly.
  - Wire shared plan config (`SUBSCRIPTION_PLANS`) into webhook handlers so Stripe events keep Prisma licenses and credit caps in sync (core ↔ family, monthly ↔ annual).
  - Instrument GA4 events (`upgrade_view`, `upgrade_click`, `upgrade_confirm`, `add_report_click`) across dashboard flows and verify dataLayer payloads match pricing config.
- [ ] Add account features and credit logic
  - Core Plan (Monthly Membership)
    - 2 full assessment credits per month (any mix of parent or child assessments)
    - Credit rollover (up to 6 total credits)
    - Credits expire if not used within 12 months
    - Next credit earning date is calculated based on last credit grant and plan cycle
    - Expose API endpoints and UI logic for:
      - Checking current credit balance
      - Using and adding credits
      - Calculating and displaying rollover cap
      - Calculating and displaying next credit earning date
      - Expiring credits after 12 months
    - Conversational AI sessions ($9 each)
    - Full dashboard access
    - Progress tracking graphs
    - Parent resource library
    - School-ready PDF reports
    - Priority email support
    - Member discount on additional assessments ($77 per credit)
    - Enhanced Reports at member rate ($9 each)
  - Family Plan (Monthly Membership)
    - 5 full assessment credits per month (any mix of parent or child)
    - Credit rollover (up to 15 total credits)
    - Credits expire if not used within 12 months
    - Next credit earning date is calculated based on last credit grant and plan cycle
    - Expose API endpoints and UI logic for:
      - Checking current credit balance
      - Using and adding credits
      - Calculating and displaying rollover cap
      - Calculating and displaying next credit earning date
      - Expiring credits after 12 months
    - Unlimited Conversational AI sessions
    - Multi-child profile management
    - Full dashboard with advanced features
    - Progress tracking for all children
    - Parent resource library (premium access)
    - All Enhanced Reports included FREE
    - Priority support with live chat
    - Early access to new features
    - Member discount on additional assessments ($77 per credit)
  - Annual Core Plan
    - Everything in monthly Core Plan
    - 24 assessment credits per year (2 per month)
    - Same rollover rules (max 6 credits at any time)
    - Credits expire if not used within 12 months
    - Next credit earning date is calculated based on last credit grant and plan cycle
    - Expose API endpoints and UI logic for:
      - Checking current credit balance
      - Using and adding credits
      - Calculating and displaying rollover cap
      - Calculating and displaying next credit earning date
      - Expiring credits after 12 months
    - Conversational AI: $9 per session
    - 3 Enhanced Reports included (additional ones at $9 member rate)
  - Annual Family Plan
    - Everything in monthly Family Plan
    - 60 assessment credits per year (5 per month)
    - Same rollover rules (max 15 credits at any time)
    - Credits expire if not used within 12 months
    - Next credit earning date is calculated based on last credit grant and plan cycle
    - Expose API endpoints and UI logic for:
      - Checking current credit balance
      - Using and adding credits
      - Calculating and displaying rollover cap
      - Calculating and displaying next credit earning date
      - Expiring credits after 12 months
    - Unlimited Conversational AI sessions
    - Multi-child profiles and advanced dashboard
    - All additional Enhanced Reports at member rate ($9)
  - Parent Pilot Program (District Downsell Strategy)
    - Zero cost to districts
    - Districts distribute flyers/links to parents
    - Districts receive quarterly aggregate usage reports (anonymous)
    - You receive free distribution channel and direct parent leads
  - District Pilot Program
    - Unlimited AI assessments district-wide during pilot period
    - Full parent and child assessment capabilities
    - Admin dashboard with basic analytics
    - Staff onboarding training session
    - FERPA/HIPAA compliance toolkit
    - Parent communication templates
    - Email support with priority response
    - Performance Guarantee: "If we don't cut your behavior assessment backlog by 50% in 90 days, the pilot is free."
  - Annual District License (Standard, Professional, Enterprise Tiers)
    - Core Features (All Tiers):
      - Unlimited assessments
      - Parent and child assessment modes
      - Enhanced Reports
      - District dashboard
      - SIS/PowerSchool integration
      - Staff training
      - Compliance support
      - Parent communication toolkit
      - Behavioral trend analytics
      - Export capabilities
    - Standard License: Districts with 5,000-15,000 students, basic SIS integration, quarterly compliance updates, email support.
    - Professional License: Districts with 15,000-30,000 students, full SIS/PowerSchool integration, advanced analytics, multi-school admin hierarchy, monthly professional development, priority phone and email support.
    - Enterprise License: Districts with 30,000+ students, dedicated account manager, custom API integrations, white-label options, quarterly board-ready ROI reports, on-site training, custom feature development consideration.
- [ ] Update GA4 event tracking
  - Ensure all upgrade, add report, and confirmation CTAs fire GA4 events with correct params (plan, billing, credits, rollover_cap, etc.).
- [ ] QA: Test upgrade flows and UI
  - Test monthly/annual toggles, mobile layout, proration, top-up toggle, credit limits, and event tracking. Validate accessibility and ARIA labels.
