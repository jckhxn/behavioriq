# Supabase Full Migration Guide

**Decision:** Migrate entire application to Supabase (database + authentication)

**Goal:** Unified platform handling both PostgreSQL database and authentication with magic links, password resets, and session management.

---

## 📋 Migration Overview

### Current Stack

- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with credentials provider
- **Vector Search:** pgvector extension for document embeddings
- **File Storage:** Local file system

### Target Stack

- **Database:** Supabase PostgreSQL with Prisma ORM
- **Auth:** Supabase Auth (replaces NextAuth)
- **Vector Search:** Supabase pgvector extension
- **File Storage:** Supabase Storage (optional upgrade)

---

## 🎯 Migration Steps

### Phase 1: Supabase Project Setup (30 minutes)

#### 1.1 Create Supabase Project

```bash
# Go to: https://supabase.com/dashboard
# Click "New Project"
# Choose organization (or create one)
# Project details:
#   - Name: ai-diagnostic-prod
#   - Database Password: [Generate strong password - SAVE THIS!]
#   - Region: [Choose closest to your users]
#   - Pricing Plan: Free (to start) or Pro
```

#### 1.2 Get Your Credentials

Navigate to: **Project Settings** (gear icon) → **API**

Copy these values:

```
Project URL:          https://xxxxx.supabase.co
anon (public) key:    eyJhbGciOi... (safe for client-side)
service_role key:     eyJhbGciOi... (NEVER expose - server only!)
```

#### 1.3 Get Database Connection String

Navigate to: **Project Settings** → **Database** → **Connection String** → **URI**

```
Connection string:    postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

#### 1.4 Update Environment Variables

```bash
# .env.local (add these, keep existing for now)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Database (new Supabase database URL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keep your existing variables:
# - OPENAI_API_KEY
# - STRIPE_SECRET_KEY
# - NEXTAUTH_SECRET (we'll migrate away from this)
```

---

### Phase 2: Database Migration (1 hour)

#### 2.1 Enable Required Extensions

Navigate to: **Database** → **Extensions** → Search and enable:

- ✅ `pgvector` (for document embeddings)
- ✅ `uuid-ossp` (if using UUIDs)

#### 2.2 Run Prisma Migrations

```bash
# Generate Prisma client with new connection
npx prisma generate

# Push your schema to Supabase
npx prisma db push

# Or run migrations (recommended for production)
npx prisma migrate deploy
```

**Expected Output:**

```
✔ Generated Prisma Client
✔ Applied migrations:
  - 20240101000000_initial_migration
  - 20240102000000_add_embeddings
  - [... all your migrations]
```

#### 2.3 Verify Schema

```bash
# Open Prisma Studio to see empty tables
npx prisma studio

# Or check in Supabase:
# Dashboard → Table Editor
```

You should see all your tables:

- users
- assessments
- scores
- documents
- chat_messages
- user_licenses
- etc.

---

### Phase 3: Data Migration (30 minutes - 2 hours depending on data size)

#### 3.1 Export Current Data

```bash
# From your OLD database, export all data
pg_dump $OLD_DATABASE_URL > backup.sql

# Or export specific tables
pg_dump $OLD_DATABASE_URL \
  --table=users \
  --table=assessments \
  --table=scores \
  --table=documents \
  --data-only \
  --inserts \
  > data_export.sql
```

#### 3.2 Clean Export (Remove Auth-Related Data)

Since we're moving to Supabase Auth, we need to handle users specially:

```bash
# Create a migration script
node scripts/migrate-to-supabase.js
```

Create `scripts/migrate-to-supabase.js`:

```javascript
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");

// OLD database
const oldPrisma = new PrismaClient({
  datasources: { db: { url: process.env.OLD_DATABASE_URL } },
});

// NEW Supabase database
const newPrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// Supabase client for auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateUsers() {
  console.log("Migrating users...");
  const users = await oldPrisma.user.findMany();

  for (const user of users) {
    try {
      // Create user in Supabase Auth
      const { data: authUser, error } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
          legacy_id: user.id, // Keep old ID for reference
        },
      });

      if (error) {
        console.error(`Failed to create auth user ${user.email}:`, error);
        continue;
      }

      // Create user record in database with SAME ID as auth user
      await newPrisma.user.create({
        data: {
          id: authUser.user.id, // Use Supabase auth ID
          email: user.email,
          name: user.name,
          password: "", // No longer needed with Supabase auth
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          organizationId: user.organizationId,
          parentUserId: user.parentUserId,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
          onboardingSkipped: user.onboardingSkipped,
        },
      });

      console.log(`✓ Migrated user: ${user.email}`);
    } catch (err) {
      console.error(`Failed to migrate ${user.email}:`, err.message);
    }
  }
}

async function migrateData() {
  console.log("Migrating assessments...");
  const assessments = await oldPrisma.assessment.findMany();
  // ... migrate other tables

  console.log("✓ Migration complete!");
}

