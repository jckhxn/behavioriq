# Dynamic Domains Migration - Complete Implementation

## Overview

This migration removes all hardcoded domain mappings and enables the system to support **fully dynamic domain names** from assessment templates. Every assessment can now have completely custom domains without any code changes.

## Changes Made

### 1. Database Schema Updates

**File**: `prisma/schema.prisma`

Added new fields to the `Score` model:

- `domainTemplateId` (String?, optional) - References the `DomainTemplate` that this score belongs to
- `domainName` (String?, optional) - Denormalized domain name for performance and backwards compatibility
- `domain` (AssessmentDomain?, now optional) - Made optional for backward compatibility with legacy assessments
- Added relation: `domainTemplate DomainTemplate?` - Join to get domain metadata

**Migration**: `20251002201018_add_domain_template_to_scores`

```sql
-- Make domain enum optional
ALTER TABLE "scores" ALTER COLUMN "domain" DROP NOT NULL;

-- Add new fields
ALTER TABLE "scores" ADD COLUMN "domainName" TEXT;
ALTER TABLE "scores" ADD COLUMN "domainTemplateId" TEXT;

-- Add foreign key constraint
ALTER TABLE "scores" ADD CONSTRAINT "scores_domainTemplateId_fkey"
  FOREIGN KEY ("domainTemplateId") REFERENCES "domain_templates"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for performance
CREATE INDEX "scores_domainTemplateId_idx" ON "scores"("domainTemplateId");
```

### 2. Score Creation Logic

**File**: `lib/ai/AssessmentAI.ts`

Updated `updateStructuredScores()` method to:

1. Fetch domain templates from the assessment's template
2. Build a mapping from domain names to template IDs
3. Store `domainTemplateId` and `domainName` instead of relying on enum mapping
4. Only use the legacy `mapDomainToEnum()` as a fallback for assessments without templates

**Key Changes**:

```typescript
// OLD (hardcoded enum mapping)
domain: this.mapDomainToEnum(domainScore.domain)

// NEW (template-based with fallback)
domainTemplateId: domainTemplateId || null,
domainName: domainScore.domain,
domain: domainTemplateId ? null : this.mapDomainToEnum(domainScore.domain)
```

### 3. Scores API Endpoint

**File**: `app/api/assessments/[id]/scores/route.ts`

Simplified the API to:

1. Join with `DomainTemplate` to get domain names
2. Use `domainName` field if available (stored in database)
3. Fall back to template name if `domainName` is null
4. Fall back to `DOMAIN_LABELS` only for legacy assessments without templates

**Key Changes**:

```typescript
// Include domain template in query
include: {
  domainTemplate: {
    select: { id: true, name: true, slug: true }
  }
}

// Priority fallback chain
domainName: score.domainName ||
            score.domainTemplate?.name ||
            (score.domain ? DOMAIN_LABELS[score.domain] : 'Unknown')
```

### 4. Frontend Component

**File**: `components/assessment/AssessmentCompletion.tsx`

Already updated in previous fix to use `score.domainName` instead of `DOMAIN_LABELS[score.domain]`.

### 5. Test Scripts

**Files**:

- `scripts/generate-sample-assessment.js`
- `scripts/generate-user-assessment.js`

Updated to include `domainName` when creating sample scores.

## How It Works Now

### For New Assessments with Templates

1. **Assessment Creation**: User uploads assessment template with custom domains
2. **Score Calculation**: When scores are calculated:
   - System fetches domain templates from assessment template
   - Maps domain names to template IDs
   - Stores both `domainTemplateId` and `domainName` in Score table
3. **Score Display**: API joins with DomainTemplate and returns actual domain names
4. **UI Rendering**: Component displays the dynamic domain name

### For Legacy Assessments (Backwards Compatibility)

1. **No Template**: Assessment doesn't have `assessmentTemplateId`
2. **Enum Fallback**: System uses `mapDomainToEnum()` to map to legacy enum values
3. **Label Fallback**: API falls back to `DOMAIN_LABELS` constant for display
4. **Works as Before**: Existing assessments continue to work without migration

## Benefits

1. ✅ **No Hardcoded Values**: Zero hardcoded domain names or mappings required
2. ✅ **Fully Dynamic**: Support ANY domain name from any template
3. ✅ **Backwards Compatible**: Legacy assessments continue to work
4. ✅ **Performance**: Denormalized `domainName` avoids extra joins
5. ✅ **Flexibility**: Each assessment can have different domains
6. ✅ **No Code Changes**: Adding new domains requires no code deployment

## Testing

### Test with Existing Assessment

Visit: `http://localhost:3000/assessment/BIQ-NQN9M7`

**Expected Behavior**:

- "Detailed Results" section shows actual domain names from the template
- No more "Antisocial Behavior" for all domains
- Each domain displays its configured name (e.g., "Suicidality", "Self-Harm", etc.)

### Test with New Assessment

1. Create assessment template with custom domains (e.g., "Anxiety", "Depression", "PTSD")
2. Take assessment
3. Complete assessment
4. View results - should show "Anxiety", "Depression", "PTSD" as domain names

## Data Migration (Optional)

Existing scores in the database have:

- `domain`: Enum value (ANTISOCIAL, VIOLENCE, etc.)
- `domainName`: NULL
- `domainTemplateId`: NULL

These will continue to work using the fallback mechanism. To fully migrate:

```sql
-- Option 1: Backfill domainName from enum (simple display fix)
UPDATE scores
SET domainName = CASE domain
  WHEN 'ANTISOCIAL' THEN 'Antisocial Behavior'
  WHEN 'VIOLENCE' THEN 'Violence Risk'
  WHEN 'ATTENTION' THEN 'Attention Problems'
  WHEN 'EMOTIONAL' THEN 'Emotional Difficulties'
  WHEN 'CONDUCT' THEN 'Conduct Problems'
END
WHERE domainName IS NULL AND domain IS NOT NULL;

-- Option 2: Link existing scores to domain templates (if templates exist)
-- This requires manual mapping based on your specific templates
```

## Future Enhancements

1. **Remove Legacy Enum**: Once all assessments use templates, the `domain` enum field can be fully deprecated
2. **Remove `mapDomainToEnum`**: The function can be deleted when no longer needed
3. **Remove `DOMAIN_LABELS`**: The hardcoded constant can be removed from the codebase

## Troubleshooting

### "Property 'domainTemplate' does not exist" Error

**Cause**: Prisma Client hasn't regenerated with new schema

**Fix**:

```bash
npx prisma generate
```

### Scores Still Show Hardcoded Names

**Cause**: Existing scores don't have `domainName` or `domainTemplateId` populated

**Fix**:

1. Delete and regenerate scores for that assessment, OR
2. Run data migration SQL above

### TypeScript Errors in IDE

**Cause**: TypeScript server using stale Prisma types

**Fix**:

1. Restart TypeScript server in VS Code
2. Restart dev server: `npm run dev`
3. Regenerate Prisma Client: `npx prisma generate`

## Conclusion

The system now supports **100% dynamic domain names** with no hardcoded values. Every assessment can define its own custom domains, and they will be displayed correctly throughout the application without requiring any code changes.
