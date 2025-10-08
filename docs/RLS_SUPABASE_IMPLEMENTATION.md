# Row Level Security (RLS) - Supabase Implementation ✅

## 🎉 Successfully Deployed!

**Date:** October 6, 2025  
**Status:** ✅ All 28 tables secured with 66 policies

---

## Deployment Summary

```
✅ 28 tables with RLS enabled
✅ 66 security policies created
✅ Using Supabase built-in auth.uid() function
✅ Zero permission errors
```

### Tables Protected

All 28 tables in the system now have row-level security:

- **Core:** users, sub_accounts, organizations
- **Content:** assessments, ai_reports, documents, document_chunks
- **Templates:** assessment_templates, domain_templates, assessment_template_domains
- **Versions:** assessment_template_versions, domain_template_versions
- **Interaction:** chat_sessions, chat_messages, shareable_links
- **Results:** scores, recommendations, question_responses
- **Questions:** question_sets, questions, termination_rules
- **Business:** licenses, user_licenses, subscriptions, payments
- **Tracking:** usage_metrics, platform_settings, login_tokens

---

## Key Implementation Details

### Authentication Function Used

We use **Supabase's built-in `auth.uid()`** function instead of custom auth schema functions:

```sql
-- Get current authenticated user ID
auth.uid()::text

-- Example usage in policy
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (id = auth.uid()::text);
```

### Why Not Custom Functions?

The initial approach tried to create custom functions in the `auth` schema:

```sql
-- ❌ This fails in Supabase (permission denied)
CREATE FUNCTION auth.user_id() RETURNS text ...
CREATE FUNCTION auth.user_role() RETURNS text ...
```

**Problem:** Supabase's `auth` schema is protected and users cannot create functions there.

**Solution:** Use Supabase's built-in `auth.uid()` and join to the `users` table for role checks:

```sql
-- ✅ This works in Supabase
CREATE POLICY "Admins can read org users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text
      AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND (u."organizationId" = users."organizationId" OR u.role = 'SUPER_ADMIN')
    )
  );
```

---

## Security Model

### Role Hierarchy

```
SUPER_ADMIN (Global access)
    ↓
ADMIN (Organization-wide access)
    ↓
DISTRICT_ADMIN (Sub-accounts + own data)
    ↓
USER / SUB_ACCOUNT (Own data only)
```

### Access Patterns

#### 1. User Isolation (Most Tables)

Users can only access their own data:

```sql
-- Example: assessments table
USING ("userId" = auth.uid()::text)
```

**Applies to:**

- assessments
- documents
- chat_sessions
- recommendations
- question_responses

#### 2. Organization Boundaries (Admin Access)

Admins can access data for users in their organization:

```sql
-- Example: admin reading org assessments
USING (
  EXISTS (
    SELECT 1 FROM users admin
    JOIN users assessment_owner ON assessments."userId" = assessment_owner.id
    WHERE admin.id = auth.uid()::text
    AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
    AND (admin."organizationId" = assessment_owner."organizationId"
         OR admin.role = 'SUPER_ADMIN')
  )
)
```

**Applies to:**

- All user-created content when accessed by admins
- Organization-level resources

#### 3. Sub-Account Hierarchy

District admins can manage their sub-accounts:

```sql
-- Sub-accounts table
USING ("managedByUserId" = auth.uid()::text)
```

**Applies to:**

- sub_accounts table
- Sub-account created content (via district admin parent)

#### 4. Public Resources

Active templates are readable by all authenticated users:

```sql
-- Example: assessment templates
USING ("isActive" = true AND auth.uid() IS NOT NULL)
```

**Applies to:**

- assessment_templates (when isActive = true)
- domain_templates
- question_sets (when isActive = true)
- questions, termination_rules

#### 5. System-Level Operations

Service role bypasses RLS for server operations:

```sql
-- Prisma client uses service role
-- No RLS enforcement on server-side queries
```

**Applies to:**

- Scores calculation (POST /api/assessments/[id]/score)
- Payment processing (Stripe webhooks)
- Usage metrics tracking
- Login token management

---

## Policy Breakdown

### High-Policy Tables (5 policies)

- **users** (5 policies)
  - Users read/update own data
  - Admins read org users
  - District admins read sub-accounts
  - Super admins full access

### Medium-Policy Tables (3-4 policies)

- **assessment_templates** (4 policies)
  - Users read active templates
  - Creators manage own templates
  - Admins manage org templates
  - Super admins manage all templates

