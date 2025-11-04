# ChatGPT Actions Integration - Complete Index

🎯 **Status**: All deliverables complete ✅
📅 **Created**: November 3, 2025
⏱️ **Estimated Implementation Time**: 6-8 hours

---

## 📦 Deliverables (3 Main Files + Supporting Docs)

### 1️⃣ OpenAPI Schema - `openapi.yaml`
**What**: Complete OpenAPI 3.1 specification for ChatGPT Actions
**Size**: ~800 lines
**Contains**:
- 7 endpoints fully documented
- Request/response schemas
- Error codes and messages
- Security configuration (API Key auth)
- All required metadata

**Use**: Upload to ChatGPT Builder or host at `https://app.behavioriq.com/openapi.yaml`

---

### 2️⃣ Implementation Guide - `CHATGPT_ACTIONS_GUIDE.md`
**What**: Complete code implementation for all 7 API routes
**Size**: ~800 lines
**Contains**:
- Full Next.js route handler code (copy-paste ready)
- Validation logic
- Error handling
- Database integration examples
- 7 API endpoints:
  1. `POST /api/trial/start`
  2. `POST /api/trial/submit`
  3. `GET /api/user/credits`
  4. `POST /api/checkout`
  5. `POST /api/assessment/start`
  6. `POST /api/assessment/submit`
  7. `GET /api/assessment/{id}/results`

**Use**: Reference while building your API routes

---

### 3️⃣ GPT System Prompt - `GPT_SYSTEM_PROMPT.txt`
**What**: Instructions for ChatGPT behavior and how to use the APIs
**Size**: ~2000 characters
**Contains**:
- How to guide users through assessments
- When to call which API endpoint
- How to handle payment flow
- How to present results professionally
- Tone and style guidelines
- Conversation examples

**Use**: Copy-paste directly into ChatGPT Builder "Custom Instructions" section

---

## 📚 Supporting Documentation

### 4️⃣ Quick Reference - `CHATGPT_ACTIONS_SUMMARY.md`
- **Purpose**: Quick checklist and reference
- **Best for**: Quick lookups during implementation
- **Includes**: Endpoint table, test commands, FAQ

### 5️⃣ Flow Diagrams - `CHATGPT_FLOW_DIAGRAM.md`
- **Purpose**: Visual understanding of data and request flows
- **Best for**: Understanding system architecture
- **Includes**:
  - Trial assessment flow diagram
  - Full assessment flow diagram
  - Payment flow
  - API request/response sequences
  - State management
  - Error handling
  - Performance metrics

---

## 🚀 Quick Start (Follow This Order)

### Step 1: Read Understanding Documents (15 min)
1. Read `CHATGPT_ACTIONS_SUMMARY.md` - Get overview
2. Review `CHATGPT_FLOW_DIAGRAM.md` - Understand architecture
3. Skim `openapi.yaml` - See the specification

### Step 2: Implement API Routes (4-5 hours)
1. Open `CHATGPT_ACTIONS_GUIDE.md`
2. Create each of the 7 Next.js route files
3. Copy code directly from the guide
4. Update database queries to match your schema
5. Test each endpoint locally with curl commands

### Step 3: Set Environment Variables (15 min)
Add to `.env.local`:
```env
CHATGPT_API_KEY=your-secure-random-key-here
STRIPE_SINGLE_PRICE_ID=price_xxx
STRIPE_CORE_MONTHLY_PRICE_ID=price_xxx
STRIPE_FAMILY_MONTHLY_PRICE_ID=price_xxx
STRIPE_CORE_ANNUAL_PRICE_ID=price_xxx
STRIPE_FAMILY_ANNUAL_PRICE_ID=price_xxx
NEXT_PUBLIC_SITE_URL=https://app.behavioriq.com
```

### Step 4: Test All Endpoints (1-2 hours)
Use test commands from `CHATGPT_ACTIONS_SUMMARY.md`:
```bash
curl -X POST http://localhost:3000/api/trial/start \
  -H "Content-Type: application/json" \
  -d '{"childAge": 8, "relationshipType": "parent"}'
```

