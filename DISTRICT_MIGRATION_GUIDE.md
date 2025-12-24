# District MVP Database Migration Guide

## Pre-Migration Checklist

Before running the migration:

1. **Backup your database:**

   **For Supabase (Recommended):**
   - Use Supabase Dashboard → Database → Backups → Create Backup
   - Or use direct connection (not pooler) with matching pg_dump version:

   ```bash
   # Get direct connection from Supabase Dashboard (Database → Connection String → Direct)
   # Use port 5432, not 6543 (pooler)
   # Remove ?pgbouncer=true parameter

   pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backups/backup_pre_district_mvp_$(date +%Y%m%d).sql
   ```

   **For local/self-hosted PostgreSQL:**

   ```bash
   pg_dump $DATABASE_URL > backups/backup_pre_district_mvp_$(date +%Y%m%d).sql
   ```

   **Note:** If you see version mismatch warnings (e.g., server 17.x, pg_dump 15.x), upgrade pg_dump:

   ```bash
   brew upgrade postgresql@17  # macOS
   ```

2. **Verify Prisma is up to date:**

   ```bash
   npm install @prisma/client@latest prisma@latest
   ```

3. **Review schema changes:**
   - New tables: `districts`, `schools`, `classrooms`, `teachers`, `students`, etc.
   - Updated enums: `Role` (added `TEACHER`)
   - New relations: `User.teacherProfile`, `Assessment.studentAssessment`, etc.

---

## Migration Steps

### Option 1: Prisma Migrate (Recommended)

```bash
# 1. Generate Prisma client with new schema
npx prisma generate

# 2. Create and apply migration
npx prisma migrate dev --name district_mvp

# 3. Verify migration was successful
npx prisma migrate status
```

### Option 2: Manual SQL Execution

```bash
# Run the migration SQL directly
psql $DATABASE_URL < prisma/migrations/district_mvp/migration.sql

# Then generate Prisma client
npx prisma generate
```

---

## Post-Migration Verification

### 1. Verify Tables Created

```sql
-- Connect to database
psql $DATABASE_URL

-- Check for new tables
\dt districts
\dt schools
\dt classrooms
\dt teachers
\dt students
\dt student_assessments
\dt student_recommendations
\dt district_audit_logs

-- Should see all 8 tables
```

### 2. Verify Enums Updated

```sql
-- Check Role enum includes TEACHER
SELECT enum_range(NULL::\"Role\");

-- Should output: {USER,ADMIN,DISTRICT_ADMIN,TEACHER,SUB_ACCOUNT,SUPER_ADMIN}
```

### 3. Verify Indexes Created

```sql
-- Check indexes on students table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'students';

-- Should see indexes on: districtId, schoolId, anonymousId
```

### 4. Verify Foreign Keys

```sql
-- Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'student%';

-- Should see FK relationships for studentId, assessmentId, etc.
```

---

## Populate Sample Data

After migration, run the setup script:

```bash
npx tsx scripts/setup-district.ts
```

This creates:

- 1 Organization: "Demo School District"
- 1 District: "Demo Unified School District" (code: DEMO-001)
- 3 Schools: Lincoln Elementary, Washington Middle, Jefferson High
- 15+ Classrooms (organized by grade)
- 1 District Admin user: `district.admin@demodistrict.edu`
- 1 Teacher user: `teacher@demodistrict.edu`
- 25 Sample students in Grade 5

---

## Verify Setup

### 1. Check Record Counts

```sql
SELECT
  (SELECT COUNT(*) FROM districts) as districts,
  (SELECT COUNT(*) FROM schools) as schools,
  (SELECT COUNT(*) FROM classrooms) as classrooms,
  (SELECT COUNT(*) FROM teachers) as teachers,
  (SELECT COUNT(*) FROM students) as students;

-- Should show: 1 district, 3 schools, 15+ classrooms, 1 teacher, 25 students
```

### 2. Verify Anonymous IDs

```sql
SELECT anonymousId, gradeLevel, isAnonymous, consentGiven
FROM students
LIMIT 5;

-- All should have isAnonymous=true, consentGiven=false, anonymousId like 'STU-XXXXXX'
```

### 3. Verify Teacher Assignment

```sql
SELECT
  u.email,
  t.id as teacher_id,
  c.name as classroom_name
FROM teachers t
JOIN users u ON u.id = t."userId"
JOIN teacher_classrooms tc ON tc."teacherId" = t.id
JOIN classrooms c ON c.id = tc."classroomId";

-- Should show teacher assigned to at least one classroom
```

---

## Rollback (If Needed)

If migration fails or you need to rollback:

### Option 1: Restore from Backup