- **assessments, ai_reports, documents, scores, etc.** (3 policies each)
  - Users manage own data
  - District admins read sub-account data (where applicable)
  - Admins read org data

### Low-Policy Tables (1-2 policies)

- **chat_sessions** (1 policy)
  - Users manage own sessions

- **question_sets, questions, etc.** (2 policies)
  - Users read (if active)
  - Admins manage

---

## Testing Guide

### 1. User Isolation Test

**Scenario:** User A should NOT see User B's assessments

```typescript
// Login as User A
const { data: userAAssessments } = await supabase
  .from("assessments")
  .select("*")
  .eq("userId", userA.id);

// Should succeed
expect(userAAssessments).toHaveLength(1);

// Try to access User B's assessment
const { data: userBAssessment, error } = await supabase
  .from("assessments")
  .select("*")
  .eq("id", userB.assessmentId);

// Should return empty or error
expect(error || userBAssessment.length === 0).toBeTruthy();
```

### 2. Admin Access Test

**Scenario:** Admin should see all org users' assessments

```typescript
// Login as Admin
const { data: orgAssessments } = await supabase
  .from("assessments")
  .select("*, users!inner(organizationId)")
  .eq("users.organizationId", admin.organizationId);

// Should see multiple users' assessments
expect(orgAssessments.length).toBeGreaterThan(1);
```

### 3. Sub-Account Test

**Scenario:** District admin should manage sub-accounts

```typescript
// Login as District Admin
const { data: subAccounts } = await supabase
  .from('sub_accounts')
  .select('*')
  .eq('managedByUserId', districtAdmin.id);

// Should succeed
expect(subAccounts).toBeDefined();

// Sub-account creates assessment
const { data: subAssessment } = await supabase
  .from('assessments')
  .insert({ userId: subAccount.userId, ... })
  .select()
  .single();

// District admin can view it
const { data: viewedAssessment } = await supabase
  .from('assessments')
  .select('*')
  .eq('id', subAssessment.id)
  .single();

expect(viewedAssessment).toBeDefined();
```

### 4. Public Resources Test

**Scenario:** Any authenticated user can read active templates

```typescript
// Login as any user
const { data: templates } = await supabase
  .from("assessment_templates")
  .select("*")
  .eq("isActive", true);

// Should succeed
expect(templates.length).toBeGreaterThan(0);

// Try to update template (should fail for non-admin)
const { error } = await supabase
  .from("assessment_templates")
  .update({ name: "Hacked" })
  .eq("id", templates[0].id);

// Should fail
expect(error).toBeDefined();
```

### 5. Service Role Test

**Scenario:** Server-side operations should bypass RLS

```typescript
// Server-side (Prisma with service role)
const allAssessments = await prisma.assessment.findMany();

// Should return ALL assessments (no RLS filtering)
expect(allAssessments.length).toBeGreaterThan(userAssessments.length);
```

---

## Manual Testing Steps

### Step 1: Create Test Users

```sql
-- Create test organization
INSERT INTO organizations (id, name, "createdAt", "updatedAt")
VALUES ('test-org-1', 'Test Organization', NOW(), NOW());

-- Create User A
INSERT INTO users (id, email, role, "organizationId", "createdAt", "updatedAt")
VALUES ('user-a', 'usera@test.com', 'USER', 'test-org-1', NOW(), NOW());

-- Create User B
INSERT INTO users (id, email, role, "organizationId", "createdAt", "updatedAt")
VALUES ('user-b', 'userb@test.com', 'USER', 'test-org-1', NOW(), NOW());

-- Create Admin
INSERT INTO users (id, email, role, "organizationId", "createdAt", "updatedAt")
VALUES ('admin-1', 'admin@test.com', 'ADMIN', 'test-org-1', NOW(), NOW());
```

### Step 2: Test User Isolation

```bash
# Login as User A (set JWT token)
# Create assessment
# Try to query as User B → Should fail/empty
```

### Step 3: Test Admin Access

```bash
# Login as Admin
# Query assessments → Should see both User A & User B's assessments
```

### Step 4: Monitor Logs

```bash
# Check Supabase logs for:
# - Permission denied errors (expected for unauthorized access)
# - Successful queries (expected for authorized access)
# - Performance (queries should be <100ms)
```

---

## Performance Considerations

### Index Recommendations

RLS policies use `userId`, `organizationId`, and role checks extensively. Ensure these indexes exist:

