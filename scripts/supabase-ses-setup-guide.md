# Supabase SES SMTP Configuration Guide

## Overview

Configure Supabase to send authentication emails (magic links, password resets, email confirmations) through AWS SES instead of Supabase's default email service.

**Benefits:**
- Lower costs ($0.10 per 1,000 emails vs Supabase limits)
- Custom "from" email address
- Better deliverability with verified domain
- Consistent email branding across your app

---

## Prerequisites

Before configuring Supabase, ensure you have:

✅ AWS SES account configured (Phase 1 completed)
✅ Verified sender email address in SES Console
✅ Generated SMTP credentials in AWS SES

---

## Step 1: Generate SES SMTP Credentials

If you haven't already generated SMTP credentials:

1. Go to **AWS SES Console** → **SMTP Settings**
2. Click **"Create SMTP Credentials"**
3. Enter IAM username: `ses-smtp-user`
4. Click **"Create"**
5. **IMPORTANT**: Download and save the credentials immediately
   - SMTP Username: `AKIA...` (starts with AKIA)
   - SMTP Password: (long generated password)
6. Note the SMTP Endpoint: `email-smtp.us-east-1.amazonaws.com`

⚠️ **Save these credentials securely** - you won't be able to view the password again!

---

## Step 2: Configure Supabase Dashboard

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project: **AI Diagnostic**
3. Navigate to: **Authentication** → **Email Templates** → **SMTP Settings** (gear icon)

### SMTP Settings Configuration

Fill in the following details:

```
Enable Custom SMTP: ✅ (Toggle ON)

SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP Username: [Your SMTP Username from Step 1]
SMTP Password: [Your SMTP Password from Step 1]

Sender Email: tjhixon@gmail.com
Sender Name: AI Diagnostic

Enable TLS: ✅ (Checked)
```

4. Click **"Save"**
5. Wait for confirmation message

---

## Step 3: Test SMTP Connection

Supabase should show a green checkmark if SMTP is configured correctly.

### Manual Test via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Invite user"**
3. Enter a test email address (must be verified in SES if still in sandbox)
4. Check your inbox for the invite email

If you receive the email within 1-2 minutes, SMTP is working correctly! ✅

---

## Step 4: Customize Email Templates

Now customize the email templates to match your branding.

### Navigate to Email Templates

1. **Authentication** → **Email Templates**
2. You'll see templates for:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email Address
   - Reset Password

### Template Variables Available

Supabase provides these variables for use in templates:

- `{{ .ConfirmationURL }}` - Confirmation/action link
- `{{ .Token }}` - Verification token (if not using links)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL (from Supabase settings)
- `{{ .RedirectTo }}` - Redirect URL (if specified)

---

## Step 5: Create Custom Email Templates

I'll create custom templates for you in the next step. For now, here's what each template should include:

### 1. Confirm Signup Template
- Welcome message
- Confirmation button/link
- Branding
- Support contact

### 2. Magic Link Template
- Security-focused message
- Magic link button
- Link expiration notice (1 hour)
- "Didn't request this?" section

### 3. Reset Password Template
- Password reset button
- Security notice
- Link expiration notice
- "Didn't request this?" section

### 4. Change Email Template
- Email change confirmation
- Confirmation button
- Security notice

---

## Step 6: Update Environment Variables

Make sure your `.env.local` has the correct Supabase settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://tzvqfmeaqdykkyvbpena.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Site Configuration (used by Supabase email templates)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # Change to production URL when deploying
NEXT_PUBLIC_SITE_NAME="AI Diagnostic"
```

---

## Step 7: Test All Authentication Flows

### Test Checklist

- [ ] **Magic Link Login**
  1. Go to `/login`
  2. Click "Sign in with email"
  3. Enter email → Click "Send magic link"
  4. Check inbox for email
  5. Click magic link → Should log you in

- [ ] **Password Reset**
  1. Go to `/auth/reset-password`
  2. Enter email → Submit
  3. Check inbox for reset email
  4. Click reset link
  5. Enter new password → Should work

- [ ] **Email Verification** (for new signups)
  1. Sign up with new email
  2. Check inbox for verification email
  3. Click confirmation link
  4. Should verify email

- [ ] **Change Email**
  1. Log in
  2. Go to Settings → Change email
  3. Enter new email → Submit
  4. Check both old and new inbox
  5. Confirm change

---

## Troubleshooting

### Issue: "SMTP connection failed"

**Solution:**
- Verify SMTP username and password are correct
- Ensure you're using port 587 (not 465 or 25)
- Check that TLS is enabled
- Verify SES is in the correct AWS region

### Issue: "Email not received"

**Solution:**
- Check if you're still in SES sandbox mode
- Verify recipient email is verified in SES Console
- Check AWS SES Console → Sending Statistics for bounces
- Look for emails in spam folder
- Check AWS CloudWatch logs for errors

### Issue: "MessageRejected: Email address is not verified"

**Solution:**
- You're still in SES sandbox mode
- Verify sender email (tjhixon@gmail.com) in SES Console
- OR request production access (takes 24-48 hours)

### Issue: "TLS connection error"

**Solution:**
- Ensure port is 587 (not 465)
- Enable TLS checkbox in Supabase
- Verify AWS SES endpoint is correct for your region

---

## Monitoring

### Check Email Delivery

1. **Supabase Dashboard**
   - Authentication → Logs
   - Look for email-related events
   - Check for errors

2. **AWS SES Console**
   - Go to SES → Account Dashboard → Sending Statistics
   - Monitor sent/delivered/bounced/complained metrics
   - Should update every few minutes

3. **CloudWatch Logs**
   - CloudWatch → Log Groups
   - Look for SES-related logs
   - Check for delivery confirmations or errors

---

## Production Deployment

Before deploying to production:

1. **Request SES Production Access**
   - Still in sandbox mode? Request production access in SES Console
   - Typically approved within 24-48 hours

2. **Verify Domain** (Optional but recommended)
   - Instead of just verifying tjhixon@gmail.com
   - Verify your entire domain in SES
   - Allows sending from any @yourdomain.com address
   - Better for branding (noreply@yourdomain.com)

3. **Update Production Environment Variables**
   - Set `NEXT_PUBLIC_SITE_URL` to production URL
   - Update Supabase site URL in Supabase Dashboard → Authentication → URL Configuration

4. **Test in Production**
   - Test all authentication flows in production
   - Monitor for 24-48 hours
   - Check SES statistics daily

---

## Cost Monitoring

With Supabase using SES SMTP:

| Email Type | Expected Volume | Monthly Cost |
|------------|----------------|--------------|
| Magic Links | 100-500/month | $0.01-$0.05 |
| Password Resets | 50-200/month | $0.01-$0.02 |
| Email Verifications | 100-500/month | $0.01-$0.05 |
| **Total Auth Emails** | **250-1,200/month** | **$0.03-$0.12** |

Combined with your application emails (assessment reports, etc.), you should stay well under $1-2/month.

---

## Next Steps

1. ✅ Configure SMTP in Supabase Dashboard (Step 2)
2. ✅ Test SMTP connection (Step 3)
3. ⏭️ Customize email templates (I'll create these for you next)
4. ⏭️ Test all authentication flows (Step 7)
5. ⏭️ Monitor for a few days before production deployment

Ready to proceed? Let me know when you've completed Steps 2-3, and I'll help you with the custom email templates!
