# ChatGPT Actions - User Flow Diagram

## Trial Assessment Flow (No Account Required)

```
User asks "Can I take a trial assessment?"
  ↓
ChatGPT calls POST /api/trial/start
  ├─ Input: childAge, relationshipType
  └─ Output: sessionId, 15 questions
  ↓
ChatGPT presents questions one-by-one
  ├─ "Does your child struggle with attention?"
  ├─ "Does your child have behavior concerns?"
  ├─ ... (15 questions total)
  ↓
User answers all 15 yes/no questions
  ↓
ChatGPT calls POST /api/trial/submit
  ├─ Input: sessionId, answers[]
  └─ Output: score, domainScores, recommendations
  ↓
ChatGPT displays results:
  ├─ Overall Score: 72/100
  ├─ Domain breakdown (Attention, Behavior, Emotion, Social)
  ├─ Recommendations
  └─ Disclaimer
  ↓
ChatGPT offers: "Want to take the full 75-question assessment for deeper insights?"
```

---

## Full Assessment Flow (With Account & Credits)

```
User authenticated & wants full assessment
  ↓
ChatGPT calls GET /api/user/credits?user_id=xyz
  └─ Output: credits available, plan type
  ↓
❓ Do they have credits?
  │
  ├─ YES (credits ≥ 1)
  │   ↓
  │   ChatGPT calls POST /api/assessment/start
  │   ├─ Input: userId, childName, childAge, relationshipType
  │   └─ Output: assessmentId, 75 questions, creditsRemaining
  │   ↓
  │   ChatGPT presents all 75 questions (5 domains × 15 questions each)
  │   ├─ Attention & Focus (15 q's)
  │   ├─ Behavior & Impulse (15 q's)
  │   ├─ Social & Peers (15 q's)
  │   ├─ Emotional & Mood (15 q's)
  │   └─ Academic & Learning (15 q's)
  │   ↓
  │   User rates each: Never, Rarely, Sometimes, Often, Very Often
  │   ↓
  │   ChatGPT calls POST /api/assessment/submit
  │   ├─ Input: assessmentId, answers[] (75 items)
  │   └─ Output: status="submitted", message
  │   ↓
  │   ChatGPT calls GET /api/assessment/{id}/results
  │   ├─ (May need to poll - results process server-side)
  │   └─ Output: overallScore, domainScores, recommendations
  │   ↓
  │   ChatGPT displays comprehensive results
  │   ├─ Score breakdown by domain
  │   ├─ Severity levels (minimal, mild, moderate, significant, severe)
  │   ├─ Personalized recommendations
  │   ├─ Next steps checklist
  │   └─ Professional disclaimer
  │
  └─ NO (credits = 0)
      ↓
      ChatGPT calls POST /api/checkout
      ├─ Input: userId, planType, successUrl, cancelUrl
      └─ Output: checkoutUrl (Stripe)
      ↓
      ChatGPT presents checkout options:
      ├─ "Single Assessment" - $9.97 (1 credit)
      ├─ "Core Plan" - $59.99/month (2 credits)
      ├─ "Family Plan" - $99.99/month (5 credits)
      └─ Shares checkout URL
      ↓
      User clicks checkout URL
      ↓
      Stripe payment page
      ├─ User enters payment info
      └─ Completes transaction
      ↓
      Stripe webhook fires
      ├─ Updates user.credits in database
      └─ Marks transaction as complete
      ↓
      ChatGPT resumes conversation:
      "Great! Your credits have been added. Ready to start the assessment?"
      ↓
      ChatGPT calls POST /api/assessment/start (retry)
      └─ Now has credits, proceeds as above
```

