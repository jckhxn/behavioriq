# Testing Checklist - Supabase Auth & RLS

**Date:** October 6, 2025  
**Status:** 🔄 In Progress

---

## 1. Authentication Flows Testing

### ✅ Basic Login/Logout

- [ ] Navigate to login page
- [ ] Login with email/password
- [ ] Verify redirect to dashboard
- [ ] Check user session is active
- [ ] Logout and verify session cleared
- [ ] Verify redirect to login/home page

### ⚠️ Magic Link (KNOWN BUG)

- [ ] Request magic link
- [ ] Check email received
- [ ] Click magic link in email
- [ ] Verify callback route works
- [ ] Verify redirect to dashboard
- **Bug:** Magic Links don't work when following link from email

### ⚠️ Password Reset (KNOWN BUG)

- [ ] Navigate to forgot password page
- [ ] Request password reset
- [ ] Check email received
- [ ] Click reset link in email
- [ ] Verify reset password page loads
- [ ] Reset password
- [ ] Login with new password
- **Bug:** Password reset doesn't work when following link from email

### Trial Assessment Flow

- [ ] Start trial assessment (unauthenticated)
- [ ] Complete trial assessment
- [ ] Register after trial
- [ ] Verify user created
- **Bug:** "failed to load assessment credits" on trial
- **Bug:** Should only be able to register AFTER completing trial

---

## 2. RLS - User Data Isolation

### Test Setup

Create two test users:

- User A: `testa@test.com`
- User B: `testb@test.com`

### User A Actions

- [ ] Login as User A
- [ ] Create an assessment
- [ ] Note assessment ID: `_______________`
- [ ] Verify assessment appears in User A's dashboard
- [ ] Logout

### User B Verification (Isolation Test)

