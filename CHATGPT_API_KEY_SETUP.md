# ChatGPT App API Key Setup

## API Key Details

```
API Key: REDACTED_API_KEY
Format: sk_test_<hash>
User Email: chatgpt-app@behavioriq.local
User ID: chatgpt-app-user
Expires: 2099-12-31 (Never expires)
```

## Setup Instructions

### Option 1: Using Prisma Studio (Easiest)

```bash
# Start Prisma Studio
npx prisma studio

# In the browser UI:
# 1. Navigate to MagicLinkToken table
# 2. Click "Add record"
# 3. Fill in:
#    - email: chatgpt-app@behavioriq.local
#    - token: REDACTED_API_KEY
#    - userId: chatgpt-app-user
#    - expiresAt: 2099-12-31
# 4. Save
```

### Option 2: Using SQL (PostgreSQL)

```bash
# Connect to your database
psql $DATABASE_URL

# Run these commands:
```

```sql
-- First, create the user if it doesn't exist
INSERT INTO "users" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'chatgpt-app-user',
  'chatgpt-app@behavioriq.local',
  'ChatGPT App',
  'USER',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Then insert the API key
INSERT INTO "MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt")
VALUES (
  'chatgpt-app@behavioriq.local',
  'REDACTED_API_KEY',
  'chatgpt-app-user',
  '2099-12-31',
  NOW()
)
ON CONFLICT (token) DO NOTHING;

-- Verify it worked
SELECT email, token, "userId", "expiresAt"
FROM "MagicLinkToken"
WHERE email = 'chatgpt-app@behavioriq.local';
```

### Option 3: Using Vercel PostgreSQL (Production)

```bash
# If using Vercel Postgres, use their CLI
vercel env pull

# Then run the SQL commands above using:
vercel postgres query << 'EOF'
-- (paste SQL from Option 2 above)
EOF
```

## Verification

After setup, verify the API key works:

```bash
# Test the /api/user/credits endpoint
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"

# Expected response (200):
{
  "userId": "chatgpt-app-user",
  "credits": 0,
  "creditsUsed": 0
}

# If you get 401, the API key wasn't registered correctly
```

## Add Credits to ChatGPT User

To give the ChatGPT App user credits for testing:

### Option 1: SQL

```sql
UPDATE "users"
SET credits = 100
WHERE id = 'chatgpt-app-user';
```

### Option 2: Prisma Studio

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to users table
3. Find `chatgpt-app-user`
4. Update `credits` field to `100`
5. Save

### Option 3: Direct Update via API (if admin endpoint exists)

## Testing the Full Flow

Once API key is registered:

```bash
# 1. Check credits
curl -X GET "http://localhost:3000/api/user/credits" \
  -H "X-API-Key: REDACTED_API_KEY"

# 2. Start an assessment
curl -X POST "http://localhost:3000/api/assessment/start" \
  -H "X-API-Key: REDACTED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "chatgpt-app-user",
    "childName": "Test Child",
    "childAge": 8,
    "relationshipType": "parent"
  }'

# 3. Submit answers (would use full assessment ID from step 2)
```

## Environment Variable

Add to your `.env.local` or `.env` for reference:

```bash
# ChatGPT App API Key
# Expected in API calls from ChatGPT App
CHATGPT_API_KEY="REDACTED_API_KEY"
```

## Using in ChatGPT App

In the ChatGPT App configuration, set the API Key to:

```
REDACTED_API_KEY
```

This key will be sent in the `X-API-Key` header on all requests from ChatGPT.

## Troubleshooting

### "Invalid API key" (401 response)

- [ ] Verify the token is stored correctly in MagicLinkToken table
- [ ] Check the exact spelling matches
- [ ] Ensure no extra spaces before/after the key
- [ ] Verify the userId exists in users table
- [ ] Check the API key hasn't expired (expires should be 2099-12-31)

### "User not found" (404 response)

- [ ] Verify the user 'chatgpt-app-user' exists in users table
- [ ] Verify the userId in MagicLinkToken matches the users.id

### "Insufficient credits" (402 response)

- [ ] Update users.credits to > 0 for 'chatgpt-app-user'
- [ ] Verify the update was successful with: `SELECT credits FROM users WHERE id = 'chatgpt-app-user'`

## Security Notes

⚠️ This is a TEST API key (starts with `sk_test_`).

For production:
- Generate production API keys with a different prefix
- Store securely in environment variables
- Rotate periodically
- Never commit to version control
- Use role-based access control if needed

## Next Steps

1. Register the API key using one of the options above
2. Add credits to the ChatGPT user account
3. Test endpoints with curl
4. Configure ChatGPT App to use this key
5. Test full flow in ChatGPT

Done! Your ChatGPT App can now authenticate with the BehaviorIQ Assessment API. 🚀
