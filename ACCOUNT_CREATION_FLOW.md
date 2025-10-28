# Account Creation & Assessment Linking Feature

## Overview

This feature enables anonymous users who completed a paid full assessment to create an account and automatically link their assessment results to their new account. This improves user retention and creates a seamless trial-to-premium conversion path.

## User Flow

### Step 1: Complete Assessment
- Anonymous user starts trial assessment
- Sees limited set of trial questions (marked with `isTrial: true` flag)
- User wants more information, clicks "Upgrade to Full Assessment"
- Completes payment via Stripe (assessment mode: TRIAL → FULL)
- Completes remaining full assessment questions
- Assessment marked as COMPLETED when user answers all questions

### Step 2: View Results
- Anonymous user redirected to `/assessment/<id>` to view results
- AssessmentCompletion component detects `user === null` (anonymous)
- **"Create Account & Save Results"** button appears prominently in green
- Button says: "Create Account & Save Results" with user and arrow icons

### Step 3: Create Account
- User clicks button, redirected to `/register?assessmentId=<id>`
- Register page recognizes `assessmentId` parameter
- Form heading changes to: "Save your assessment results by creating an account"
- User fills in: Name, Email, Password, Confirm Password
- User clicks "Create account"

### Step 4: Account Linking
- Supabase creates new user account
- `/api/assessment/link-to-user` endpoint is called automatically
- Assessment `userId` field updated from `null` to new user's ID
- Toast notification: "Assessment linked to your account!"

### Step 5: Email Confirmation
- User sees: "Check Your Email" confirmation page
- Instructions to click email confirmation link
- Message: "After confirming your email, you'll be redirected to view your assessment results"
- Button: "Return to Login" (or auto-redirect after confirmation)

### Step 6: Access Results
- User confirms email
- Redirected to `/assessment/<id>` with authenticated user
- Results now load with full dashboard access
- Assessment appears in user's dashboard for future reference

## Component Changes

### 1. AssessmentCompletion Component
**File:** `components/assessment/AssessmentCompletion.tsx`

**New Props:**
```typescript
interface AssessmentCompletionProps {
  assessmentId: string;
  subjectName: string;
  aiRecommendations?: string;
  isAnonymous?: boolean;  // NEW: Detects if user is anonymous
}
```

**New Button:**
```typescript
{isAnonymous && (
  <Button
    onClick={() => window.location.href = `/register?assessmentId=${assessmentId}`}
    className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white"
  >
    <UserPlus className="h-4 w-4 mr-2" />
    Create Account & Save Results
    <ArrowRight className="h-4 w-4 ml-2" />
  </Button>
)}
```

**Location:** Export & Share card, first button when anonymous

### 2. Assessment Page
**File:** `app/assessment/[id]/page.tsx`

**Change:**
```typescript
<AssessmentCompletion
  assessmentId={assessmentId}
  subjectName={assessment.subjectName}
  isAnonymous={!user}  // NEW: Pass user auth status
/>
```

**Applied to:**
- Conversational assessment results (line 143-147)
- Regular assessment results (line 179-183)

## API Endpoint

### POST /api/assessment/link-to-user

**Location:** `app/api/assessment/link-to-user/route.ts`

**Purpose:** Transfer assessment ownership from anonymous user to new account

**Request:**
```json
{
  "assessmentId": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "assessment": {
    "id": "string",
    "userId": "string",  // Now contains user ID
    ...
  },
  "message": "Assessment successfully linked to your account"
}
```

**Response (Error):**
```json
{
  "error": "Assessment not found or already linked to a user"
}
```

**Security:**
- Requires authenticated user (`getCurrentUserWithRole()`)
- Only processes assessments with:
  - `userId: null` (truly anonymous)
  - `mode: "FULL"` (prevents trial hijacking)
- Returns 401 if not authenticated
- Returns 404 if assessment doesn't exist or conditions not met

**Error Handling:**
- If linking fails after registration, user can still access assessment
- Toast warning shown: "Account created but couldn't link assessment. You can access it from your dashboard."
- Non-fatal error - doesn't block account creation

## Register Page Updates

**File:** `app/(auth)/register/page.tsx`

**New Features:**

1. **Assessment ID Detection:**
   ```typescript
   const assessmentId = searchParams.get("assessmentId");
   if (assessmentId) {
     setAssessmentId(assessmentId);
     setHasCompletedTrial(true);
   }
   ```

2. **Conditional Form Description:**
   ```typescript
   <CardDescription>
     {assessmentId
       ? "Save your assessment results by creating an account"
       : "Sign up to access AI-powered behavioral assessments"}
   </CardDescription>
   ```

3. **Automatic Assessment Linking:**
   ```typescript
   // After successful Supabase signup
   if (assessmentId) {
     await linkAssessmentToUser();
   }
   ```

4. **Post-Confirmation Redirect:**
   ```typescript
   if (assessmentId) {
     setTimeout(() => {
       router.push(`/assessment/${assessmentId}`);
     }, 3000);
   }
   ```

5. **Dynamic UI Updates:**
   - Hide "Take a free trial" link when coming from assessment
   - Show assessment context in success page
   - Disable inputs during linking operation

## Database Impact

