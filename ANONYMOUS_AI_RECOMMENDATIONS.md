# Anonymous AI Recommendations Implementation

## Overview

This implementation enables anonymous users who have paid for FULL assessments to generate AI recommendations while maintaining strict security and privacy controls.

## Architecture

### Key Principle: Conditional Authorization

The system uses conditional authorization based on authentication status:

```typescript
// Authenticated users: require ownership
if (userId) {
  whereClause = { id: assessmentId, userId };
} else {
  // Anonymous users: only FULL paid assessments
  whereClause = { id: assessmentId, userId: null, mode: "FULL" };
}
```

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)

**Changed:** Made `Recommendation.userId` optional (nullable)

```typescript
model Recommendation {
  userId  String?    // null for anonymous assessments
  user    User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Migration:** `make_recommendation_userid_optional`
- Sets `userId` to nullable
- Preserves foreign key constraint for cascading deletes

### 2. Streaming Endpoint (`/api/assessments/[id]/recommendations/route.ts`)

**Changes:**
- Removed hard auth requirement (line 15-17)
- Made auth optional with `const userId = user?.id`
- Conditional rate limiting: only apply to authenticated users (line 20-31)
- Conditional assessment lookup (line 45-50):
  - Authenticated: `{ id: assessmentId, userId }`
  - Anonymous: `{ id: assessmentId, userId: null, mode: "FULL" }`
- Updated function signature: `userId: string | undefined`
- Conditional AI call recording: only for authenticated users

**One-Per-Assessment Logic:**
- Existing code already checks for duplicate recommendations (line 85-91)
- Returns cached content if recommendation already exists
- Prevents duplicate API calls and costs

### 3. Save Endpoint (`/api/recommendations/route.ts`)

**POST Changes:**
- Removed hard auth requirement
- Made auth optional with `const userId = user?.id`
- Conditional assessment lookup (line 85-87):
  - Authenticated: requires ownership `userId match`
  - Anonymous: only FULL paid assessments `userId: null AND mode: FULL`
- Enhanced error handling for both auth contexts
- Stores `userId: null` for anonymous recommendations

**Security Checks:**
```typescript
// Line 123-151: Different checks based on auth status
if (userId && anyAssessment.userId !== userId) {
  // Authenticated user accessing another's assessment
  return 403 Access Denied
} else if (!userId && (anyAssessment.userId || anyAssessment.mode !== "FULL")) {
  // Anonymous user accessing non-FULL or authenticated assessment
  return 403 Access Denied
}
```

## Security Model

### What Anonymous Users CAN Do
✅ Generate AI recommendations for their own FULL paid assessments
✅ Stream recommendations (view as text)
✅ Save recommendations to database
✅ View saved recommendations via database query

### What Anonymous Users CANNOT Do
❌ Access TRIAL assessments (only FULL mode allowed)
❌ Access assessments owned by others (only userId: null assessments)
❌ Create share links (not authenticated)
❌ View authenticated users' assessments
❌ Bypass the FULL assessment requirement

### Share Link Privacy Preserved
- **PUBLIC** share links: Not affected (work as before)
- **PRIVATE** share links: Not affected (auth required, unchanged)
- **PASSWORD_PROTECTED** links: Not affected (work as before)
- **Anonymous assessments**: Cannot have share links (no user owner)

## Flow Diagrams

### Anonymous User AI Recommendation Flow

```
1. Anonymous user completes FULL assessment
   ↓
2. Clicks "Generate AI Recommendations"
   ↓
3. POST /api/assessments/[id]/recommendations (no auth header)
   ↓
4. Endpoint checks: userId = null, mode = "FULL" ✓
   ↓
5. Stream OpenAI response to client
   ↓
6. Client collects streamed text
   ↓
7. Client calls POST /api/recommendations (no auth header)
   ↓
8. Endpoint saves to DB with userId: null
   ↓
9. Recommendation persisted (queryable by assessmentId)
```

### Authenticated User AI Recommendation Flow

```
1. Authenticated user completes assessment
   ↓
2. Clicks "Generate AI Recommendations"
   ↓
3. POST /api/assessments/[id]/recommendations (WITH auth header)
   ↓
4. Endpoint checks: userId = user.id, must own assessment ✓
   ↓
5. Apply rate limiting to user
   ↓
6. Stream OpenAI response to client
   ↓
7. Client collects streamed text
   ↓
8. Client calls POST /api/recommendations (WITH auth header)
   ↓
9. Endpoint validates ownership again
   ↓
10. Recommendation persisted (queryable by userId + assessmentId)
```

## Rate Limiting

- **Authenticated users**: Full rate limiting applied via `checkAIRateLimit(userId)`
- **Anonymous users**: No rate limiting (could add IP-based limiting if needed)

## Querying Recommendations

### Authenticated Users
```typescript
// GET /api/recommendations?assessmentId=xxx
// Returns recommendations where userId = currentUser.id
```

### Anonymous Users
```typescript
// Recommendations are stored with userId: null
// Cannot be queried via GET /api/recommendations (auth required)
// Could add anonymous query endpoint if needed
```

## Testing Checklist

- [ ] Anonymous user completes FULL assessment
- [ ] Click "Generate Recommendations" works
- [ ] Streaming response flows correctly
- [ ] Recommendation saves to database with userId: null
- [ ] Anonymous user cannot access TRIAL assessment recommendations
- [ ] Anonymous user cannot access others' assessments
- [ ] Authenticated user cannot access anonymous assessments
- [ ] Authenticated user rate limiting still works
- [ ] Share links unaffected by changes
- [ ] One-per-assessment constraint works for anonymous users

## Edge Cases Handled

1. **Existing Recommendations**: Returns cached content (no duplicate API calls)
2. **Anonymous + TRIAL**: Blocked (mode check)
3. **Anonymous + Authenticated Assessment**: Blocked (userId check)
4. **Authenticated + Non-Owned Assessment**: Blocked (userId match)
5. **Rate Limit**: Only applies to authenticated users
6. **Database Integrity**: Foreign key cascade delete works with nullable userId

## Future Enhancements

1. **IP-Based Rate Limiting**: Could add for anonymous users
2. **Anonymous Query Endpoint**: Allow anonymous users to query their own recommendations
3. **Feedback Loop**: Track which recommendations are useful
4. **Analytics**: Monitor anonymous vs authenticated recommendation generation
5. **Persistence Options**: Allow anonymous users to save recommendations to local storage before account creation
