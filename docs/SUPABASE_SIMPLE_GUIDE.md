# Supabase Auth - Simplified Setup

## Why Supabase?

**Just for these 2 features:**

1. ✉️ **Magic Links** - Passwordless login via email
2. 🔑 **Password Reset** - Easy password recovery

You keep your existing auth, just add these features on top!

---

## Quick Setup (10 minutes)

### Step 1: Create Supabase Project (3 min)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `ai-diagnostic`
   - **Database Password**: (save this - you won't need it often)
   - **Region**: Choose closest to you
4. Wait 2 minutes for it to initialize

### Step 2: Get Your Keys (1 min)

1. In your Supabase project, go to **Settings** (gear icon bottom left)
2. Click **API**
3. You'll see two sections:

**Project API keys:**

- Copy the **URL** (starts with `https://`)
- Copy the **anon** **public** key (long string starting with `eyJ...`)

**⚠️ Note:** The service role key is below, but **you don't need it** for basic magic links and password reset! Skip it for now.

4. Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Configure Email Auth (2 min)

1. Go to **Authentication** (in left sidebar)
2. Click **Providers** tab
3. Find **Email** and toggle it ON
4. Done! (Default settings work fine)

### Step 4: Set Redirect URLs (2 min)

1. Still in **Authentication**, click **URL Configuration** tab
2. Set **Site URL**: `http://localhost:3000`
3. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   ```
4. Click **Save**

### Step 5: Test It! (2 min)

1. Start your dev server: `npm run dev`
2. The code is already installed, now just create a simple test page

---

## Super Simple Test Page

Create `app/test-magic-link/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestMagicLink() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return <div className="p-8">Check your email! 📧</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Magic Link</h1>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={sendMagicLink}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send Magic Link
      </button>
    </div>
  );
}
```

Create `app/auth/callback/route.ts`:

```tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

**Test it:**

1. Visit http://localhost:3000/test-magic-link
2. Enter your email
3. Check your inbox
4. Click the link
5. You should be redirected to dashboard

---

## That's It!

Now you have:

- ✅ Magic link login working
- ✅ Email system configured
- ✅ Ready to add password reset

## Add to Your Existing Login Page

Just add this component to your login page:

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MagicLinkOption() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Or sign in with email:</p>
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        onClick={handleMagicLink}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </Button>
    </div>
  );
}
```

---

## Password Reset (Even Simpler!)

Add to your login page:

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    const supabase = createClient();

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    alert("Check your email for reset link!");
  };

  return (
    <div className="space-y-2">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleReset} variant="ghost" className="w-full">
        Forgot Password?
      </Button>
    </div>
  );
}
```

---

## Production (When Ready)

**Email Sending:**

Free tier: 4 emails/hour (fine for testing)

For production, set up **Resend** (5 minutes):

1. Go to https://resend.com (free tier: 3,000 emails/month)
2. Add domain or use their test domain
3. In Supabase: **Settings** > **Auth** > **SMTP Settings**
4. Add Resend SMTP credentials

---

## FAQ

**Q: Do I need the service role key?**
A: No! Not for basic magic links and password reset. Only needed for advanced admin operations.

**Q: Can I keep my existing auth?**
A: Yes! Supabase is just an add-on for magic links and password reset. Keep everything else the same.

**Q: What about my existing users?**
A: They continue using password login. Magic links are just an alternative option.

**Q: Is this secure?**
A: Yes! Supabase handles all the security. The magic links expire automatically.

**Q: What if I want to migrate all users to Supabase?**
A: That's a bigger project. Start with this simple approach first!

---

## Next Steps

1. ✅ Test magic link works
2. Add magic link button to login page
3. Add forgot password link
4. Test in production
5. (Optional) Set up Resend for better email delivery

**Need the full detailed guide?** See `SUPABASE_AUTH_SETUP.md`

**Keep it simple!** You don't need most of the advanced features yet.
