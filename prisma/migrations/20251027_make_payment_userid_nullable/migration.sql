-- Make userId nullable in payments table
-- Allows payments from anonymous trial users who haven't created an account

ALTER TABLE "payments" ALTER COLUMN "userId" DROP NOT NULL;
