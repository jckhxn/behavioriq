# District MVP Implementation Summary

## Overview

This document summarizes the district-focused behavioral assessment SaaS MVP implementation for K-12 schools.

## Core Data Models

### New/Updated Models in `prisma/schema.prisma`

1. **Role Enum** - Added new roles:
   - `COUNSELOR` - School counselors with caseload-based access
   - `PRINCIPAL` - School principals with school-wide access

2. **Counselor Model** - New table for counselor profiles:

   ```prisma
   model Counselor {
     id              String   @id @default(cuid())
     userId          String   @unique
     districtId      String
     schoolId        String?
     employeeId      String?
     specializations String[]
     maxCaseload     Int      @default(50)
     isActive        Boolean  @default(true)
     // Relations...
   }
   ```

3. **CounselorCaseload Model** - Links counselors to their assigned students:

   ```prisma
   model CounselorCaseload {
     id          String   @id @default(cuid())
     counselorId String
     studentId   String
     reason      String?
     priority    String?  @default("NORMAL")
     assignedAt  DateTime @default(now())
     notes       String?
   }
   ```

4. **Teacher Model** - Added `schoolId` field for PRINCIPAL role support

## Permission Hierarchy

```
SUPER_ADMIN (100) > ADMIN (90) > DISTRICT_ADMIN (80) > PRINCIPAL (70) > COUNSELOR (60) > TEACHER (50)
```

### Access Rules

| Role                  | Access Scope                 |
| --------------------- | ---------------------------- |
| **TEACHER**           | Own classroom students only  |
| **COUNSELOR**         | Assigned caseload students   |
| **PRINCIPAL**         | All students in their school |
| **DISTRICT_ADMIN**    | All students in district     |
| **ADMIN/SUPER_ADMIN** | Global access                |

## Feature Flags

### Available Flags (seeded via `prisma/seed.ts`)

| Flag Key                | Scope  | Description                       |
| ----------------------- | ------ | --------------------------------- |
| `district_routes`       | global | Enable district management routes |
| `teacher_dashboard`     | global | Enable teacher dashboard          |
| `ai_recommendations`    | global | Enable AI-powered recommendations |
| `pdf_export`            | global | Enable PDF report generation      |
| `csv_export`            | global | Enable CSV data export            |
| `counselor_caseload`    | role   | Counselor-specific features       |
| `principal_school_view` | role   | Principal school-wide view        |
| `audit_logging`         | global | FERPA-compliant audit logging     |
| `anonymization`         | global | Use anonymous student IDs         |

### Feature Flag Management

- **API**: `/api/admin/feature-flags` (SUPER_ADMIN only)
- **UI**: Feature Flags tab in Super Admin Platform Settings

## API Endpoints

### Teacher APIs

| Endpoint                          | Method | Description                         |
| --------------------------------- | ------ | ----------------------------------- |
| `/api/teacher/students`           | GET    | List teacher's students with status |
| `/api/teacher/assessments/assign` | POST   | Assign assessment to student        |

### District APIs

| Endpoint                             | Method | Description                         |
| ------------------------------------ | ------ | ----------------------------------- |
| `/api/district/dashboard`            | GET    | Aggregate metrics (by school/grade) |
| `/api/district/export`               | GET    | CSV/PDF export                      |
| `/api/district/students/[id]/report` | GET    | Generate student PDF report         |

### Admin APIs

| Endpoint                        | Method           | Description               |
| ------------------------------- | ---------------- | ------------------------- |
| `/api/admin/feature-flags`      | GET/POST         | List/create feature flags |
| `/api/admin/feature-flags/[id]` | GET/PATCH/DELETE | Manage individual flag    |

## Route Protection

### Layout-based Protection

- **`/teacher/*`** - Requires: TEACHER, COUNSELOR, PRINCIPAL, DISTRICT_ADMIN, ADMIN, SUPER_ADMIN
- **`/district/*`** - Requires: DISTRICT_ADMIN, ADMIN, SUPER_ADMIN
- **`/(admin)/*`** - Page-level checks for ADMIN/SUPER_ADMIN

### Access Control Functions

Located in `lib/district/access-control.ts`:

- `getDistrictUser()` - Get current user with district context
- `requireDistrictAdmin()` - Require district admin or higher
- `requireTeacher()` - Require teacher or higher
- `canAccessStudent(userId, studentId)` - Check if user can access student
- `withDistrictAuth(handler, requiredRole)` - Middleware wrapper for API routes

## UI Components

### Teacher Dashboard (`components/district/TeacherDashboardView.tsx`)

- Student list with assessment status badges
- Conditional action buttons (Assign/View Report)
- Shows student names when consent given, otherwise anonymousId

### District Metrics (`components/district/DistrictMetricsCards.tsx`)

- Summary cards (total, screened, flagged)
- Domain breakdown
- School-wise breakdown
- Grade-level breakdown

### Feature Flags Manager (`components/admin/FeatureFlagsManager.tsx`)

- CRUD operations for feature flags
- Role-based scope configuration
- Toggle enabled status

## Database Migrations

The `district_mvp` migration adds:

1. District management tables (districts, schools, classrooms)
2. Teacher tables (teachers, teacher_classrooms)
3. Student tables (students, student_classrooms, student_assessments)
4. Counselor tables (counselors, counselor_caseloads)
5. Audit logging (district_audit_logs)
6. COUNSELOR and PRINCIPAL role values

## Next Steps to Deploy

1. **Run migrations**:

   ```bash
   npx prisma migrate deploy
   ```

2. **Seed feature flags**:

   ```bash
   npx prisma db seed
   ```

3. **Create initial district admin**:
   - Manually create a user with `role: DISTRICT_ADMIN`
   - Create associated Teacher profile with districtId

## Non-Diagnostic Language

All student-facing outputs use educational terminology:

- "Screening" instead of "Assessment"
- "Behavioral patterns" instead of "Symptoms"
- "May benefit from support" instead of "At risk"
- "Classroom strategies" instead of "Treatment recommendations"

## FERPA Compliance

- Audit logging for all student data access
- Consent tracking before revealing student identities
- Anonymous identifiers by default
- Role-based access control
- Feature flags for granular feature control

## Files Modified/Created

### Created

- `app/api/admin/feature-flags/route.ts`
- `app/api/admin/feature-flags/[id]/route.ts`
- `app/api/district/students/[id]/report/route.ts`
- `components/admin/FeatureFlagsManager.tsx`
- `prisma/migrations/district_mvp/migration.sql`

### Modified

- `prisma/schema.prisma` (roles, Counselor, Teacher.schoolId)
- `prisma/seed.ts` (feature flags seeding)
- `lib/district/access-control.ts` (new roles, canAccessStudent)
- `lib/district/feature-flags.ts` (new flag constants)
- `components/admin/SuperAdminPlatformSettings.tsx` (Feature Flags tab)
- `app/teacher/layout.tsx` (role protection)
- `app/district/layout.tsx` (role protection)
- `app/(district)/page.tsx`, `app/district/page.tsx` (role checks)
- Various page/API files for COUNSELOR/PRINCIPAL support
