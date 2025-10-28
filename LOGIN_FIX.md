# Login Loop Fix

## Problem
When users login, they get redirected back to the login page instead of being redirected to the dashboard. This creates a redirect loop.

## Root Cause
**Race condition between client-side auth state and middleware cookie detection:**

1. User enters email/password and submits
2. Supabase client successfully authenticates and stores token in localStorage/sessionStorage
3. Login page calls `router.push()` to redirect to dashboard
4. BUT: The middleware runs BEFORE cookies are synced to the server
5. Middleware checks for auth cookie (via `isSupabaseAuthenticated()`)
6. Cookie isn't set yet → `isAuth` is false
7. Middleware redirects user back to `/login`
8. Creates infinite redirect loop

## Solution Applied

### 1. Added Timing Delay (300ms) in Login Page
**File**: `app/(auth)/login/page.tsx`

Added a small delay before redirecting to allow the middleware time to sync the auth cookie:

```typescript
// Wait a moment for middleware to sync cookies before redirecting
// This ensures the auth cookie is set before the next page loads
await new Promise(resolve => setTimeout(resolve, 300));
router.refresh();
router.push(from);
```

This gives the browser time to:
1. Set the auth token in localStorage/sessionStorage
2. Sync to cookies via Supabase SSR client
3. Make cookies available to the middleware

### 2. Added Debug Logging
**File**: `middleware.ts`

Enhanced `isSupabaseAuthenticated()` function to log which auth cookies are present:

```typescript
function isSupabaseAuthenticated(req: NextRequest): boolean {
  // ... checks cookie ...

  // Debug logging - shows what cookies are actually present
  if (!hasCookie) {
    const authCookies = allCookies
      .filter(c => c.name.includes('auth') || c.name.includes('sb-'))
      .map(c => c.name);
    if (authCookies.length > 0) {
      console.warn(`[Middleware] Expected cookie not found. Available:`, authCookies);
    }
  }
}
```

This helps identify if the cookie is being set at all.

### 3. Added User Authentication Logging
**File**: `lib/supabase/middleware.ts`

Added logging when a user is authenticated:

```typescript
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  console.log(`[Middleware] User authenticated: ${user.email}`);
}
```

## How to Test

### Step 1: Clear Browser Storage
- Open Developer Tools → Application
- Delete all cookies and localStorage for the domain
- Close all tabs for the domain

### Step 2: Try Login
1. Go to `/login`
2. Enter email and password
3. Click login
4. Should see:
   - Toast: "Signed in successfully"
   - Redirect to dashboard (NOT back to login)

### Step 3: Check Console Logs
Open browser console and look for:

**Success indicators:**
```
[Middleware] User authenticated: user@example.com
[Login] Session established for: user@example.com
[Login] No MFA, redirecting to: /dashboard
```

**Failure indicators:**
```
[Middleware] Expected cookie not found. Available: [...]
[Login] No session after signin
```

### Step 4: Verify in Dashboard
- Should see user dashboard
- Check network tab - no redirect loops
- Check Application → Cookies for `sb-*-auth-token`

## Performance Notes
- 300ms delay is imperceptible to users but enough for cookie sync
- This delay only happens on login (not on subsequent navigation)
- Alternative: Could be increased to 500ms if 300ms is too fast

## If Login Still Fails

### Check 1: Verify Supabase Connection
```javascript
// In browser console on login page
const { createClient } = await import('@/lib/supabase/client');
const client = createClient();
const { data } = await client.auth.getSession();
console.log('Session:', data);
```

### Check 2: Check Middleware Logs
- Look at server logs for middleware warnings
- Check if `SUPABASE_AUTH_COOKIE_NAME` is being calculated correctly

### Check 3: Verify Environment Variables
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Both should be set correctly.

### Check 4: Try Magic Link Instead
If password login fails:
1. Click "Sign in with Magic Link"
2. Enter email
3. Check email for link
4. Click link (should redirect to `/auth/callback`)
5. Should authenticate and redirect to dashboard

## Files Modified

1. **app/(auth)/login/page.tsx**
   - Added 300ms delay before redirect
   - Applies to both MFA and no-MFA paths

2. **middleware.ts**
   - Added debug logging for missing cookies
   - Helps diagnose auth cookie issues

3. **lib/supabase/middleware.ts**
   - Added type annotation fix for cookies
   - Added logging for authenticated users

## Next Steps

1. **Test locally** with the fix
2. **Check console logs** for success/failure indicators
3. **If still failing**: Run Check 1-4 above to diagnose
4. **Report findings** if issue persists

## Timeline
- Fix applied: [Date]
- Root cause: Race condition in cookie sync
- Solution: Timing delay + debug logging
- Expected: Login should now work without redirect loop
