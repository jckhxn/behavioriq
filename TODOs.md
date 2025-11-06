# 🚀 AI Diagnostic – Launch Roadmap & Documentation

**Last Updated:** October 8, 2025  
**MVP Launch Target:** 2 Weeks  
**Status:** ✅ 95% Ready for Launch

---

## 📌 1. Overview

This document tracks everything required to launch the AI Diagnostic platform — including trial experience, backend tasks, launch blockers, and post-MVP roadmap.

---

## 💰 2. Core Costs

| Feature / Service                 | Cost                 |
| --------------------------------- | -------------------- |
| Regular Assessment Report         | $0.025 per report    |
| Conversational Assessment (94 Qs) | ~$0.017 _(verify)_   |
| AWS SES Email                     | $1 per 10,000 emails |

---

## 🧲 3. Trial Results Lead Magnet (Website Experience)

Render dynamic trial results based on **top flagged domain(s)** with fallback messaging.

### ✅ Required Components

#### **Risk Summary (Chips)**

Example: `Anxiety — Elevated`, `Mood — Typical`, `Self-Harm — Low`

#### **Scores at a Glance (Table)**

Format: `Domain | Your Score | Screener | Diagnostic | Status`

#### **Your 24-Hour Starter Plan**

Three interactive cards:

| Card                | Functionality                                             |
| ------------------- | --------------------------------------------------------- |
| Send Teacher Email  | **Copy text** → toast: “Copied!”                          |
| Log 3 Moments (ABC) | 3 inputs per row: Time, Antecedent, Behavior, Consequence |
| 10-Minute Routine   | Checkbox → shows “Done” timestamp                         |

- Progress chip: `0/3`, `1/3`, `2/3`, `3/3`
- Nudge: If still 0/3 after 6 hours → “Finish one step in 2 minutes…”
- Events tracked:  
  `starter.email_copied`, `starter.abc_saved`, `starter.action_done`, `starter.complete_3of3`

#### **Upgrade Section**

Primary CTA:  
**Finish the full assessment — $97 (Instant PDF)**  
Subtext: _Full report + AI recommendations with APA/CDC citations._

Secondary:

- Download Snapshot (PDF)
- Email Snapshot

#### **Privacy Text**

`AI stores no data • Anonymous mode available • Encrypted • FERPA/HIPAA-aligned`

---

## 📄 4. Provisional Snapshot PDF (Lead Magnet)

**Page 1 Structure:**

- ✅ Risk Chips
- ✅ “What this means” – 2 sentences (screening, not diagnosis)
- ✅ “3 Things You Can Do Today” – domain-aware content
- ✅ Upgrade Box: **Finish Full Assessment — $97 (Instant PDF)**

---

## ⚙️ 5. Pending Implementations

- [ ] Conversational AI mode (chat-based recs & static assessment)
- [ ] Decide AI stack: OpenAI Responses API + Vercel AI SDK vs Agents
- [ ] Add MFA/Passkey prompts in login flow
- [ ] Final Trial Results UI polish
- [ ] Lead Magnet Offer & Core Offer structure
- [ ] Monthly retention features (progress reports, etc.)
- [ ] Trial → Dashboard transition improvements
- [ ] Move to `react-pdf` + `react-email` (static HTML output)
- [ ] Stripe Connect (payout info in dashboard)
- [ ] GA4 & Meta Analytics in Super Admin

---

## 🐞 6. Known Bugs

- [ ] Trial results display unscored domains (should hide or gray out)
- [ ] Device fingerprint error — `lib/affiliate/fingerprint.ts:30`
- [ ] Email Snapshot feature not implemented
- [ ] Blurred sample report fails to load
- [ ] Trial shows problem domain data but lacks clear comparison to diagnostic cutoffs

---

## 🔴 7. Priority 1 – Must Complete Before Launch (This Week)

### ✅ Stripe & Payments

- [ ] Switch to Stripe production mode
- [ ] Create/replace production price IDs (Basic, Monthly, Annual, AI)
- [ ] Configure webhook + environment variables
- [ ] Test full payment & subscription flows

### ✅ Environment Setup

- [ ] Set production URLs (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RP_ID`)
- [ ] Set Stripe production keys & price IDs
- [ ] Verify all required env variables exist

### ✅ Database Stability

- [ ] Check migration status: `npx prisma migrate status`
- [ ] Test in staging
- [ ] Deploy: `npx prisma migrate deploy`

### ✅ Code Cleanup

- [ ] Delete unused pages (`register/page-old.tsx`)
- [ ] Remove unused markdown files outside `docs/`
- [ ] Remove test scripts in `/scripts/`
- [ ] Clean unused imports & commented code

---

## 🟡 8. Priority 2 – Essential Before Launch (Next Week)

### ✅ Critical Flow Testing

- [x] Sign up & Login (Email/OAuth/MFA)
- [x] Trial assessment (guest mode)
- [ ] Full assessment
- [ ] Payments (all plans)
- [ ] Enhanced Report purchase
- [ ] PDF generation & download
- [ ] Share assessment link
- [ ] Admin dashboard tests

### ✅ Monitoring & Performance

- [ ] Add Sentry/Error tracking
- [ ] Lighthouse ≥ 90 score
- [ ] Optimize images (Next/Image)
- [ ] Add missing lazy/loading states
- [ ] Check build size with profiling

### ✅ SEO & Analytics

- [ ] Add GA4
- [ ] Create `robots.txt` + `sitemap.xml`
- [ ] Ensure metadata, OpenGraph images
- [ ] Meta Pixel (if ads are active)

---

## 🟢 9. Priority 3 – Post-MVP

Includes:

- Conversational assessment improvements
- Resource Library feature (after 50+ requests)
- District Admin signup & School dashboard
- Email marketing automation
- Affiliate Program (after $5K MRR)
- pSEO pipeline (after 1,000+ monthly visitors)
- UX improvements (drag/drop, storage clearing, dynamic content)

---

## 🧊 10. Stashed / Ideas

- useworkflow.dev for workflows/emails
- Voice Mode
- iOS/iPad App
- Dashboard Command Menu (`⌘K`)

---

## 📊 11. MVP Success Metrics

### **Week 1**

- 10–50 signups
- 50% trial completion rate
- 5–10% conversion
- Error rate <1%
- Page load <3s

### **Month 1**

- 100–500 active users
- $500–$2,000 revenue
- 10+ feedback reviews
- Top 5 feature requests logged

---

## 🚀 12. Launch Checklist (Quick View)

- [ ] Finish Priority 1 tasks
- [ ] Finish Priority 2 tasks
- [ ] Test all critical user flows
- [ ] Deploy to production
- [ ] **Launch! 🎉**

---

## 💡 13. Philosophy

**Ship fast. Learn faster.**  
Don’t build what you _think_ users want — build what they _prove_ they need.  
You are 95% there — complete the final 5%, launch, iterate.

---

**End of Document** ✅
