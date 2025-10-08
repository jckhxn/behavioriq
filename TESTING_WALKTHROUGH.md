# 🧪 Step-by-Step Testing Guide

**Dev Server**: ✅ Running on http://localhost:3000
**Time Needed**: 30-45 minutes
**Goal**: Verify all critical features work before launch

---

## 🎯 Testing Strategy

We'll test in this order:

1. **Basic Navigation** (5 min) - Make sure site loads
2. **Authentication** (10 min) - Sign up, login, logout
3. **Trial Assessment** (10 min) - Not logged in flow
4. **Full Assessment** (10 min) - Logged in flow
5. **Settings & New Features** (5 min) - Security tab, MFA, Passkeys

---

## Test Session Setup

**Open These Tools**:

1. Browser: http://localhost:3000
2. Browser DevTools (F12) - Watch for console errors
3. This file - Check off tests as you complete them
4. Notepad - Track any bugs you find

**Test Accounts You'll Need**:

- New test email for signup
- Your super admin account (if you have one)

---

## 🚀 TEST 1: Basic Navigation & Site Health

**Goal**: Make sure the site loads without errors

### Steps:

1. **Open the site**:

   ```
   Open: http://localhost:3000
   ```

   - [ ] ✅ Page loads
   - [ ] ✅ No errors in browser console (F12)
   - [ ] ✅ Landing page displays correctly

2. **Check main navigation**:
   - [ ] Click through header links
   - [ ] All pages load without errors
   - [ ] Navigation works smoothly

3. **Test 404 page**:
   ```
   Visit: http://localhost:3000/this-page-does-not-exist
   ```

   - [ ] 404 page displays
   - [ ] Can navigate back to home

**✅ PASS if**: Site loads, no console errors, navigation works
**❌ FAIL if**: White screen, React errors, broken navigation

---

## 🔐 TEST 2: Authentication Flow

**Goal**: Verify users can sign up, login, and logout

### 2A: Sign Up (New Account)

1. **Navigate to signup**:

   ```
   Go to: http://localhost:3000/register
   OR click "Sign Up" button
   ```

2. **Fill out form**:
   - [ ] Email: `test-[timestamp]@example.com`
   - [ ] Password: `Test1234!`
   - [ ] Name: `Test User`
   - [ ] Click "Sign Up"

3. **Verify redirect**:
   - [ ] ✅ Redirects to dashboard (or onboarding)
   - [ ] ✅ No errors shown
   - [ ] ✅ User is logged in

**Note**: Save this test email - you'll use it later!

### 2B: Logout

1. **Find logout**:
   - [ ] Click user menu (top right)
   - [ ] Click "Logout" or "Sign Out"
   - [ ] Redirects to home or login page
   - [ ] ✅ Successfully logged out

### 2C: Login (Existing Account)

1. **Navigate to login**:

   ```
   Go to: http://localhost:3000/login
   ```

2. **Enter credentials**:
   - [ ] Email: (your test account from 2A)
   - [ ] Password: `Test1234!`
   - [ ] Click "Sign In"

3. **Verify login**:
   - [ ] ✅ Redirects to dashboard
   - [ ] ✅ User menu shows your name/email
   - [ ] ✅ Session persists on refresh (F5)

### 2D: Password Reset (Optional but Important)

1. **Navigate to forgot password**:

   ```
   Go to: http://localhost:3000/login
   Click "Forgot Password?" link
   ```

2. **Request reset**:
   - [ ] Enter your test email
   - [ ] Click "Send Reset Link"
   - [ ] Success message appears

3. **Check email** (Supabase sends this):
   - [ ] Open email inbox
   - [ ] Look for password reset email
   - [ ] Click reset link
   - [ ] Can set new password

**✅ PASS if**: Can sign up, login, logout, reset password
**❌ FAIL if**: Cannot create account, login fails, errors shown

---

## 📝 TEST 3: Trial Assessment (Not Logged In)

**Goal**: Verify trial flow works for non-users

### Setup:

- [ ] Make sure you're **logged out**
- [ ] Clear browser (optional): Clear cookies/local storage

### 3A: Start Trial

1. **Navigate to trial**:

   ```
   Go to: http://localhost:3000/trial-assessment
   OR: http://localhost:3000/conversational-trial
   ```

2. **Read instructions**:
   - [ ] ✅ Instructions page loads
   - [ ] ✅ "What to expect" section displays
   - [ ] ✅ "Start Assessment" button visible

