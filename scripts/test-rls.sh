#!/bin/bash

# =============================================================================
# Test Row Level Security (RLS) Policies
# =============================================================================
# This script tests RLS policies to ensure proper data isolation
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Testing RLS Policies${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    exit 1
fi

# Test 1: Check RLS is enabled
echo -e "${BLUE}Test 1: Verify RLS is enabled on all tables${NC}"
ENABLED=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'users', 'assessments', 'documents', 'ai_reports', 
  'assessment_templates', 'domain_templates'
) 
AND rowsecurity = true;
")

if [ "$ENABLED" -eq 6 ]; then
    echo -e "${GREEN}✓ RLS enabled on core tables${NC}"
else
    echo -e "${RED}✗ RLS not enabled on all tables (found $ENABLED/6)${NC}"
fi
echo ""

# Test 2: Check helper functions exist
echo -e "${BLUE}Test 2: Verify helper functions exist${NC}"
FUNCTIONS=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_proc 
WHERE proname IN ('user_id', 'user_role', 'is_admin', 'is_super_admin', 'user_org_id', 'manages_sub_account')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');
")

if [ "$FUNCTIONS" -eq 6 ]; then
    echo -e "${GREEN}✓ All helper functions created${NC}"
else
    echo -e "${RED}✗ Missing helper functions (found $FUNCTIONS/6)${NC}"
fi
echo ""

# Test 3: Check policies exist
echo -e "${BLUE}Test 3: Verify policies are created${NC}"
POLICIES=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
")

if [ "$POLICIES" -gt 50 ]; then
    echo -e "${GREEN}✓ Policies created ($POLICIES policies found)${NC}"
else
    echo -e "${YELLOW}⚠ Found $POLICIES policies (expected 50+)${NC}"
fi
echo ""

# Test 4: List policies by table
echo -e "${BLUE}Test 4: Policy breakdown by table${NC}"
psql "$DATABASE_URL" -c "
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
"
echo ""

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}RLS Testing Complete${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}Manual Testing Required:${NC}"
echo ""
echo -e "  1. Test user authentication and data access"
echo -e "  2. Verify users cannot see other users' data"
echo -e "  3. Test admin access to organization data"
echo -e "  4. Test sub-account hierarchy"
echo -e "  5. Verify public assessment templates are readable"
echo ""
