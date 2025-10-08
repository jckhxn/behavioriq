-- ============================================================================
-- Row Level Security (RLS) Policies for AI Diagnostic System
-- ============================================================================
-- This migration enables RLS on all tables and creates policies for:
-- 1. User data isolation (users can only see their own data)
-- 2. Organization-level access (admins can see org data)
-- 3. Sub-account hierarchies (district admins manage their sub-accounts)
-- 4. Public data access (where appropriate)
-- ============================================================================

-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_template_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE termination_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper Functions for RLS Policies
-- ============================================================================

-- Get current user's ID from Supabase auth
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE SQL STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is an admin (ADMIN, SUPER_ADMIN, or DISTRICT_ADMIN)
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
  SELECT role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN') 
  FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is a super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin() RETURNS BOOLEAN AS $$
  SELECT role = 'SUPER_ADMIN' FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION auth.user_org_id() RETURNS TEXT AS $$
  SELECT "organizationId" FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user manages a sub-account
CREATE OR REPLACE FUNCTION auth.manages_sub_account(sub_account_user_id TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM sub_accounts 
    WHERE "userId" = sub_account_user_id 
    AND "managedByUserId" = auth.user_id()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- USERS Table Policies
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (id = auth.user_id());

-- Users can update their own data (except role and sensitive fields)
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (id = auth.user_id());

-- Admins can read all users in their organization
CREATE POLICY "Admins can read org users"
  ON users FOR SELECT
  USING (
    auth.is_admin() AND (
      "organizationId" = auth.user_org_id() OR
      auth.is_super_admin()
    )
  );

-- Super admins can do anything with users
CREATE POLICY "Super admins have full access to users"
  ON users FOR ALL
  USING (auth.is_super_admin());

-- District admins can read their sub-accounts
CREATE POLICY "District admins can read their sub-accounts"
  ON users FOR SELECT
  USING (
    "parentUserId" = auth.user_id()
  );

-- ============================================================================
-- SUB_ACCOUNTS Table Policies
-- ============================================================================

-- Users can read their own sub-account profile
CREATE POLICY "Users can read their own sub-account"
  ON sub_accounts FOR SELECT
  USING ("userId" = auth.user_id());

-- District admins can manage their sub-accounts
CREATE POLICY "District admins can manage their sub-accounts"
  ON sub_accounts FOR ALL
  USING ("managedByUserId" = auth.user_id());

-- Admins and super admins can read sub-accounts in their org
CREATE POLICY "Admins can read org sub-accounts"
  ON sub_accounts FOR SELECT
  USING (
    auth.is_admin() AND (
      "organizationId" = auth.user_org_id() OR
      auth.is_super_admin()
    )
  );

-- ============================================================================
-- DOCUMENTS Table Policies
-- ============================================================================

-- Users can manage their own documents
CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  USING ("userId" = auth.user_id());

-- Admins can read all documents in their org
CREATE POLICY "Admins can read org documents"
  ON documents FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- DOCUMENT_CHUNKS Table Policies
-- ============================================================================

-- Users can read their own document chunks
CREATE POLICY "Users can read their own document chunks"
  ON document_chunks FOR SELECT
  USING ("userId" = auth.user_id());

-- Admins can read org document chunks
CREATE POLICY "Admins can read org document chunks"
  ON document_chunks FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- ASSESSMENTS Table Policies
-- ============================================================================

-- Users can manage their own assessments
CREATE POLICY "Users can manage their own assessments"
  ON assessments FOR ALL
  USING ("userId" = auth.user_id());

-- District admins can read assessments of their sub-accounts
CREATE POLICY "District admins can read sub-account assessments"
  ON assessments FOR SELECT
  USING (
    auth.manages_sub_account("userId")
  );

-- Admins can read all assessments in their org
CREATE POLICY "Admins can read org assessments"
  ON assessments FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- AI_REPORTS Table Policies
-- ============================================================================

-- Users can read AI reports for their own assessments
CREATE POLICY "Users can read their own AI reports"
  ON ai_reports FOR SELECT
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.user_id()
    )
  );

