# Assessment Deletion Fix

## Issue

Assessments for "Test Student" (test@example.com) could not be deleted.

## Root Cause

The assessment deletion API route (`/app/api/assessments/[id]/route.ts`) was missing deletion of `ShareableLink` records before attempting to delete the assessment. This caused a foreign key constraint violation when assessments had associated share links.

## Solution

Updated the DELETE handler to include deletion of `ShareableLink` records in the transaction:

```typescript
// Delete related records first (due to foreign key constraints)
await prisma.$transaction(async (tx) => {
  // Delete chat messages
  await tx.chatMessage.deleteMany({
    where: { assessmentId: internalId },
  });

  // Delete scores
  await tx.score.deleteMany({
    where: { assessmentId: internalId },
  });

  // Delete recommendations
  await tx.recommendation.deleteMany({
    where: { assessmentId: internalId },
  });

  // Delete shareable links  <-- ADDED THIS
  await tx.shareableLink.deleteMany({
    where: { assessmentId: internalId },
  });

  // Delete the assessment
  await tx.assessment.delete({
    where: { id: internalId },
  });
});
```

## Testing

Created debug and test scripts:

- `scripts/debug-test-student-assessments.js` - Analyzes assessments and related records
- `scripts/test-assessment-deletion.js` - Tests actual deletion

Verified that an assessment with 9 scores and 1 share link was successfully deleted.

## Files Modified

- `/app/api/assessments/[id]/route.ts` - Added ShareableLink deletion to transaction

## Related Models

Assessment has foreign key relationships with:

- ✅ ChatMessage (messages)
- ✅ Score (scores)
- ✅ Recommendation (recommendations)
- ✅ ShareableLink (shareableLinks) ← **This was missing**

All must be deleted before the assessment can be deleted.
