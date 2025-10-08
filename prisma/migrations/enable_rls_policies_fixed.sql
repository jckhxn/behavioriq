-- ============================================================================
-- Row Level Security (RLS) Policies for AI Diagnostic System (Supabase Compatible)
-- ============================================================================
-- This migration enables RLS on all tables and creates policies using
-- Supabase's built-in auth functions instead of custom functions
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
-- USERS Table Policies
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (id = auth.uid()::text);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (id = auth.uid()::text);

-- Admins can read all users in their organization
CREATE POLICY "Admins can read org users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid()::text 
      AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND (u."organizationId" = users."organizationId" OR u.role = 'SUPER_ADMIN')
    )
  );

-- Super admins have full access
CREATE POLICY "Super admins have full access to users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND role = 'SUPER_ADMIN'
    )
  );

-- District admins can read their sub-accounts
CREATE POLICY "District admins can read their sub-accounts"
  ON users FOR SELECT
  USING ("parentUserId" = auth.uid()::text);

-- ============================================================================
-- SUB_ACCOUNTS Table Policies
-- ============================================================================

-- Users can read their own sub-account profile
CREATE POLICY "Users can read their own sub-account"
  ON sub_accounts FOR SELECT
  USING ("userId" = auth.uid()::text);

-- District admins can manage their sub-accounts
CREATE POLICY "District admins can manage their sub-accounts"
  ON sub_accounts FOR ALL
  USING ("managedByUserId" = auth.uid()::text);

-- Admins can read sub-accounts in their org
CREATE POLICY "Admins can read org sub-accounts"
  ON sub_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text
      AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND (u."organizationId" = sub_accounts."organizationId" OR u.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- DOCUMENTS Table Policies
-- ============================================================================

-- Users can manage their own documents
CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  USING ("userId" = auth.uid()::text);

-- Admins can read org documents
CREATE POLICY "Admins can read org documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users doc_owner ON documents."userId" = doc_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = doc_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- DOCUMENT_CHUNKS Table Policies
-- ============================================================================

-- Users can read their own document chunks
CREATE POLICY "Users can read their own document chunks"
  ON document_chunks FOR SELECT
  USING ("userId" = auth.uid()::text);

-- Admins can read org document chunks
CREATE POLICY "Admins can read org document chunks"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users chunk_owner ON document_chunks."userId" = chunk_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = chunk_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- ASSESSMENTS Table Policies
-- ============================================================================

-- Users can manage their own assessments
CREATE POLICY "Users can manage their own assessments"
  ON assessments FOR ALL
  USING ("userId" = auth.uid()::text);

-- District admins can read sub-account assessments
CREATE POLICY "District admins can read sub-account assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sub_accounts
      WHERE sub_accounts."userId" = assessments."userId"
      AND sub_accounts."managedByUserId" = auth.uid()::text
    )
  );

-- Admins can read org assessments
CREATE POLICY "Admins can read org assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users assessment_owner ON assessments."userId" = assessment_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = assessment_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- AI_REPORTS Table Policies
-- ============================================================================

-- Users can read AI reports for their assessments
CREATE POLICY "Users can read their own AI reports"
  ON ai_reports FOR SELECT
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.uid()::text
    )
  );

-- Report generators can manage their reports
CREATE POLICY "Users can manage AI reports they generated"
  ON ai_reports FOR ALL
  USING ("generatedByUserId" = auth.uid()::text);

-- Admins can read org AI reports
CREATE POLICY "Admins can read org AI reports"
  ON ai_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN assessments a ON ai_reports."assessmentId" = a.id
      JOIN users assessment_owner ON a."userId" = assessment_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = assessment_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- ASSESSMENT_TEMPLATES Table Policies
-- ============================================================================

-- All authenticated users can read active templates
CREATE POLICY "Users can read active assessment templates"
  ON assessment_templates FOR SELECT
  USING ("isActive" = true AND auth.uid() IS NOT NULL);

-- Creators can manage their templates
CREATE POLICY "Creators can manage their own templates"
  ON assessment_templates FOR ALL
  USING ("createdById" = auth.uid()::text);

-- Admins can manage org templates
CREATE POLICY "Admins can manage org templates"
  ON assessment_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users template_owner ON assessment_templates."createdById" = template_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = template_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- Super admins can manage all templates
CREATE POLICY "Super admins can manage all templates"
  ON assessment_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================================================
-- DOMAIN_TEMPLATES Table Policies
-- ============================================================================

-- All authenticated users can read domain templates
CREATE POLICY "Users can read domain templates"
  ON domain_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Creators can manage their domains
CREATE POLICY "Creators can manage their own domains"
  ON domain_templates FOR ALL
  USING ("createdById" = auth.uid()::text);

-- Admins can manage all domains
CREATE POLICY "Admins can manage all domains"
  ON domain_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- ============================================================================
-- ASSESSMENT_TEMPLATE_DOMAINS Junction Table
-- ============================================================================

-- Users can read template-domain associations
CREATE POLICY "Users can read template-domain associations"
  ON assessment_template_domains FOR SELECT
  USING (
    "assessmentTemplateId" IN (
      SELECT id FROM assessment_templates WHERE "isActive" = true
    )
  );

-- Admins can manage associations
CREATE POLICY "Admins can manage template-domain associations"
  ON assessment_template_domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- ============================================================================
-- TEMPLATE VERSION HISTORY
-- ============================================================================

