# ChatGPT Actions API - BehaviorIQ Assessment

Complete implementation guide for using BehaviorIQ Assessment API as a ChatGPT Action.

## Overview

This API powers the BehaviorIQ ChatGPT App, enabling users to:
- Take a 15-question trial assessment (anonymous, no auth required)
- Take a full 75-question assessment (requires credits)
- Check account credits
- Purchase additional credits via Stripe checkout

### Key Features
- ✅ OpenAPI 3.1 specification
- ✅ Production-ready Next.js Route Handlers (App Router)
- ✅ Input validation using Zod schemas
- ✅ Rate limiting and API key authentication
- ✅ Stripe Checkout integration
- ✅ Comprehensive error handling
- ✅ Type-safe responses

---

## Quick Start

### 1. Local Development Setup

#### Install Dependencies
```bash
npm install
# or
yarn install
```

#### Environment Variables
Create or update `.env.local` with:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_diagnostic"

# Stripe (Test Keys)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

#### Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Start PostgreSQL (if using local instance)
pg_ctl -D /usr/local/var/postgres start
```

#### Start Dev Server
```bash
npm run dev
# API will be available at http://localhost:3000/api
```

### 2. Test API Locally

Use `curl` to test endpoints before uploading to ChatGPT.

#### Test Trial Assessment Flow

**Step 1: Start Trial Assessment**
```bash
curl -X POST http://localhost:3000/api/trial/start \
  -H "Content-Type: application/json" \
  -d '{
    "childAge": 8,
    "relationshipType": "parent"
  }' | jq
```

Response:
```json
{
  "sessionId": "trial_12345abc...",
  "totalQuestions": 15,
  "questions": [
    {
      "questionId": "trial_attention_1",
      "text": "Does your child have difficulty paying attention in class...",
      "domain": "attention"
    },
    ...
  ]
}
```

**Step 2: Submit Trial Answers**
```bash
curl -X POST http://localhost:3000/api/trial/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "trial_12345abc...",
    "answers": [
      {"questionId": "trial_attention_1", "answer": "yes"},
      {"questionId": "trial_attention_2", "answer": "no"},
      {"questionId": "trial_attention_3", "answer": "yes"},
      {"questionId": "trial_emotional_1", "answer": "no"},
      {"questionId": "trial_emotional_2", "answer": "yes"},
      {"questionId": "trial_emotional_3", "answer": "no"},
      {"questionId": "trial_social_1", "answer": "yes"},
      {"questionId": "trial_social_2", "answer": "no"},
      {"questionId": "trial_social_3", "answer": "yes"},
      {"questionId": "trial_behavioral_1", "answer": "no"},
      {"questionId": "trial_behavioral_2", "answer": "yes"},
      {"questionId": "trial_behavioral_3", "answer": "no"},
      {"questionId": "trial_learning_1", "answer": "yes"},
      {"questionId": "trial_learning_2", "answer": "no"},
      {"questionId": "trial_learning_3", "answer": "yes"}
    ]
  }' | jq
```

Response:
```json
{
  "sessionId": "trial_12345abc...",
  "domainScores": [
    {
      "domain": "attention",
      "score": 4,
      "percentile": 67,
      "severity": "moderate"
    },
    ...
  ],
  "summary": "The assessment suggests possible concerns in attention and behavioral domains...",
  "recommendations": [
    "Focus on supporting attention skills through targeted interventions.",
    "Focus on supporting behavioral skills through targeted interventions."
  ]
}
```

#### Test Authenticated Endpoints

First, you need an API key. API keys are stored in the `MagicLinkToken` table:

```bash
# In your database:
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES ('test@example.com', 'sk_test_abc123...', 'user-id-here', '2099-12-31', NOW());
```

**Get User Credits**
```bash
curl -X GET "http://localhost:3000/api/user/credits?user_id=user-id-here" \
  -H "X-API-Key: sk_test_abc123..." | jq
```

Response:
```json
{
  "userId": "user-id-here",
  "credits": 10,
  "creditsUsed": 2
}
```

**Create Checkout Session**
```bash
curl -X POST http://localhost:3000/api/chatgpt/checkout \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "userId": "user-id-here",
    "planType": "single_assessment"
  }' | jq
```

Response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "planType": "single_assessment",
  "amount": 97.0,
  "currency": "USD"
}
```

---

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. POST /api/trial/start
Start a 15-question trial assessment

**Request:**
```json
{
  "childAge": 8,
  "relationshipType": "parent"
}
```

**Response (200):**
```json
{
  "sessionId": "trial_...",
  "totalQuestions": 15,
  "questions": [...]
}
```

**Errors:**
- `400`: Invalid request parameters
- `500`: Internal server error

---

#### 2. POST /api/trial/submit
Submit trial assessment answers

**Request:**
```json
{
  "sessionId": "trial_...",
  "answers": [
    {"questionId": "trial_attention_1", "answer": "yes"},
    ...
  ]
}
```

