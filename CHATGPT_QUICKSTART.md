# ChatGPT MCP Integration - Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Install MCP SDK
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Update Environment Variables
Add these to your `.env.local`:
```env
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_CHATGPT=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

# OAuth & JWT
JWT_SIGNING_KEY=your-secret-key-at-least-32-bytes-long

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_...
```

### 3. Run Database Migration
```bash
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## Testing Workflows

### Test 1: Trial Assessment (2 minutes)
Anonymous 15-question assessment - no auth needed.

```bash
# 1. Create trial session
curl -X POST http://localhost:3000/api/chatgpt/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "start_trial",
      "arguments": {
        "childAge": 8,
        "relationshipType": "parent"
      }
    }
  }'

# Expected: Trial assessment widget with 15 questions
```

### Test 2: Full Assessment with Auth (5 minutes)
Authenticated full assessment - requires login via magic link.

```bash
# 1. Request magic link
curl -X POST http://localhost:3000/api/auth/chatgpt-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Expected: Magic link token created
# Check application logs or email for magic link

# 2. Click magic link in email or simulate verification
# The link format is:
# http://localhost:3000/api/auth/chatgpt-magic-link/verify?token=xxxxx&email=test@example.com

# 3. After authentication, create full assessment
curl -X POST http://localhost:3000/api/chatgpt/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
      "name": "start_full_assessment",
      "arguments": {
        "childAge": 8,
        "relationshipType": "parent",
        "childName": "Emma"
      }
    }
  }'

# Expected:
# - If no credits: Stripe checkout widget
# - If has credits: Full 75-question assessment
```

### Test 3: Payment Flow (3 minutes)
Test credit purchase with Stripe.

```bash
# 1. Request checkout for single assessment
curl -X POST http://localhost:3000/api/stripe/chatgpt-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "single",
    "sessionId": "optional-session-id"
  }'

# Expected: { "url": "https://checkout.stripe.com/...", "sessionId": "..." }

# 2. Use Stripe test card in checkout:
# - Card: 4242 4242 4242 4242
# - Expiry: 12/25
# - CVC: 123

# 3. Webhook should fire automatically in test mode
# Check webhook logs: Dashboard → Developers → Webhooks
```

### Test 4: View Results (2 minutes)
Display completed assessment results.

```bash
# After completing a full assessment, view results
curl -X POST http://localhost:3000/api/chatgpt/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "view_results",
      "arguments": {
        "resultId": "assessment-result-uuid"
      }
    }
  }'

# Expected: Results widget with scores and recommendations
```

### Test 5: OAuth Flow (3 minutes)
Test OAuth 2.1 with PKCE support.

```bash
# 1. Get OAuth discovery document
curl http://localhost:3000/.well-known/oauth-authorization-server

# Expected: OAuth server metadata

# 2. Test authorization endpoint
curl "http://localhost:3000/api/oauth/authorize?client_id=test&response_type=code&redirect_uri=http://localhost:3001/callback&state=abc123&code_challenge=xxxxx&code_challenge_method=S256"

# Expected: Redirect with authorization code

# 3. Exchange code for token
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "auth-code-from-step-2",
    "client_id": "test",
    "redirect_uri": "http://localhost:3001/callback",
    "code_verifier": "your-code-verifier"
  }'

# Expected: { "access_token": "...", "token_type": "Bearer", "expires_in": 3600 }
```

## Database Checks

### View Recent Assessments
```sql
SELECT id, "userId", "subjectName", status, "createdAt"
FROM public."Assessment"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### View Credit Transactions
```sql
SELECT "userId", amount, type, reference, "balanceAfter", "createdAt"
FROM public."CreditTransaction"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### View Magic Link Tokens
```sql
SELECT email, "userId", "expiresAt", "createdAt"
FROM public."MagicLinkToken"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### View OAuth Tokens
```sql
SELECT "clientId", "expiresAt", "createdAt"
FROM public."OAuthToken"
ORDER BY "createdAt" DESC
LIMIT 10;
```

## Common Errors & Fixes

### "Cannot find module '@modelcontextprotocol/sdk'"
**Fix:** Run `npm install @modelcontextprotocol/sdk`

### "Missing magic link token"
**Fix:** Check RESEND_API_KEY is set and valid. Email may be in spam folder.

### "Stripe webhook failed"
**Fix:**
- Verify STRIPE_WEBHOOK_SECRET_CHATGPT matches dashboard
- Check webhook endpoint is accessible
- Review webhook logs in Stripe dashboard

### "OAuth discovery returns 404"
**Fix:** Verify route is created at `app/api/.well-known/oauth-authorization-server/route.ts`

### "Credits not adding after payment"
**Fix:**
- Check webhook signature verification
- Verify Stripe test mode is active
- Check CloudFlare/WAF isn't blocking webhooks

## Quick Testing Checklist

- [ ] Trial assessment loads and accepts 15 answers
- [ ] Full assessment requires authentication
- [ ] Magic link email is received
- [ ] Magic link login works
- [ ] Full assessment shows after login
- [ ] Stripe checkout appears when no credits
- [ ] Payment succeeds with test card
- [ ] Credits appear in User account
- [ ] Results display with scores
- [ ] OAuth discovery endpoint works
- [ ] Authorization code can be generated
- [ ] Token exchange succeeds
- [ ] Access token works with userinfo endpoint

## Performance Metrics

### Expected Response Times (Local Development)

- Trial assessment creation: ~100ms
- Magic link email: ~500ms
- Full assessment with auth: ~150ms
- Checkout session creation: ~300ms
- Results view: ~100ms
- OAuth token generation: ~50ms

### Database Indexes Created

```sql
-- For performance
CREATE INDEX idx_trial_session_status ON "TrialSession"(status);
CREATE INDEX idx_trial_session_created ON "TrialSession"("createdAt");
CREATE INDEX idx_credit_transaction_user ON "CreditTransaction"("userId");
CREATE INDEX idx_credit_transaction_type ON "CreditTransaction"(type);
CREATE INDEX idx_oauth_token_access ON "OAuthToken"("accessToken");
CREATE INDEX idx_oauth_token_refresh ON "OAuthToken"("refreshToken");
CREATE INDEX idx_authorization_code_client ON "AuthorizationCode"("clientId");
```

## Next Steps After Setup

1. **Update Stripe Keys**
   - Switch from test mode to live keys when ready for production
   - Update webhook endpoint URL

2. **Configure Email**
   - Test with real email addresses
   - Customize magic link email template
   - Set up email logging/monitoring

3. **Deploy to Staging**
   - Test full flow in staging environment
   - Set up monitoring and alerts
   - Test with ChatGPT app registration

4. **Register ChatGPT App**
   - Go to https://platform.openai.com/apps
   - Create new app
   - Set MCP endpoint
   - Configure OAuth
   - Submit for review

5. **Production Deployment**
   - Update all environment variables
   - Enable HTTPS enforcement
   - Set up monitoring/alerts
   - Configure rate limiting
   - Document API for support team

## Support Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [ChatGPT Apps SDK](https://platform.openai.com/docs/apps)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Implementation Docs](./CHATGPT_MCP_IMPLEMENTATION.md)

## Need Help?

Check the implementation documentation:
```bash
open CHATGPT_MCP_IMPLEMENTATION.md
```

Or review the relevant source files:
- MCP Server: `lib/chatgpt/mcp/server.ts`
- Tools: `lib/chatgpt/mcp/tools/`
- OAuth: `app/api/oauth/`
- Stripe: `app/api/stripe/`

---

**Last Updated:** 2025-11-03
**Status:** Ready for Testing
