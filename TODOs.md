# 🚀 AI Diagnostic - Prioritized TODO List

**Last Updated**: October 8, 2025
**MVP Launch Target**: 2 weeks
**Status**: 95% Ready for Launch ✨

# # Additional stuff in /PRICING_MATRIX.MD

# # Costs

2.5 cents per regular assessment report.
1.7. conversational assessment (94 questions)
$1 per 10k emails (SES)

---

## Bugs Track

- [] Fix pSEO generating grade level stuff thats not needed.
- [] Failed to load credits (likely from the migration stuff)
- [] Regular Report doesn't use ai-config.ts PROMPT
- [] Cleanup all the damn console.logs
- [] Assessments are so slow.
- [] maxConversationalReports is missing DB

## Features

- [] pSEO has redundant code/folders
- [] Have pSEO script generate sitemap automatically.
- [] AI Recommendation read out could be prettier (use custom components?)
- [] Update UI to reflect pricing changes (IDs already generated in .env)
  - - Refer to PRICING_MATRIX.md
- [] Verify Convo Assessment Flow (A->Results Page->Generate AI Report?)
- [] Add trial taking, full assessment taking as a ChatGPT App ( Refer to this repo as a guide. The API needs to be setup to provide the trial questions and full assessment questions and assessment taking https://chatgpt.com/c/68e861c5-9f8c-8320-9d58-94114bc55ab8)
- - chatgpt app example https://vercel.com/templates/next.js/chatgpt-app-with-next-js

- [] Global max limit for both AI reports and AI convos (This supercedes the amount of credits a user has purchased.)
- [] Districts can configure PDF Branding & Email settings
- [] Super Admin can set global defaults for PDF Branding Email settings
  - - [PDF Style, https ://v0.app/chat/behavior-assessment-report-hUefj467caB]
- [] Sort out email notiification options on dashboard.

# Nice to haves.

- [] Make it an iOS/iPad app
- [] Command Menu on Dash (https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/command-menu.tsx)
- [] Sentry and Analytics.

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
  - [ ] Sign up & login (password, OAuth, MFA)
  - [ ] Trial assessment flow (not logged in)
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
