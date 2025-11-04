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
-- NOTE: Password is required field. Using a secure placeholder that ChatGPT will never use
-- (ChatGPT authenticates via X-API-Key header, not password)
INSERT INTO "users" (
  id,
  email,
  name,
  password,
  role,
  "createdAt",
  "updatedAt"
)
VALUES (
  'chatgpt-app-user',
  'chatgpt-app@behavioriq.local',
  'ChatGPT App',
  '$2b$12$placeholder-for-chatgpt-api-user-no-password-login-needed',
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
-- Verification Results Expected:
-- - Query 1: User Created (id, email, name, credits)
-- - Query 2: API Key Created (email, token, userId, expiresAt)
-- - Query 3: Credits Added (id, email, credits)
--
-- Next: Test with curl or upload to ChatGPT Builder
-- ============================================================================
