# NextAuth to Supabase Migration - Code Update Guide

This document explains how to replace all NextAuth usage with Supabase Auth throughout the codebase.

## ✅ Completed

- [x] Middleware updated to Supabase
- [x] Auth routes created (callback, confirm, reset-password)
- [x] API auth endpoints created (signup, signin, signout, magic-link, forgot-password)
- [x] Login page updated
- [x] Register page updated
- [x] Forgot password page created
- [x] Root layout SessionProvider removed
- [x] Supabase hooks created (useUser, useUserData, useSignOut)
- [x] User API endpoint created (/api/user/me)

## 🔄 In Progress

### Client Components (Using `useSession`)

**Pattern to Replace:**

```tsx
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
const user = session?.user;
```

**Replace With:**

```tsx
import { useUser } from "@/lib/hooks/use-supabase-user";

const { user, isLoading } = useUser();
// user.email, user.id are available directly
```

**Or for full user data with role:**

```tsx
import { useUserData } from "@/lib/hooks/use-supabase-user";

const { userData, isLoading } = useUserData();
// userData.role, userData.name, etc.
```

**Files to Update (19 files):**

- [ ] `/app/trial-checkout/page.tsx`
- [ ] `/components/trial/TrialResults.tsx`
- [ ] `/app/assessment/new/page.tsx`
- [ ] `/components/assessment/AssessmentsView.tsx`
- [ ] `/app/checkout-direct/page.tsx`
- [ ] `/app/page.tsx` (also has signOut)
- [ ] `/components/settings/SettingsPane.tsx`
- [ ] `/components/chat/AssessmentChat.tsx`
- [ ] `/components/trial/TrialAssessment.tsx`
- [ ] `/components/dashboard/UserDashboard.tsx`
- [ ] `/components/assessment/AssessmentDetailSidebar.tsx`
- [ ] `/components/admin/SuperAdminPanel.tsx`
- [ ] `/components/chat/UnifiedChat.tsx`
- [ ] `/app/admin/page.tsx`
- [ ] `/app/assessment/[id]/page.tsx`
- [ ] `/app/payment/page.tsx`

### Server Components & API Routes (Using `auth()`)

**Pattern to Replace:**

```tsx
import { auth } from "@/lib/auth/config";

const session = await auth();
const userId = session?.user?.id;
const userEmail = session?.user?.email;
```

**Replace With:**

```tsx
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

const user = await getCurrentUserWithRole();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = user.id;
const userEmail = user.email;
const userRole = user.role;
```

**Files to Update (30+ files):**

#### API Routes (Need auth check)

- [ ] `/app/api/user/credits/route.ts`
- [ ] `/app/api/assessments/route.ts`
- [ ] `/app/api/stripe/checkout/route.ts`
- [ ] `/app/api/subscription/pause/route.ts`
- [ ] `/app/api/subscription/change-tier/route.ts`
- [ ] `/app/api/subscription/cancel/route.ts`
- [ ] `/app/api/user/onboarding-status/route.ts`
- [ ] `/app/api/user/onboarding-complete/route.ts`
- [ ] `/app/api/user/onboarding-skip/route.ts`
- [ ] `/app/api/user/onboarding-progress/route.ts`
- [ ] `/app/api/user/onboarding-checklist/route.ts`
- [ ] `/app/api/assessments/[id]/messages/route.ts`
- [ ] `/app/api/assessments/[id]/route.ts`
- [ ] `/app/api/share/[code]/route.ts`
- [ ] `/app/api/assessment/conversational/start/route.ts`
- [ ] `/app/api/assessments/[id]/pdf/route.ts`
- [ ] `/app/api/admin/licenses/route.ts`
- [ ] `/app/api/share/route.ts`
- [ ] `/app/api/recommendations/route.ts`
- [ ] `/app/api/debug/create-mock-conversational/route.ts`
- [ ] `/app/api/recommendations/[id]/route.ts`
- [ ] `/app/api/stripe/checkout-enhanced/[assessmentId]/route.ts`
- [ ] `/app/api/admin/analytics/route.ts`
- [ ] `/app/api/admin/sub-accounts/[id]/reset-password/route.ts`
- [ ] `/app/api/emails/assessment-report/route.ts`

