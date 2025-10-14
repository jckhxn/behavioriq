# 🧩 BehaviorIQ™ Pricing Matrix Implementation Roadmap

## 📊 Current State Analysis

### ❌ Not Implemented

- [] Progress tracking & scoring

- [ ] Credit rollover caps (max 6 Core, max 15 Family)
- [ ] Distinct plan tiers (7 total plans)
- [ ] Multi-child profile system
- [ ] Tiered support system
- [ ] Enterprise SIS integration
- [ ] Branded PDF exports
- [ ] Add-on credit purchases
- [ ] Subscription upgrades/downgrades with proration
- [ ] District admin tools

# PRICING MATRIX & IMPLEMENTATION ROADMAP

## Overview

This document outlines the pricing tiers, feature access, and implementation roadmap for the AI Diagnostic platform. It includes the database schema, Stripe product configuration, and feature gating logic for each plan.

## Table of Contents

1. Pricing Tiers & Features
2. Database Schema
3. Stripe Product Configuration
4. Implementation Roadmap
5. Success Metrics & Deliverables

---

## 1. Pricing Tiers & Features

### Pricing Table

| Plan       | Monthly | Annual | Credits | Conversational AI | Multi-Child | PDF Export | Support   | Enterprise |
| ---------- | ------- | ------ | ------- | ----------------- | ----------- | ---------- | --------- | ---------- |
| BASIC      | $29     | $290   | 1/mo    | No                | No          | No         | Email     | No         |
| PLUS       | $49     | $490   | 2/mo    | No                | No          | Yes        | Email     | No         |
| FAMILY     | $79     | $790   | 4/mo    | Unlimited         | Yes         | Yes        | Priority  | No         |
| PRO        | $129    | $1290  | 8/mo    | 10/mo             | Yes         | Yes        | Priority  | No         |
| ENTERPRISE | Custom  | Custom | Custom  | Unlimited         | Yes         | Yes        | Dedicated | Yes        |

### Add-On Pricing

- Assessment Credit: **$77/credit**
- Conversational AI Add-On: **$9/mo**

### Feature Comparison

| Feature              | BASIC | PLUS  | FAMILY    | PRO      | ENTERPRISE |
| -------------------- | ----- | ----- | --------- | -------- | ---------- |
| Assessment Credits   | 1     | 2     | 4         | 8        | Custom     |
| Conversational AI    | No    | No    | Unlimited | 10/mo    | Unlimited  |
| Multi-Child Profiles | No    | No    | Yes       | Yes      | Yes        |
| PDF Export           | No    | Yes   | Yes       | Yes      | Yes        |
| Support              | Email | Email | Priority  | Priority | Dedicated  |
| Enterprise Features  | No    | No    | No        | No       | Yes        |

---

