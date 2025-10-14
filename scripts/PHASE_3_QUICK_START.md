# Phase 3: Supabase + SES Integration - Quick Start

## ✅ What's Been Done

- ✅ SES email service created and tested
- ✅ Custom email templates created for Supabase
- ✅ Test scripts ready to use
- ✅ Setup documentation prepared

## 🎯 What You Need to Do (Manual Steps)

### Step 1: Configure Supabase SMTP (10-15 minutes)

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select your project

2. **Navigate to SMTP Settings**
   - Sidebar: **Authentication** → **Email Templates**
   - Click the **gear icon (⚙️)** in the top right

3. **Enable Custom SMTP**
   - Toggle: **Enable Custom SMTP** → ON

4. **Enter SES SMTP Credentials**
   ```
   SMTP Host: email-smtp.us-east-1.amazonaws.com
   SMTP Port: 587
   SMTP Username: [Your AWS SES SMTP username - starts with AKIA]
   SMTP Password: [Your AWS SES SMTP password]

   Sender Email: tjhixon@gmail.com
   Sender Name: AI Diagnostic

   Enable TLS: ✅ (Checked)
   ```

5. **Click "Save"**
   - Should see a green success message
   - May take 30-60 seconds to apply

### Step 2: Update Email Templates (15-20 minutes)

1. **Open Template File**
   - File: `scripts/supabase-email-templates.html`
   - Contains 5 pre-made templates

2. **For Each Template Type:**

   **A. Magic Link Template**
   - In Supabase: **Authentication** → **Email Templates** → **Magic Link**
   - Copy the "Magic Link Template" HTML from the file
   - Paste into Supabase editor
   - Click **"Save"**

   **B. Reset Password Template**
   - In Supabase: **Authentication** → **Email Templates** → **Reset Password**
   - Copy the "Password Reset Template" HTML from the file
   - Paste into Supabase editor
   - Click **"Save"**

   **C. Confirm Signup Template**
   - In Supabase: **Authentication** → **Email Templates** → **Confirm signup**
   - Copy the "Confirm Signup Template" HTML from the file
   - Paste into Supabase editor
   - Click **"Save"**

   **D. Change Email Template**
   - In Supabase: **Authentication** → **Email Templates** → **Change Email Address**
   - Copy the "Change Email Template" HTML from the file
   - Paste into Supabase editor
   - Click **"Save"**

   **E. Invite User Template**
   - In Supabase: **Authentication** → **Email Templates** → **Invite user**
   - Copy the "Invite User Template" HTML from the file
   - Paste into Supabase editor
   - Click **"Save"**

### Step 3: Test the Integration (10-15 minutes)

1. **Run the test script:**
   ```bash
   npx tsx scripts/test-supabase-auth-emails.ts tjhixon@gmail.com
   ```

2. **What the script tests:**
   - ✅ Magic Link email
   - ✅ Password Reset email
   - ✅ Email Verification (if user doesn't exist)

3. **Check your inbox:**
   - Should receive 2-3 test emails
   - Verify sender is: tjhixon@gmail.com
   - Check branding and formatting
   - Click links to ensure they work

4. **Check AWS SES Console:**
   - Go to: AWS SES Console → Account Dashboard
   - Look at "Sending Statistics"
   - Should see 2-3 emails sent
   - Delivery rate should be 100%

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `scripts/supabase-ses-setup-guide.md` | Detailed setup instructions with troubleshooting |
| `scripts/supabase-email-templates.html` | Copy-paste ready email templates |
| `scripts/test-supabase-auth-emails.ts` | Automated testing script |
| `scripts/PHASE_3_QUICK_START.md` | This quick reference (you are here) |

---

## ⏱️ Time Estimate

- **Step 1 (SMTP Config):** 10-15 minutes
- **Step 2 (Templates):** 15-20 minutes
- **Step 3 (Testing):** 10-15 minutes
- **Total:** ~35-50 minutes

---

## ✅ Success Checklist

- [ ] SMTP configured in Supabase Dashboard
- [ ] All 5 email templates updated
- [ ] Test script executed successfully
- [ ] Received test emails in inbox
- [ ] Email links work correctly
- [ ] AWS SES shows sent emails
- [ ] Email branding looks good

---

## 🚨 Common Issues & Quick Fixes

### Issue: "SMTP connection failed"
**Fix:** Double-check SMTP username and password in Supabase settings

### Issue: "Email not received"
**Fix:**
- Check if still in SES sandbox mode
- Verify tjhixon@gmail.com is verified in AWS SES Console
- Check spam folder

### Issue: "Template doesn't look right"
**Fix:**
- Ensure you copied the FULL HTML template
- Check for any accidental edits
- Re-copy from the template file

### Issue: Test script fails
**Fix:**
- Verify `.env.local` has correct Supabase credentials
- Check that `NEXT_PUBLIC_SUPABASE_URL` is set
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

---

## 📞 Need Help?

If you run into issues:

1. Check the detailed guide: `scripts/supabase-ses-setup-guide.md`
2. Check AWS CloudWatch logs for SES errors
3. Check Supabase Dashboard → Authentication → Logs
4. Verify AWS SES sending statistics

---

## 🎉 What's Next After Phase 3?

Once Phase 3 is complete, you can move to:

- **Phase 4:** User Notifications System (optional)
- **Phase 4.5:** Rate Limiting & Abuse Prevention (recommended)
- **Phase 5:** PDF Email Handling (already works!)
- **Phase 6:** Monitoring & Analytics
- **Phase 7:** Production Deployment

**Or:** Move on to other priorities in your TODOs.md!

---

## 💡 Pro Tips

- **Sandbox Mode:** If still in SES sandbox, only verified emails work
- **Production Access:** Request in AWS SES Console (24-48 hours)
- **Domain Verification:** Consider verifying your domain (not just email)
- **Monitoring:** Check SES stats daily for first week
- **Cost:** Auth emails should be <$0.10/month with current usage

---

Good luck! 🚀