### Step 5: Register ChatGPT App (30 min)
1. Go to https://platform.openai.com/apps
2. Click "Create new app"
3. Name: "BehaviorIQ Assessment"
4. OpenAPI URL: Upload `openapi.yaml` or point to hosted URL
5. Authentication: API Key (Header: `X-API-Key`)
6. Instructions: Copy-paste from `GPT_SYSTEM_PROMPT.txt`
7. Save and test

### Step 6: Test in ChatGPT (30 min)
1. Open ChatGPT
2. Select your BehaviorIQ app
3. Say: "Can I take a trial assessment?"
4. Follow the conversation flow
5. Verify API calls are working

---

## 📋 Files Reference

| File | Purpose | Read Time | Implementation |
|------|---------|-----------|-----------------|
| `openapi.yaml` | API Specification | 15 min | Required |
| `CHATGPT_ACTIONS_GUIDE.md` | Full Code Implementation | 30 min | Core work (4-5 hrs) |
| `GPT_SYSTEM_PROMPT.txt` | ChatGPT Instructions | 10 min | Copy-paste |
| `CHATGPT_ACTIONS_SUMMARY.md` | Quick Reference | 5 min | Reference |
| `CHATGPT_FLOW_DIAGRAM.md` | Visual Flows | 15 min | Understanding |
| `CHATGPT_ACTIONS_INDEX.md` | This file | 5 min | Navigation |

---

## 🔧 Implementation Checklist

### API Routes (Required)
- [ ] `/api/trial/start` - Create file, implement POST handler
- [ ] `/api/trial/submit` - Create file, implement POST handler
- [ ] `/api/user/credits` - Create file, implement GET handler with API key validation
- [ ] `/api/checkout` - Create file, implement POST handler for Stripe
- [ ] `/api/assessment/start` - Create file, implement POST handler
- [ ] `/api/assessment/submit` - Create file, implement POST handler
- [ ] `/api/assessment/{id}/results` - Create file, implement GET handler

### Configuration
- [ ] Set `CHATGPT_API_KEY` environment variable
- [ ] Add Stripe price IDs to environment
- [ ] Update `NEXT_PUBLIC_SITE_URL` for production
- [ ] Test all endpoints with curl

### ChatGPT Setup
- [ ] Register app at platform.openai.com/apps
- [ ] Upload/link OpenAPI schema
- [ ] Add API key authentication
- [ ] Paste system prompt
- [ ] Test in ChatGPT

### Deployment
- [ ] Deploy API routes to production
- [ ] Deploy OpenAPI schema to accessible URL
- [ ] Update ChatGPT app with production URLs
- [ ] Final end-to-end test

---

## 💡 Key Concepts

### Why OpenAPI?
✅ ChatGPT native support
✅ Industry standard
✅ Self-documenting
✅ Easy to test
✅ Works with Swagger tools

### Why API Key Auth?
✅ Simple to implement
✅ ChatGPT compatible
✅ Secure for server-side calls
✅ Easy to rotate/revoke

### Why These 7 Endpoints?
✅ Covers complete assessment lifecycle
✅ Trial → Full → Results
✅ Payment handling
✅ Credit management
✅ Minimal but complete

---

## 🧪 Testing Strategy

### Local Testing (Phase 1)
```bash
# Test trial flow
curl -X POST http://localhost:3000/api/trial/start

# Test with API key
curl -X GET "http://localhost:3000/api/user/credits?user_id=test123" \
  -H "X-API-Key: test-key"
```

### Production Testing (Phase 2)
```bash
# Test against production endpoints
curl -X POST https://app.behavioriq.com/api/trial/start

# Test OpenAPI schema
curl https://app.behavioriq.com/openapi.yaml
```

### ChatGPT Testing (Phase 3)
1. Register app
2. Open ChatGPT
3. Start conversation: "Hi, can I take a behavioral assessment?"
4. Follow full flow
5. Verify results display correctly

---

## 📊 Success Metrics

You'll know it's working when:

- ✅ All 7 endpoints return 200 OK
- ✅ Trial questions display in ChatGPT
- ✅ Scoring works correctly
- ✅ Stripe checkout URL generates
- ✅ Payment adds credits
- ✅ Full assessment works with credits
- ✅ Results display beautifully
- ✅ All error cases handled gracefully

---

## 🔒 Security Checklist

