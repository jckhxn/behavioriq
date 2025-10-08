# Row Level Security (RLS) Security Model

## Overview

Row Level Security (RLS) is enabled on all database tables to ensure data isolation and access control at the database level. This provides defense-in-depth security, where even if application-level checks fail, the database will still enforce access restrictions.

## Security Principles

### 1. **User Data Isolation**

- Users can only access their own data (assessments, documents, recommendations)
- Each row is tied to a `userId` that must match the authenticated user

### 2. **Organization Boundaries**

- Admins can access all data within their organization
- Super admins have global access across all organizations
- Data cannot leak between organizations

### 3. **Role-Based Access Control (RBAC)**

```
SUPER_ADMIN > ADMIN > DISTRICT_ADMIN > USER/SUB_ACCOUNT
```

### 4. **Hierarchical Sub-Account Management**

- District admins can manage their sub-accounts
- Sub-accounts inherit access from their parent district admin
- Parent users can view sub-account assessments and data

## Helper Functions

### `auth.user_id()`

Returns the current user's ID from Supabase JWT token.

```sql
SELECT auth.user_id();
-- Returns: 'cuid_abc123...'
```

### `auth.user_role()`

Returns the current user's role.

```sql
SELECT auth.user_role();
-- Returns: 'USER' | 'ADMIN' | 'DISTRICT_ADMIN' | 'SUB_ACCOUNT' | 'SUPER_ADMIN'
```

### `auth.is_admin()`

Checks if the current user has admin privileges.

```sql
SELECT auth.is_admin();
-- Returns: true if role is ADMIN, SUPER_ADMIN, or DISTRICT_ADMIN
```

### `auth.is_super_admin()`

Checks if the current user is a super admin.

```sql
SELECT auth.is_super_admin();
-- Returns: true if role is SUPER_ADMIN
```

### `auth.user_org_id()`

Returns the current user's organization ID.

```sql
SELECT auth.user_org_id();
-- Returns: 'org_abc123...' or NULL
```

### `auth.manages_sub_account(user_id)`

Checks if the current user manages a specific sub-account.

```sql
SELECT auth.manages_sub_account('user_xyz789...');
-- Returns: true if current user is the district admin for this sub-account
```

## Access Patterns by Table

### 👤 Users Table

**Read Access:**

- ✅ Users can read their own profile
- ✅ Admins can read all users in their organization
- ✅ Super admins can read all users
- ✅ District admins can read their sub-accounts

**Write Access:**

- ✅ Users can update their own profile (name, email, preferences)
- ✅ Super admins can update any user
- ❌ Users cannot change their own role

### 📊 Assessments Table

**Read Access:**

- ✅ Users can read their own assessments
- ✅ District admins can read assessments from their sub-accounts
- ✅ Admins can read all assessments in their organization
- ✅ Super admins can read all assessments

**Write Access:**

- ✅ Users can create and update their own assessments
- ❌ Users cannot modify others' assessments

### 🤖 AI Reports Table

**Read Access:**

- ✅ Users can read AI reports for their own assessments
- ✅ Admins can read AI reports for org assessments
- ✅ Super admins can read all AI reports

**Write Access:**

- ✅ Users can generate AI reports for their assessments
- ✅ Report generators can update reports they created

### 📝 Assessment Templates Table

**Read Access:**

- ✅ **All authenticated users** can read active assessment templates
- ✅ This allows any user to take assessments

**Write Access:**

- ✅ Template creators can update their own templates
- ✅ Admins can create/update templates in their org
- ✅ Super admins can manage all templates

### 🎯 Domain Templates Table

**Read Access:**

- ✅ **All authenticated users** can read domain templates
- ✅ Required for assessment questions to be accessible

**Write Access:**

- ✅ Domain creators can update their domains
- ✅ Admins and super admins can manage all domains

### 🔗 Shareable Links Table

**Read Access:**

- ✅ **All users** can read active shareable links (public sharing)
- ✅ Link privacy is enforced at the application level
- ✅ Admins can see org shareable links

**Write Access:**

- ✅ Link creators can manage their own shareable links

### 💳 Payments Table

**Read Access:**

- ✅ Users can read their own payment history
- ✅ Admins can read org payment history
- ✅ Super admins can read all payments

**Write Access:**

- ✅ System (service role) can create payment records
- ❌ Users cannot modify payment records

### 🏢 Organizations Table

**Read Access:**

- ✅ Users can read their own organization details
- ✅ Super admins can read all organizations

**Write Access:**

- ✅ Admins can update their organization's branding/settings
- ✅ Super admins can manage all organizations

### 🎫 Licenses & Subscriptions

**Read Access:**

- ✅ Users can read their own licenses
- ✅ Users can read their org's subscription status
- ✅ Admins can read org licenses and subscriptions

**Write Access:**

- ✅ Admins can assign licenses to org users
- ✅ Admins can manage org subscriptions
- ✅ Super admins have full access

### 📄 Documents & Chunks

**Read Access:**

- ✅ Users can read their own documents
- ✅ Admins can read org documents (for knowledge base)

**Write Access:**

- ✅ Users can upload and manage their own documents

### 💬 Chat Sessions & Messages

**Read Access:**

- ✅ Users can read messages from their own chat sessions
- ✅ Users can read messages from their assessments

**Write Access:**

- ✅ Users can create messages in their sessions/assessments

### 📊 Scores & Recommendations

**Read Access:**

- ✅ Users can read scores for their own assessments
- ✅ Admins can read org scores

