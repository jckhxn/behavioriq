# Safe Migration Guide - Trial-to-Full Flow

## Problem
Prisma tried to force a full schema reset because of constraint conflicts. We've created a **safe manual migration** that preserves all existing data.

## Solution
Use the manual SQL migration file instead of `prisma migrate dev`.

---

## How to Apply the Migration

### Option 1: Using Prisma (Recommended)
```bash
# Apply the safe migration
npx prisma migrate deploy

# This will run the migration SQL safely without resetting data
```

### Option 2: Direct SQL (If Prisma Fails)
If Prisma still has issues, run the SQL directly:

```bash
# Using psql
psql "postgresql://user:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres" << 'EOF'
-- Paste the contents of prisma/migrations/20251026_add_trial_to_full_flow/migration.sql
EOF
```

Or in Supabase dashboard:
1. SQL Editor → New Query
2. Copy contents of `prisma/migrations/20251026_add_trial_to_full_flow/migration.sql`
3. Run

---

## What the Migration Does

### Safe Operations (No Data Loss)
✅ Creates `AssessmentMode` enum type (trial, full)
✅ Adds `mode` column with DEFAULT 'TRIAL'
✅ Adds `sessionId` column (nullable)
✅ Adds `paidAt` column (nullable)
✅ Adds `aiReportGenerated` column with DEFAULT false
✅ Creates indexes for performance

### Data Preservation
✅ Uses DO/EXCEPTION blocks to skip if columns already exist
✅ Updates existing rows:
   - Assessments with `userId IS NOT NULL` → `mode = 'FULL'`
   - Assessments with `userId IS NULL` → `mode = 'TRIAL'`
✅ No rows dropped, no data deleted

---

## Why This Works

### The Issue
- Prisma automatically generates migrations from schema changes
- When adding new columns and changing constraints, Prisma sometimes wants to DROP and RECREATE
- This requires resetting the database

### Our Solution
- Manual migration SQL file avoids Prisma's auto-generation
- Uses idempotent operations (IF NOT EXISTS, DO/EXCEPTION blocks)
- Can be applied multiple times safely
- Preserves all existing data and relationships

---

## Verification Steps

### After Migration, Verify in Database

```sql
-- Check columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Assessment'
  AND column_name IN ('mode', 'sessionId', 'paidAt', 'aiReportGenerated')
ORDER BY column_name;

-- Expected output:
-- mode | AssessmentMode | NO (has default)
-- sessionId | TEXT | YES (nullable)
-- paidAt | TIMESTAMP | YES (nullable)
-- aiReportGenerated | BOOLEAN | NO (has default = false)

-- Check indexes exist
SELECT indexname
FROM pg_indexes
WHERE tablename = 'Assessment'
  AND indexname LIKE 'Assessment_%idx';

-- Expected:
-- Assessment_mode_idx
-- Assessment_sessionId_idx

-- Check data is preserved
SELECT COUNT(*) FROM "Assessment";
-- Should match before migration count

-- Check mode distribution
SELECT mode, COUNT(*) FROM "Assessment" GROUP BY mode;

-- Expected:
-- FULL | (authenticated users count)
-- TRIAL | (anonymous users count)
-- NULL | (0 - should be none if migration ran)

-- Check a specific assessment
SELECT id, userId, mode, sessionId, paidAt, aiReportGenerated
FROM "Assessment"
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

## If You Get an Error

### Error: "Enum type 'AssessmentMode' already exists"
✅ **This is OK** - The migration handles this with `EXCEPTION WHEN duplicate_object`
✅ Prisma and the migration can both run without conflicts

### Error: "Column 'mode' already exists"
✅ **This is OK** - The migration handles this with `EXCEPTION WHEN duplicate_column`
✅ Idempotent operation, safe to retry

### Error: "relation 'Assessment' does not exist"
❌ **This is bad** - Check table name in your database
- Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
- If table is `assessments` (lowercase), update migration SQL

---

## Migration File Location
```
prisma/migrations/20251026_add_trial_to_full_flow/migration.sql
```

---

## Next Steps

1. **Apply migration**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify columns exist**:
   ```bash
   npx prisma studio
   # Or run SQL verification queries above
   ```

3. **Update Prisma client** (optional, auto-generated):
   ```bash
   npx prisma generate
   ```

4. **Deploy to production** (same process)

5. **Monitor logs** for any issues

---

## Rollback Plan (If Needed)

If the migration causes issues, you can:

### Option 1: Drop New Columns (Quick Revert)
```sql
ALTER TABLE "Assessment" DROP COLUMN "mode";
ALTER TABLE "Assessment" DROP COLUMN "sessionId";
ALTER TABLE "Assessment" DROP COLUMN "paidAt";
ALTER TABLE "Assessment" DROP COLUMN "aiReportGenerated";

DROP INDEX IF EXISTS "Assessment_mode_idx";
DROP INDEX IF EXISTS "Assessment_sessionId_idx";

DROP TYPE IF EXISTS "AssessmentMode";
```

### Option 2: Revert Prisma Schema
```bash
# Revert schema to before changes
git checkout HEAD~1 prisma/schema.prisma

# Remove the migration
rm -rf prisma/migrations/20251026_add_trial_to_full_flow

# Rollback in database
npx prisma migrate resolve --rolled-back 20251026_add_trial_to_full_flow
```

---

## Key Points

✅ **Safe**: Uses idempotent operations
✅ **No data loss**: All existing rows preserved
✅ **No reset required**: Works with production data
✅ **Backwards compatible**: Schema changes match implementation
✅ **Handles edge cases**: DO/EXCEPTION for safety

---

## Support

If you encounter issues:
1. Check error message against "If You Get an Error" section
2. Run verification SQL queries to debug
3. Review migration SQL for table/column names
4. Check Supabase logs for constraint issues

The migration is designed to be **fail-safe** and **idempotent**.
Run it as many times as needed - it won't cause issues.