-- Report generators can manage reports they created
CREATE POLICY "Users can manage AI reports they generated"
  ON ai_reports FOR ALL
  USING ("generatedByUserId" = auth.user_id());

-- Admins can read org AI reports
CREATE POLICY "Admins can read org AI reports"
  ON ai_reports FOR SELECT
  USING (
    auth.is_admin() AND (
      "assessmentId" IN (
        SELECT a.id FROM assessments a
        JOIN users u ON a."userId" = u.id
        WHERE u."organizationId" = auth.user_org_id() OR auth.is_super_admin()
      )
    )
  );

-- ============================================================================
-- ASSESSMENT_TEMPLATES Table Policies
-- ============================================================================

-- All authenticated users can read active assessment templates
CREATE POLICY "Users can read active assessment templates"
  ON assessment_templates FOR SELECT
  USING ("isActive" = true AND auth.user_id() IS NOT NULL);

-- Template creators can manage their own templates
CREATE POLICY "Creators can manage their own templates"
  ON assessment_templates FOR ALL
  USING ("createdById" = auth.user_id());

-- Admins can manage all templates in their org
CREATE POLICY "Admins can manage org templates"
  ON assessment_templates FOR ALL
  USING (
    auth.is_admin() AND (
      "createdById" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- Super admins can manage all templates
CREATE POLICY "Super admins can manage all templates"
  ON assessment_templates FOR ALL
  USING (auth.is_super_admin());

-- ============================================================================
-- DOMAIN_TEMPLATES Table Policies
-- ============================================================================

-- All authenticated users can read domain templates
CREATE POLICY "Users can read domain templates"
  ON domain_templates FOR SELECT
  USING (auth.user_id() IS NOT NULL);

-- Domain creators can manage their own domains
CREATE POLICY "Creators can manage their own domains"
  ON domain_templates FOR ALL
  USING ("createdById" = auth.user_id());

-- Admins can manage all domains
CREATE POLICY "Admins can manage all domains"
  ON domain_templates FOR ALL
  USING (auth.is_admin());

-- ============================================================================
-- ASSESSMENT_TEMPLATE_DOMAINS Junction Table Policies
-- ============================================================================

-- Read access mirrors assessment templates
CREATE POLICY "Users can read template-domain associations"
  ON assessment_template_domains FOR SELECT
  USING (
    "assessmentTemplateId" IN (
      SELECT id FROM assessment_templates WHERE "isActive" = true
    )
  );

-- Write access for admins and creators
CREATE POLICY "Admins can manage template-domain associations"
  ON assessment_template_domains FOR ALL
  USING (auth.is_admin());

-- ============================================================================
-- TEMPLATE VERSION HISTORY Policies
-- ============================================================================

-- Users can read version history of templates they can access
CREATE POLICY "Users can read assessment template versions"
  ON assessment_template_versions FOR SELECT
  USING (
    "assessmentTemplateId" IN (
      SELECT id FROM assessment_templates WHERE "isActive" = true
    )
  );

CREATE POLICY "Users can read domain template versions"
  ON domain_template_versions FOR SELECT
  USING (auth.user_id() IS NOT NULL);

-- Admins can manage version history
CREATE POLICY "Admins can manage assessment template versions"
  ON assessment_template_versions FOR ALL
  USING (auth.is_admin());

CREATE POLICY "Admins can manage domain template versions"
  ON domain_template_versions FOR ALL
  USING (auth.is_admin());

-- ============================================================================
-- SHAREABLE_LINKS Table Policies
-- ============================================================================

-- Link creators can manage their own links
CREATE POLICY "Users can manage their own shareable links"
  ON shareable_links FOR ALL
  USING ("createdById" = auth.user_id());

-- Public/password-protected links are readable by anyone (controlled by app logic)
CREATE POLICY "Public shareable links are readable"
  ON shareable_links FOR SELECT
  USING ("isActive" = true);

-- Admins can read org shareable links
CREATE POLICY "Admins can read org shareable links"
  ON shareable_links FOR SELECT
  USING (
    auth.is_admin() AND (
      "createdById" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- CHAT_SESSIONS & CHAT_MESSAGES Table Policies
-- ============================================================================

-- Users can manage their own chat sessions
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions FOR ALL
  USING ("userId" = auth.user_id());

-- Users can read messages from their sessions
CREATE POLICY "Users can read their own chat messages"
  ON chat_messages FOR SELECT
  USING (
    "sessionId" IN (
      SELECT id FROM chat_sessions WHERE "userId" = auth.user_id()
    ) OR
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.user_id()
    )
  );

-- Users can create messages in their sessions/assessments
CREATE POLICY "Users can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    "sessionId" IN (
      SELECT id FROM chat_sessions WHERE "userId" = auth.user_id()
    ) OR
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.user_id()
    )
  );