**Write Access:**

- ✅ System can create scores (auto-calculated)
- ✅ Users can create/update their own recommendations

### ❓ Question Sets, Questions, Termination Rules

**Read Access:**

- ✅ **All authenticated users** can read active question sets
- ✅ Required for taking assessments

**Write Access:**

- ✅ Admins can create/update assessment questions
- ✅ Super admins have full access

### 🔐 Login Tokens

**Read Access:**

- ✅ Users can read their own login tokens (magic links)

**Write Access:**

- ✅ System can create/invalidate login tokens

## Service Role Bypass

When using the **service role key** (server-side Prisma operations), RLS is **automatically bypassed**. This is necessary for:

✅ **Background Jobs:**

- Scoring calculations
- Email sending
- Report generation
- Usage metrics tracking

✅ **Payment Processing:**

- Stripe webhooks
- License activation
- Subscription management

✅ **Admin API Routes:**

- When admin auth is verified at application level
- Bulk operations
- Analytics queries

⚠️ **Important:** Always verify user authentication and authorization in your API routes even when using service role!

## Database Connection Strings

### User (Application) Connection

Uses **anon** or **authenticated** role:

```env
DATABASE_URL="postgresql://..."
```

- ✅ RLS policies are enforced
- ✅ JWT token required for auth functions
- ✅ Row-level filtering applied

### Service Role Connection

Uses **service_role** key (server-side only):

```env
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..." # with service role
```

- ⚠️ RLS is bypassed
- ⚠️ Full database access
- ⚠️ Must be kept secret (server-side only)

## Testing RLS Policies

### Test as a Regular User

```sql
-- Set JWT claim to simulate user
SET request.jwt.claims = '{"sub": "user_id_here"}';

-- Try to read data
SELECT * FROM assessments;
-- Should only return user's own assessments
```

### Test as an Admin

```sql
-- Set JWT with admin role
SET request.jwt.claims = '{"sub": "admin_id_here"}';

-- Verify admin can see org data
SELECT * FROM assessments;
-- Should return all assessments in admin's org
```

### Test Isolation

```sql
-- As User A
SET request.jwt.claims = '{"sub": "user_a_id"}';
SELECT * FROM assessments;

-- As User B
SET request.jwt.claims = '{"sub": "user_b_id"}';
SELECT * FROM assessments;

-- User B should NOT see User A's data
```

## Common Patterns

### User-Owned Resources

```sql
CREATE POLICY "Users can manage their own X"
  ON table_name FOR ALL
  USING ("userId" = auth.user_id());
```

### Organization-Wide Access

```sql
CREATE POLICY "Admins can read org X"
  ON table_name FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );
```

### Public Read, Private Write

```sql
CREATE POLICY "Anyone can read X"
  ON table_name FOR SELECT
  USING (true);

CREATE POLICY "Only owners can write X"
  ON table_name FOR INSERT
  WITH CHECK ("userId" = auth.user_id());
```

### Sub-Account Hierarchy

```sql
CREATE POLICY "District admins can manage sub-accounts"
  ON sub_accounts FOR ALL
  USING ("managedByUserId" = auth.user_id());
```

## Migration Checklist

- [x] Enable RLS on all tables
- [x] Create helper functions for auth checks
- [x] Implement user isolation policies
- [x] Implement organization boundaries
- [x] Implement admin access policies
- [x] Implement sub-account hierarchy
- [x] Test with different user roles
- [x] Document service role bypass
- [ ] Run migration on Supabase
- [ ] Test all API routes with RLS enabled
- [ ] Monitor query performance
- [ ] Update application code if needed

## Security Best Practices

1. **Always use prepared statements** - Prevents SQL injection
2. **Verify auth in API routes** - Don't rely solely on RLS
3. **Use service role sparingly** - Only for trusted server operations
4. **Audit admin actions** - Log changes to sensitive data
5. **Test RLS policies** - Verify data isolation works correctly
6. **Monitor failed queries** - Detect unauthorized access attempts
7. **Keep JWT secrets secure** - Rotate regularly
8. **Use HTTPS only** - Protect JWT tokens in transit

## Performance Considerations

- RLS policies are evaluated on every query
- Use indexes on `userId`, `organizationId`, and role columns
- Complex policies may require query optimization
- Consider materialized views for reporting queries
- Monitor slow queries and add indexes as needed

## Troubleshooting

### "Permission denied for table X"

- ✅ Check if RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'table_name';`
- ✅ Verify JWT token is set correctly
- ✅ Check if user has the correct role
- ✅ Use service role for server-side operations

### "No rows returned when data exists"

- ✅ Verify `auth.user_id()` returns the correct ID
- ✅ Check `userId` matches in the table
- ✅ Ensure organization relationships are correct
- ✅ Test with service role to verify data exists

### "Policy allows too much access"

- ✅ Review policy USING/WITH CHECK clauses
- ✅ Test with different user roles
- ✅ Use `EXPLAIN` to see policy evaluation
- ✅ Refine conditions to be more restrictive

## Next Steps

After running this migration:

1. **Test Authentication** - Verify login/logout works
2. **Test User Isolation** - User A cannot see User B's data
3. **Test Admin Access** - Admins can see org data
4. **Test Sub-Accounts** - District admins can manage sub-accounts
5. **Test Public Access** - Assessment templates are readable
6. **Monitor Performance** - Check for slow queries
7. **Review Logs** - Look for permission errors

---

**For more information:**

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