async function main() {
  await migrateUsers();
  await migrateData();
  await oldPrisma.$disconnect();
  await newPrisma.$disconnect();
}

main().catch(console.error);
```

Run migration:

```bash
OLD_DATABASE_URL="your-old-db-url" \
DATABASE_URL="your-new-supabase-url" \
node scripts/migrate-to-supabase.js
```

#### 3.3 Verify Data Migration

```bash
# Check record counts
npx prisma studio

# Or SQL query
psql $DATABASE_URL -c "SELECT 'users' as table, COUNT(*) FROM users
UNION ALL SELECT 'assessments', COUNT(*) FROM assessments
UNION ALL SELECT 'scores', COUNT(*) FROM scores;"
```

---

### Phase 4: Authentication Migration (2-3 hours)

#### 4.1 Configure Supabase Auth

Navigate to: **Authentication** → **Providers**

**Enable Email Provider:**

- ✅ Enable Email provider
- ✅ Confirm email: **Enabled** (recommended)
- ✅ Secure email change: **Enabled**
- ✅ Secure password change: **Enabled**

**Configure URLs:**
Navigate to: **Authentication** → **URL Configuration**

```
Site URL:              http://localhost:3000
Redirect URLs:         http://localhost:3000/auth/callback
                       http://localhost:3000/api/auth/callback
```

**Email Templates:**
Navigate to: **Authentication** → **Email Templates**

Customize:

- Confirmation email
- Magic link email
- Password reset email
- Email change confirmation

#### 4.2 Update Prisma Schema

```prisma
model User {
  id              String           @id // Remove @default(cuid())
  email           String           @unique
  name            String?
  // Remove password field - Supabase handles this
  // password     String
  role            Role             @default(USER)
  // ... rest stays the same
}
```

```bash
# Push schema changes
npx prisma db push
```

#### 4.3 Replace NextAuth with Supabase Auth

**Remove NextAuth files:**

```bash
rm -rf app/api/auth/[...nextauth]
rm lib/auth/config.ts
```

**Create new Supabase auth callback:**

```typescript
// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard or home
  return NextResponse.redirect(requestUrl.origin + "/dashboard");
}
```

**Update middleware:**

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/assessments/:path*",
    "/api/:path*",
  ],
};
```

#### 4.4 Create Auth UI Components

**Login Form:**

```typescript
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }

    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setError('Check your email for the magic link!')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleMagicLink}
        disabled={loading || !email}
      >
        <Mail className="mr-2 h-4 w-4" />
        Send Magic Link
      </Button>
    </div>
  )
}
```

**Sign Up Form:**

```typescript
// components/auth/SignUpForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'USER',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setError('Check your email to confirm your account!')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-3">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
```

#### 4.5 Update Auth Checks Throughout App

**Server Components:**

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  return <div>Welcome {dbUser?.name}!</div>
}
```

**API Routes:**

```typescript
// app/api/assessments/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
  const assessments = await prisma.assessment.findMany({
    where: { userId: user.id },
  });

  return NextResponse.json(assessments);
}
```

**Client Components:**

```typescript
// components/UserMenu.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
```

---

### Phase 5: Row Level Security (RLS) - IMPORTANT! (1-2 hours)

Supabase requires Row Level Security for data protection.

#### 5.1 Enable RLS on All Tables

```sql
-- Run in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables
```

#### 5.2 Create RLS Policies

**Users Table:**

```sql
-- Users can read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
```

**Assessments Table:**

```sql
-- Users can view their own assessments
CREATE POLICY "Users can view own assessments"
ON assessments FOR SELECT
USING (auth.uid() = "userId");

-- Users can create their own assessments
CREATE POLICY "Users can create own assessments"
ON assessments FOR INSERT
WITH CHECK (auth.uid() = "userId");

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
ON assessments FOR UPDATE
USING (auth.uid() = "userId");

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
ON assessments FOR DELETE
USING (auth.uid() = "userId");
```

**Similar policies for other tables...**

#### 5.3 Service Role Bypass

Your API routes using `SUPABASE_SERVICE_ROLE_KEY` will bypass RLS automatically.

---

### Phase 6: Testing (2-3 hours)

#### 6.1 Test Authentication

- [ ] Sign up new user
- [ ] Confirm email
- [ ] Login with password
- [ ] Login with magic link
- [ ] Password reset flow
- [ ] Sign out

#### 6.2 Test Core Features

- [ ] Create assessment
- [ ] Complete assessment
- [ ] View results
- [ ] Generate PDF report
- [ ] Share assessment link
- [ ] Document upload and search

#### 6.3 Test Payments

- [ ] Stripe webhook delivery to new deployment
- [ ] Purchase assessment
- [ ] Subscribe to plan
- [ ] Cancel subscription

#### 6.4 Test Admin Features

- [ ] Admin dashboard access
- [ ] User management
- [ ] License assignment
- [ ] Assessment templates

---

### Phase 7: Deployment (1 hour)

#### 7.1 Update Production Environment Variables

In your hosting platform (Vercel, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### 7.2 Update Supabase Auth URLs

Navigate to: **Authentication** → **URL Configuration**

```
Site URL:              https://yourdomain.com
Redirect URLs:         https://yourdomain.com/auth/callback
                       https://yourdomain.com/api/auth/callback