**Assessment Table:**
- `userId` field updated from `null` to user ID
- `mode` remains `"FULL"` (unchanged)
- `status` remains `"COMPLETED"` (unchanged)
- All assessment data (scores, recommendations) stays the same

**Example:**
```sql
-- Before
id: cmh9k1mh7008donl0mokqnmx1
userId: null
mode: FULL
status: COMPLETED

-- After (user creates account)
id: cmh9k1mh7008donl0mokqnmx1
userId: 550e8400-e29b-41d4-a716-446655440000
mode: FULL
status: COMPLETED
```

## Error Handling

### Linking Fails
```typescript
toast.warning(
  "Account created but couldn't link assessment. You can access it from your dashboard."
);
```

**Why this is OK:**
- User's account is already created
- Assessment is still accessible via direct ID `/assessment/<id>`
- Can be added to dashboard later if needed
- User can still view and download results

### Assessment Already Linked
- API returns 404: "Assessment not found or already linked to a user"
- Registration still completes successfully
- User can access assessment from dashboard

### Missing Assessment ID
- Defaults to standard registration flow
- User registers normally
- No assessment linking attempted
- User redirected to dashboard per normal flow

## Authorization Pattern

**For Accessing Assessments:**

```typescript
if (user) {
  // Authenticated: Check ownership
  assessment = await getAssessmentByIdentifier(assessmentId, user.id);
} else {
  // Anonymous: Only allow FULL paid assessments with no owner
  assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      userId: null,        // Must be anonymous
      mode: "FULL",        // Must be paid
    },
  });
}
```

**After Account Creation:**
- User authenticates with email/password
- Same assessment now belongs to user (`userId` set)
- User can access via authenticated path (owns it)
- Can view from dashboard, share link, etc.

## Testing Checklist

### Anonymous Flow
- [ ] Start trial assessment without login
- [ ] Complete trial questions
- [ ] Click "Upgrade to Full Assessment"
- [ ] Complete payment successfully
- [ ] Complete remaining full questions
- [ ] See "Assessment Complete!" with green success card
- [ ] See "Create Account & Save Results" button

### Account Creation
- [ ] Click "Create Account & Save Results"
- [ ] Redirected to `/register?assessmentId=<id>`
- [ ] Form description says "Save your assessment results..."
- [ ] Fill in registration form
- [ ] See validation errors if needed
- [ ] Submit form successfully
- [ ] See "Check Your Email" confirmation page

### Assessment Linking
- [ ] Toast shows "Assessment linked to your account!"
- [ ] Or warning if linking fails (non-fatal)
- [ ] Account created successfully either way

### Post-Registration
- [ ] Check email for confirmation link
- [ ] Click confirmation link
- [ ] Redirected to assessment results
- [ ] Assessment appears in user's dashboard
- [ ] Can download PDF, share, etc.

### Error Cases
- [ ] Register without required fields → form validation errors
- [ ] Password mismatch → password error
- [ ] Password too short → length validation
- [ ] Email already exists → Supabase error
- [ ] Linking fails → warning toast, account still created

## Technical Details

### Flow Diagram
```
Anonymous User
    ↓
Takes Trial → Upgrades → Completes Full Assessment
    ↓
Sees Results Page (isAnonymous=true)
    ↓
Clicks "Create Account & Save Results"
    ↓
Redirected: /register?assessmentId=<id>
    ↓
Creates Account (Supabase Auth)
    ↓
POST /api/assessment/link-to-user
    ↓
Update Assessment: userId = user.id
    ↓
Check Email Page
    ↓
Confirm Email
    ↓
Redirected: /assessment/<id>
    ↓
Now Authenticated, Can Access Results
    ↓
Assessment in Dashboard
```

### Related Files Modified
- `components/assessment/AssessmentCompletion.tsx` - Added isAnonymous prop and button
- `app/assessment/[id]/page.tsx` - Pass isAnonymous to component
- `app/(auth)/register/page.tsx` - Handle assessmentId parameter
- `app/api/assessment/link-to-user/route.ts` - New endpoint

### Authorization Changes
Both `/api/assessments/[id]/route.ts` and `/api/assessments/[id]/scores/route.ts` already updated to:
1. Allow authenticated users to access their own assessments
2. Allow anonymous users to access FULL mode assessments with `userId: null`
3. Block all other access patterns

## Benefits

1. **Improved Conversion:** Trial → Premium → Account creation in one smooth flow
2. **Better Retention:** Users don't lose results when creating account
3. **Reduced Friction:** No second payment flow needed
4. **User Trust:** Results are preserved and immediately accessible
5. **Dashboard Integration:** Assessment automatically appears in user's account
6. **Analytics:** Can track conversion metrics with assessment linking
7. **Security:** Only allows linking truly anonymous assessments, prevents fraud

## Future Enhancements

1. **Email Verification:** Send assessment link in confirmation email
2. **Dashboard Tour:** Show new user their assessment on first login
3. **Sharing:** Allow user to share assessment results with others
4. **Bulk Operations:** Link multiple assessments if user has several
5. **Analytics:** Track conversion funnel from trial → paid → account
6. **Recommendation Emails:** Send AI recommendations to user's email after confirmation