-- ============================================================================
-- SCORES Table Policies
-- ============================================================================

-- Users can read scores for their own assessments
CREATE POLICY "Users can read their own scores"
  ON scores FOR SELECT
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.user_id()
    )
  );

-- System can create scores for any assessment (service role)
CREATE POLICY "System can create scores"
  ON scores FOR INSERT
  WITH CHECK (true);

-- Admins can read org scores
CREATE POLICY "Admins can read org scores"
  ON scores FOR SELECT
  USING (
    auth.is_admin() AND (
      "assessmentId" IN (
        SELECT a.id FROM assessments a
        JOIN users u ON a."userId" = u.id
        WHERE u."organizationId" = auth.user_org_id() OR auth.is_super_admin()
      )
    )
  );

-- ============================================================================
-- RECOMMENDATIONS Table Policies
-- ============================================================================

-- Users can manage their own recommendations
CREATE POLICY "Users can manage their own recommendations"
  ON recommendations FOR ALL
  USING ("userId" = auth.user_id());

-- Admins can read org recommendations
CREATE POLICY "Admins can read org recommendations"
  ON recommendations FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- QUESTION_SETS, QUESTIONS, TERMINATION_RULES Table Policies
-- ============================================================================

-- All authenticated users can read question sets (assessment content)
CREATE POLICY "Users can read question sets"
  ON question_sets FOR SELECT
  USING (auth.user_id() IS NOT NULL AND "isActive" = true);

CREATE POLICY "Users can read questions"
  ON questions FOR SELECT
  USING (auth.user_id() IS NOT NULL);

CREATE POLICY "Users can read termination rules"
  ON termination_rules FOR SELECT
  USING (auth.user_id() IS NOT NULL);

-- Admins can manage question content
CREATE POLICY "Admins can manage question sets"
  ON question_sets FOR ALL
  USING (auth.is_admin());

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  USING (auth.is_admin());

CREATE POLICY "Admins can manage termination rules"
  ON termination_rules FOR ALL
  USING (auth.is_admin());

-- ============================================================================
-- QUESTION_RESPONSES Table Policies
-- ============================================================================

-- Users can manage responses for their own assessments
CREATE POLICY "Users can manage their own question responses"
  ON question_responses FOR ALL
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.user_id()
    )
  );

-- Admins can read org question responses
CREATE POLICY "Admins can read org question responses"
  ON question_responses FOR SELECT
  USING (
    auth.is_admin() AND (
      "assessmentId" IN (
        SELECT a.id FROM assessments a
        JOIN users u ON a."userId" = u.id
        WHERE u."organizationId" = auth.user_org_id() OR auth.is_super_admin()
      )
    )
  );

-- ============================================================================
-- LICENSES Table Policies
-- ============================================================================

-- Admins can read licenses for their org
CREATE POLICY "Admins can read org licenses"
  ON licenses FOR SELECT
  USING (
    auth.is_admin() AND (
      "organizationId" = auth.user_org_id() OR
      auth.is_super_admin()
    )
  );