```

#### 7.3 Deploy

```bash
git add .
git commit -m "Migrate to Supabase"
git push origin main

# Or manual deploy
npm run build
```

---

## 🚨 Rollback Plan

If something goes wrong:

### 1. Revert Environment Variables

```bash
# Switch back to old DATABASE_URL
DATABASE_URL=your-old-database-url
```

### 2. Revert Auth

```bash
# Restore NextAuth files from git
git checkout HEAD~1 -- app/api/auth
git checkout HEAD~1 -- lib/auth
git checkout HEAD~1 -- middleware.ts
```

### 3. Redeploy

```bash
npm run build
# Deploy to production
```

---

## 📊 Migration Checklist

### Pre-Migration

- [ ] Backup current database
- [ ] Document all environment variables
- [ ] Test backup restoration
- [ ] Notify users of maintenance window

### Supabase Setup

- [ ] Create Supabase project
- [ ] Save all credentials securely
- [ ] Enable pgvector extension
- [ ] Configure auth providers

### Database Migration

- [ ] Run Prisma migrations on Supabase
- [ ] Verify schema in Supabase dashboard
- [ ] Migrate user data
- [ ] Migrate assessment data
- [ ] Migrate all other tables
- [ ] Verify record counts match

### Authentication Migration

- [ ] Create Supabase auth utilities
- [ ] Update Prisma schema (remove password)
- [ ] Create auth UI components
- [ ] Update middleware
- [ ] Replace NextAuth checks with Supabase checks
- [ ] Test login flows

### Security

- [ ] Enable RLS on all tables
- [ ] Create RLS policies for each table
- [ ] Test service role key access
- [ ] Verify user data isolation

### Testing

- [ ] Test signup/login flows
- [ ] Test magic links
- [ ] Test password reset
- [ ] Test all assessment features
- [ ] Test payments and webhooks
- [ ] Test admin features
- [ ] Test in production-like environment

### Deployment

- [ ] Update production env variables
- [ ] Update Supabase redirect URLs
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Test critical paths in production

### Post-Migration

- [ ] Monitor for 24 hours
- [ ] Check error rates
- [ ] Verify user signups working
- [ ] Verify payments processing
- [ ] Send announcement email to users

---

## ⏱️ Estimated Timeline

**Total Time: 8-12 hours**

- Phase 1 (Setup): 30 minutes
- Phase 2 (Database): 1 hour
- Phase 3 (Data Migration): 30 min - 2 hours
- Phase 4 (Auth Migration): 2-3 hours
- Phase 5 (RLS): 1-2 hours
- Phase 6 (Testing): 2-3 hours
- Phase 7 (Deployment): 1 hour

**Recommended Approach:**

- Day 1: Phases 1-3 (Setup + Database + Data)
- Day 2: Phase 4 (Auth Migration)
- Day 3: Phases 5-6 (RLS + Testing)
- Day 4: Phase 7 (Deployment)

---

## 💡 Pro Tips

1. **Use Supabase Database Backups**
   - Enable automatic daily backups in Supabase
   - Download manual backup before major changes

2. **Test with a Clone First**
   - Create a second Supabase project for staging
   - Test entire migration on staging before production

3. **Gradual Rollout**
   - Deploy to staging first
   - Test with a few beta users
   - Monitor for 24-48 hours before full rollout

4. **Keep Service Role Key Secret**
   - Never commit to git
   - Only use in server-side code
   - Rotate regularly

5. **Email Provider for Production**
   - Supabase built-in email works for testing
   - Use Resend or SendGrid for production
   - Configure SMTP in Supabase settings

---

## 🆘 Troubleshooting

### Problem: Migrations fail with "relation already exists"

```bash
# Reset and rerun
npx prisma migrate reset
npx prisma migrate deploy
```

### Problem: RLS blocking all queries

```bash
# Check policies in SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'users';

# Temporarily disable RLS for debugging (DON'T DO IN PRODUCTION)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Problem: Auth callback not working

Check:

- Redirect URLs match exactly in Supabase dashboard
- `NEXT_PUBLIC_SITE_URL` is correct
- Callback route exists at `/auth/callback`

### Problem: Service role key not bypassing RLS

Make sure you're using the server client with service role:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Not anon key!
);
```

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)

---

**Ready to start? Begin with Phase 1: Supabase Project Setup** ☝️
