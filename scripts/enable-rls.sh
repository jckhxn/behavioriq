#!/bin/bash

# =============================================================================
# Enable Row Level Security (RLS) Policies Migration Script
# =============================================================================
# This script applies RLS policies to your Supabase database
# 
# Prerequisites:
# - Supabase CLI installed (or use SQL editor in Supabase dashboard)
# - DATABASE_URL environment variable set
# 
# Usage:
#   ./scripts/enable-rls.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SQL_FILE="$PROJECT_DIR/prisma/migrations/enable_rls_policies.sql"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}Row Level Security (RLS) Migration${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file not found at $SQL_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found RLS migration file${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it in your .env file or export it:${NC}"
    echo -e "${YELLOW}  export DATABASE_URL='postgresql://...'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will enable Row Level Security on all tables${NC}"
echo -e "${YELLOW}   and create access control policies.${NC}"
echo ""
echo -e "${YELLOW}   Existing queries may fail if RLS policies are too restrictive.${NC}"
echo -e "${YELLOW}   Make sure you have a backup and test thoroughly after migration.${NC}"
echo ""
read -p "Do you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Migration cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting migration...${NC}"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed${NC}"
    echo -e "${YELLOW}Please install PostgreSQL client tools or use Supabase dashboard SQL editor${NC}"
    echo ""
    echo -e "${BLUE}To apply manually:${NC}"
    echo -e "  1. Go to Supabase Dashboard > SQL Editor"
    echo -e "  2. Copy contents of: ${SQL_FILE}"
    echo -e "  3. Paste and run the SQL"
    exit 1
fi

# Run the migration
echo -e "${BLUE}Applying RLS policies...${NC}"
psql "$DATABASE_URL" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==============================================================================${NC}"
    echo -e "${GREEN}✓ RLS Migration Completed Successfully!${NC}"
    echo -e "${GREEN}==============================================================================${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo ""
    echo -e "  1. ${GREEN}Test Authentication${NC}"
    echo -e "     - Login/logout works correctly"
    echo -e "     - JWT tokens are generated properly"
    echo ""
    echo -e "  2. ${GREEN}Test User Isolation${NC}"
    echo -e "     - User A cannot see User B's data"
    echo -e "     - Assessments are properly isolated"
    echo ""
    echo -e "  3. ${GREEN}Test Admin Access${NC}"
    echo -e "     - Admins can see organization data"
    echo -e "     - Super admins have global access"
    echo ""
    echo -e "  4. ${GREEN}Test Sub-Account Hierarchy${NC}"
    echo -e "     - District admins can manage their sub-accounts"
    echo -e "     - Sub-accounts inherit proper permissions"
    echo ""
    echo -e "  5. ${GREEN}Monitor Performance${NC}"
    echo -e "     - Check for slow queries"
    echo -e "     - Review query execution plans"
    echo ""
    echo -e "  6. ${GREEN}Review Application Logs${NC}"
    echo -e "     - Look for permission denied errors"
    echo -e "     - Fix any broken queries"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo -e "  - RLS Security Model: ${PROJECT_DIR}/docs/RLS_SECURITY_MODEL.md"
    echo -e "  - Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security"
    echo ""
else
    echo ""
    echo -e "${RED}==============================================================================${NC}"
    echo -e "${RED}✗ Migration Failed${NC}"
    echo -e "${RED}==============================================================================${NC}"
    echo ""
    echo -e "${YELLOW}Please check the error messages above and fix any issues.${NC}"
    echo ""
    echo -e "${BLUE}Common Issues:${NC}"
    echo -e "  - Connection refused: Check DATABASE_URL"
    echo -e "  - Permission denied: Use service_role key for migration"
    echo -e "  - Syntax errors: Check SQL file for typos"
    echo ""
    exit 1
fi