## 2. Database Schema

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  planTier      String
  credits       Int      @default(0)
  rolledCredits Int      @default(0)
  childProfiles Child[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Child {
  id        String   @id @default(uuid())
  userId    String
  name      String
  birthdate DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}

model Assessment {
  id        String   @id @default(uuid())
  userId    String
  childId   String?
  score     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  child     Child?   @relation(fields: [childId], references: [id])
}
```

---

## 3. Stripe Product Configuration

```js
// Example Stripe product config
const products = [
  {
    name: "Basic",
    priceMonthly: 2900,
    priceAnnual: 29000,
    credits: 1,
    features: ["Email Support"],
  },
  {
    name: "Plus",
    priceMonthly: 4900,
    priceAnnual: 49000,
    credits: 2,
    features: ["PDF Export", "Email Support"],
  },
  {
    name: "Family",
    priceMonthly: 7900,
    priceAnnual: 79000,
    credits: 4,
    features: ["Unlimited AI", "Multi-Child", "PDF Export", "Priority Support"],
  },
  {
    name: "Pro",
    priceMonthly: 12900,
    priceAnnual: 129000,
    credits: 8,
    features: ["10 AI/mo", "Multi-Child", "PDF Export", "Priority Support"],
  },
  {
    name: "Enterprise",
    priceMonthly: null,
    priceAnnual: null,
    credits: null,
    features: [
      "Unlimited AI",
      "Multi-Child",
      "PDF Export",
      "Dedicated Support",
      "Enterprise Features",
    ],
  },
];
```

---

## 4. Implementation Roadmap

### Phase 1: Database & Schema (Week 1)

- Setup database models for User, Child, Assessment
- Implement migrations
- Seed initial data

### Phase 2: Core Features (Week 1-2)

- Assessment CRUD
- Child profile CRUD
- Credit management logic

### Phase 3: Pricing & Stripe Integration (Week 2)

- Stripe product setup
- Checkout flows
- Webhook handling

### Phase 4: Child Profiles & Assessment Linking (Week 2-3)

- Child profile management
- Assessment-child linking

### Phase 5: Tiered Feature Access (Week 3-4)

- Conversational AI access control
- Feature gates by tier

### Phase 6: Payment & Checkout (Week 4)

- New checkout flows
- Add-on credit purchase
- Webhook enhancement

### Phase 7: Admin & Enterprise Features (Week 5)

- District admin dashboard
- Branded PDF exports
- SIS integration preparation

### Phase 8: UI/UX Updates (Week 5-6)

- Credits display component
- Pricing page redesign
- Billing management

### Phase 9: Automated Jobs & Maintenance (Week 6)

- Cron jobs for billing cycles
- Background workers

### Phase 10: Testing & Quality Assurance (Week 7)

- Unit tests
- Integration tests
- Manual testing checklist

### Phase 11: Migration & Deployment (Week 8)

- Data migration
- Rollout strategy

---

## 📋 Implementation Checklist by Feature

### Credit Rollover System

- Database schema for rolled credits
- Credit rollover service
- Billing cycle processor
- UI display component
- Expiration logic
- Cap enforcement (6/15)

### Multi-Child Profiles

- Child model in database
- Child CRUD API
- Child profile UI
- Child selector component
- Assessment-child linking
- Child-filtered dashboard

### Tiered Pricing

- 7 plan configurations
- Stripe products/prices
- Checkout flows for each
- Feature access middleware
- Upgrade/downgrade logic
- Proration handling

### Conversational AI Access

- Plan-based unlimited access
- Add-on purchase system
- Credit tracking separate from assessments
- Access validation middleware

### Enterprise Features

- District admin role
- Multi-school dashboard
- Bulk user management
- SIS connector framework
- Branded PDF generator
- API access controls

### Support Tiers

- Support tier assignment
- Priority routing logic
- Dedicated manager assignment
- Support ticket system integration

---

## 🎯 Success Metrics

- All 7 pricing tiers functional
- Credit rollover working with caps
- Multi-child profiles operational
- Conversational AI properly gated
- Upgrade/downgrade with proration
- Enterprise features demo-ready
- 100% webhook reliability
- Zero payment failures during migration

---

## ⚠️ Risk Mitigation

1. **Backward Compatibility:** Maintain existing user data
2. **Stripe Testing:** Use test mode extensively before production
3. **Credit Migration:** Dry-run migration script on copy of production data
4. **Gradual Rollout:** Feature flags for new functionality
5. **Monitoring:** Set up alerts for failed payments, credit issues

---

## 📦 Deliverables

- Updated database schema with migrations
- Complete pricing configuration
- 7 Stripe product configurations
- Enhanced credit management system
- Multi-child profile system
- Tiered feature access controls
- Subscription management system
- Enterprise admin dashboard
- Comprehensive test suite
- Migration scripts
- Updated documentation

---

## Estimated Timeline & Team

- **Estimated Timeline:** 8 weeks for full implementation
- **Team Size:** 1-2 developers
- **Priority Order:** Phase 1-6 are MVP, Phase 7-11 can be iterative
  conversationalAddonPrice: 900,
  interval: 'month',
  features: { /_ ... _/ },
  supportTier: 'PRIORITY*EMAIL'
  },
  FAMILY_MONTHLY: {
  id: 'family_monthly',
  name: 'Family Plan',
  price: 9900, // $99/mo
  creditsPerMonth: 5,
  rolloverCap: 15,
  conversationalAI: true, // Unlimited
  interval: 'month',
  multiChild: true,
  features: { /* ... _/ },
  supportTier: 'PRIORITY_CHAT'
  },
  CORE_ANNUAL: {
  id: 'core_annual',
  name: 'Annual Core',
  price: 59700, // $597/yr
  creditsPerMonth: 2,
  creditsPerYear: 24,
  rolloverCap: 6,
  conversationalAI: false,
  conversationalAddonPrice: 900,
  interval: 'year',
  features: { /_ ... _/ },
  supportTier: 'PRIORITY_EMAIL'
  },
  FAMILY_ANNUAL: {
  id: 'family_annual',
  name: 'Annual Family',
  price: 99700, // $997/yr
  creditsPerMonth: 5,
  creditsPerYear: 60,
  rolloverCap: 15,
  conversationalAI: true,
  interval: 'year',
  multiChild: true,
  features: { /_ ... _/ },
  supportTier: 'PRIORITY_CHAT'
  },
  ENTERPRISE: {
  id: 'enterprise',
  name: 'District License',
  priceRange: [25000, 60000], // $25k-$60k/yr
  creditsPerMonth: -1, // Unlimited
  rolloverCap: -1, // Unlimited
  conversationalAI: true,
  interval: 'year',
  multiChild: true,
  multiSchool: true,
  sisIntegration: true,
  brandedPDF: true,
  features: { /_ ... \_/ },
  supportTier: 'DEDICATED_MANAGER'
  }
  }

Tasks:

- Define all 7 pricing tiers in config
- Add feature matrices for each tier
- Document pricing logic

  2.2 Create Stripe Products & Prices

File: scripts/setup-stripe-products.ts

Tasks:

- Create script to set up Stripe products
- Create all products in Stripe
- Create prices for each tier
- Store price IDs in .env

---

Phase 3: Core Business Logic (Week 2)

3.1 Enhanced Credits Service

File: lib/services/enhanced-credits-service.ts

class EnhancedCreditsService {
// Check credits considering rollover
async checkCreditsWithRollover(userId: string)

// Use credit (deduct from rolled first, then current)
async useCredit(userId: string, type: 'assessment' | 'conversational')

// Monthly billing cycle processing
async processBillingCycle(userId: string)

// Add credits (purchase or subscription renewal)
async addCredits(userId: string, amount: number, source: 'purchase' |
'subscription')

// Get credit breakdown for display
async getCreditBreakdown(userId: string): {
current: number
rolled: number
total: number
cap: number
willRollover: number
willExpire: number
}
}

Tasks:

- Implement enhanced credits service
- Add rollover-aware credit checking
- Implement deduction priority (rolled first)
- Add credit breakdown calculations

  3.2 Subscription Upgrade/Downgrade Service

File: lib/services/subscription-tier-service.ts

class SubscriptionTierService {
// Upgrade/downgrade with proration
async changeTier(userId: string, newTier: PlanTier)

// Calculate proration
async calculateProration(currentTier, newTier, daysRemaining)

// Handle credit transfer on tier change
async handleCreditTransfer(userId: string, oldTier, newTier)
}

Tasks:

- Implement tier change service
- Add Stripe proration logic
- Handle credit adjustments on tier change
- Add tier change validation

---

Phase 4: Multi-Child Profiles (Week 3)

4.1 Child Profile Management

Files:

- app/api/children/route.ts - CRUD operations
- app/api/children/[id]/route.ts - Update/delete
- components/children/ChildProfileManager.tsx - UI component
- components/children/ChildSelector.tsx - Dropdown selector

Tasks:

- Create child profile API endpoints
- Implement child CRUD operations
- Create child profile UI component
- Create child selector dropdown
- Add child profile validation

  4.2 Assessment-Child Linking

Tasks:

- Update assessment creation to select child
- Add child filter to assessment list
- Create child-specific dashboard view
- Add child progress tracking

---

Phase 5: Tiered Feature Access (Week 3-4)

5.1 Conversational AI Access Control

File: lib/middleware/feature-access.ts

async function canAccessConversationalAI(userId: string): boolean {
const user = await getUserWithPlan(userId)

// Unlimited for Family & Enterprise
if (['FAMILY_MONTHLY', 'FAMILY_ANNUAL',
'ENTERPRISE'].includes(user.planTier)) {
return true
}

// Check addon credits for others
const credits = await checkConversationalCredits(userId)
return credits > 0
}

Tasks:

- Create feature access middleware
- Implement conversational AI gating
- Add plan-based unlimited access
- Create addon credit validation

  5.2 Feature Gates

Tasks:

- Gate dashboard features by tier
- Gate PDF export (all paid tiers)
- Gate multi-child profiles (Family & Enterprise)
- Gate progress graphs (paid tiers)
- Implement support tier routing

---

Phase 6: Payment & Checkout (Week 4)

6.1 New Checkout Flows

Files:

- app/api/stripe/checkout-tier/[tier]/route.ts - Tier-specific checkout
- app/checkout/[tier]/page.tsx - Checkout pages for each tier
- components/pricing/PricingMatrix.tsx - Pricing table component

Tasks:

- Create tier-specific checkout API endpoints
- Create checkout pages for each tier
- Build pricing matrix component
- Add tier comparison UI
- Implement checkout validation

  6.2 Add-On Credit Purchase

File: app/api/stripe/checkout-credits/route.ts

Tasks:

- Create credit purchase endpoint
- Allow assessment credit purchase ($77/credit)
- Allow conversational AI addon purchase ($9)
- Add credit purchase UI

  6.3 Webhook Enhancement

File: app/api/stripe/webhook/route.ts

Tasks:

- Handle subscription.created (new subscription)
- Handle subscription.updated (tier change)
- Handle invoice.payment_succeeded (renewal with credits)
- Handle invoice.payment_failed (suspend)
- Handle customer.subscription.deleted (downgrade)
- Add comprehensive webhook logging

---

Phase 7: Admin & Enterprise Features (Week 5)

7.1 District Admin Dashboard

Files:

- app/(admin)/district/page.tsx - District overview
- app/(admin)/district/users/page.tsx - User management
- app/(admin)/district/assessments/page.tsx - Bulk assessment tracking
- components/admin/DistrictAnalytics.tsx - Multi-school analytics

Tasks:

- Create district admin dashboard
- Build user management interface
- Create bulk assessment tracking
- Build multi-school analytics
- Add district-level reporting

  7.2 Branded PDF Exports (Enterprise)

File: lib/pdf/branded-pdf-generator.ts

Tasks:

- Create branded PDF generator
- Add custom logo/colors from Organization
- Implement white-label headers/footers
- Add custom footer text
- Create PDF customization UI

  7.3 SIS Integration Preparation

Files:

- lib/integrations/sis-connector.ts - Base connector
- lib/integrations/powerschool-connector.ts - PowerSchool
- lib/integrations/clever-connector.ts - Clever

Tasks:

- Create SIS connector framework
- Build PowerSchool connector
- Build Clever connector
- Add SSO/LTI support
- Create API endpoints for SIS

---

Phase 8: UI/UX Updates (Week 5-6)

8.1 Credits Display Component

File: components/dashboard/EnhancedCreditsDisplay.tsx

<CreditsDisplay
  current={2}
  rolled={3}
  total={5}
  cap={6}
  nextRenewal="Dec 15, 2025"
  willExpire={1}
/>

Tasks:

- Create enhanced credits display
- Show current + rolled credits
- Display rollover cap
- Show expiration warnings
- Add next renewal date

  8.2 Pricing Page Redesign

File: app/pricing/page.tsx

Tasks:

- Redesign pricing page with matrix
- Add feature comparison table
- Create FAQ section
- Add upgrade/downgrade CTAs
- Implement plan comparison tool

  8.3 Billing Management

File: components/settings/BillingManagement.tsx

Tasks:

- Build billing management UI
- Display current plan details
- Show credit usage history
- Add upgrade/downgrade buttons
- Display invoice history
- Add payment method management

🧠 8.4 UX Implementation Tips

Credit Counter Best Practices:

- Show prominent credit counter in dashboard header
  - Example: "You have 3 available credits" with visual badge
  - Use progress bar for visual representation of credit status
- Include renewal badge each billing cycle
  - Example: Badge with "+2 new credits added" on renewal day
  - Animate the credit increase for user delight
  - Show "Next renewal: Dec 15" countdown
- Show upcoming expiration warnings
  - Example: Warning banner "⚠️ 1 credit expires in 30 days"
  - Creates urgency to use credits before they expire
  - Use color coding: Green (safe) → Yellow (warning) → Red (urgent)
  - Email notification 7 days before expiration
- Make it easy to buy extra credits
  - Example: Quick-buy button "Add 1 more assessment for $97"
  - Inline upsell when credits run low
  - One-click purchase flow for existing customers
  - Show value proposition: "$77/credit vs $97 single purchase"

Visual Design Elements:

- Credit pill/badge in top navigation
- Visual credit meter (filled circles or progress bar)
- Animated transitions when credits change
- Confetti animation on credit renewal
- Empty state with "Buy Credits" CTA when depleted

Notification Strategy:

- Real-time credit balance updates
- Toast notifications on credit use
- Email digest: "Your monthly credits are here!"
- Push notifications for mobile (future)

---

Phase 9: Automated Jobs & Maintenance (Week 6)

9.1 Cron Jobs

Files:

- scripts/cron/process-billing-cycles.ts - Run daily to process renewals
- scripts/cron/rollover-expired-credits.ts - Handle credit expiration
- scripts/cron/send-low-credit-warnings.ts - Notify users

Tasks:

- Create billing cycle processor cron
- Create credit rollover cron
- Create low credit warning system
- Set up cron job scheduling
- Add monitoring and alerting

  9.2 Background Workers

Tasks:

- Implement credit rollover processor
- Create subscription renewal handler
- Build failed payment recovery system

---

Phase 10: Testing & Quality Assurance (Week 7)

10.1 Unit Tests

Tasks:

- Test credit rollover logic
- Test billing cycle processing
- Test proration calculations
- Test feature access gates
- Test tier change scenarios

  10.2 Integration Tests

Tasks:

- Test purchase flows for all tiers
- Test upgrade/downgrade scenarios
- Test webhook handling
- Test credit expiration
- Test multi-child functionality

  10.3 Manual Testing Checklist

Tasks:

- Test all 7 pricing tiers end-to-end
- Test credit rollover with caps
- Test conversational AI access rules
- Test multi-child profiles
- Test subscription changes
- Test enterprise features

---

Phase 11: Migration & Deployment (Week 8)

11.1 Data Migration

File: scripts/migrate-to-new-pricing.ts

Tasks:

- Create migration script
- Migrate existing users to new plan tiers
- Assign appropriate credit caps
- Convert existing licenses
- Preserve existing credits
- Test migration on staging data

  11.2 Rollout Strategy

Tasks:

- Deploy database schema changes
- Update pricing configuration
- Create Stripe products/prices
- Enable new checkout flows
- Run data migration
- Enable new features with feature flags
- Monitor metrics and errors
- Gradual rollout to users

---

📋 Implementation Checklist by Feature

Credit Rollover System

- Database schema for rolled credits
- Credit rollover service
- Billing cycle processor
- UI display component
- Expiration logic
- Cap enforcement (6/15)

Multi-Child Profiles

- Child model in database
- Child CRUD API
- Child profile UI
- Child selector component
- Assessment-child linking
- Child-filtered dashboard

Tiered Pricing

- 7 plan configurations
- Stripe products/prices
- Checkout flows for each
- Feature access middleware
- Upgrade/downgrade logic
- Proration handling

Conversational AI Access

- Plan-based unlimited access
- Add-on purchase system
- Credit tracking separate from assessments
- Access validation middleware

Enterprise Features

- District admin role
- Multi-school dashboard
- Bulk user management
- SIS connector framework
- Branded PDF generator
- API access controls

Support Tiers

- Support tier assignment
- Priority routing logic
- Dedicated manager assignment
- Support ticket system integration

---

🎯 Success Metrics

- All 7 pricing tiers functional
- Credit rollover working with caps
- Multi-child profiles operational
- Conversational AI properly gated
- Upgrade/downgrade with proration
- Enterprise features demo-ready
- 100% webhook reliability
- Zero payment failures during migration

---

⚠️ Risk Mitigation

1. Backward Compatibility: Maintain existing user data
2. Stripe Testing: Use test mode extensively before production
3. Credit Migration: Dry-run migration script on copy of production data
4. Gradual Rollout: Feature flags for new functionality
5. Monitoring: Set up alerts for failed payments, credit issues

---

📦 Deliverables

- Updated database schema with migrations
- Complete pricing configuration
- 7 Stripe product configurations
- Enhanced credit management system
- Multi-child profile system
- Tiered feature access controls
- Subscription management system
- Enterprise admin dashboard
- Comprehensive test suite
- Migration scripts
- Updated documentation

---

Estimated Timeline: 8 weeks for full implementationTeam Size: 1-2
developersPriority Order: Phase 1-6 are MVP, Phase 7-11 can be iterative

```

```
