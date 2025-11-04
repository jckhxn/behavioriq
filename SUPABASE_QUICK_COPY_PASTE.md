# Supabase Setup - Copy & Paste (5 Minutes)

## Overview

This guide will get your API key registered in Supabase in 5 minutes.

**API Key:** `REDACTED_API_KEY`

---

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**

---

## Step 2: Copy & Paste the SQL

Copy all the SQL below and paste it into the Supabase SQL editor:

```sql
-- Create ChatGPT App user (requires password field)
INSERT INTO "users" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES ('chatgpt-app-user', 'chatgpt-app@behavioriq.local', 'ChatGPT App', '$2b$12$placeholder-for-chatgpt-api-user-no-password-login-needed', 'USER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Register the API Key
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES ('chatgpt-app@behavioriq.local', 'REDACTED_API_KEY', 'chatgpt-app-user', '2099-12-31', NOW())
ON CONFLICT (token) DO NOTHING;

-- Add 100 credits
UPDATE "users" SET credits = 100 WHERE id = 'chatgpt-app-user';

-- Verify everything was created
SELECT 'User Created' as status, id, email FROM "users" WHERE id = 'chatgpt-app-user';
SELECT 'API Key Created' as status, email, token FROM "MagicLinkToken" WHERE email = 'chatgpt-app@behavioriq.local';
```

---

## Step 3: Run the Query

1. Click **Run** button (bottom right)
2. Wait for execution to complete
3. You should see two rows in the result:
   - Row 1: User Created
   - Row 2: API Key Created

---

## Step 4: Verify Success

If you see results, you're done! The setup is complete:

```
✅ User 'chatgpt-app-user' created
✅ API Key registered
✅ 100 credits added
```

---

## If Something Goes Wrong

### Error: "null value in column \"password\" violates not-null constraint"

**This was the issue in the previous attempt!** The users table requires a password field.

**The fix:** Add the password field to the INSERT statement:
```sql
password, '$2b$12$placeholder-for-chatgpt-api-user-no-password-login-needed',
```

The SQL above already includes this. The password is a placeholder because ChatGPT authenticates via the **X-API-Key header**, not by password login.

### Error: "duplicate key value violates unique constraint"

This means the user or API key already exists (which is fine!). You can:
- Run the query again (it has `ON CONFLICT DO NOTHING` so it's safe)
- Or manually check if the data exists with:

```sql
SELECT * FROM "users" WHERE id = 'chatgpt-app-user';
SELECT * FROM "MagicLinkToken" WHERE email = 'chatgpt-app@behavioriq.local';
```

### Error: "relation \"users\" does not exist"

Your table might be named differently. Check your exact table name:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Then update the SQL above with the correct table name.

### Error: "column \"createdAt\" does not exist"

Your columns might use different naming. Check the actual column names:

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
```

---

## Step 5: Test It Works

Once the SQL succeeds, test your API key:

```bash
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"
```

Expected response:
```json
{
  "userId": "chatgpt-app-user",
  "credits": 100,
  "creditsUsed": 0
}
```

---

## Your API Key

Keep this safe - it's used by ChatGPT:

```
REDACTED_API_KEY
```

**Add to your `.env.local` for reference:**
```
CHATGPT_API_KEY="REDACTED_API_KEY"
```

---

## Next Steps

1. ✅ Run SQL in Supabase (you are here)
2. Test locally: `npm run dev`
3. Upload `openapi.yaml` to ChatGPT Builder
4. Configure ChatGPT with API key
5. Deploy to production

---

## Need Help?

- **"Invalid API key" error** → Check that the SQL ran successfully
- **Database table names different** → Update SQL with your actual table names
- **Still stuck** → Read `API_KEY_CLARIFICATION.md` for detailed explanation

**You're all set! 🚀**
