# Share Link Bug Fixes

## Issues

1. **Enhanced Reports not loading** - Share page doesn't display Enhanced Report content
2. **Regular reports error** - `Cannot read properties of null (reading 'toLowerCase')` when viewing regular shared assessments

## Root Causes

### Issue 1: Null Domain Field

The `Score` model has:

- `domain` field (enum `AssessmentDomain?`) - **can be null**
- `domainName` field (String?) - denormalized domain name
- `domainTemplate` relation - points to DomainTemplate

The share page code at line 200 was trying to call `.toLowerCase()` on `score.domain` which could be null:

```tsx
{
  score.domain.toLowerCase().replace("_", " ");
} // ❌ Crashes if domain is null
```

### Issue 2: Missing Domain Template Relation

The API route wasn't including the `domainTemplate` relation when fetching scores, so domain information was incomplete.

## Solutions

### 1. Fixed Share Page (app/share/[code]/page.tsx)

Updated to use fallback chain for domain name:

```tsx
{
  (score.domainName || score.domain || "Unknown Domain")
    .toLowerCase()
    .replace(/_/g, " ");
}
```

This ensures:

- Uses `domainName` if available (preferred)
- Falls back to `domain` enum if domainName is null
- Falls back to "Unknown Domain" if both are null
- Uses regex `/g` flag to replace all underscores, not just first one

### 2. Fixed API Route (app/api/share/[code]/route.ts)

**Updated query to include domainTemplate:**

```typescript
scores: {
  include: {
    domainTemplate: true,
  },
},
```

**Updated response mapping:**

```typescript
scores: shareableLink.assessment.scores.map((score) => ({
  ...score,
  domainName:
    score.domainName ||
    score.domainTemplate?.name ||
    score.domain ||
    "Unknown Domain",
})),
```

This ensures every score has a `domainName` field with proper fallback chain:

1. Use existing `domainName` from database
2. Use `domainTemplate.name` if available
3. Use `domain` enum as fallback
4. Use "Unknown Domain" as final fallback

## Testing

To test the fixes:

1. **Create a shareable link** for an assessment with scores
2. **Access the share link** - should now display domain names correctly
3. **Check Enhanced Reports** - should load properly if enhanced report data exists

## Files Modified

- `app/share/[code]/page.tsx` - Fixed null domain handling in UI
- `app/api/share/[code]/route.ts` - Added domainTemplate relation and improved domain name mapping

## Related Models

```prisma
model Score {
  id                 String            @id @default(cuid())
  assessmentId       String
  domain             AssessmentDomain? // ← Can be null!
  domainTemplateId   String?
  domainName         String?           // ← Preferred field to use
  domainTemplate     DomainTemplate?   @relation(...)
  // ... other fields
}
```

## Prevention

When displaying domain information in the future:

1. Always use `score.domainName` as the primary field
2. Provide fallbacks for null values
3. Include `domainTemplate` relation when fetching scores if needed
4. Never assume `domain` field is non-null