**Response (200):**
```json
{
  "sessionId": "trial_...",
  "domainScores": [...],
  "summary": "...",
  "recommendations": [...]
}
```

**Errors:**
- `400`: Invalid session or answers
- `404`: Session not found
- `500`: Internal server error

---

### Authenticated Endpoints (Require X-API-Key)

#### 3. GET /api/user/credits
Get user's remaining credits

**Headers:**
```
X-API-Key: sk_test_...
```

**Query Parameters:**
```
user_id=<userId>  (optional, for reference)
```

**Response (200):**
```json
{
  "userId": "...",
  "credits": 10,
  "creditsUsed": 2
}
```

**Errors:**
- `401`: Missing or invalid API key
- `404`: User not found
- `500`: Internal server error

---

#### 4. POST /api/chatgpt/checkout
Create Stripe checkout session

**Headers:**
```
X-API-Key: sk_test_...
Content-Type: application/json
```

**Request:**
```json
{
  "userId": "...",
  "planType": "single_assessment"
}
```

**Available Plans:**
- `single_assessment`: 1 credit ($97)
- `core_monthly`: 2 credits/month ($59)
- `family_monthly`: 5 credits/month ($99)
- `core_annual`: 24 credits/year ($659)
- `family_annual`: 60 credits/year ($1,099)

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/...",
  "planType": "single_assessment",
  "amount": 97.0,
  "currency": "USD"
}
```

**Errors:**
- `400`: Invalid plan type or missing parameters
- `401`: Missing or invalid API key
- `500`: Stripe error or internal error

---

#### 5. POST /api/assessment/start
Start a full 75-question assessment (requires credits)

**Headers:**
```
X-API-Key: sk_test_...
Content-Type: application/json
```

**Request:**
```json
{
  "userId": "...",
  "childName": "Emma",
  "childAge": 8,
  "relationshipType": "parent"
}
```

**Response (200):**
```json
{
  "assessmentId": "assess_...",
  "totalQuestions": 75,
  "creditsRemaining": 9,
  "questions": [...]
}
```

**Insufficient Credits (402):**
```json
{
  "error": "insufficient_credits",
  "message": "You do not have enough credits for this assessment",
  "creditsRequired": 1,
  "creditsAvailable": 0,
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Errors:**
- `400`: Invalid parameters or child age out of range
- `401`: Missing or invalid API key
- `402`: Insufficient credits (returns checkout URL)
- `403`: User ID mismatch
- `404`: User not found
- `500`: Internal server error

---

#### 6. POST /api/assessment/submit
Submit full assessment answers

**Headers:**
```
X-API-Key: sk_test_...
Content-Type: application/json
```

**Request:**
```json
{
  "assessmentId": "assess_...",
  "answers": [
    {"questionId": "q_attention_1", "answer": "never"},
    {"questionId": "q_attention_2", "answer": "rarely"},
    {"questionId": "q_attention_3", "answer": "sometimes"},
    ...
  ]
}
```

**Allowed Answer Values:**
- `never`
- `rarely`
- `sometimes`
- `often`
- `very_often`

**Response (200):**
```json
{
  "assessmentId": "assess_...",
  "status": "completed",
  "message": "Assessment has been successfully submitted and scored."
}
```

**Errors:**
- `400`: Invalid answers or assessment already completed
- `403`: Assessment doesn't belong to authenticated user
- `404`: Assessment not found
- `500`: Internal server error

---

#### 7. GET /api/assessment/[assessmentId]/results
Get assessment results

**Response (200):**
```json
{
  "assessmentId": "assess_...",
  "childName": "Emma",
  "childAge": 8,
  "completedAt": "2024-01-15T10:30:00Z",
  "domainScores": [
    {
      "domain": "attention",
      "score": 45,
      "percentile": 72,
      "severity": "moderate"
    },
    ...
  ],
  "overall": {
    "score": 210,
    "percentile": 68,
    "severity": "moderate"
  },
  "recommendations": [...],
  "nextSteps": [...]
}
```

**Errors:**
- `400`: Assessment not yet completed
- `404`: Assessment not found
- `500`: Internal server error

---

## API Authentication

### Generating API Keys

API keys are stored in the `MagicLinkToken` table. To create a test key:

```sql
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES (
  'test@example.com',
  'sk_test_' || md5(random()::text),
  'user-id-from-users-table',
  '2099-12-31',
  NOW()
);
```

### Using API Keys

Include in all authenticated requests:

```bash
curl -H "X-API-Key: sk_test_..." https://app.behavioriq.com/api/...
```

### Invalid Key Response

```json
{
  "error": "Invalid API key",
  "code": "INVALID_API_KEY",
  "requestId": "..."
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "requestId": "unique-request-id"
}
```

### Common Error Codes

| Code | Status | Cause |
|------|--------|-------|
| `INVALID_REQUEST` | 400 | Malformed JSON |
| `VALIDATION_ERROR` | 400 | Invalid parameters |
| `MISSING_PARAMETER` | 400 | Required parameter missing |
| `INVALID_API_KEY` | 401 | Missing/invalid X-API-Key |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits (see checkoutUrl) |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `ASSESSMENT_NOT_FOUND` | 404 | Assessment doesn't exist |
| `SESSION_NOT_FOUND` | 404 | Trial session doesn't exist |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DATABASE_ERROR` | 500 | Database connection error |
| `STRIPE_ERROR` | 500 | Stripe API error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Uploading to ChatGPT Builder

### Step 1: Get the OpenAPI Schema

The schema is available at:
```
https://app.behavioriq.com/api/openapi
```

Or download locally:
```bash
curl https://app.behavioriq.com/api/openapi > openapi.yaml
```

### Step 2: Create ChatGPT App

1. Go to: https://platform.openai.com/apps
2. Click "Create new app"
3. Fill in Basic Info:
   - **Name:** BehaviorIQ Assessment
   - **Description:** AI-powered behavioral assessments for children aged 3-18
   - **Icon:** (upload logo)
   - **Instructions:** (paste from GPT_SYSTEM_PROMPT.txt)

### Step 3: Add OpenAPI Schema

1. Click "Import OpenAPI Schema"
2. Choose one:
   - **Paste:** Copy entire openapi.yaml content
   - **URL:** `https://app.behavioriq.com/api/openapi`

### Step 4: Configure Authentication

1. Go to "Authentication" section
2. Select: **API Key**
3. Configure:
   - **Header name:** `X-API-Key`
   - **Auth scheme:** Header
   - **Description:** "Your API key from BehaviorIQ dashboard"

### Step 5: Test Endpoints

ChatGPT will automatically test each operation. Verify all green checkmarks.

### Step 6: Save and Deploy

1. Click "Save"
2. App is immediately available to use
3. Copy App ID for your records

---

## Production Deployment

### Pre-Launch Checklist

- [ ] Stripe production keys configured
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] API keys created for production users
- [ ] HTTPS enabled (required)
- [ ] CORS configured for ChatGPT domain
- [ ] Rate limiting tested
- [ ] Error logs configured
- [ ] Monitoring/alerting set up
- [ ] Webhook handler tested

