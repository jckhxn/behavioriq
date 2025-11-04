# API Key System Clarification

## The Short Answer

**The environment variable `BEHAVIORIQ_API_KEY` is NOT used by the API middleware.**

Instead, the API keys are **stored in the database** (in the `MagicLinkToken` table) and looked up when a request comes in.

---

## How the API Key System Works

### 1. API Keys Are Stored in Database

```
Table: MagicLinkToken
┌────────────────────────────────────────────────────────┐
│ email                          │ token                  │
├────────────────────────────────────────────────────────┤
│ chatgpt-app@behavioriq.local   │ sk_test_7fc035...     │
│ user2@example.com              │ sk_test_abc123...     │
│ user3@example.com              │ sk_test_xyz789...     │
└────────────────────────────────────────────────────────┘
```

### 2. When ChatGPT Makes a Request

```
ChatGPT sends:
┌──────────────────────────────────────────┐
│ POST /api/assessment/start               │
│ X-API-Key: sk_test_7fc035...            │
│ Content-Type: application/json           │
│ { "userId": "...", ... }                │
└──────────────────────────────────────────┘
        ↓
API Middleware receives it:
        ↓
Reads X-API-Key header:
        ↓
Looks it up in MagicLinkToken table:
        ↓
Finds the token → Gets userId from linked user:
        ↓
✅ Request authorized!
        ↓
Processes request and returns response
```

### 3. What the Middleware Code Does

```typescript
// File: lib/api/chatgpt/middleware.ts

export async function validateApiKey(request: NextRequest) {
  // 1. Read X-API-Key header from request
  const apiKey = request.headers.get("x-api-key");

  // 2. Query database for this API key
  const token = await prisma.magicLinkToken.findUnique({
    where: { token: apiKey },  // ← Looks up by token field!
    include: { user: true },
  });

  // 3. If found and not expired, return userId
  if (token && !expired) {
    return { userId: token.user.id };
  }

  // 4. If not found, return error
  return { userId: null, error: "Invalid API key" };
}
```

---

## Why Database Storage?

### Benefits of Storing Keys in Database

✅ **Dynamic** - Add/remove keys without redeploying
✅ **Revocable** - Expire or delete keys immediately
✅ **Trackable** - See which user owns each key
✅ **Audit Trail** - Keep history of key usage
✅ **Multi-key** - One user can have multiple keys
✅ **Rotation** - Change keys without code changes
✅ **Security** - Keys aren't in environment variables or code

### Why NOT Use Environment Variables

❌ Static - Can't add keys without redeploying
❌ Limited - Only one key per environment
❌ Risky - Secrets in version control or logs
❌ Inflexible - Can't revoke mid-deployment

---

## How to Use the System

### Setup (One Time)

1. **Run SQL commands** (from `SUPABASE_SETUP.sql`):
   ```sql
   -- Creates user 'chatgpt-app-user'
   -- Creates API key in MagicLinkToken table
   -- Adds 100 credits
   ```

2. **Verify**:
   ```sql
   SELECT * FROM "MagicLinkToken"
   WHERE email = 'chatgpt-app@behavioriq.local';
   ```

### Using the API

**ChatGPT (or any client) sends:**
```bash
curl -X GET "https://app.behavioriq.com/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"
```

**What happens:**
1. API receives request with X-API-Key header
2. Middleware reads the key from header
3. Middleware queries: `SELECT * FROM MagicLinkToken WHERE token = 'sk_test_7fc035...'`
4. Middleware finds the token and links it to user `chatgpt-app-user`
5. Request is authorized and processed
6. User's credit data is returned

---

## Adding More API Keys

To add additional API keys for other users:

```sql
-- 1. Create a new user
INSERT INTO "users" (id, email, name, role)
VALUES ('another-user', 'another@example.com', 'Another User', 'USER');

-- 2. Create API key for that user
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES (
  'another@example.com',
  'sk_test_' || md5(random()::text),  -- Generate random key
  'another-user',
  '2099-12-31',
  NOW()
);

-- 3. Retrieve the generated key
SELECT token FROM "MagicLinkToken"
WHERE email = 'another@example.com';
```