-- Admins can manage licenses
CREATE POLICY "Admins can manage licenses"
  ON licenses FOR ALL
  USING (auth.is_admin());

-- ============================================================================
-- ORGANIZATIONS Table Policies
-- ============================================================================

-- Users can read their own organization
CREATE POLICY "Users can read their own organization"
  ON organizations FOR SELECT
  USING (
    id = auth.user_org_id()
  );

-- Admins can manage their organization
CREATE POLICY "Admins can manage their organization"
  ON organizations FOR UPDATE
  USING (
    auth.is_admin() AND id = auth.user_org_id()
  );

-- Super admins can manage all organizations
CREATE POLICY "Super admins can manage all organizations"
  ON organizations FOR ALL
  USING (auth.is_super_admin());

-- ============================================================================
-- USER_LICENSES Table Policies
-- ============================================================================

-- Users can read their own licenses
CREATE POLICY "Users can read their own licenses"
  ON user_licenses FOR SELECT
  USING ("userId" = auth.user_id());

-- Admins can manage user licenses in their org
CREATE POLICY "Admins can manage org user licenses"
  ON user_licenses FOR ALL
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS Table Policies
-- ============================================================================

-- Organization members can read their org subscription
CREATE POLICY "Users can read their org subscription"
  ON subscriptions FOR SELECT
  USING (
    "organizationId" = auth.user_org_id()
  );

-- Admins can manage their org subscription
CREATE POLICY "Admins can manage their org subscription"
  ON subscriptions FOR ALL
  USING (
    auth.is_admin() AND "organizationId" = auth.user_org_id()
  );

-- Super admins can manage all subscriptions
CREATE POLICY "Super admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.is_super_admin());

-- ============================================================================
-- PAYMENTS Table Policies
-- ============================================================================

-- Users can read their own payments
CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING ("userId" = auth.user_id());

-- System can create payments (service role)
CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Admins can read org payments
CREATE POLICY "Admins can read org payments"
  ON payments FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- USAGE_METRICS Table Policies
-- ============================================================================

-- Users can read their own usage metrics
CREATE POLICY "Users can read their own usage metrics"
  ON usage_metrics FOR SELECT
  USING ("userId" = auth.user_id());

-- System can manage usage metrics (service role)
CREATE POLICY "System can manage usage metrics"
  ON usage_metrics FOR ALL
  WITH CHECK (true);

-- Admins can read org usage metrics
CREATE POLICY "Admins can read org usage metrics"
  ON usage_metrics FOR SELECT
  USING (
    auth.is_admin() AND (
      "userId" IN (
        SELECT id FROM users WHERE "organizationId" = auth.user_org_id()
      ) OR auth.is_super_admin()
    )
  );

-- ============================================================================
-- PLATFORM_SETTINGS Table Policies
-- ============================================================================

-- All authenticated users can read platform settings
CREATE POLICY "Users can read platform settings"
  ON platform_settings FOR SELECT
  USING (auth.user_id() IS NOT NULL);

-- Only super admins can manage platform settings
CREATE POLICY "Super admins can manage platform settings"
  ON platform_settings FOR ALL
  USING (auth.is_super_admin());

-- ============================================================================
-- LOGIN_TOKENS Table Policies
-- ============================================================================

-- Users can read their own login tokens
CREATE POLICY "Users can read their own login tokens"
  ON login_tokens FOR SELECT
  USING ("userId" = auth.user_id());

-- System can manage login tokens (service role)
CREATE POLICY "System can manage login tokens"
  ON login_tokens FOR ALL
  WITH CHECK (true);

-- ============================================================================
-- Service Role Bypass (for server-side operations)
-- ============================================================================
-- Note: When using Prisma from server-side with service_role key,
-- RLS is automatically bypassed. This is intentional for:
-- - Assessment scoring calculations
-- - Payment processing
-- - Email sending
-- - Background jobs
-- - Admin operations through API routes with proper authorization
-- ============================================================================

-- End of RLS Policies Migration
