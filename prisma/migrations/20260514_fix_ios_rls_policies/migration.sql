-- ============================================================================
-- Fix RLS policies for iOS app access
-- Drops ALL existing policies on affected tables then recreates them cleanly.
-- ============================================================================

-- Drop every policy on these tables so we start fresh
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE tablename IN (
      'platform_settings',
      'assessment_templates',
      'domain_templates',
      'assessment_template_domains',
      'assessments',
      'scores'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- platform_settings: public read (non-sensitive app config)
CREATE POLICY "public_read"
  ON platform_settings FOR SELECT USING (true);

CREATE POLICY "super_admin_all"
  ON platform_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN'
  ));

-- assessment_templates: public read for active templates
CREATE POLICY "public_read_active"
  ON assessment_templates FOR SELECT USING ("isActive" = true);

CREATE POLICY "creator_manage"
  ON assessment_templates FOR ALL
  USING ("createdById" = auth.uid()::text);

CREATE POLICY "admin_manage"
  ON assessment_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
  ));

-- domain_templates: public read
CREATE POLICY "public_read"
  ON domain_templates FOR SELECT USING (true);

CREATE POLICY "admin_manage"
  ON domain_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
  ));

-- assessment_template_domains: public read
CREATE POLICY "public_read"
  ON assessment_template_domains FOR SELECT USING (true);

CREATE POLICY "admin_manage"
  ON assessment_template_domains FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
  ));

-- assessments: users own their records
CREATE POLICY "owner_all"
  ON assessments FOR ALL
  USING ("userId" = auth.uid()::text);

CREATE POLICY "admin_read"
  ON assessments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN')
  ));

-- scores: tied to owned assessments
CREATE POLICY "owner_read"
  ON scores FOR SELECT
  USING ("assessmentId" IN (
    SELECT id FROM assessments WHERE "userId" = auth.uid()::text
  ));

CREATE POLICY "insert_allowed"
  ON scores FOR INSERT WITH CHECK (true);