#### Server Components

- [ ] `/app/settings/page.tsx`

#### Other Files

- [ ] `/lib/licensing/middleware.ts`

## 📦 Sign Out Pattern

**Old:**

```tsx
import { signOut } from "next-auth/react";
await signOut();
```

**New:**

```tsx
import { useSignOut } from "@/lib/hooks/use-supabase-user";
const { signOut } = useSignOut();
await signOut();
```

## 🗑️ Files to Delete

- [ ] `/lib/auth/config.ts` - Old NextAuth configuration
- [ ] `/app/api/auth/[...nextauth]/route.ts` - Old NextAuth API route (if exists)

## ⚙️ Migration Strategy

### Option 1: Automated Script (Recommended)

Create a migration script to:

1. Find all `useSession` imports
2. Replace with `useUser` or `useUserData`
3. Update variable names
4. Fix all type references

### Option 2: Manual Updates

Update files one by one:

1. Update client components first (test each one)
2. Update API routes next
3. Update server components
4. Delete old files
5. Run full test suite

## 🧪 Testing Checklist

After migration, test:

- [ ] Login with email/password
- [ ] Login with magic link
- [ ] Sign up
- [ ] Password reset
- [ ] Sign out
- [ ] Protected routes redirect to login
- [ ] User data loads correctly in all components
- [ ] Admin routes check role properly
- [ ] Assessment creation works
- [ ] Payment flow works
- [ ] All API endpoints authenticate correctly

## 🔍 Search Commands

Find remaining NextAuth references:

```bash
# Find useSession usage
grep -r "useSession" --include="*.tsx" --include="*.ts" .

# Find auth() usage
grep -r "from \"@/lib/auth/config\"" --include="*.tsx" --include="*.ts" .

# Find signOut usage
grep -r "from \"next-auth/react\"" --include="*.tsx" --include="*.ts" .
```

## 📝 Common Patterns

### Pattern 1: Simple Auth Check

```tsx
// Before
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// After
const user = await getCurrentUserWithRole();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Pattern 2: Role Check

```tsx
// Before
const session = await auth();
if (session?.user?.role !== "SUPER_ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// After
const user = await getCurrentUserWithRole();
if (!user || user.role !== "SUPER_ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Pattern 3: Client Component Auth

```tsx
// Before
const { data: session, status } = useSession();
if (status === "loading") return <div>Loading...</div>;
if (!session) return <div>Please sign in</div>;

// After
const { user, isLoading } = useUser();
if (isLoading) return <div>Loading...</div>;
if (!user) return <div>Please sign in</div>;
```

### Pattern 4: Full User Data

```tsx
// Before
const session = await auth();
const userId = session?.user?.id;
const userEmail = session?.user?.email;
const userName = session?.user?.name;

// After
const user = await getCurrentUserWithRole();
const userId = user?.id;
const userEmail = user?.email;
const userName = user?.name;
const userRole = user?.role; // Bonus: now available!
```

## 🚨 Important Notes

1. **User IDs Changed**: Old CUID IDs are now Supabase UUIDs. Migration script already handled this for existing data.

2. **Session Structure**: Supabase User object is different from NextAuth Session:
   - `session.user.id` → `user.id`
   - `session.user.email` → `user.email`
   - No `session.user.name` in Supabase User (use `getCurrentUserWithRole()` to get name from database)

3. **Error Handling**: Supabase auth errors are different. Check `error.message` for details.

4. **Middleware**: Already updated. All route protection now uses Supabase.

5. **Email Confirmation**: New signups require email confirmation (unless disabled in Supabase dashboard).

## 📊 Progress Tracking

Run this command to count remaining NextAuth references:

```bash
grep -r "from \"next-auth" --include="*.tsx" --include="*.ts" . | wc -l
```

Target: 0 references

Current: ~40+ references (need to update)
