# Testing Guide for Refactored Code

## 🧪 Testing Checklist

### Prerequisites

```bash
# 1. Regenerate Prisma Client
npx prisma generate

# 2. Ensure database is running
# 3. Ensure Stripe webhook secret is in .env
```

---

## 1. Test Domain Mapping (Bug Fix)

### What Was Fixed

All domains were showing as "Anti Social" - now each domain should show correct label.

### Test Steps

1. Create a full assessment with responses across all domains
2. View results page
3. **Expected:** See 5 distinct domains:
   - Attention & Hyperactivity (questions 1-9)
   - Anxiety (questions 10-18)
   - Depression (questions 19-27)
   - Oppositional Defiant (questions 28-35)
   - Conduct & Anti-Social (questions 36-51)

### Test Code

```typescript
import { getDomainFromQuestionNumber } from "@/lib/assessment/domain-mapper";

// Test question mapping
console.log(getDomainFromQuestionNumber(5)); // Should be "attention_hyperactivity"
console.log(getDomainFromQuestionNumber(15)); // Should be "anxiety"
console.log(getDomainFromQuestionNumber(25)); // Should be "depression"
console.log(getDomainFromQuestionNumber(30)); // Should be "oppositional_defiant"
console.log(getDomainFromQuestionNumber(40)); // Should be "antisocial"
```

---

## 2. Test Results Page Data Accuracy (Bug Fix)

### What Was Fixed

Results page showed inaccurate or missing data due to inconsistent score formats.

### Test Steps

1. Complete an assessment
2. Navigate to results page (`/assessment/[id]`)
3. **Expected:**
   - All domain scores displayed correctly
   - Severity labels match scores
   - Response count shown for each domain
   - No "undefined" or "NaN" values

### Test Cases

```typescript
// Test score normalization
import { assessmentService } from "@/lib/services/assessment-service";

const assessment = await assessmentService.getAssessmentWithScores("test-id");
console.log(assessment.scores);

// Should output:
// {
//   attention_hyperactivity: { score: 1.5, severity: "High", count: 9 },
//   anxiety: { score: 0.8, severity: "Moderate", count: 9 },
//   ...
// }
```

---

## 3. Test Webhook Handler (Refactoring)

### What Changed

Webhook handler now delegates to service layer with transaction safety.

### Test with Stripe CLI

```bash
# 1. Install Stripe CLI
# brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

### Expected Behavior

```
[Webhook] ✅ Event received: checkout.session.completed
[PaymentService] Processing checkout: cs_test_...
[PaymentService] User resolved: user_123
[PaymentService] Payment created: pay_123
[PaymentService] License created/updated: lic_123
[Webhook] ✅ Response: { received: true }
```

### Verify Database

```sql
-- Check payment was created
SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 1;

-- Check license was assigned
SELECT * FROM "user_licenses"
JOIN licenses ON "user_licenses"."licenseId" = licenses.id
ORDER BY "user_licenses"."createdAt" DESC LIMIT 1;

-- Check user was activated
SELECT "isActive" FROM users WHERE email = 'test@example.com';
```

---

## 4. Test Payment Service

### Test Anonymous Checkout

```typescript
import { paymentService } from "@/lib/services/payment-service";

// Mock Stripe session
const mockSession = {
  id: "cs_test_123",
  payment_status: "paid",
  customer: "cus_123",
  payment_intent: "pi_123",
  amount_total: 9700, // $97.00
  currency: "usd",
  metadata: {
    userEmail: "newuser@example.com",
    userName: "New User",
    userPasswordHash: "hashed_password",
    assessmentType: "basic",
  },
};

await paymentService.processCheckout(mockSession);

// Verify:
// 1. User created in database
// 2. Payment record created
// 3. License created and assigned
// 4. User is activated
```

### Test Enhanced Report Purchase

```typescript
const enhancedSession = {
  id: "cs_test_456",
  payment_status: "paid",
  customer: "cus_123",
  payment_intent: "pi_456",
  amount_total: 900, // $9.00
  currency: "usd",
  metadata: {
    userId: "existing_user_id",
    productType: "enhanced_report",
    assessmentId: "assessment_123",
  },
};

await paymentService.processCheckout(enhancedSession);

// Verify:
// 1. Assessment.hasEnhancedReport = true
// 2. Assessment.enhancedReportPurchasedAt set
// 3. Payment record created
```

---

## 5. Test Repository Pattern

### Test User Repository

```typescript
import { userRepository } from "@/lib/db/repositories/user-repository";

// Create user
const user = await userRepository.create({
  email: "test@example.com",
  name: "Test User",
  password: "hashed_password",
  role: "USER",
});

// Find user
const found = await userRepository.findByEmail("test@example.com");
console.log(found?.id === user.id); // Should be true

// Update user
await userRepository.activate(user.id);

// Verify
const activated = await userRepository.findById(user.id);
console.log(activated?.isActive); // Should be true
```

### Test License Repository

```typescript
import { licenseRepository } from "@/lib/db/repositories/license-repository";