3. **Click "Start Assessment"**:
   - [ ] Assessment loads
   - [ ] First question displays
   - [ ] No errors in console

### 3B: Answer Questions

1. **Complete assessment**:
   - [ ] Answer question 1 (Yes/No or conversational)
   - [ ] Click "Next" or submit answer
   - [ ] Question 2 loads
   - [ ] Progress indicator works (if shown)
   - [ ] Can navigate back to previous question
   - [ ] Answer all questions

**Tips**:

- You can click through quickly (test data)
- Watch for any errors between questions
- Note if progress saves (refresh page mid-assessment)

### 3C: View Results

1. **Complete assessment**:
   - [ ] Answer final question
   - [ ] Click "Submit" or "Finish"
   - [ ] Redirects to results page

2. **Check results page**:

   ```
   URL should be: /trial-results/[shortId]
   ```

   - [ ] ✅ Results page loads
   - [ ] ✅ Charts/graphs display correctly
   - [ ] ✅ Domain scores visible
   - [ ] ✅ AI recommendations appear
   - [ ] ✅ No layout issues

3. **Enhanced report option**:
   - [ ] "Purchase Enhanced Report" button/card visible
   - [ ] Shows price ($5 or configured amount)
   - [ ] Clicking it redirects (to payment or signup)

### 3D: Progress Persistence (Optional)

1. **Start new trial**:
   - [ ] Start another trial assessment
   - [ ] Answer 2-3 questions
   - [ ] **Refresh page** (F5)
   - [ ] Verify progress saved (should resume where left off)

**✅ PASS if**: Can complete trial, see results, charts work
**❌ FAIL if**: Assessment breaks, results don't load, charts missing

---

## 📊 TEST 4: Full Assessment (Logged In)

**Goal**: Verify authenticated user assessment flow

### Setup:

- [ ] Make sure you're **logged in** (use test account from Test 2)

### 4A: Start Assessment from Dashboard

1. **Go to dashboard**:

   ```
   Go to: http://localhost:3000/dashboard
   ```

2. **Create new assessment**:
   - [ ] Click "New Assessment" or "Start Assessment"
   - [ ] Enter subject name: `Test Student`
   - [ ] Select assessment type (if prompted)
   - [ ] Click "Start" or "Begin"

3. **Verify assessment starts**:
   - [ ] Assessment page loads
   - [ ] First question displays
   - [ ] Subject name shown somewhere (header/sidebar)

### 4B: Complete Assessment

1. **Answer questions**:
   - [ ] Answer all questions
   - [ ] Progress saves automatically
   - [ ] Can pause and resume (test by refreshing)
   - [ ] No errors during assessment

2. **Submit assessment**:
   - [ ] Click "Submit" or "Complete"
   - [ ] Confirmation dialog (if any)
   - [ ] Redirects to results

### 4C: View Full Results

1. **Results page**:

   ```
   URL: /assessments/[id] or /results/[id]
   ```

   - [ ] ✅ Results page loads
   - [ ] ✅ All charts render correctly
   - [ ] ✅ Domain scores accurate
   - [ ] ✅ AI recommendations display
   - [ ] ✅ PDF download button visible

2. **Download PDF**:
   - [ ] Click "Download PDF" button
   - [ ] PDF generates successfully
   - [ ] Open PDF and verify content
   - [ ] Charts included in PDF
   - [ ] Text formatted correctly

### 4D: Share Assessment

1. **Create shareable link**:
   - [ ] Find "Share" button on results page
   - [ ] Click "Share"
   - [ ] Shareable link generated
   - [ ] Copy link to clipboard

2. **Test share link**:
   - [ ] Open incognito/private window
   - [ ] Paste share link
   - [ ] Results viewable without login
   - [ ] Charts display correctly
   - [ ] Cannot edit/delete (view-only)

### 4E: View Assessment History

1. **Go to dashboard**:

   ```
   Go to: http://localhost:3000/dashboard
   ```

2. **Check assessment list**:
   - [ ] Previous assessments listed
   - [ ] Shows subject name, date, status
   - [ ] Can click to view past results
   - [ ] Past results load correctly

**✅ PASS if**: Full assessment works, PDF downloads, sharing works
**❌ FAIL if**: Assessment fails, PDF broken, sharing doesn't work

---

## 🔒 TEST 5: New Security Features

**Goal**: Verify OAuth, MFA, and Passkey features display correctly

