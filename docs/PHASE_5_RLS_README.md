# Phase 5: Row Level Security (RLS) Implementation

## 📋 Overview

This phase implements comprehensive Row Level Security (RLS) policies on all database tables to ensure data isolation, organization boundaries, and role-based access control at the database level.

## 🎯 Goals

1. **Data Isolation** - Users can only access their own data
2. **Organization Boundaries** - Prevent data leakage between organizations
3. **Role-Based Access** - Enforce permissions based on user roles
4. **Sub-Account Hierarchy** - District admins manage their sub-accounts
5. **Defense in Depth** - Database-level security complements application-level checks

## 📁 Files Created

### SQL Migration

- `prisma/migrations/enable_rls_policies.sql` - Main RLS migration file
  - Enables RLS on all 28 tables
  - Creates 6 helper functions
  - Implements 60+ security policies

### Documentation

- `docs/RLS_SECURITY_MODEL.md` - Complete security model documentation
  - Access patterns by table
  - Helper function reference
  - Testing guide
  - Troubleshooting tips

### Scripts

- `scripts/enable-rls.sh` - Migration script to apply RLS policies
- `scripts/test-rls.sh` - Test script to verify RLS is working

## 🔒 Security Model

### Role Hierarchy

```
SUPER_ADMIN (Global access to everything)
    ↓
ADMIN (Organization-wide access)
    ↓
DISTRICT_ADMIN (Sub-account management)
    ↓
USER / SUB_ACCOUNT (Own data only)
```

### Access Control Summary

| Resource          | User          | District Admin    | Admin             | Super Admin    |
| ----------------- | ------------- | ----------------- | ----------------- | -------------- |
| Own Data          | ✅ Read/Write | ✅ Read/Write     | ✅ Read/Write     | ✅ Full Access |
| Sub-Account Data  | ❌            | ✅ Read/Write     | ✅ Read/Write     | ✅ Full Access |
| Org Data          | ❌            | ❌                | ✅ Read/Write     | ✅ Full Access |
| All Data          | ❌            | ❌                | ❌                | ✅ Full Access |
| Templates         | ✅ Read       | ✅ Read/Write Own | ✅ Read/Write Org | ✅ Full Access |
| Platform Settings | ❌            | ❌                | ❌                | ✅ Full Access |

### Key Security Features

#### 1. User Data Isolation

```sql
-- Users can only see their own assessments
CREATE POLICY "Users can manage their own assessments"
  ON assessments FOR ALL
  USING ("userId" = auth.user_id());
```

#### 2. Organization Boundaries

```sql
-- Admins can only see users in their organization
CREATE POLICY "Admins can read org users"
  ON users FOR SELECT
  USING (
    auth.is_admin() AND (
      "organizationId" = auth.user_org_id() OR
      auth.is_super_admin()
    )
  );
```

#### 3. Sub-Account Hierarchy

```sql
-- District admins can manage their sub-accounts
CREATE POLICY "District admins can manage their sub-accounts"
  ON sub_accounts FOR ALL
  USING ("managedByUserId" = auth.user_id());
```

#### 4. Public Resources

```sql
-- All authenticated users can read assessment templates
CREATE POLICY "Users can read active assessment templates"
  ON assessment_templates FOR SELECT
  USING ("isActive" = true AND auth.user_id() IS NOT NULL);
```

## 🚀 Running the Migration

### Option 1: Using the Script (Recommended)

```bash
# Make sure DATABASE_URL is set (uses service_role key)
source .env.local

# Run the migration
./scripts/enable-rls.sh

# Test the policies
./scripts/test-rls.sh
```

### Option 2: Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Open `prisma/migrations/enable_rls_policies.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"

### Option 3: Using Prisma Migrate

```bash
# Create a new migration
npx prisma migrate dev --name enable_rls_policies

# Or apply directly
psql $DATABASE_URL -f prisma/migrations/enable_rls_policies.sql
```

## ✅ Testing Checklist

### Automated Tests

```bash
# Run automated RLS tests
./scripts/test-rls.sh
```

Expected output:

- ✅ RLS enabled on core tables
- ✅ All helper functions created
- ✅ 60+ policies created
- ✅ Policy breakdown by table

### Manual Testing

#### 1. Test User Isolation

```typescript
// Login as User A
const userA = await supabase.auth.signInWithPassword({
  email: "usera@example.com",
  password: "password",
});

// Try to fetch assessments - should only see User A's data
const { data: assessments } = await supabase.from("assessments").select("*");

console.log(assessments); // Only User A's assessments
```

#### 2. Test Admin Access

```typescript
// Login as Admin
const admin = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "password",
});

// Admin should see all org assessments
const { data: orgAssessments } = await supabase.from("assessments").select("*");

console.log(orgAssessments); // All org assessments
```

#### 3. Test Sub-Account Hierarchy

```typescript
// Login as District Admin
const districtAdmin = await supabase.auth.signInWithPassword({
  email: "district@example.com",
  password: "password",
});

// Should see sub-accounts managed by this admin
const { data: subAccounts } = await supabase.from("sub_accounts").select("*");

console.log(subAccounts); // Sub-accounts managed by district admin
```

#### 4. Test Public Resources