---

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        ChatGPT                               │
└────────────────────────┬────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           ↓             ↓             ↓
      ┌─────────┐  ┌──────────┐  ┌─────────────┐
      │ Trial   │  │ User     │  │ Assessment  │
      │ Assess. │  │ Account  │  │ & Payment   │
      └────┬────┘  └────┬─────┘  └──────┬──────┘
           │            │               │
           ↓            ↓               ↓
    ┌──────────────────────────────────────────────┐
    │         BehaviorIQ API Server                │
    │  (Next.js Routes @ /api/*)                   │
    └──────┬───────────────────────────────────┬───┘
           │                                   │
           ↓                                   ↓
    ┌──────────────┐                 ┌──────────────────┐
    │  PostgreSQL  │                 │  Stripe API      │
    │  Database    │                 │  (Payments)      │
    └──────────────┘                 └──────────────────┘
```

---

## Endpoint Reference

### 1. Trial Assessment (Public)
```
POST /api/trial/start
  Headers: Content-Type: application/json
  Body: { childAge: 8, relationshipType: "parent" }
  Response: { sessionId, questions: [...15], totalQuestions: 15 }

POST /api/trial/submit
  Headers: Content-Type: application/json
  Body: { sessionId, answers: [...15 yes/no] }
  Response: { score: 72, domainScores, recommendations }
```

### 2. User Account (Requires API Key)
```
GET /api/user/credits?user_id=xxx
  Headers: X-API-Key: your-key
  Response: { credits: 3, plan: "core_monthly", nextCreditDate }
```

### 3. Checkout (Requires API Key)
```
POST /api/checkout
  Headers: Content-Type: application/json, X-API-Key: your-key
  Body: { userId, planType: "single_assessment" | "core_monthly" | ... }
  Response: { checkoutUrl: "https://checkout.stripe.com/..." }
```

### 4. Full Assessment (Requires API Key)
```
POST /api/assessment/start
  Headers: Content-Type: application/json, X-API-Key: your-key
  Body: { userId, childName, childAge, relationshipType }
  Response: { assessmentId, questions: [...75], creditsRemaining: 2 }
  Error 402: { error: "insufficient_credits", checkoutUrl }

POST /api/assessment/submit
  Headers: Content-Type: application/json, X-API-Key: your-key
  Body: { assessmentId, answers: [...75] }
  Response: { status: "submitted" }

GET /api/assessment/{assessmentId}/results
  Response: { overallScore, domainScores, recommendations, disclaimer }
```

---

## Data Flow Sequence

### Trial to Results (30 minutes)
```
00:00 - User starts trial
00:05 - Completes 15 questions
00:06 - ChatGPT calls submit
00:07 - Receives trial results
00:08 - Offered full assessment
00:08 - Checks credits (has 3 remaining)
00:09 - Starts full assessment
00:35 - Completes 75 questions (26 minutes)
00:36 - ChatGPT calls submit
00:37 - Polls for results (backend scoring)
00:40 - Results ready
00:41 - ChatGPT displays comprehensive results
```

### Payment Flow (5 minutes)
```
00:00 - User starts assessment
00:01 - Checks credits (has 0)
00:02 - Presented checkout URL
00:02 - Clicks checkout link
00:03 - Enters payment info on Stripe
00:04 - Completes payment
00:04 - Stripe webhook fires (adds credits)
00:05 - ChatGPT resumes with new credits
00:05 - User starts assessment (retry)
```

---

## State Management

### Trial Session State
```
TrialSession {
  id: "trial_abc123"
  childAge: 8
  relationshipType: "parent"
  status: "started" | "completed"
  questions: [] (question IDs)
  answers: [{questionId, answer}]
  startedAt: Date
  completedAt: Date?
}
```

### Assessment State
```
Assessment {
  id: "assess_xyz789"
  userId: "user_123"
  childName: "Emma"
  childAge: 8
  relationshipType: "parent"
  status: "IN_PROGRESS" | "COMPLETED" | "SCORED"
  questions: [] (75 question IDs)
  answers: [{questionId, answer}]
  startedAt: Date
  completedAt: Date?
}

ChatGPTAssessmentResult {
  assessmentId: "assess_xyz789"
  overallScore: 72
  percentile: 65
  domainScores: { attention, behavior, social, emotion, academic }
  recommendations: []
}
```

### User Credits State
```
User {
  id: "user_123"
  email: "parent@example.com"
  credits: 2 (remaining)
  plan: "core_monthly" | "family_monthly" | ...
  stripeCustomerId: "cus_xxx"
}

CreditTransaction {
  id: "trans_abc"
  userId: "user_123"
  amount: -1 (negative = used, positive = added)
  type: "ASSESSMENT_STARTED" | "PURCHASE" | "RENEWAL"
  reference: "assess_xyz789" (what it was for)
  balanceAfter: 2
  createdAt: Date
}
```

---

## Error Handling

```
✅ Success Path: 200 OK
├─ { success: true, data }

⚠️  User Input Error: 400 Bad Request
├─ { success: false, error: "invalid_age", message: "..." }

💳 Need Payment: 402 Payment Required
├─ { success: false, error: "insufficient_credits", checkoutUrl }

🔒 Auth Required: 401 Unauthorized
├─ { success: false, error: "unauthorized", message: "Invalid API key" }

❌ Not Found: 404 Not Found
├─ { success: false, error: "assessment_not_found", message: "..." }

⚡ Server Error: 500 Internal Server Error
├─ { success: false, error: "server_error", message: "..." }
```

---

## Security & Validation

```
Public Endpoints (No Auth)
  ✓ /api/trial/start
  ✓ /api/trial/submit
  ✓ /api/assessment/{id}/results

Protected Endpoints (API Key Required)
  ✓ /api/user/credits (X-API-Key header)
  ✓ /api/checkout (X-API-Key header)
  ✓ /api/assessment/start (X-API-Key header)
  ✓ /api/assessment/submit (X-API-Key header)

Validation Rules
  ✓ childAge: 3-18
  ✓ relationshipType: enum (parent, educator, other)
  ✓ sessionId: Must exist in database
  ✓ assessmentId: Must exist in database
  ✓ answers: Must match count (15 or 75)
  ✓ X-API-Key: Must match env var
```

---

## Performance Expectations

```
Trial Start:      ~100ms   (generate questions)
Trial Submit:     ~200ms   (score 15 questions)
Get Credits:      ~50ms    (database lookup)
Checkout:         ~300ms   (create Stripe session)
Assessment Start: ~150ms   (create assessment, deduct credits)
Assessment Submit:~200ms   (store answers)
Get Results:      ~100ms   (database lookup)

Total User Wait Times:
  Trial Flow:     ~5 mins   (mostly waiting for user input)
  Checkout:       ~2 mins   (Stripe payment process)
  Full Assessment:~30 mins  (user answering questions)
  Results:        ~5 secs   (API fetch)
```

---

## Monitoring & Logging

```
Critical Events to Log:
  ✓ Trial started (childAge, relationshipType)
  ✓ Trial completed (score, time taken)
  ✓ Assessment started (userId, childName)
  ✓ Assessment submitted (userId, time taken)
  ✓ Results scored (overallScore, riskLevel)
  ✓ Payment processed (userId, planType, amount)
  ✓ Credits deducted (userId, reason, balance)
  ✓ Errors (endpoint, error message, context)

Metrics to Track:
  📊 Trial completion rate
  📊 Full assessment completion rate
  📊 Conversion rate (trial → paid)
  📊 Average time per assessment
  📊 Error rate by endpoint
  📊 API response times
  📊 Stripe success rate
```

---

**This diagram shows the complete flow from user interaction through API calls to database and payment processing.**
