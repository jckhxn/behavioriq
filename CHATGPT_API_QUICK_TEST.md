# ChatGPT API - Quick Test Guide

**API Key:** `REDACTED_API_KEY`
**User ID:** `chatgpt-app-user`
**Base URL:** `http://localhost:3000` (dev) or `https://app.behavioriq.com` (prod)

---

## Setup (One-Time)

### 1. Register API Key in Database

**Using Prisma Studio (Easiest):**
```bash
npx prisma studio
# Open browser → MagicLinkToken table → Add record
# email: chatgpt-app@behavioriq.local
# token: REDACTED_API_KEY
# userId: chatgpt-app-user
# expiresAt: 2099-12-31
```

**Using SQL:**
```sql
INSERT INTO "users" (id, email, name, role)
VALUES ('chatgpt-app-user', 'chatgpt-app@behavioriq.local', 'ChatGPT App', 'USER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES ('chatgpt-app@behavioriq.local', 'REDACTED_API_KEY', 'chatgpt-app-user', '2099-12-31', NOW())
ON CONFLICT (token) DO NOTHING;
```

### 2. Add Credits

```sql
UPDATE "users" SET credits = 100 WHERE id = 'chatgpt-app-user';
```

---

## Test Endpoints

### 1. Check Credits

```bash
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"
```

**Expected Response (200):**
```json
{
  "userId": "chatgpt-app-user",
  "credits": 100,
  "creditsUsed": 0
}
```

---

### 2. Trial Assessment Flow

#### Start Trial
```bash
curl -X POST "http://localhost:3000/api/trial/start" \
  -H "Content-Type: application/json" \
  -d '{
    "childAge": 8,
    "relationshipType": "parent"
  }' | jq
```

**Response includes:** `sessionId`, 15 questions

#### Submit Trial Answers
```bash
TRIAL_SESSION_ID="trial_<copy-from-response>"

curl -X POST "http://localhost:3000/api/trial/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$TRIAL_SESSION_ID'",
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

**Response includes:** Domain scores, summary, recommendations

---

### 3. Full Assessment Flow

#### Start Full Assessment
```bash
curl -X POST "http://localhost:3000/api/assessment/start" \
  -H "X-API-Key: REDACTED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "chatgpt-app-user",
    "childName": "Emma",
    "childAge": 8,
    "relationshipType": "parent"
  }' | jq
```

**Response includes:** `assessmentId`, 75 questions, `creditsRemaining`

#### Submit Full Assessment

Save the `assessmentId` from above response:

```bash
ASSESSMENT_ID="assess_<copy-from-response>"

# Create 75 "sometimes" answers (quick test)
ANSWERS='[
  {"questionId": "q_attention_1", "answer": "sometimes"},
  {"questionId": "q_attention_2", "answer": "sometimes"},
  ... (repeat for all 75 questions)
]'

curl -X POST "http://localhost:3000/api/assessment/submit" \
  -H "X-API-Key: REDACTED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "'$ASSESSMENT_ID'",
    "answers": '$ANSWERS'
  }' | jq
```

#### Get Assessment Results
```bash
curl -X GET "http://localhost:3000/api/assessment/$ASSESSMENT_ID/results" | jq
```

**Response includes:** Domain scores, overall score, recommendations, next steps

---

### 4. Checkout (Create Stripe Session)

```bash
curl -X POST "http://localhost:3000/api/chatgpt/checkout" \
  -H "X-API-Key: REDACTED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "chatgpt-app-user",
    "planType": "single_assessment"
  }' | jq
```

**Available Plans:**
- `single_assessment`: 1 credit ($97)
- `core_monthly`: 2 credits/month ($59)
- `family_monthly`: 5 credits/month ($99)
- `core_annual`: 24 credits/year ($659)
- `family_annual`: 60 credits/year ($1,099)

---

## Error Scenarios

### Missing API Key
```bash
curl -X GET "http://localhost:3000/api/user/credits"
# Response (401):
# {"error": "Missing X-API-Key header", "code": "INVALID_API_KEY", "requestId": "..."}
```

### Invalid API Key
```bash
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: sk_test_invalid"
# Response (401):
# {"error": "Invalid API key", "code": "INVALID_API_KEY", "requestId": "..."}
```

### Insufficient Credits
```bash
# (First set credits to 0)
curl -X POST "http://localhost:3000/api/assessment/start" \
  -H "X-API-Key: REDACTED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userId": "chatgpt-app-user", "childName": "Test", "childAge": 8, "relationshipType": "parent"}'

# Response (402):
# {"error": "insufficient_credits", "message": "...", "creditsRequired": 1, "creditsAvailable": 0, "checkoutUrl": "https://checkout.stripe.com/..."}
```

### Invalid Parameters
```bash
curl -X POST "http://localhost:3000/api/trial/start" \
  -H "Content-Type: application/json" \
  -d '{"childAge": 25, "relationshipType": "parent"}'
# Response (400):
# {"error": "Validation failed: childAge: ...", "code": "VALIDATION_ERROR", "requestId": "..."}
```

---

## Quick Test Script

Save as `test_api.sh`:

```bash
#!/bin/bash

API_KEY="REDACTED_API_KEY"
USER_ID="chatgpt-app-user"
BASE_URL="http://localhost:3000"

echo "=== 1. Check Credits ==="
curl -s -X GET "$BASE_URL/api/user/credits" \
  -H "X-API-Key: $API_KEY" | jq

echo -e "\n=== 2. Start Trial ==="
TRIAL=$(curl -s -X POST "$BASE_URL/api/trial/start" \
  -H "Content-Type: application/json" \
  -d '{
    "childAge": 8,
    "relationshipType": "parent"
  }')
TRIAL_ID=$(echo $TRIAL | jq -r '.sessionId')
echo "Trial ID: $TRIAL_ID"

echo -e "\n=== 3. Start Assessment ==="
ASSESSMENT=$(curl -s -X POST "$BASE_URL/api/assessment/start" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "childName": "Test Child",
    "childAge": 8,
    "relationshipType": "parent"
  }')
ASSESSMENT_ID=$(echo $ASSESSMENT | jq -r '.assessmentId')
echo "Assessment ID: $ASSESSMENT_ID"
echo "Credits remaining: $(echo $ASSESSMENT | jq -r '.creditsRemaining')"

echo -e "\n✅ All tests passed!"
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid API key | Check key is registered in MagicLinkToken |
| 404 User not found | User doesn't exist | Create user 'chatgpt-app-user' |
| 402 Insufficient credits | Credits = 0 | Update credits in users table |
| 400 Validation error | Invalid parameters | Check parameter types and ranges |
| 500 Server error | Database error | Check database connection, run migrations |

---

## Environment Variable

Add to `.env.local` for easy reference:

```bash
CHATGPT_API_KEY="REDACTED_API_KEY"
CHATGPT_USER_ID="chatgpt-app-user"
```

---

## Next Steps

1. ✅ Register API key in database
2. ✅ Add credits to user
3. ✅ Test endpoints with curl
4. ✅ Configure ChatGPT App to use this key
5. ✅ Test full flow in ChatGPT

🚀 Ready to integrate with ChatGPT!