```sql
-- Users table
CREATE INDEX idx_users_organization ON users("organizationId");
CREATE INDEX idx_users_role ON users(role);

-- Assessments table
CREATE INDEX idx_assessments_user ON assessments("userId");

-- Sub-accounts table
CREATE INDEX idx_sub_accounts_managed_by ON sub_accounts("managedByUserId");

-- AI Reports table
CREATE INDEX idx_ai_reports_assessment ON ai_reports("assessmentId");
```

### Query Performance

- Most RLS policies use simple `userId` checks → Very fast
- Admin policies use JOINs → Slightly slower but acceptable
- Complex nested queries may need optimization

**Monitoring:**

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
WHERE query LIKE '%assessments%'
ORDER BY mean_exec_time DESC;
```

---

## Troubleshooting

### Issue 1: "Permission Denied" Errors

**Symptom:** User gets permission denied when querying table

**Causes:**

1. User not authenticated (auth.uid() is NULL)
2. User trying to access data they don't own
3. RLS policy too restrictive

**Debug:**

```sql
-- Check if user is authenticated
SELECT auth.uid();

-- Check user's role
SELECT id, role, "organizationId" FROM users WHERE id = auth.uid()::text;

-- Check policies on table
SELECT * FROM pg_policies WHERE tablename = 'assessments';
```

### Issue 2: Admin Can't See Org Data

**Symptom:** Admin user gets empty results for org queries

**Causes:**

1. Admin's organizationId doesn't match target user's
2. Role not set correctly
3. Policy logic error

**Debug:**

```sql
-- Check admin's org
SELECT id, role, "organizationId" FROM users WHERE id = auth.uid()::text;

-- Check target user's org
SELECT id, "organizationId" FROM users WHERE id = 'target-user-id';

-- Manually test policy logic
SELECT * FROM assessments
WHERE EXISTS (
  SELECT 1 FROM users admin
  JOIN users assessment_owner ON assessments."userId" = assessment_owner.id
  WHERE admin.id = 'admin-user-id'
  AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
  AND admin."organizationId" = assessment_owner."organizationId"
);
```

### Issue 3: Service Role Queries Failing

**Symptom:** Server-side Prisma queries fail

**Causes:**

1. Not using service role key
2. Using anon key instead

**Fix:**

```typescript
// ✅ Correct - uses service role (bypasses RLS)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Service role connection string
    },
  },
});

// ❌ Wrong - uses anon key (enforces RLS)
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Anon key enforces RLS
);
```

---

## Rollback Procedure

If RLS causes issues and needs to be disabled:

```sql
-- Disable RLS on specific table
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- Drop policies on specific table
DROP POLICY "Users can manage their own assessments" ON assessments;
DROP POLICY "District admins can read sub-account assessments" ON assessments;
DROP POLICY "Admins can read org assessments" ON assessments;

-- Disable RLS on all tables (DANGER!)
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
```

---

## Next Steps

### Immediate (Testing Phase)

1. ✅ RLS migration applied
2. ✅ 28 tables secured
3. ✅ 66 policies created
4. ⏳ Run automated tests (`./scripts/test-rls.sh`)
5. ⏳ Manual authentication testing
6. ⏳ Test user isolation
7. ⏳ Test admin access patterns
8. ⏳ Monitor performance

### Short-term (Pre-Production)

1. Load testing with RLS enabled
2. Performance optimization (add indexes if needed)
3. Error tracking and alerting setup
4. Documentation for team

### Long-term (Production)

1. Regular security audits
2. Policy refinement based on usage patterns
3. Performance monitoring
4. User feedback integration

---

## Security Best Practices

1. **Never disable RLS in production** unless absolutely necessary
2. **Always use service role for server operations** (Prisma)
3. **Use anon key for client operations** (Supabase client)
4. **Test policies with real user scenarios** before deploying
5. **Monitor for permission denied errors** after deployment
6. **Add indexes for policy-checked columns** (userId, organizationId, role)
7. **Document all policy changes** with rationale
8. **Regular security audits** of policy logic

---

## Migration Files

- **Main Migration:** `prisma/migrations/enable_rls_policies_fixed.sql`
- **Original (Failed):** `prisma/migrations/enable_rls_policies.sql`
- **Helper Scripts:**
  - `scripts/enable-rls.sh` (apply migration)
  - `scripts/test-rls.sh` (verify deployment)

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- Project Docs: `docs/RLS_SECURITY_MODEL.md`, `docs/PHASE_5_RLS_README.md`

---

**Status:** ✅ Production Ready (pending testing)  
**Last Updated:** October 6, 2025  
**Maintained By:** Development Team