### Environment Variables (Production)

```bash
# Stripe (Production Keys)
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

# Webhook Secret
STRIPE_WEBHOOK_SECRET="whsec_..."

# Site URL
NEXT_PUBLIC_SITE_URL="https://app.behavioriq.com"

# Database (use your production URL)
DATABASE_URL="postgresql://..."

# Node
NODE_ENV="production"
```

### Deploy

```bash
# Build
npm run build

# Deploy to Vercel / your hosting
vercel deploy --prod
```

---

## Monitoring & Debugging

### View API Logs

Server logs include:
- `[Endpoint Name]` prefix for all operations
- Request ID for tracing
- Error messages without PII

Example:
```
[Trial Start] Database error: connection timeout
[Assessment Submit] Processing error: invalid score calculation
```

### Enable Debug Logging

Add to `.env`:
```bash
LOG_LEVEL=debug
```

### Common Issues

#### "Invalid OpenAPI schema"
- Validate at: https://editor.swagger.io
- Check YAML indentation (use 2 spaces)
- Ensure all paths start with `/api/`

#### "ChatGPT can't call endpoints"
- Verify endpoint URLs are correct in schema
- Test with curl first
- Check X-API-Key is configured in ChatGPT

#### "Rate limit exceeded"
- Trial: 10 requests/minute per sessionId
- Authenticated: 30 requests/minute per user
- Wait before retrying

#### "Insufficient credits (402)"
- Response includes `checkoutUrl`
- Direct user to Stripe checkout
- Webhook auto-credits account after payment

---

## Code Structure

```
/lib/api/chatgpt/
  ├── schemas.ts          # Zod validation schemas (all types)
  ├── middleware.ts       # Auth, rate limiting, utilities
  ├── questions.json      # Question bank (15 trial, 75 full)
  └── ...

/app/api/
  ├── trial/
  │   ├── start/route.ts        # POST /api/trial/start
  │   └── submit/route.ts       # POST /api/trial/submit
  ├── user/
  │   └── credits/route.ts      # GET /api/user/credits
  ├── chatgpt/
  │   └── checkout/route.ts     # POST /api/chatgpt/checkout
  └── assessment/
      ├── start/route.ts        # POST /api/assessment/start
      ├── submit/route.ts       # POST /api/assessment/submit
      └── [assessmentId]/
          └── results/route.ts  # GET /api/assessment/[id]/results

/openapi.yaml            # OpenAPI 3.1 specification
```

---

## Support

For issues or questions:
- Email: support@behavioriq.com
- Docs: https://docs.behavioriq.com
- Status: https://status.behavioriq.com

---

## License

© 2024 BehaviorIQ. All rights reserved.
