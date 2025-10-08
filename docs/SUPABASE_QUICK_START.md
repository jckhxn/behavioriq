# Supabase Auth Quick Start Checklist

## ✅ Completed

- [x] Installed `@supabase/supabase-js` and `@supabase/ssr`
- [x] Created Supabase client utilities (`lib/supabase/`)
- [x] Updated `.env.example` with Supabase variables

## 🔄 Next Steps

### 1. Create Supabase Project (5 minutes)

- [ ] Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Click "New Project"
- [ ] Fill in project details
- [ ] Save database password securely
- [ ] Wait for project to be ready (~2 minutes)

### 2. Get API Keys (2 minutes)

- [ ] Navigate to: **Settings** (gear icon) > **API** in Supabase Dashboard
- [ ] Under "Project API keys", copy:
  - **Project URL** (starts with `https://`)
  - **anon public** key (long string starting with `eyJ...`)
- [ ] Add to your `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

**Note:** You DON'T need the service role key for basic magic links and password reset! Skip it for now.

### 3. Configure Auth Settings (3 minutes)

- [ ] Go to **Authentication** > **Providers**
- [ ] Enable **Email** provider
- [ ] Toggle ON these settings:
  - Enable Email Confirmations
  - Enable Email Change Confirmations
  - Secure Email Change

### 4. Set Redirect URLs (2 minutes)

- [ ] Go to **Authentication** > **URL Configuration**
- [ ] Set **Site URL**: `http://localhost:3000`
- [ ] Add **Redirect URLs**:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/confirm
  http://localhost:3000/auth/reset-password
  ```

### 5. Customize Email Templates (Optional - 5 minutes)

- [ ] Go to **Authentication** > **Email Templates**
- [ ] Customize templates for:
  - Magic Link
  - Reset Password
  - Confirm Signup

### 6. Create API Routes

Copy these files from `docs/SUPABASE_AUTH_SETUP.md`:

- [ ] `app/api/auth/magic-link/route.ts`
- [ ] `app/api/auth/reset-password/route.ts`
- [ ] `app/api/auth/update-password/route.ts`
- [ ] `app/auth/callback/route.ts`
- [ ] `app/auth/reset-password/page.tsx`

### 7. Create UI Components

Copy these from `docs/SUPABASE_AUTH_SETUP.md`:

- [ ] `components/auth/MagicLinkForm.tsx`
- [ ] `components/auth/ForgotPasswordForm.tsx`

### 8. Update Login Page (Optional)

Add magic link option to your existing login page:

```tsx
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
// Add tab or section for magic link login
```

### 9. Test in Development

- [ ] Start dev server: `npm run dev`
- [ ] Test magic link: Enter email → Check inbox → Click link
- [ ] Test password reset: Request reset → Check inbox → Set new password
- [ ] Verify redirect after auth works

### 10. Configure Email Provider for Production

**Choose one:**

#### Option A: Use Supabase Built-in (Free Tier)

- ✅ Already works (4 emails/hour limit)
- ⚠️ Limited for production use

#### Option B: Custom SMTP (Recommended)

- [ ] Go to **Settings** > **Auth** > **SMTP Settings**
- [ ] Enable custom SMTP
- [ ] Configure your provider:

**Recommended Providers:**

1. **Resend** (easiest)
   - Free tier: 100 emails/day, 3,000/month
   - [https://resend.com](https://resend.com)

2. **SendGrid**
   - Free tier: 100 emails/day
   - [https://sendgrid.com](https://sendgrid.com)

3. **AWS SES** (cheapest at scale)
   - $0.10 per 1,000 emails
   - Requires domain verification
   - [https://aws.amazon.com/ses](https://aws.amazon.com/ses)

## 📚 Documentation Files Created

- ✅ `docs/SUPABASE_AUTH_SETUP.md` - Complete setup guide
- ✅ `lib/supabase/client.ts` - Browser client
- ✅ `lib/supabase/server.ts` - Server client
- ✅ `lib/supabase/middleware.ts` - Session management

## 🎯 Priority Order

**Must Have (MVP):**

1. Password Reset ← Start here
2. Magic Link Login

**Nice to Have:** 3. Email Verification 4. Social Auth (Google, etc.)

## ⚠️ Important Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never expose in client code)
- Test thoroughly in development before deploying
- Set up custom email domain in production (improves deliverability)
- Monitor Supabase Auth logs for errors

## 🔗 Quick Links

- [Full Setup Guide](./SUPABASE_AUTH_SETUP.md)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

## ⏱️ Estimated Time

- **Minimum Setup**: ~15 minutes (steps 1-4)
- **Full Implementation**: ~1-2 hours (all steps)
- **Production Ready**: +30 minutes (email provider setup)

---

**Ready to start?** Begin with step 1: Create your Supabase project!