// Create license
const license = await licenseRepository.create("BASIC");
console.log(license.maxAssessments); // Should be 1

// Assign to user
await licenseRepository.assignToUser(license.id, user.id);

// Check availability
const hasSlots = await licenseRepository.hasAvailableAssessments(user.id);
console.log(hasSlots); // Should be true
```

---

## 6. Test Assessment Service

### Test Score Calculation

```typescript
import { assessmentService } from "@/lib/services/assessment-service";

// Complete assessment
const result = await assessmentService.completeAssessment("assessment_id");

console.log(result.scores);
// Should output properly calculated scores for all domains

// Get with normalized scores
const assessment =
  await assessmentService.getAssessmentWithScores("assessment_id");
console.log(assessment.scores);
// Should handle both old and new score formats
```

---

## 7. Integration Tests

### Full Purchase Flow

```bash
# 1. User signs up (trial)
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}

# 2. User creates checkout session
POST /api/stripe/create-checkout-session
{
  "assessmentType": "basic",
  "source": "dashboard"
}

# 3. Simulate payment success (Stripe webhook)
stripe trigger checkout.session.completed

# 4. Verify user can access assessment
GET /api/assessments
# Should show 1 available assessment

# 5. Complete assessment
POST /api/assessments/[id]/complete

# 6. View results
GET /assessment/[id]
# Should show correct domain scores
```

---

## 8. Error Handling Tests

### Test Transaction Rollback

```typescript
// Simulate failure mid-transaction
try {
  await prisma.$transaction(async (tx) => {
    await tx.payment.create({ data: {...} });
    throw new Error('Simulated failure');
    await tx.license.create({ data: {...} }); // Should not execute
  });
} catch (error) {
  // Verify payment was NOT created (rolled back)
  const payments = await prisma.payment.findMany();
  console.log(payments.length); // Should be 0
}
```

---

## 9. Performance Tests

### Test Repository Queries

```typescript
import { performance } from "perf_hooks";

const start = performance.now();
const users = await userRepository.findWithRelations("user_id");
const end = performance.now();

console.log(`Query took ${end - start}ms`);
// Should be < 100ms with proper indexing
```

---

## 10. TypeScript Type Checking

### Run Type Checks

```bash
# Check for TypeScript errors
npm run type-check

# Or
npx tsc --noEmit

# Expected output: No errors!
```

---

## 🎯 Success Criteria

### Bug Fixes

- ✅ Results page shows correct data (no NaN, no undefined)
- ✅ All domains properly labeled (not all "Anti Social")
- ✅ Scores calculated accurately per domain

### Architecture

- ✅ Webhook handler < 100 lines
- ✅ All business logic in services
- ✅ Database transactions work correctly
- ✅ No TypeScript errors

### Functionality

- ✅ User creation works (anonymous + registered)
- ✅ Payment processing works
- ✅ License assignment works
- ✅ Enhanced report purchase works
- ✅ Subscription handling works

---

## 🐛 Known Issues & Limitations

### Prisma Client Types

Some fields like `hasEnhancedReport` may not be in generated types. This is expected with `as any` workarounds. Run `npx prisma generate` to update types.

### Webhook Retries

Current implementation doesn't handle idempotency keys. Consider adding for production:

```typescript
const idempotencyKey = session.id;
// Check if already processed...
```

### Test Environment

Ensure you're using test Stripe keys:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📝 Testing Log Template

```markdown
## Test Run: [Date]

### Domain Mapping

- [ ] Question 5 → Attention & Hyperactivity
- [ ] Question 15 → Anxiety
- [ ] Question 25 → Depression
- [ ] Question 30 → Oppositional Defiant
- [ ] Question 40 → Anti-Social
- [ ] Results page shows all 5 domains correctly

### Results Page

- [ ] Scores display correctly
- [ ] Severity labels match scores
- [ ] No undefined/NaN values
- [ ] Response counts shown

### Webhook Handler

- [ ] checkout.session.completed works
- [ ] invoice.payment_succeeded works
- [ ] customer.subscription.deleted works
- [ ] customer.subscription.updated works
- [ ] Database transactions work

### Payment Service

- [ ] Anonymous checkout creates user
- [ ] Payment records created
- [ ] Licenses assigned
- [ ] Enhanced reports unlock

### Repositories

- [ ] User CRUD operations work
- [ ] Payment queries work
- [ ] License management works
- [ ] Assessment operations work

### Notes:

[Add any observations or issues here]
```

---

## 🚀 Next Steps After Testing

1. **If tests pass:**
   - Deploy to staging
   - Test with real Stripe test mode
   - Monitor logs for 24 hours
   - Deploy to production

2. **If tests fail:**
   - Document failures
   - Check REFACTORING_SUMMARY.md for architecture details
   - Debug using service layer logs
   - Fix and retest

---

**Happy Testing! 🎉**
