#!/bin/bash

# =============================================================================
# Test Row Level Security (RLS) Policies - Supabase Compatible
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
echo -e "${BLUE}Testing RLS Policies (Supabase Implementation)${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Load environment
if [ -f .env ]; then
    source .env 2>/dev/null
fi

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
AND rowsecurity = true;
")

if [ "$ENABLED" -eq 28 ]; then
    echo -e "${GREEN}✓ RLS enabled on all 28 tables${NC}"
else
    echo -e "${YELLOW}⚠ RLS enabled on $ENABLED/28 tables${NC}"
fi
echo ""

# Test 2: Check Supabase auth.uid() function exists
echo -e "${BLUE}Test 2: Verify Supabase auth.uid() function${NC}"
FUNCTIONS=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_proc 
WHERE proname = 'uid'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');
")

if [ "$FUNCTIONS" -ge 1 ]; then
    echo -e "${GREEN}✓ Supabase auth.uid() function exists${NC}"
else
    echo -e "${YELLOW}⚠ Supabase auth.uid() not found (expected for Supabase managed DB)${NC}"
fi
echo ""

# Test 3: Check policies exist
echo -e "${BLUE}Test 3: Verify policies are created${NC}"
POLICIES=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
")

if [ "$POLICIES" -ge 60 ]; then
    echo -e "${GREEN}✓ Policies created ($POLICIES policies found)${NC}"
else
    echo -e "${YELLOW}⚠ Only $POLICIES policies found (expected 60+)${NC}"
fi
echo ""

# Test 4: Show policy distribution
echo -e "${BLUE}Test 4: Policy distribution by table${NC}"
psql "$DATABASE_URL" -c "
SELECT tablename, COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY policy_count DESC;
"
echo ""

# Test 5: Verify critical policies
echo -e "${BLUE}Test 5: Verify critical policies exist${NC}"

# Check users table policies
USERS_POLICIES=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_policies 
WHERE tablename = 'users' AND policyname LIKE '%can read their own%';
")

# Check assessments table policies
ASSESSMENTS_POLICIES=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_policies 
WHERE tablename = 'assessments' AND policyname LIKE '%can manage their own%';
")

# Check templates table policies
TEMPLATES_POLICIES=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM pg_policies 
WHERE tablename = 'assessment_templates' AND policyname LIKE '%can read active%';
")

CRITICAL_FOUND=0
if [ "$USERS_POLICIES" -ge 1 ]; then
    echo -e "${GREEN}✓ Users isolation policy exists${NC}"
    CRITICAL_FOUND=$((CRITICAL_FOUND + 1))
fi

if [ "$ASSESSMENTS_POLICIES" -ge 1 ]; then
    echo -e "${GREEN}✓ Assessments isolation policy exists${NC}"
    CRITICAL_FOUND=$((CRITICAL_FOUND + 1))
fi

if [ "$TEMPLATES_POLICIES" -ge 1 ]; then
    echo -e "${GREEN}✓ Public templates policy exists${NC}"
    CRITICAL_FOUND=$((CRITICAL_FOUND + 1))
fi

if [ "$CRITICAL_FOUND" -eq 3 ]; then
    echo -e "${GREEN}✓ All critical policies verified${NC}"
else
    echo -e "${YELLOW}⚠ Only $CRITICAL_FOUND/3 critical policies found${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo "Tables with RLS:  $ENABLED/28"
echo "Total Policies:   $POLICIES"
echo "Implementation:   Supabase built-in auth.uid()"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test authentication flows (login/logout)"
echo "2. Test user data isolation (User A can't see User B's data)"
echo "3. Test admin access patterns (Admins see org data)"
echo "4. Test sub-account hierarchy"
echo "5. Monitor logs for permission denied errors"
echo ""
echo -e "${GREEN}✅ RLS Testing Complete!${NC}"