---

## About the `BEHAVIORIQ_API_KEY` Environment Variable

You mentioned seeing:
```
BEHAVIORIQ_API_KEY="REDACTED_API_KEY"
```

**This is informational only.** It's not used by the API code, but you can:

1. **Store it for reference** - Document your main API key
2. **Use it in tests** - Your test scripts might read from `.env`
3. **Pass to ChatGPT Builder** - ChatGPT will send it in `X-API-Key` header

### How ChatGPT Uses It

When you configure ChatGPT Builder:

```
ChatGPT Settings:
├─ Authentication Type: API Key
├─ Header: X-API-Key
└─ Key: REDACTED_API_KEY
```

ChatGPT will then automatically include it in every request:
```
X-API-Key: REDACTED_API_KEY
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        ChatGPT                              │
│  (Configured with API Key in authentication settings)       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Sends request with X-API-Key header
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   Your Next.js API                          │
│  POST /api/assessment/start                                │
│  X-API-Key: sk_test_7fc035...                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Middleware validates key
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                               │
│  MagicLinkToken table                                      │
│  Lookup: WHERE token = 'sk_test_7fc035...'               │
│  Result: userId = 'chatgpt-app-user'                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Found! Request authorized
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Endpoint Handler                      │
│  Now process: GET /api/assessment/start                    │
│  With userId: chatgpt-app-user                             │
│  Return: Assessment data + questions                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Response sent back to ChatGPT
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        ChatGPT                              │
│  Receives: { assessmentId, questions, ... }              │
│  Continues conversation with user                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Concept | Value | Location |
|---------|-------|----------|
| **API Key Format** | `REDACTED_API_KEY` | Database |
| **Storage Table** | `MagicLinkToken` | Supabase |
| **Key Field** | `token` | `MagicLinkToken.token` |
| **User Field** | `chatgpt-app-user` | `MagicLinkToken.userId` |
| **HTTP Header** | `X-API-Key` | Request headers |
| **Middleware File** | `lib/api/chatgpt/middleware.ts` | Code |
| **Validation Logic** | Lines 68-99 | `validateApiKey()` function |

---

## Testing the System

### 1. Verify Key is in Database

```sql
SELECT * FROM "MagicLinkToken"
WHERE token LIKE 'sk_test_%';
```

Should return a row with:
- `email`: `chatgpt-app@behavioriq.local`
- `token`: `sk_test_7fc035...`
- `userId`: `chatgpt-app-user`

### 2. Test API with Valid Key

```bash
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

### 3. Test API with Invalid Key

```bash
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: sk_test_invalid"
```

Expected response (401):
```json
{
  "error": "Invalid API key",
  "code": "INVALID_API_KEY",
  "requestId": "..."
}
```

### 4. Test API without Key

```bash
curl -X GET "http://localhost:3000/api/user/credits"
```

Expected response (401):
```json
{
  "error": "Missing X-API-Key header",
  "code": "INVALID_API_KEY",
  "requestId": "..."
}
```

---

## Summary

✅ **API keys are stored in the database** (not environment variables)
✅ **Middleware looks them up when requests come in**
✅ **ChatGPT sends the key in the `X-API-Key` header**
✅ **No code changes needed to add more keys**
✅ **Keys can be revoked or rotated anytime**
✅ **The environment variable is for reference only**

---

## Next Steps

1. **Run the SQL from `SUPABASE_SETUP.sql`**
2. **Verify the key is in the database**
3. **Test with curl commands above**
4. **Configure ChatGPT Builder with the API key**
5. **Start making requests!**

---

**Your API Key:**
```
REDACTED_API_KEY
```

**Ready to deploy!** 🚀
