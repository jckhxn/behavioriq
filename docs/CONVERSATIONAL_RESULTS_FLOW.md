# Conversational Assessment Results Flow

## Overview

This document describes how conversational assessment results are passed to the trial results page and how the checkout flow differs for registered vs. non-registered users.

## Flow Diagram

```
Conversational Assessment Complete
           ↓
   Store in localStorage
           ↓
   Redirect to /trial-results
           ↓
   Load from localStorage
           ↓
   Check User Session
           ↓
     ┌─────┴─────┐
     ↓           ↓
Registered    Anonymous
   User         User
     ↓           ↓
/checkout-   /register?
  direct     redirect=
           checkout
```

## Implementation Details

### 1. ConversationalAssessment Component

**Location:** `components/assessment/ConversationalAssessment.tsx`

When assessment completes:

```typescript
localStorage.setItem(
  "conversationalTrialResults",
  JSON.stringify({
    responses: completeData.responses,
    scores: completeData.scores,
    scoresByDomain: completeData.scoresByDomain,
    summary: completeData.summary,
    totalQuestions: completeData.totalQuestions,
    answeredQuestions: completeData.answeredQuestions,
    timestamp: new Date().toISOString(),
  })
);
```

### 2. TrialResults Component

**Location:** `components/trial/TrialResults.tsx`

**Data Sources:**

- **URL Parameters**: Regular trial assessment (existing flow)
- **localStorage**: Conversational assessment (new flow)

**Loading Logic:**

```typescript
useEffect(() => {
  // Try URL params first (regular trial)
  if (responsesStr) {
    // Parse and display results from URL
  } else {
    // Try localStorage (conversational trial)
    const storedResults = localStorage.getItem("conversationalTrialResults");
    if (storedResults) {
      // Parse and display results
      // Clear localStorage after loading
      localStorage.removeItem("conversationalTrialResults");
    }
  }
}, [searchParams]);
```

### 3. User Role Detection

**Uses:** `useSession()` from `next-auth/react`

**Checkout Button Logic:**

```typescript
{session?.user ? (
  // Registered user - direct to checkout
  <Link href="/checkout-direct">
    Get Your Full AI Report - $97
  </Link>
) : (
  // Anonymous user - register first
  <Link href="/register?source=trial&redirect=checkout">
    Get Your Full AI Report - $97
  </Link>
)}
```

### 4. Retake Assessment Button

Dynamically links back to appropriate assessment type:

```typescript
<Link href={results.isConversational ? "/conversational-trial" : "/trial-assessment"}>
  Retake Assessment
</Link>
```

## User Experience Flow

### For Anonymous Users (No Account)

1. Complete conversational assessment at `/conversational-trial`
2. See completion screen with redirect countdown
3. Arrive at `/trial-results` with results displayed
4. Click "Get Your Full AI Report - $97"
5. Redirected to `/register?source=trial&redirect=checkout`
6. After registration, redirected to checkout page

### For Registered Users (USER Role)

1. Complete conversational assessment at `/conversational-trial`
2. See completion screen with redirect countdown
3. Arrive at `/trial-results` with results displayed
4. Click "Get Your Full AI Report - $97"
5. Directly go to `/checkout-direct` (skip registration)
6. Complete purchase immediately

## Data Structure

### localStorage Format

```json
{
  "responses": {
    "att_1": true,
    "att_2": false
    // ... all question responses
  },
  "scores": {
    "attention": 85.5,
    "hyperactivity": 60.0,
    "emotional": 45.0
  },
  "scoresByDomain": {
    "attention": { "score": 4, "total": 5 },
    "hyperactivity": { "score": 3, "total": 5 },
    "emotional": { "score": 2, "total": 5 }
  },
  "summary": "# Assessment Results\n\n...",
  "totalQuestions": 15,
  "answeredQuestions": 15,
  "timestamp": "2025-10-01T12:34:56.789Z"
}
```

### Results Display

The `TrialResults` component calculates:

- **Total Indicators**: Number of questions with positive responses
- **Domain Breakdown**: Attention, Conduct, Emotional concerns
- **Risk Level**: Low, Moderate, or High based on positive responses
  - ≤2 positive: Low
  - 3-4 positive: Moderate
  - ≥5 positive: High

## Security & Privacy

- **localStorage Cleared**: Results removed after loading to avoid persistence
- **Session-Based**: Auth state checked server-side via NextAuth
- **No PII Stored**: Only assessment responses and scores in localStorage
- **Temporary Data**: Cleared on page load, browser close, or manual clear

## Testing Checklist

### Anonymous User Flow

- [ ] Complete conversational assessment
- [ ] Redirected to /trial-results
- [ ] Results display correctly
- [ ] CTA shows "Get Your Full AI Report" with register link
- [ ] Click CTA goes to /register
- [ ] After registration, redirected to checkout

### Registered User Flow

- [ ] Log in as USER role
- [ ] Complete conversational assessment
- [ ] Redirected to /trial-results
- [ ] Results display correctly
- [ ] CTA shows "Get Your Full AI Report" with direct checkout link
- [ ] Click CTA goes to /checkout-direct
- [ ] Can complete purchase

### Edge Cases

- [ ] Complete assessment, refresh /trial-results (should show "No Results")
- [ ] Complete assessment, clear localStorage manually (should show "No Results")
- [ ] Complete assessment, log out mid-flow (should still show results)
- [ ] "Retake Assessment" links to correct assessment type

## Related Files

- `components/assessment/ConversationalAssessment.tsx` - Stores results
- `components/trial/TrialResults.tsx` - Loads and displays results
- `app/conversational-trial/page.tsx` - Conversational assessment page
- `app/trial-results/page.tsx` - Results page wrapper
- `app/checkout-direct/page.tsx` - Direct checkout for registered users
- `app/register/page.tsx` - Registration with redirect support

## API Endpoints

- `POST /api/assessment/conversational/start` - Start assessment session
- `POST /api/assessment/conversational/message` - Process user messages
- `POST /api/assessment/conversational/complete` - Complete and score assessment

## Future Enhancements

1. **Store in Database**: Save conversational results to user profile
2. **Email Report**: Send summary via email after completion
3. **Compare Results**: Show comparison between conversational and regular trial
4. **Progress Tracking**: Track user progress across sessions
5. **A/B Testing**: Compare conversion rates between flows