CREATE POLICY "Users can read assessment template versions"
  ON assessment_template_versions FOR SELECT
  USING (
    "assessmentTemplateId" IN (
      SELECT id FROM assessment_templates WHERE "isActive" = true
    )
  );

CREATE POLICY "Users can read domain template versions"
  ON domain_template_versions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage assessment template versions"
  ON assessment_template_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

CREATE POLICY "Admins can manage domain template versions"
  ON domain_template_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- ============================================================================
-- SHAREABLE_LINKS Table
-- ============================================================================

CREATE POLICY "Users can manage their own shareable links"
  ON shareable_links FOR ALL
  USING ("createdById" = auth.uid()::text);

CREATE POLICY "Public shareable links are readable"
  ON shareable_links FOR SELECT
  USING ("isActive" = true);

CREATE POLICY "Admins can read org shareable links"
  ON shareable_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users link_owner ON shareable_links."createdById" = link_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = link_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- CHAT_SESSIONS & MESSAGES
-- ============================================================================

CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions FOR ALL
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can read their own chat messages"
  ON chat_messages FOR SELECT
  USING (
    "sessionId" IN (
      SELECT id FROM chat_sessions WHERE "userId" = auth.uid()::text
    ) OR
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    "sessionId" IN (
      SELECT id FROM chat_sessions WHERE "userId" = auth.uid()::text
    ) OR
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.uid()::text
    )
  );

-- ============================================================================
-- SCORES Table
-- ============================================================================

CREATE POLICY "Users can read their own scores"
  ON scores FOR SELECT
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "System can create scores"
  ON scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read org scores"
  ON scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN assessments a ON scores."assessmentId" = a.id
      JOIN users assessment_owner ON a."userId" = assessment_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = assessment_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- RECOMMENDATIONS Table
-- ============================================================================

CREATE POLICY "Users can manage their own recommendations"
  ON recommendations FOR ALL
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Admins can read org recommendations"
  ON recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users rec_owner ON recommendations."userId" = rec_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = rec_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- QUESTION_SETS, QUESTIONS, TERMINATION_RULES
-- ============================================================================

CREATE POLICY "Users can read question sets"
  ON question_sets FOR SELECT
  USING (auth.uid() IS NOT NULL AND "isActive" = true);

CREATE POLICY "Users can read questions"
  ON questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read termination rules"
  ON termination_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage question sets"
  ON question_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

CREATE POLICY "Admins can manage termination rules"
  ON termination_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- ============================================================================
-- QUESTION_RESPONSES Table
-- ============================================================================

CREATE POLICY "Users can manage their own question responses"
  ON question_responses FOR ALL
  USING (
    "assessmentId" IN (
      SELECT id FROM assessments WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Admins can read org question responses"
  ON question_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN assessments a ON question_responses."assessmentId" = a.id
      JOIN users assessment_owner ON a."userId" = assessment_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = assessment_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- LICENSES Table
-- ============================================================================

CREATE POLICY "Admins can read org licenses"
  ON licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND (
        users."organizationId" = licenses."organizationId" 
        OR users.role = 'SUPER_ADMIN'
      )
    )
  );

CREATE POLICY "Admins can manage licenses"
  ON licenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- ============================================================================
-- ORGANIZATIONS Table
-- ============================================================================

CREATE POLICY "Users can read their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage their organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND users."organizationId" = organizations.id
    )
  );

CREATE POLICY "Super admins can manage all organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================================================
-- USER_LICENSES Table
-- ============================================================================

CREATE POLICY "Users can read their own licenses"
  ON user_licenses FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "Admins can manage org user licenses"
  ON user_licenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users license_owner ON user_licenses."userId" = license_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND (admin."organizationId" = license_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS Table
-- ============================================================================

CREATE POLICY "Users can read their org subscription"
  ON subscriptions FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage their org subscription"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text
      AND role IN ('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN')
      AND users."organizationId" = subscriptions."organizationId"
    )
  );

CREATE POLICY "Super admins can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================================================
-- PAYMENTS Table
-- ============================================================================

CREATE POLICY "Users can read their own payments"
  ON payments FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read org payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users payment_owner ON payments."userId" = payment_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = payment_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- USAGE_METRICS Table
-- ============================================================================

CREATE POLICY "Users can read their own usage metrics"
  ON usage_metrics FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "System can manage usage metrics"
  ON usage_metrics FOR ALL
  WITH CHECK (true);

CREATE POLICY "Admins can read org usage metrics"
  ON usage_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users admin
      JOIN users metrics_owner ON usage_metrics."userId" = metrics_owner.id
      WHERE admin.id = auth.uid()::text
      AND admin.role IN ('ADMIN', 'SUPER_ADMIN')
      AND (admin."organizationId" = metrics_owner."organizationId" OR admin.role = 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- PLATFORM_SETTINGS Table
-- ============================================================================

CREATE POLICY "Users can read platform settings"
  ON platform_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage platform settings"
  ON platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN'
    )
  );

-- ============================================================================
-- LOGIN_TOKENS Table
-- ============================================================================

CREATE POLICY "Users can read their own login tokens"
  ON login_tokens FOR SELECT
  USING ("userId" = auth.uid()::text);

CREATE POLICY "System can manage login tokens"
  ON login_tokens FOR ALL
  WITH CHECK (true);

-- End of RLS Policies Migration (Supabase Compatible)