### Setup:

- [ ] Make sure you're **logged in**

### 5A: Settings Page - Security Tab

1. **Navigate to settings**:

   ```
   Go to: http://localhost:3000/settings
   ```

2. **Check tabs**:
   - [ ] ✅ "Profile" tab exists
   - [ ] ✅ "Security" tab exists ← **NEW!**
   - [ ] ✅ "Billing" tab exists
   - [ ] ✅ "Preferences" or "Admin" tab exists

3. **Click Security tab**:
   - [ ] Security tab loads
   - [ ] No errors in console

### 5B: MFA Settings Component

1. **Find MFA card**:
   - [ ] "Two-Factor Authentication (2FA)" card visible
   - [ ] Shows current status (Enabled/Disabled)
   - [ ] Has "Enable 2FA" button (if not enabled)

2. **Test MFA enrollment** (Optional - requires authenticator app):

   ```
   You can skip this if you don't have an authenticator app
   ```

   - [ ] Click "Enable 2FA"
   - [ ] QR code displays
   - [ ] Manual secret key shown
   - [ ] Can copy secret key
   - [ ] Scan with Google Authenticator/Authy/1Password
   - [ ] Enter 6-digit code
   - [ ] Successfully enables MFA

3. **Verify MFA enabled**:
   - [ ] Status changes to "Enabled"
   - [ ] "Disable 2FA" button appears
   - [ ] Can disable MFA (optional)

### 5C: Passkey Settings Component

1. **Find Passkey card**:
   - [ ] "Passkeys (Biometric Authentication)" card visible
   - [ ] Shows browser support status
   - [ ] Has "Add Passkey" button

2. **Check WebAuthn support**:
   - [ ] If supported: Shows passkey list (empty or with passkeys)
   - [ ] If not supported: Shows warning message

3. **Test Passkey registration** (Optional - requires biometric device):

   ```
   Works on: Mac (Touch ID), iPhone (Face ID), Windows (Hello)
   Skip if you don't have biometric hardware
   ```

   - [ ] Click "Add Passkey"
   - [ ] Enter passkey name: "Test Device"
   - [ ] Browser prompts for biometric
   - [ ] Authenticate with fingerprint/face/PIN
   - [ ] Passkey added to list
   - [ ] Shows device icon, name, date

4. **Test Passkey deletion**:
   - [ ] Click trash/delete icon on passkey
   - [ ] Confirmation dialog appears
   - [ ] Confirm deletion
   - [ ] Passkey removed from list

### 5D: OAuth Buttons (Login Page)

1. **Log out first**:
   - [ ] Click logout

2. **Go to login page**:

   ```
   Go to: http://localhost:3000/login
   ```

3. **Check OAuth buttons**:
   - [ ] ✅ "Continue with Google" button visible
   - [ ] ✅ "Continue with Apple" button visible
   - [ ] ✅ Buttons have proper icons
   - [ ] ✅ Buttons styled correctly

4. **Test OAuth** (Optional - requires Supabase config):
   ```
   Skip if you haven't configured OAuth in Supabase yet
   ```

   - [ ] Click "Continue with Google"
   - [ ] Redirects to Google login
   - [ ] After auth, redirects back to app
   - [ ] User logged in
   - [ ] Redirects to dashboard

**✅ PASS if**: Security tab exists, components display, no errors
**❌ FAIL if**: Tab missing, components broken, console errors

---

## 📱 TEST 6: Mobile Responsiveness

**Goal**: Verify site works on mobile devices

### 6A: Desktop Browser - Mobile View

1. **Open DevTools**:
   - [ ] Press F12 (Chrome/Edge/Firefox)
   - [ ] Click device toolbar icon (phone/tablet icon)
   - [ ] Or: Ctrl+Shift+M (Cmd+Shift+M on Mac)

2. **Select device**:
   - [ ] Choose "iPhone 12" or similar
   - [ ] Or manually resize to 375x667

### 6B: Test Key Pages on Mobile

1. **Home/Landing**:

   ```
   Go to: http://localhost:3000
   ```

   - [ ] Layout looks good on mobile
   - [ ] Text readable (not too small)
   - [ ] Buttons big enough to tap
   - [ ] No horizontal scrolling

2. **Login page**:

   ```
   Go to: http://localhost:3000/login
   ```

   - [ ] Form fields accessible
   - [ ] Buttons work
   - [ ] OAuth buttons display correctly