```typescript
// Login as any user
const user = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

// Should be able to read assessment templates
const { data: templates } = await supabase
  .from("assessment_templates")
  .select("*")
  .eq("isActive", true);

console.log(templates); // All active templates
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Permission denied for table X"

**Cause:** RLS is enabled but policy doesn't allow access

**Solution:**

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'your_table';

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'your_table';

-- Temporarily disable RLS to test (dev only!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### 2. "No rows returned when data exists"

**Cause:** JWT token not set or user ID doesn't match

**Solution:**

```sql
-- Test auth.user_id() function
SELECT auth.user_id();

-- Check if userId matches in table
SELECT * FROM assessments WHERE "userId" = auth.user_id();

-- Use service role to verify data exists
-- (in Supabase dashboard with service_role key)
SELECT * FROM assessments;
```

#### 3. "Function auth.user_id() does not exist"

**Cause:** Helper functions not created

**Solution:**

```bash
# Re-run migration
psql $DATABASE_URL -f prisma/migrations/enable_rls_policies.sql
```

#### 4. Queries are too slow

**Cause:** Missing indexes on filtered columns

**Solution:**

```sql
-- Add indexes on commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_assessments_userId
ON assessments("userId");

CREATE INDEX IF NOT EXISTS idx_users_organizationId
ON users("organizationId");

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);
```

## 📊 Performance Considerations

### Query Performance

RLS policies are evaluated on **every** query, which can impact performance:

1. **Use indexes** - Ensure `userId`, `organizationId`, and `role` columns are indexed
2. **Optimize policies** - Keep policy logic simple
3. **Use materialized views** - For complex reporting queries
4. **Monitor slow queries** - Use `EXPLAIN ANALYZE` to identify bottlenecks

### Example: Check Query Plan

```sql
EXPLAIN ANALYZE
SELECT * FROM assessments WHERE "userId" = auth.user_id();

-- Look for "Seq Scan" (bad) vs "Index Scan" (good)
```

## 🔐 Security Best Practices

### 1. Never Trust Client Input

```typescript
// ❌ BAD - Trusting client to filter
const userId = req.body.userId; // User could fake this!
const data = await prisma.assessment.findMany({
  where: { userId },
});

// ✅ GOOD - Using authenticated user from JWT
const user = await getCurrentUserWithRole();
const data = await prisma.assessment.findMany({
  where: { userId: user.id },
});
```

### 2. Always Verify Auth in API Routes

```typescript
// ❌ BAD - Relying solely on RLS
export async function GET(request: NextRequest) {
  const data = await prisma.assessment.findMany();
  return NextResponse.json(data);
}

// ✅ GOOD - Verify auth first, RLS as backup
export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.assessment.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json(data);
}
```

### 3. Use Service Role Carefully

```typescript
// ❌ BAD - Using service role for user queries
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS!
);

// User could see all data!
const data = await supabase.from("assessments").select("*");

// ✅ GOOD - Use authenticated client for user queries
const supabase = await createServerClient(); // Uses user's JWT
const data = await supabase.from("assessments").select("*");
```

### 4. Audit Admin Actions

```typescript
// Log admin actions for security audits
if (user.role === "SUPER_ADMIN") {
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE_USER_ROLE",
      resourceId: targetUserId,
      oldValue: oldRole,
      newValue: newRole,
      timestamp: new Date(),
    },
  });
}
```

## 📈 Monitoring

### Key Metrics to Track

1. **Permission Denied Errors**
   - Monitor logs for RLS policy violations
   - Indicates potential security issues or bugs

2. **Query Performance**
   - Track slow queries (>100ms)
   - Add indexes where needed

3. **Failed Login Attempts**
   - Monitor for brute force attacks
   - Implement rate limiting

4. **Data Access Patterns**
   - Track who accesses what data
   - Identify anomalies

### Example Monitoring Query

```sql
-- Count permission denied errors (requires logging extension)
SELECT
  date_trunc('hour', timestamp) as hour,
  COUNT(*) as error_count
FROM logs
WHERE message LIKE '%permission denied%'
GROUP BY hour
ORDER BY hour DESC
LIMIT 24;
```

## 🚨 Rollback Plan

If RLS causes issues in production:

### Option 1: Disable RLS Temporarily

```sql
-- Disable RLS on specific table (emergency only!)
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing issues
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
```

### Option 2: Create Permissive Policy

```sql
-- Temporarily allow all access (dev/testing only!)
CREATE POLICY "temp_allow_all"
  ON assessments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Remove after fixing proper policies
DROP POLICY "temp_allow_all" ON assessments;
```

### Option 3: Full Rollback

```sql
-- Disable RLS on all tables
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
```

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [RLS Security Model (this project)](./RLS_SECURITY_MODEL.md)

## ✅ Next Steps

After completing Phase 5:

1. ✅ Run the migration script
2. ✅ Test authentication flows
3. ✅ Verify data isolation
4. ✅ Test admin access
5. ✅ Monitor performance
6. ✅ Review logs for errors

**Then proceed to:**

- **Phase 6**: Comprehensive Testing
- **Phase 7**: Production Deployment

---

**Questions or Issues?**

- Check `docs/RLS_SECURITY_MODEL.md` for detailed documentation
- Review test results from `./scripts/test-rls.sh`
- Check Supabase logs for permission errors