```bash
# Drop all district tables
psql $DATABASE_URL << EOF
DROP TABLE IF EXISTS district_audit_logs CASCADE;
DROP TABLE IF EXISTS student_recommendations CASCADE;
DROP TABLE IF EXISTS student_assessments CASCADE;
DROP TABLE IF EXISTS student_classrooms CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teacher_classrooms CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
EOF

# Restore from backup
psql $DATABASE_URL < backup_pre_district_mvp_YYYYMMDD.sql
```

### Option 2: Prisma Migrate Rollback

```bash
# Reset to previous migration
npx prisma migrate reset

# Re-apply migrations up to (but not including) district_mvp
npx prisma migrate deploy --to <previous_migration_name>
```

---

## Common Issues & Solutions

### Issue: "pg_dump version mismatch"

**Error:** `server version: 17.6; pg_dump version: 15.14`

**Solution:** Upgrade your local PostgreSQL client:

```bash
# macOS
brew upgrade postgresql@17
brew link postgresql@17 --force

# Verify version
pg_dump --version  # Should show 17.x
```

Or use Supabase's built-in backup feature in the dashboard.

### Issue: "invalid URI query parameter: pgbouncer"

**Solution:** Use the **direct connection** (not pooler) for backups:

- Remove `?pgbouncer=true` from connection string
- Use port **5432** instead of **6543**
- Remove `.pooler` from hostname

### Issue: "Role enum already exists"

**Solution:** The migration SQL includes `DO $$ BEGIN ... EXCEPTION ...` to handle this. If you still see errors, manually drop and recreate:

```sql
DROP TYPE IF EXISTS "Role" CASCADE;
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'DISTRICT_ADMIN', 'TEACHER', 'SUB_ACCOUNT', 'SUPER_ADMIN');
```

### Issue: "Foreign key constraint violation"

**Solution:** Ensure migrations are run in order. Check:

```bash
npx prisma migrate status
```

If out of order, reset and re-apply:

```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue: "Anonymous ID generation fails"

**Solution:** Check that `randomBytes` is available:

```typescript
import { randomBytes } from "crypto";

async function generateAnonymousId() {
  const prefix = "STU";
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}
```

### Issue: "Teacher can see all students"

**Solution:** Verify `teacherId` is being passed to `DistrictService.getStudentList()`:

```typescript
const teacherId = user.role === "TEACHER" ? user.teacherId : undefined;
```

Check database that `teacher_classrooms` and `student_classrooms` have correct relationships.

---

## Performance Tuning

After migration, if queries are slow:

### 1. Add Missing Indexes

```sql
-- If metrics queries are slow
CREATE INDEX IF NOT EXISTS idx_student_assessments_completed
ON student_assessments(studentId)
WHERE "fullCompletedAt" IS NOT NULL;

-- If student list queries are slow
CREATE INDEX IF NOT EXISTS idx_students_active_with_grade
ON students(districtId, isActive, gradeLevel);
```

### 2. Analyze Query Plans

```sql
EXPLAIN ANALYZE
SELECT * FROM students
WHERE districtId = 'xxx'
  AND isActive = true;
```

Look for:

- Seq Scan → Add index
- High execution time → Optimize query

### 3. Update Statistics

```sql
ANALYZE students;
ANALYZE student_assessments;
ANALYZE classrooms;
```

---

## Testing Queries

Run these to verify data integrity:

### 1. Students Without Classrooms

```sql
SELECT s.id, s.anonymousId
FROM students s
LEFT JOIN student_classrooms sc ON sc."studentId" = s.id
WHERE sc.id IS NULL;

-- Should be empty if all students are enrolled
```

### 2. Teachers Without Classrooms

```sql
SELECT u.email, t.id
FROM teachers t
JOIN users u ON u.id = t."userId"
LEFT JOIN teacher_classrooms tc ON tc."teacherId" = t.id
WHERE tc.id IS NULL;

-- Should be empty if all teachers are assigned
```

### 3. Orphaned Assessments

```sql
SELECT a.id, a.status
FROM assessments a
LEFT JOIN student_assessments sa ON sa."assessmentId" = a.id
WHERE sa.id IS NULL
  AND a.status = 'COMPLETED';

-- Should be empty if all completed assessments are linked to students
```

---

## Next Steps

After successful migration:

1. ✅ Run setup script: `npx tsx scripts/setup-district.ts`
2. ✅ Start dev server: `npm run dev`
3. ✅ Test login as district admin
4. ✅ Test login as teacher
5. ✅ Verify dashboard loads
6. ✅ Create sample assessments
7. ✅ Test AI recommendation generation
8. ✅ Verify audit logs are created

---

**Migration Support:** If you encounter issues, check:

1. Prisma migration logs: `npx prisma migrate status`
2. PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
3. Application logs: Check console for Prisma errors

**Last Updated:** December 20, 2025