- [ ] API key is random and strong (min 32 characters)
- [ ] API key stored in environment (not in code)
- [ ] HTTPS enforced in production
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Stripe webhook signature verified
- [ ] User data access restricted to own user

---

## 📝 Database Models Needed

If not already present, ensure you have:

```typescript
// Trial session tracking
TrialSession {
  id: String @id
  childAge: Int
  relationshipType: String
  status: String
  answers: Json
  createdAt: DateTime
}

// Assessment with credits
Assessment {
  id: String @id
  userId: String
  status: String // IN_PROGRESS, COMPLETED
  createdAt: DateTime
}

// Credit transactions for audit
CreditTransaction {
  id: String @id
  userId: String
  amount: Int // negative = used, positive = added
  type: String // ASSESSMENT_STARTED, PURCHASE
  balanceAfter: Int
  createdAt: DateTime
}

// Assessment results storage
ChatGPTAssessmentResult {
  assessmentId: String @unique
  overallScore: Int
  domainScores: Json
  recommendations: Json
  createdAt: DateTime
}

// Stripe customer linking
User {
  stripeCustomerId: String?
  credits: Int // available credits
}
```

---

## 🆘 Troubleshooting

**"API returns 401 Unauthorized"**
- Check `CHATGPT_API_KEY` is set correctly
- Verify `X-API-Key` header is in request
- Confirm header matches environment variable

**"Stripe checkout fails"**
- Verify Stripe price IDs are correct
- Check Stripe secret key is valid
- Confirm webhook is registered

**"ChatGPT can't call actions"**
- Verify OpenAPI schema syntax (use validator: https://editor.swagger.io)
- Check API key is correctly configured in app settings
- Test endpoint directly with curl first

**"Credits not deducting"**
- Confirm assessment/start is called before assessment/submit
- Check database has credits field on User
- Verify transaction is logged

---

## 📚 Additional Resources

- **OpenAPI Spec**: https://spec.openapis.org/oas/v3.1.0
- **Swagger Editor**: https://editor.swagger.io
- **ChatGPT Platform**: https://platform.openai.com/apps
- **Stripe API**: https://stripe.com/docs/api
- **Next.js Routes**: https://nextjs.org/docs/app/building-your-application/routing

---

## ⏰ Timeline Estimate

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Read Documentation | 1 hr | ✅ Start here |
| 2 | Implement 7 Routes | 4-5 hrs | 🔨 Core work |
| 3 | Test Locally | 1-2 hrs | 🧪 Validation |
| 4 | Register ChatGPT App | 30 min | 🚀 Setup |
| 5 | Production Deploy | 1 hr | 📦 Launch |
| **Total** | | **6-8 hrs** | |

---

## 🎯 Next Steps

1. **Start here**: Read `CHATGPT_ACTIONS_SUMMARY.md` (5 min)
2. **Understand**: Review `CHATGPT_FLOW_DIAGRAM.md` (15 min)
3. **Implement**: Follow `CHATGPT_ACTIONS_GUIDE.md` (4-5 hrs)
4. **Deploy**: Push to production (1 hr)
5. **Register**: Set up app on platform.openai.com (30 min)
6. **Launch**: Go live! 🎉

---

## 💬 Questions?

Refer to:
- **"How do I...?"** → `CHATGPT_ACTIONS_GUIDE.md`
- **"What's the flow?"** → `CHATGPT_FLOW_DIAGRAM.md`
- **"Quick ref?"** → `CHATGPT_ACTIONS_SUMMARY.md`
- **"What to copy-paste?"** → `GPT_SYSTEM_PROMPT.txt` and `openapi.yaml`

---

## ✅ You Now Have

- ✅ Complete OpenAPI 3.1 specification
- ✅ Full Next.js implementation code for all 7 routes
- ✅ ChatGPT system prompt ready to copy-paste
- ✅ Flow diagrams and architecture documentation
- ✅ Testing commands and debugging tips
- ✅ Security checklist
- ✅ Complete implementation timeline

**Everything you need to launch ChatGPT Actions integration in 6-8 hours!**

---

**Version**: 1.0
**Status**: Ready to Implement
**Last Updated**: November 3, 2025
**Maintainer**: Your Dev Team

👉 **Start with: `CHATGPT_ACTIONS_GUIDE.md`** - It has all the code you need!
