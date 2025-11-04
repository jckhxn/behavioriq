# Database Setup - Final Instructions

## What You Asked For

> "Do the SQL stuff for me using Supabase or SQL command I will copy paste. Are you using the .env variable BEHAVIORIQ_API_KEY for API calls from chatgpt?"

## Answer

✅ **SQL provided** - Ready to copy/paste into Supabase
✅ **API key clarified** - The .env variable is informational only
✅ **Database setup** - Takes 5 minutes

---

## About the Environment Variable

**Q: Are you using `BEHAVIORIQ_API_KEY` from .env for API calls from ChatGPT?**

**A: NO.** Here's how it actually works:

### How API Keys Actually Work

```
API Keys are stored in the database (MagicLinkToken table)
                    ↓
ChatGPT sends request with X-API-Key header
                    ↓
API middleware reads X-API-Key from request header
                    ↓
Middleware queries database for that API key
                    ↓
Middleware finds userId associated with key
                    ↓
Request is authorized and processed
```

### Why Not Use .env Variable?

Using database storage instead of .env is better because:
- ✅ Dynamic - Can add/remove keys without redeploying
- ✅ Revocable - Can disable keys immediately
- ✅ Scalable - Support multiple API keys per user
- ✅ Auditable - Track which user owns which key
- ✅ Secure - Keys aren't in version control or environment

---

## SQL Commands to Run

### Option 1: Copy-Paste (Easiest)

1. Open Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire block below:

```sql
-- Create ChatGPT App user (includes required password field)
INSERT INTO "users" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES ('chatgpt-app-user', 'chatgpt-app@behavioriq.local', 'ChatGPT App', '$2b$12$placeholder-for-chatgpt-api-user-no-password-login-needed', 'USER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Register the API Key
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES ('chatgpt-app@behavioriq.local', 'REDACTED_API_KEY', 'chatgpt-app-user', '2099-12-31', NOW())
ON CONFLICT (token) DO NOTHING;

-- Add 100 credits
UPDATE "users" SET credits = 100 WHERE id = 'chatgpt-app-user';

-- Verify it worked - User created
SELECT id, email, credits FROM "users" WHERE id = 'chatgpt-app-user';

-- Verify it worked - API key registered
SELECT email, token, "userId" FROM "MagicLinkToken" WHERE email = 'chatgpt-app@behavioriq.local';
```

4. Click "Run"
5. Done! ✅

**Note about the password field:** The users table requires a password column. Since ChatGPT authenticates via X-API-Key header (not password), we use a placeholder. This account will never be able to log in with a password, which is correct.

### Option 2: File Location

The SQL is also saved at:
```
SUPABASE_SETUP.sql
```

---

## Your API Key

**Used by ChatGPT to authenticate:**

```
REDACTED_API_KEY
```

**Details:**
- Storage: `MagicLinkToken` table in database
- User ID: `chatgpt-app-user`
- Expires: Never (2099-12-31)
- Format: `sk_test_<hash>`

---

## How It Works After Setup

### When ChatGPT Makes a Request

```
ChatGPT Browser:
  "I want to take an assessment"
           ↓
  ChatGPT sends request:
  POST /api/assessment/start
  X-API-Key: REDACTED_API_KEY
           ↓
Your API:
  1. Reads X-API-Key header
  2. Looks it up in MagicLinkToken table
  3. Finds: userId = 'chatgpt-app-user'
  4. Approves request ✅
  5. Processes request
  6. Returns assessment
           ↓
ChatGPT:
  "Great! Here's your assessment. Question 1: ..."
```

### The Middleware Code

```typescript
// File: lib/api/chatgpt/middleware.ts
export async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");  // ← From request header

  const token = await prisma.magicLinkToken.findUnique({
    where: { token: apiKey },  // ← Look up in database
  });

  if (token && !expired) {
    return { userId: token.user.id };  // ← Return user ID
  }

  return { userId: null, error: "Invalid API key" };  // ← Or error
}
```

---

## Verify It Worked

After running the SQL, verify with these commands:

### Check User Was Created
```sql
SELECT id, email, credits FROM "users" WHERE id = 'chatgpt-app-user';
```
Should return: 1 row with id='chatgpt-app-user', credits=100

### Check API Key Was Registered
```sql
SELECT email, token, "userId", "expiresAt" FROM "MagicLinkToken"
WHERE email = 'chatgpt-app@behavioriq.local';
```
Should return: 1 row with the full API key

---

## Test the API

Once SQL is run, test locally:

```bash
# Start dev server
npm run dev

# Test with the API key
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"
```

Expected response (200):
```json
{
  "userId": "chatgpt-app-user",
  "credits": 100,
  "creditsUsed": 0
}
```

---

## Adding More API Keys

To create additional keys for other users:

```sql
-- Create new user
INSERT INTO "users" (id, email, name, role)
VALUES ('user-2', 'user2@example.com', 'User 2', 'USER');

-- Create API key for that user
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES (
  'user2@example.com',
  'sk_test_another_random_key_here',  -- Generate your own
  'user-2',
  '2099-12-31',
  NOW()
);

-- Get the created key
SELECT token FROM "MagicLinkToken" WHERE email = 'user2@example.com';
```

---

## Files Provided

1. **SUPABASE_SETUP.sql** - Full SQL with comments
2. **SUPABASE_QUICK_COPY_PASTE.md** - Quick 5-minute guide
3. **API_KEY_CLARIFICATION.md** - Detailed explanation of the system
4. **This file** - Final instructions summary

---

## Timeline

- **Right now:** Run the SQL (5 minutes)
- **Then:** Test with curl (2 minutes)
- **Then:** Configure ChatGPT Builder (5 minutes)
- **Then:** Test in ChatGPT (5 minutes)
- **Then:** Deploy to production (15 minutes)

**Total to live: ~45 minutes** 🚀

---

## Summary

✅ API keys are stored in database (not .env)
✅ Middleware looks them up when requests arrive
✅ ChatGPT sends key in X-API-Key header
✅ SQL is ready to copy/paste
✅ Takes 5 minutes to set up
✅ Can add more keys anytime

---

## Next Actions (In Order)

1. **Copy & paste SQL into Supabase**
   → File: SUPABASE_QUICK_COPY_PASTE.md

2. **Verify SQL ran successfully**
   → Look for 2 result rows

3. **Test API locally**
   → Run curl command above

4. **Upload openapi.yaml to ChatGPT Builder**
   → https://platform.openai.com/apps

5. **Configure ChatGPT with API key**
   → Use: REDACTED_API_KEY

6. **Deploy to production**
   → git push origin main

7. **Update ChatGPT Builder for production**
   → Update URL to production domain

---

## Your API Key (Keep Safe)

```
REDACTED_API_KEY
```

**Store in .env.local for reference:**
```
CHATGPT_API_KEY="REDACTED_API_KEY"
```

---

**You're ready to deploy! 🚀**

Execute the SQL and you're good to go.
