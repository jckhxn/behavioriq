# ChatGPT Actions - Quick Reference

## 📋 What You Need to Do

### Step 1: Create 7 API Endpoints
See `CHATGPT_ACTIONS_GUIDE.md` for complete code. Quick summary:

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/trial/start` | POST | Start 15-question trial | None |
| `/api/trial/submit` | POST | Submit trial answers | None |
| `/api/user/credits` | GET | Check remaining credits | API Key |
| `/api/checkout` | POST | Create Stripe checkout | API Key |
| `/api/assessment/start` | POST | Start 75-question assessment | API Key |
| `/api/assessment/submit` | POST | Submit assessment answers | API Key |
| `/api/assessment/{id}/results` | GET | Get assessment results | None |

### Step 2: Deploy OpenAPI Schema
- File: `openapi.yaml` (already created ✅)
- Host at: `https://app.behavioriq.com/openapi.yaml`

### Step 3: Register ChatGPT App
1. Go to https://platform.openai.com/apps
2. Click "Create new app"
3. Fill in:
   - **Name**: BehaviorIQ Assessment
   - **Description**: AI-powered behavioral assessments for children
   - **OpenAPI URL**: `https://app.behavioriq.com/openapi.yaml`
4. Add authentication:
   - Type: API Key
   - Header: `X-API-Key`
5. Copy the GPT System Prompt (see below)

### Step 4: Copy System Prompt
See `CHATGPT_ACTIONS_GUIDE.md` → Part 2 → Full prompt to copy-paste

---

## 🚀 Implementation Checklist

```
Phase 1: API Routes (4-6 hours)
  [ ] POST /api/trial/start
  [ ] POST /api/trial/submit
  [ ] GET /api/user/credits
  [ ] POST /api/checkout
  [ ] POST /api/assessment/start
  [ ] POST /api/assessment/submit
  [ ] GET /api/assessment/{id}/results

Phase 2: Testing (2-3 hours)
  [ ] Test each endpoint with curl
  [ ] Verify Stripe checkout works
  [ ] Test trial → full assessment flow
  [ ] Test payment handling

Phase 3: ChatGPT Registration (30 min)
  [ ] Register app on OpenAI platform
  [ ] Add OpenAPI schema
  [ ] Add API key authentication
  [ ] Paste system prompt
  [ ] Test in ChatGPT

Phase 4: Production (1-2 hours)
  [ ] Set environment variables
  [ ] Deploy to production
  [ ] Update OpenAPI URL
  [ ] Final end-to-end test
  [ ] Launch! 🎉
```

---

## 📝 Environment Variables Needed

```env
# API Security
CHATGPT_API_KEY=your-secure-api-key-here

# Stripe Price IDs
STRIPE_SINGLE_PRICE_ID=price_xxx
STRIPE_CORE_MONTHLY_PRICE_ID=price_xxx
STRIPE_FAMILY_MONTHLY_PRICE_ID=price_xxx
STRIPE_CORE_ANNUAL_PRICE_ID=price_xxx
STRIPE_FAMILY_ANNUAL_PRICE_ID=price_xxx

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://app.behavioriq.com
```

---

## 🧪 Quick Test Commands

### Test Trial Start
```bash
curl -X POST http://localhost:3000/api/trial/start \
  -H "Content-Type: application/json" \
  -d '{
    "childAge": 8,
    "relationshipType": "parent"
  }'
```

### Test Get Credits
```bash
curl -X GET "http://localhost:3000/api/user/credits?user_id=user123" \
  -H "X-API-Key: your-api-key"
```

### Test Checkout
```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "userId": "user123",
    "planType": "single_assessment"
  }'
```

---

## 💡 Key Decisions Made

✅ **OpenAPI 3.1** - Modern standard, ChatGPT native support
✅ **Actions (not MCP)** - Simpler, more direct integration
✅ **7 endpoints** - Covers full assessment lifecycle
✅ **API Key auth** - Simple, secure, ChatGPT-compatible
✅ **Stripe checkout** - Handles payment flow
✅ **System prompt** - 2000+ characters of detailed instructions

---

## 📚 Files Created

1. ✅ **openapi.yaml** - Full OpenAPI 3.1 schema
2. ✅ **CHATGPT_ACTIONS_GUIDE.md** - Complete implementation guide with all 7 routes
3. ✅ **CHATGPT_ACTIONS_SUMMARY.md** - This file (quick reference)

---

## 🎯 Success Criteria

Your ChatGPT app is ready when:

- [ ] All 7 endpoints return 200 OK responses
- [ ] Trial flow: question → answer → score works
- [ ] Full assessment: start → submit → results works
- [ ] Stripe checkout works and adds credits
- [ ] No credits → checkout flow works
- [ ] ChatGPT calls actions correctly
- [ ] Results display beautifully
- [ ] System prompt instructions are followed

---

## ❓ FAQ

**Q: Do I need to replace the existing MCP implementation?**
A: No! This is cleaner/simpler for ChatGPT. You can keep MCP for other integrations.

**Q: How do I test locally?**
A: Use `npm run dev` and test with curl commands above.

**Q: When should I use the API key?**
A: For endpoints that access user data or process payments: `/checkout`, `/user/credits`, `/assessment/start`, `/assessment/submit`.

**Q: How often should I update the OpenAPI schema?**
A: Cache it for 1 hour (via headers). Whenever you change endpoints, re-deploy the YAML.

**Q: Can I add more endpoints later?**
A: Yes! Just update `openapi.yaml` and re-register the app.

---

## 🔗 Resources

- OpenAPI Spec: `openapi.yaml`
- Full Implementation: `CHATGPT_ACTIONS_GUIDE.md`
- ChatGPT Platform: https://platform.openai.com/apps
- OpenAPI Docs: https://spec.openapis.org/oas/v3.1.0

---

**Status**: ✅ Ready to Implement
**Effort**: 6-8 hours total
**Complexity**: Medium (straightforward endpoints)
**Test Coverage**: High (7 testable endpoints)

Start with Phase 1 (API routes), then test before registering the ChatGPT app.
