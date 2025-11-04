-- ============================================================================
-- ChatGPT API Key Setup - SQL Commands for Supabase
-- ============================================================================
-- Copy and paste these commands into your Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
--
-- The API Key is:
-- REDACTED_API_KEY
--
-- ============================================================================

-- Step 1: Create the ChatGPT App user
-- ============================================================================
INSERT INTO "users" (
  id,
  email,
  name,
  role,
  "createdAt",
  "updatedAt"
)
VALUES (
  'chatgpt-app-user',
  'chatgpt-app@behavioriq.local',
  'ChatGPT App',
  'USER',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify user was created
SELECT id, email, name, credits FROM "users" WHERE id = 'chatgpt-app-user';


-- Step 2: Register the API Key
-- ============================================================================
INSERT INTO "MagicLinkToken" (
  email,
  token,
  "userId",
  "expiresAt",
  "createdAt"
)
VALUES (
  'chatgpt-app@behavioriq.local',
  'REDACTED_API_KEY',
  'chatgpt-app-user',
  '2099-12-31',
  NOW()
)
ON CONFLICT (token) DO NOTHING;

-- Verify API key was created
SELECT email, token, "userId", "expiresAt" FROM "MagicLinkToken"
WHERE email = 'chatgpt-app@behavioriq.local';


-- Step 3: Add credits to the ChatGPT user
-- ============================================================================
UPDATE "users"
SET credits = 100
WHERE id = 'chatgpt-app-user';

-- Verify credits were added
SELECT id, email, credits FROM "users" WHERE id = 'chatgpt-app-user';


-- ============================================================================
-- ALL DONE!
-- ============================================================================
-- If all three SELECT queries above return results, you're ready to test!
--
-- API Key: REDACTED_API_KEY
-- User ID: chatgpt-app-user
-- Credits: 100
--
-- Next: Test with curl or upload to ChatGPT Builder
-- ============================================================================