3. **Dashboard**:

   ```
   Go to: http://localhost:3000/dashboard
   ```

   - [ ] Dashboard responsive
   - [ ] Cards stack vertically
   - [ ] Navigation accessible (hamburger menu?)

4. **Assessment page**:
   - [ ] Start an assessment
   - [ ] Questions readable
   - [ ] Buttons easy to tap
   - [ ] Progress indicator visible

5. **Results page**:
   - [ ] Charts resize properly
   - [ ] Text readable
   - [ ] Can scroll through content

6. **Settings page**:
   ```
   Go to: http://localhost:3000/settings
   ```

   - [ ] Tabs work on mobile
   - [ ] Forms usable
   - [ ] All sections accessible

**✅ PASS if**: Site usable on mobile, no layout breaks
**❌ FAIL if**: Text unreadable, buttons too small, layout broken

---

## 🎯 TEST 7: Admin Features (If You Have Admin Account)

**Goal**: Verify admin dashboard works

### Setup:

- [ ] Login with admin/super-admin account
- [ ] If you don't have one, skip this section

### 7A: Access Admin Dashboard

1. **Navigate to admin**:
   ```
   Go to: http://localhost:3000/admin
   ```

   - [ ] Admin dashboard loads
   - [ ] No "Forbidden" error
   - [ ] Admin navigation visible

### 7B: Domain Templates

1. **Navigate to domain templates**:
   - [ ] Click "Domain Templates" (or similar)
   - [ ] List of domain templates loads
   - [ ] Can view template details

2. **Create new domain template** (Optional):
   - [ ] Click "Create Domain Template"
   - [ ] Fill out form
   - [ ] Save successfully
   - [ ] New template appears in list

### 7C: Assessment Templates

1. **Navigate to assessment templates**:
   - [ ] Click "Assessment Templates" (or similar)
   - [ ] List of templates loads
   - [ ] Can view/edit templates

### 7D: User Management (If exists)

1. **View users**:
   - [ ] Navigate to user management
   - [ ] User list displays
   - [ ] Shows email, role, status
   - [ ] Can search/filter users

**✅ PASS if**: Admin features accessible and working
**❌ FAIL if**: Cannot access admin, features broken

---

## 🐛 Bug Tracking Template

As you test, track bugs using this format:

### Bug #1

**Page**: [Page URL]
**Severity**: Critical / High / Medium / Low
**Description**:
[What went wrong]

**Steps to Reproduce**:

1.
2.
3.

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Errors**: [Any error messages]
**Screenshot**: [If applicable]

---

## ✅ Final Checklist

After completing all tests:

- [ ] All critical flows work (auth, assessment, results)
- [ ] No major bugs blocking launch
- [ ] Mobile responsive
- [ ] New security features display correctly
- [ ] Bugs documented (if any)
- [ ] Ready for Priority 2 tasks (OAuth config, Stripe setup)

---

## 📊 Test Results Summary

**Total Tests Run**: **_/7
**Tests Passed**: _**/7
**Critical Bugs**: **_
**Minor Bugs**: _**

**Status**:

- ✅ PASS - Ready for next steps
- ⚠️ ISSUES - Need to fix bugs
- ❌ FAIL - Major issues found

---

## 🚀 Next Steps After Testing

### If Tests Pass:

1. Document any minor bugs (fix later)
2. Move to Priority 2:
   - Configure Supabase OAuth
   - Set up Stripe production
   - Performance optimization

### If Critical Bugs Found:

1. List all critical bugs
2. Prioritize fixes
3. Fix critical bugs
4. Re-test affected areas
5. Then move to Priority 2

---

## 💡 Testing Tips

**Best Practices**:

- ✅ Test one thing at a time
- ✅ Keep DevTools console open
- ✅ Take screenshots of bugs
- ✅ Note exact steps to reproduce
- ✅ Test happy path first, then edge cases
- ✅ Use real test data (not "asdf")

**What to Watch For**:

- 🚨 White screens / crashes
- 🚨 Error messages to users
- 🚨 Console errors (red text)
- ⚠️ Slow loading (>3 seconds)
- ⚠️ Layout issues (overlapping text)
- ⚠️ Broken navigation

**Common Issues**:

- Images not loading → Check paths
- API errors → Check Supabase connection
- Charts not rendering → Check data format
- Session issues → Clear cookies and retry

---

**Ready to start testing? Let's go! 🚀**

Pick a test section above and work through it step by step. Good luck!