- [ ] Login as User B
- [ ] Check dashboard (should NOT see User A's assessment)
- [ ] Try to access User A's assessment directly via URL
  - URL: `/dashboard/enhanced-report/[User A's assessment ID]`
  - **Expected:** Error or empty/redirect (RLS blocks access)
- [ ] Try API call to fetch User A's assessment
  - API: `GET /api/assessments/[User A's assessment ID]`
  - **Expected:** 404 or 403 error
- [ ] Create User B's own assessment
- [ ] Verify User B only sees own assessment

### ✅ RLS Working If:

- User B cannot see User A's assessment in UI
- Direct URL access to User A's assessment fails
- API calls return error or empty data
- User B only sees own assessments

---

## 3. RLS - Admin Access Patterns

### Test Setup

Create test users in same organization:

- Regular User: `user@org1.com`
- Admin User: `admin@org1.com` (role: ADMIN)
- Super Admin: `superadmin@test.com` (role: SUPER_ADMIN)

### Regular User Actions

- [ ] Login as regular user
- [ ] Create assessment
- [ ] Note assessment ID: `_______________`
- [ ] Verify only sees own assessment
- [ ] Cannot access admin routes
- [ ] Logout

### Admin Access Test

- [ ] Login as admin user
- [ ] Create own assessment
- [ ] Navigate to admin dashboard
- [ ] Verify can see regular user's assessment
- [ ] Verify can see org-wide data
- [ ] Try to access other org's data
  - **Expected:** Cannot see other org's data (RLS blocks)
- [ ] Logout

### Super Admin Access Test

- [ ] Login as super admin
- [ ] Navigate to admin dashboard
- [ ] Verify can see ALL organizations' data
- [ ] Verify can access all assessments
- [ ] Verify can manage platform settings

### ✅ RLS Working If:

- Regular users only see own data
- Admins see organization-wide data
- Admins CANNOT see other orgs' data
- Super admins see everything

---

## 4. RLS - Sub-Account Hierarchy

### Test Setup

Create district admin and sub-accounts:

- District Admin: `district@test.com` (role: DISTRICT_ADMIN)
- Sub-Account 1: `sub1@test.com` (managed by district admin)
- Sub-Account 2: `sub2@test.com` (managed by district admin)

### District Admin Actions

- [ ] Login as district admin
- [ ] Create sub-account 1
- [ ] Create sub-account 2
- [ ] View sub-accounts list
- [ ] Verify can see both sub-accounts
- [ ] Logout

### Sub-Account Actions

- [ ] Login as sub-account 1
- [ ] Create assessment
- [ ] Verify assessment visible to sub-account 1
- [ ] Logout

### District Admin Verification

- [ ] Login as district admin
- [ ] Verify can see sub-account 1's assessment
- [ ] Verify can manage sub-account 1
- [ ] Cannot see unrelated users' data

### ✅ RLS Working If:

- District admin can manage their sub-accounts
- District admin can see sub-accounts' assessments
- Sub-accounts have proper isolated access
- District admin cannot see other districts' sub-accounts

---

## 5. RLS - Public Resources

### Template Access Test

- [ ] Login as regular user
- [ ] Navigate to assessment templates page
- [ ] Verify can READ active templates
- [ ] Try to create/edit template
  - **Expected:** Fails (only admins can manage)
- [ ] Navigate to domain templates
- [ ] Verify can READ domain templates

### Question Sets Access

- [ ] Login as regular user
- [ ] Start assessment (loads question sets)
- [ ] Verify can READ active question sets
- [ ] Verify can READ questions
- [ ] Verify cannot modify questions

### ✅ RLS Working If:

- Users can read active templates
- Users can read question sets/questions
- Users CANNOT modify templates/questions
- Only admins can manage templates

---

## 6. Database Performance Monitoring

### Query Performance

- [ ] Check Supabase dashboard → Performance
- [ ] Monitor query execution times
- [ ] Look for slow queries (>100ms)
- [ ] Check for missing indexes

### Error Monitoring

- [ ] Check Supabase logs
- [ ] Look for "permission denied" errors
- [ ] Look for RLS policy errors
- [ ] Monitor error rates during testing

### Load Testing (Optional)

- [ ] Create 10+ test users
- [ ] Have each create assessments
- [ ] Monitor database CPU/memory
- [ ] Check query performance under load

---

## 7. Known Bugs to Verify

### Bug 1: Magic Links Not Working

- **Status:** ⏳ To Test
- **Issue:** Magic links don't work when clicking from email
- **Test Steps:**
  1. Request magic link
  2. Check email
  3. Click link
  4. Document exact error
- **Expected Fix Location:** `/app/auth/callback/route.ts` or Supabase redirect URLs

### Bug 2: Password Reset Not Working

- **Status:** ⏳ To Test
- **Issue:** Password reset doesn't work when clicking from email
- **Test Steps:**
  1. Request password reset
  2. Check email
  3. Click link
  4. Document exact error
- **Expected Fix Location:** `/app/auth/reset-password/` or callback handling

### Bug 3: Trial Assessment Credits Error

- **Status:** ⏳ To Test
- **Issue:** "failed to load assessment credits" on trial (unauthenticated)
- **Test Steps:**
  1. Open trial assessment page (not logged in)
  2. Check browser console
  3. Document error
- **Expected Fix Location:** Trial assessment route or credits checking logic

### Bug 4: Previous Button on Resume

- **Status:** ⏳ To Test
- **Issue:** Previous button doesn't work on assessment resume
- **Test Steps:**
  1. Start assessment
  2. Answer some questions
  3. Leave and come back
  4. Try previous button
  5. Document behavior
- **Expected Fix Location:** Assessment component navigation logic

### Bug 5: Registration Before Trial

- **Status:** ⏳ To Test
- **Issue:** Should only register after completing trial
- **Test Steps:**
  1. Try to register without completing trial
  2. Should be blocked
  3. Complete trial
  4. Then allow registration
- **Expected Fix Location:** Registration flow logic

---

## 8. Testing Tools

### Manual Testing

- **Browser:** Use Chrome DevTools
- **Network Tab:** Monitor API calls
- **Console:** Check for errors
- **Application Tab:** Verify cookies/localStorage

### Database Queries

```sql
-- Check current user's ID
SELECT auth.uid();

-- Check RLS policies on table
SELECT * FROM pg_policies WHERE tablename = 'assessments';

-- Check table has RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'assessments';

-- Test query as specific user (use Supabase SQL Editor)
SET request.jwt.claim.sub = 'user-id-here';
SELECT * FROM assessments;
```

### API Testing

```bash
# Test authenticated API call
curl -X GET http://localhost:3000/api/assessments \
  -H "Cookie: your-session-cookie"

# Test unauthenticated call (should fail)
curl -X GET http://localhost:3000/api/assessments
```

---

## Test Results Summary

### Authentication ✅ / ❌ / ⏳

- [ ] Basic login/logout: ⏳
- [ ] Magic links: ⏳
- [ ] Password reset: ⏳
- [ ] Trial flow: ⏳

### RLS - User Isolation ✅ / ❌ / ⏳

- [ ] User A/B isolation: ⏳
- [ ] Direct URL access blocked: ⏳
- [ ] API access blocked: ⏳

### RLS - Admin Access ✅ / ❌ / ⏳

- [ ] Admin sees org data: ⏳
- [ ] Admin blocked from other orgs: ⏳
- [ ] Super admin sees all: ⏳

### RLS - Sub-Accounts ✅ / ❌ / ⏳

- [ ] District admin manages subs: ⏳
- [ ] Sub-account isolation: ⏳

### RLS - Public Resources ✅ / ❌ / ⏳

- [ ] Users read templates: ⏳
- [ ] Users blocked from editing: ⏳

### Performance ✅ / ❌ / ⏳

- [ ] Queries <100ms: ⏳
- [ ] No permission errors: ⏳

---

## Notes

_Add any observations, errors, or issues discovered during testing here:_

---

**Next Steps After Testing:**

1. Document all bugs found
2. Fix critical authentication issues (magic links, password reset)
3. Fix trial assessment bugs
4. Verify all RLS policies working
5. Commit RLS implementation
6. Move to Phase 6: Comprehensive Testing
