# Magic Link & Password Reset Fix Guide

**Date:** October 6, 2025  
**Status:** 🔧 Fixed - Requires Supabase Configuration

---

## Problem

Magic links and password reset emails were not working when users clicked the links from their email.

## Root Causes

### 1. Missing Redirect URL Configuration in Supabase

Supabase requires explicit redirect URLs to be whitelisted in the dashboard. Without this, auth callbacks fail.

### 2. Callback Route Not Handling Different Auth Types

The original callback route treated all auth flows the same way:

- Magic links → Should redirect to dashboard ✓
- Password reset → Should redirect to reset-password page ✗ (was redirecting to dashboard)

### 3. No Session Verification on Reset Password Page

The reset password page didn't verify if the user had a valid recovery session before allowing password change.

---

## Fixes Applied

### Fix 1: Enhanced Callback Route

**File:** `app/auth/callback/route.ts`

**Changes:**

- Added `type` parameter detection (`recovery` or `invite`)
- Added `next` parameter for custom redirect URLs
- Separate handling for password reset vs magic link flows
- Better error handling

**Before:**

```typescript
export async function GET(request: Request) {
  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
```

**After:**

```typescript
export async function GET(request: Request) {
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    // Handle different types of auth flows
    if (type === "recovery" || type === "invite") {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
```

### Fix 2: Session Verification on Reset Password Page

**File:** `app/auth/reset-password/page.tsx`

**Changes:**

- Added `useEffect` to verify user has valid recovery session
- Added `verifying` state with loading UI
- Shows error if session is invalid or expired

**Added:**

```typescript
useEffect(() => {
  async function checkSession() {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      setError(
        "Invalid or expired reset link. Please request a new password reset."
      );
      setVerifying(false);
      return;
    }

    setVerifying(false);
  }

  checkSession();
}, []);
```

---

## Required Supabase Configuration

### Step 1: Configure Redirect URLs

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/tzvqfmeaqdykkyvbpena
   - Navigate to: **Authentication → URL Configuration**

2. **Add Site URL:**

   ```
   Site URL: http://localhost:3000
   ```

3. **Add Redirect URLs:**
   Add these URLs to the "Redirect URLs" list:

   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   http://localhost:3000/dashboard
   ```

4. **For Production (when deploying):**
   ```
   https://yourdomain.com/**
   https://yourdomain.com/auth/callback
   https://yourdomain.com/auth/reset-password
   https://yourdomain.com/dashboard
   ```

### Step 2: Verify Email Templates

1. **Go to:** **Authentication → Email Templates**

2. **Check "Confirm signup" template:**
   - Should contain: `{{ .ConfirmationURL }}`
   - This creates the magic link URL

3. **Check "Reset Password" template:**
   - Should contain: `{{ .ConfirmationURL }}`
   - This creates the password reset URL

4. **Verify Email Settings:**
   - Go to: **Project Settings → Auth → Email Auth**
   - Ensure "Enable Email Confirmations" is ON
   - Ensure "Enable Email Password Recovery" is ON

---

## Testing the Fixes

### Test 1: Magic Link Login

1. **Request Magic Link:**

   ```bash
   # Navigate to login page
   http://localhost:3000/login

   # Click "Send Magic Link" (or equivalent)
   # Enter email
   ```

2. **Check Email:**
   - Open email client
   - Find magic link email
   - Note the URL structure (should have `code` and `token` parameters)

3. **Click Magic Link:**
   - Click link in email
   - Should redirect to: `http://localhost:3000/auth/callback?code=xxx&type=magiclink`
   - Then redirect to: `http://localhost:3000/dashboard`
   - **Expected:** Successfully logged in and on dashboard

4. **Verify Session:**
   - Check browser cookies (should see Supabase auth cookies)
   - Try refreshing page (should stay logged in)
   - Navigate to profile (should see user data)

### Test 2: Password Reset

1. **Request Password Reset:**

   ```bash
   # Navigate to forgot password page
   http://localhost:3000/forgot-password

   # Enter email
   # Click "Send Reset Link"
   ```

2. **Check Email:**
   - Open email client
   - Find password reset email
   - Note the URL structure (should have `code`, `token`, and `type=recovery`)

3. **Click Reset Link:**
   - Click link in email
   - Should redirect to: `http://localhost:3000/auth/callback?code=xxx&type=recovery`
   - Then redirect to: `http://localhost:3000/auth/reset-password`
   - **Expected:** Reset password page loads with session active

4. **Reset Password:**
   - Enter new password (min 8 characters)
   - Confirm password
   - Click "Update Password"
   - **Expected:** Success message, then redirect to dashboard
   - **Verify:** Can login with new password

