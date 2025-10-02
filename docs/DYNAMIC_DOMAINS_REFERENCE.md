# Quick Reference: Dynamic Domains System

## How Domain Names Work Now

### For New Assessments (Template-Based)

```
Assessment Template → Domain Templates → Score (stores domainTemplateId + domainName)
                                      ↓
                              API returns domainName
                                      ↓
                              UI displays custom name
```

### For Legacy Assessments (No Template)

```
Score (has enum value) → Enum Fallback → DOMAIN_LABELS lookup
                                       ↓
                              UI displays enum label
```

## Score Model Fields

| Field              | Type    | Purpose                 | Example              |
| ------------------ | ------- | ----------------------- | -------------------- |
| `domainTemplateId` | String? | Links to DomainTemplate | `"cuid123..."`       |
| `domainName`       | String? | Denormalized name       | `"Anxiety Symptoms"` |
| `domain`           | Enum?   | Legacy enum (optional)  | `EMOTIONAL`          |

## Fallback Priority

When displaying domain name:

1. ✅ `score.domainName` (stored in database)
2. ✅ `score.domainTemplate.name` (joined from template)
3. ✅ `DOMAIN_LABELS[score.domain]` (legacy fallback)
4. ❌ `"Unknown"` (should never happen)

## API Response Format

```json
{
  "scores": [
    {
      "id": "score123",
      "domain": "EMOTIONAL", // Legacy enum (may be null)
      "domainName": "Anxiety Symptoms", // 🎯 Display this
      "rawScore": 15,
      "totalPossible": 30,
      "riskLevel": "MODERATE",
      "confidence": 0.85,
      "questionsAnswered": 10,
      "wasTerminatedEarly": false,
      "timestamp": "2025-10-02T..."
    }
  ]
}
```

## Component Usage

```tsx
// ✅ CORRECT - Use domainName with fallback
<h4>{score.domainName || DOMAIN_LABELS[score.domain]}</h4>

// ❌ WRONG - Don't use only enum
<h4>{DOMAIN_LABELS[score.domain]}</h4>
```

## Creating Scores (Backend)

```typescript
// ✅ CORRECT - Store template ID and name
await prisma.score.create({
  data: {
    assessmentId: "...",
    domainTemplateId: templateId, // Link to template
    domainName: "Anxiety Symptoms", // Store name
    domain: null, // Don't use enum
    // ... other fields
  },
});

// ❌ WRONG - Don't rely on enum alone
await prisma.score.create({
  data: {
    assessmentId: "...",
    domain: AssessmentDomain.EMOTIONAL, // ❌ Loses custom name
    // ... other fields
  },
});
```

## Adding New Domain to Template

1. Create DomainTemplate in database with custom name
2. Link to AssessmentTemplate via AssessmentTemplateDomain junction table
3. No code changes needed!
4. Domain name will automatically appear in results

## Troubleshooting

| Problem                                  | Cause                                | Solution                                    |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------- |
| All domains show same name               | Scores have enum but no `domainName` | Regenerate scores OR run migration SQL      |
| "Property domainTemplate does not exist" | Prisma types stale                   | `npx prisma generate`                       |
| Domain shows "Unknown"                   | No template, enum, or name           | Check assessment has `assessmentTemplateId` |

## Migration Commands

```bash
# Regenerate Prisma Client
npx prisma generate

# Check migration status
npx prisma migrate status

# Create new migration (if needed)
npx prisma migrate dev --name <name>

# Backfill domain names (optional)
npx prisma db execute --stdin <<< "
UPDATE scores
SET domainName =
  CASE domain
    WHEN 'ANTISOCIAL' THEN 'Antisocial Behavior'
    WHEN 'VIOLENCE' THEN 'Violence Risk'
    WHEN 'ATTENTION' THEN 'Attention Problems'
    WHEN 'EMOTIONAL' THEN 'Emotional Difficulties'
    WHEN 'CONDUCT' THEN 'Conduct Problems'
  END
WHERE domainName IS NULL;
"
```

## Key Files

- **Schema**: `prisma/schema.prisma` (Score model)
- **Score Creation**: `lib/ai/AssessmentAI.ts` (updateStructuredScores)
- **API**: `app/api/assessments/[id]/scores/route.ts`
- **Component**: `components/assessment/AssessmentCompletion.tsx`
- **Migration**: `prisma/migrations/20251002201018_add_domain_template_to_scores/`

## Testing Checklist

- [ ] Visit existing assessment results page
- [ ] Verify domain names show correctly (not all same)
- [ ] Create new assessment with custom domains
- [ ] Complete assessment and check results
- [ ] Verify API returns `domainName` field
- [ ] Test legacy assessment (no template) still works

---

✅ **System Status**: Dynamic domains fully implemented  
📍 **Server**: http://localhost:3000  
📅 **Date**: October 2, 2025
