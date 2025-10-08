# Assessment Credits System Implementation

## Overview

Implemented a credits-based system for BASIC users where each $97 purchase grants 1 assessment credit. Users must purchase additional credits to take more assessments.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)

Added two new fields to the `UserLicense` model:

- `assessmentsAllowed`: Number of assessments the license allows (incremented on purchase)
- `assessmentsUsed`: Number of assessments actually used by the user

```prisma
model UserLicense {
  // ... existing fields
  assessmentsAllowed Int      @default(0)
  assessmentsUsed    Int      @default(0)
}
```

### 2. Database Migration

Created migration: `20251004162105_add_assessment_credits_tracking`

- Adds the two new fields to `user_licenses` table
- Also removes deprecated `FREE` license type

### 3. Payment Service (`lib/services/payment-service.ts`)

Updated `createOrUpdateLicense()` method to:

- Increment `assessmentsAllowed` by 1 when user purchases a $97 assessment
- Initialize new users with `assessmentsAllowed: 1` and `assessmentsUsed: 0`

### 4. Assessment Credits Service (`lib/services/assessment-credits-service.ts`) - NEW

Created comprehensive service to manage assessment credits:

#### Methods:

- `checkUserCredits(userId)`: Check if user has available credits and return credit info
- `useCredit(userId)`: Consume one credit when assessment is created (increments `assessmentsUsed`)
- `addCredits(userId, amount)`: Add credits to user (for admin or additional purchases)
- `getCreditsDisplay(userId)`: Get formatted strings for UI display

#### License Type Handling:

- **TRIAL**: 1 free assessment
- **BASIC**: Pay-per-assessment (track with credits)
- **PROFESSIONAL**: Unlimited assessments
- **ENTERPRISE**: Unlimited assessments

## Next Steps

### 5. Update Assessment Creation Logic

Need to integrate the credits service when creating assessments:

```typescript
// Before creating assessment
const credits = await assessmentCreditsService.checkUserCredits(userId);
if (!credits.hasCredits) {
  throw new Error("No assessment credits available");
}

// Create assessment
...

// After successful creation
await assessmentCreditsService.useCredit(userId);
```

### 6. Create AssessmentLimitDialog Component

Build a UI dialog to show when user has no credits:

- Clear message about credit limit reached
- Display remaining/total credits
- "Purchase More Assessments" button linking to checkout
- Professional, conversion-optimized design

### 7. Add Limit Checks to Assessment Pages

Update these pages to check credits before allowing assessment creation:

- `/assessment/create`
- `/trial-assessment` (after trial is complete and they want a full assessment)
- Any other assessment entry points

### 8. Display Credits in UI

Show remaining credits in:

- Dashboard (prominent display)
- Settings/Billing page
- Assessment pages (before starting)
- Navigation/header (for easy reference)

## Usage Examples

### Check if User Can Take Assessment

```typescript
import { assessmentCreditsService } from "@/lib/services/assessment-credits-service";

const credits = await assessmentCreditsService.checkUserCredits(userId);
if (!credits.hasCredits) {
  // Show purchase dialog
  return <AssessmentLimitDialog credits={credits} />;
}
```

### Use a Credit When Creating Assessment

```typescript
try {
  // Check credits first
  const credits = await assessmentCreditsService.checkUserCredits(userId);
  if (!credits.hasCredits) {
    throw new Error("No credits available");
  }

  // Create the assessment
  const assessment = await createAssessment(...);

  // Consume the credit
  await assessmentCreditsService.useCredit(userId);

  return assessment;
} catch (error) {
  // Handle error
}
```

### Display Credits in Dashboard

```typescript
const display = await assessmentCreditsService.getCreditsDisplay(userId);

return (
  <div className="credits-display">
    <p>{display.text}</p>
    {display.showPurchase && (
      <Button href="/checkout-direct">Purchase More Assessments</Button>
    )}
  </div>
);
```

## Testing

### Test Scenarios:

1. **New User Purchase**: Buy $97 assessment → Should have 1 credit
2. **Use Credit**: Create assessment → Credit should decrement
3. **Multiple Purchases**: Buy 3 times → Should have 3 credits
4. **Limit Reached**: Try to create assessment with 0 credits → Should show dialog
5. **Professional User**: Should show "Unlimited" and not check credits
6. **Trial User**: Should have 1 free credit, then show purchase option

### Database Queries to Verify:

```sql
-- Check user's credits
SELECT
  ul.assessmentsAllowed,
  ul.assessmentsUsed,
  (ul.assessmentsAllowed - ul.assessmentsUsed) as remaining,
  l.type as license_type
FROM user_licenses ul
JOIN licenses l ON l.id = ul.licenseId
WHERE ul.userId = '[USER_ID]' AND ul.isActive = true;

-- Check all BASIC users with credits
SELECT
  u.email,
  ul.assessmentsAllowed,
  ul.assessmentsUsed,
  (ul.assessmentsAllowed - ul.assessmentsUsed) as remaining
FROM users u
JOIN user_licenses ul ON ul.userId = u.id
JOIN licenses l ON l.id = ul.licenseId
WHERE l.type = 'BASIC' AND ul.isActive = true;
```

## Benefits

✅ Prevents unlimited free assessments for BASIC users
✅ Clear monetization model (pay-per-assessment)
✅ Flexible system that works with all license types
✅ Easy to track and audit credit usage
✅ Can be extended for bulk purchases (e.g., buy 5 for $400)
✅ Provides upgrade path to PROFESSIONAL for unlimited access

## Future Enhancements

- Bulk credit purchase discounts (e.g., 5 for $400, 10 for $700)
- Credit expiration dates
- Credit transfer between users
- Gift credits to other users
- Admin panel to manually adjust credits
- Usage analytics and reporting