### Test 3: Expired Reset Link

1. **Use an old reset link** (>1 hour old)
2. Click link
3. **Expected:** Error message "Invalid or expired reset link"
4. **Verify:** Can request new reset link

### Test 4: Direct Access to Reset Page

1. **Navigate directly** to `http://localhost:3000/auth/reset-password` (no session)
2. **Expected:** Error message "Invalid or expired reset link"
3. **Verify:** Cannot reset password without valid session

---

## Flow Diagrams

### Magic Link Flow

```
User enters email
      ↓
Supabase sends magic link email
      ↓
User clicks link in email
      ↓
Redirect to: /auth/callback?code=xxx&type=magiclink
      ↓
exchangeCodeForSession(code)
      ↓
Success → Redirect to /dashboard
Failure → Redirect to /login?error=auth_callback_error
```

### Password Reset Flow

```
User enters email
      ↓
Supabase sends password reset email
      ↓
User clicks link in email
      ↓
Redirect to: /auth/callback?code=xxx&type=recovery
      ↓
exchangeCodeForSession(code)
      ↓
Redirect to: /auth/reset-password
      ↓
Verify session exists (useEffect)
      ↓
Session valid → Show reset form
Session invalid → Show error
      ↓
User enters new password
      ↓
updateUser({ password })
      ↓
Success → Redirect to /dashboard
```

---

## Troubleshooting

### Issue 1: "Invalid redirect URL" error

**Symptom:** Error in Supabase logs or user sees error page

**Cause:** Redirect URL not whitelisted in Supabase dashboard

**Fix:**

1. Go to Supabase dashboard → Authentication → URL Configuration
2. Add the redirect URL to the whitelist
3. Use wildcard `http://localhost:3000/**` for local development

### Issue 2: Magic link works but password reset doesn't

**Symptom:** Magic link redirects to dashboard, but password reset redirects to dashboard instead of reset-password page

**Cause:** Callback route not detecting `type=recovery` parameter

**Fix:**

1. Check Supabase email template includes `type=recovery` in URL
2. Verify callback route checks for `type` parameter
3. Check Supabase logs for the actual URL being used

### Issue 3: "Invalid or expired reset link" immediately

**Symptom:** User clicks reset link, but immediately sees error

**Cause:** Session not being set properly by `exchangeCodeForSession`

**Fix:**

1. Check Supabase logs for authentication errors
2. Verify `code` parameter is present in URL
3. Check if redirect URLs are configured correctly
4. Try clearing browser cookies and cache

### Issue 4: Reset works but user not redirected to dashboard

**Symptom:** Password updates successfully but stays on reset page

**Cause:** Router not redirecting after success

**Fix:**

1. Check browser console for errors
2. Verify `router.push("/dashboard")` is being called
3. Check if dashboard route requires authentication
4. Try using `window.location.href = "/dashboard"` instead

### Issue 5: Magic link expires too quickly

**Symptom:** User clicks magic link 5 minutes later and it's expired

**Cause:** Supabase default OTP expiration

**Fix:**

1. Go to Supabase dashboard → Authentication → Auth Providers → Email
2. Adjust "Magic Link Token Expiry" (default is 1 hour)
3. Consider extending to 24 hours for better UX

---

## Environment Variables Checklist

Verify these are set correctly in `.env`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tzvqfmeaqdykkyvbpena.supabase.co ✓
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key ✓
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key ✓

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 ✓

# Database (for Prisma)
DATABASE_URL=postgresql://... ✓
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add production redirect URLs to Supabase dashboard
- [ ] Test magic links in production
- [ ] Test password reset in production
- [ ] Verify email delivery (not going to spam)
- [ ] Check email templates for production URLs
- [ ] Set up custom SMTP (optional, for better deliverability)
- [ ] Monitor Supabase logs for auth errors
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

---

## Files Modified

1. `app/auth/callback/route.ts` - Enhanced to handle different auth types
2. `app/auth/reset-password/page.tsx` - Added session verification

---

## Testing Results

### Before Fixes

- [ ] Magic Link: ❌ Failed
- [ ] Password Reset: ❌ Failed

### After Fixes (to be tested)

- [ ] Magic Link: ⏳ Testing
- [ ] Password Reset: ⏳ Testing

---

## Next Steps

1. ✅ Apply code fixes (DONE)
2. ⏳ Configure redirect URLs in Supabase dashboard (PENDING - USER ACTION)
3. ⏳ Test magic link flow
4. ⏳ Test password reset flow
5. ⏳ Update this document with test results
6. ⏳ Commit fixes to repository

---

**Status:** Code fixes applied, awaiting Supabase configuration and testing  
**Last Updated:** October 6, 2025
