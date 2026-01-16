-- CreateEnum for district roles (add new values if not exists)
DO $$ BEGIN
 CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'DISTRICT_ADMIN', 'TEACHER', 'COUNSELOR', 'PRINCIPAL', 'SUB_ACCOUNT', 'SUPER_ADMIN');
EXCEPTION
 WHEN duplicate_object THEN 
    -- If Role type exists, add missing values
    BEGIN
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COUNSELOR';
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PRINCIPAL';
    EXCEPTION
        WHEN others THEN null;
    END;
END $$;

-- District Management Tables

CREATE TABLE IF NOT EXISTS "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "organizationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ferpaComplianceDate" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "districts_code_key" ON "districts"("code");
CREATE INDEX IF NOT EXISTS "districts_organizationId_idx" ON "districts"("organizationId");

CREATE TABLE IF NOT EXISTS "schools" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "schools_districtId_code_key" ON "schools"("districtId", "code");
CREATE INDEX IF NOT EXISTS "schools_districtId_idx" ON "schools"("districtId");

CREATE TABLE IF NOT EXISTS "classrooms" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "classrooms_schoolId_idx" ON "classrooms"("schoolId");

CREATE TABLE IF NOT EXISTS "teachers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "employeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "teachers_userId_key" ON "teachers"("userId");
CREATE INDEX IF NOT EXISTS "teachers_userId_idx" ON "teachers"("userId");
CREATE INDEX IF NOT EXISTS "teachers_districtId_idx" ON "teachers"("districtId");

CREATE TABLE IF NOT EXISTS "teacher_classrooms" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teacher_classrooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "teacher_classrooms_teacherId_classroomId_key" ON "teacher_classrooms"("teacherId", "classroomId");
CREATE INDEX IF NOT EXISTS "teacher_classrooms_teacherId_idx" ON "teacher_classrooms"("teacherId");
CREATE INDEX IF NOT EXISTS "teacher_classrooms_classroomId_idx" ON "teacher_classrooms"("classroomId");

CREATE TABLE IF NOT EXISTS "students" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "schoolId" TEXT,
    "anonymousId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gradeLevel" TEXT,
    "birthDate" TIMESTAMP(3),
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "students_anonymousId_key" ON "students"("anonymousId");
CREATE INDEX IF NOT EXISTS "students_districtId_idx" ON "students"("districtId");
CREATE INDEX IF NOT EXISTS "students_schoolId_idx" ON "students"("schoolId");
CREATE INDEX IF NOT EXISTS "students_anonymousId_idx" ON "students"("anonymousId");

CREATE TABLE IF NOT EXISTS "student_classrooms" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_classrooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_classrooms_studentId_classroomId_key" ON "student_classrooms"("studentId", "classroomId");
CREATE INDEX IF NOT EXISTS "student_classrooms_studentId_idx" ON "student_classrooms"("studentId");
CREATE INDEX IF NOT EXISTS "student_classrooms_classroomId_idx" ON "student_classrooms"("classroomId");

CREATE TABLE IF NOT EXISTS "student_assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "isTrial" BOOLEAN NOT NULL DEFAULT true,
    "trialCompletedAt" TIMESTAMP(3),
    "fullCompletedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "shareLinkId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "flaggedDomains" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "student_assessments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_assessments_assessmentId_key" ON "student_assessments"("assessmentId");
CREATE INDEX IF NOT EXISTS "student_assessments_studentId_idx" ON "student_assessments"("studentId");
CREATE INDEX IF NOT EXISTS "student_assessments_assessmentId_idx" ON "student_assessments"("assessmentId");
CREATE INDEX IF NOT EXISTS "student_assessments_isTrial_idx" ON "student_assessments"("isTrial");

CREATE TABLE IF NOT EXISTS "student_recommendations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "schoolStrategies" JSONB NOT NULL,
    "classroomAccommodations" JSONB NOT NULL,
    "parentNextSteps" JSONB NOT NULL,
    "referralGuidance" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT,
    CONSTRAINT "student_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_recommendations_studentId_assessmentId_key" ON "student_recommendations"("studentId", "assessmentId");
CREATE INDEX IF NOT EXISTS "student_recommendations_studentId_idx" ON "student_recommendations"("studentId");
CREATE INDEX IF NOT EXISTS "student_recommendations_assessmentId_idx" ON "student_recommendations"("assessmentId");

CREATE TABLE IF NOT EXISTS "district_audit_logs" (
    "id" TEXT NOT NULL,
    "districtId" TEXT,
    "studentId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "district_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "district_audit_logs_districtId_idx" ON "district_audit_logs"("districtId");
CREATE INDEX IF NOT EXISTS "district_audit_logs_studentId_idx" ON "district_audit_logs"("studentId");
CREATE INDEX IF NOT EXISTS "district_audit_logs_userId_idx" ON "district_audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "district_audit_logs_action_idx" ON "district_audit_logs"("action");
CREATE INDEX IF NOT EXISTS "district_audit_logs_createdAt_idx" ON "district_audit_logs"("createdAt");

-- Foreign Keys

ALTER TABLE "districts" ADD CONSTRAINT "districts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "schools" ADD CONSTRAINT "schools_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_classrooms" ADD CONSTRAINT "teacher_classrooms_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_classrooms" ADD CONSTRAINT "teacher_classrooms_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "student_classrooms" ADD CONSTRAINT "student_classrooms_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_classrooms" ADD CONSTRAINT "student_classrooms_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "shareable_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "student_recommendations" ADD CONSTRAINT "student_recommendations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "district_audit_logs" ADD CONSTRAINT "district_audit_logs_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "district_audit_logs" ADD CONSTRAINT "district_audit_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Counselor tables

CREATE TABLE IF NOT EXISTS "counselors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "schoolId" TEXT,
    "employeeId" TEXT,
    "specializations" TEXT[],
    "maxCaseload" INTEGER NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "counselors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "counselors_userId_key" ON "counselors"("userId");
CREATE INDEX IF NOT EXISTS "counselors_districtId_idx" ON "counselors"("districtId");
CREATE INDEX IF NOT EXISTS "counselors_schoolId_idx" ON "counselors"("schoolId");

CREATE TABLE IF NOT EXISTS "counselor_caseloads" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT,
    "priority" TEXT DEFAULT 'NORMAL',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "counselor_caseloads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "counselor_caseloads_counselorId_studentId_key" ON "counselor_caseloads"("counselorId", "studentId");
CREATE INDEX IF NOT EXISTS "counselor_caseloads_counselorId_idx" ON "counselor_caseloads"("counselorId");
CREATE INDEX IF NOT EXISTS "counselor_caseloads_studentId_idx" ON "counselor_caseloads"("studentId");

-- Counselor foreign keys

ALTER TABLE "counselors" ADD CONSTRAINT "counselors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counselors" ADD CONSTRAINT "counselors_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counselors" ADD CONSTRAINT "counselors_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "counselor_caseloads" ADD CONSTRAINT "counselor_caseloads_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "counselors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "counselor_caseloads" ADD CONSTRAINT "counselor_caseloads_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add schoolId to teachers if it doesn't exist (for PRINCIPAL role)
DO $$ BEGIN
    ALTER TABLE "teachers" ADD COLUMN "schoolId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add foreign key for teacher schoolId
DO $$ BEGIN
    ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
