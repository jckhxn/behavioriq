/*
  Warnings:

  - The values [FREE] on the enum `LicenseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LicenseType_new" AS ENUM ('TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');
ALTER TABLE "public"."licenses" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."licenses" ALTER COLUMN "type" TYPE "public"."LicenseType_new" USING ("type"::text::"public"."LicenseType_new");
ALTER TYPE "public"."LicenseType" RENAME TO "LicenseType_old";
ALTER TYPE "public"."LicenseType_new" RENAME TO "LicenseType";
DROP TYPE "public"."LicenseType_old";
ALTER TABLE "public"."licenses" ALTER COLUMN "type" SET DEFAULT 'TRIAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."user_licenses" ADD COLUMN     "assessmentsAllowed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "assessmentsUsed" INTEGER NOT NULL DEFAULT 0;
