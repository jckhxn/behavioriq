# Quick Fix - Prisma Studio & Webhook Issues

## ✅ Issues Fixed

### 1. Prisma Studio DATABASE_URL Error

**Problem**: Prisma Studio couldn't find `DATABASE_URL`  
**Solution**: Created `scripts/studio.sh` to load environment variables

### 2. Webhook User ID Undefined

**Problem**: Anonymous checkout didn't have a user ID in metadata  
**Solution**: Updated webhook to create users from anonymous checkout metadata

## 🚀 How to Run Prisma Studio

### Option 1: Using the Script (Recommended)

```bash
./scripts/studio.sh
```

### Option 2: Manual

```bash
# Load .env.local first
export $(cat .env.local | xargs)

# Then run Prisma Studio
npx prisma studio
```

### Option 3: One-liner

```bash
env $(cat .env.local | xargs) npx prisma studio
```

## 🧪 Test the Complete Flow Now

### Terminal Setup:

**Terminal 1** - Dev Server:

```bash
npm run dev
```

**Terminal 2** - Stripe Webhook Listener:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Terminal 3** - Prisma Studio (Optional):

```bash
./scripts/studio.sh
```

### Test Flow:

1. **Visit**: http://localhost:3000/conversational-trial
2. **Complete assessment** (type "yes" to all questions)
3. **View results** at `/trial-results`
4. **Click** "Get Full Assessment"
5. **Register** (if not logged in):
   - Email: test@example.com
   - Name: Test User
   - Password: Test123!
6. **Complete checkout** with test card: `4242 4242 4242 4242`

### Watch for Success:

**Terminal 1 (Dev Server)** should show:

```
[Webhook] ✅ Event received: checkout.session.completed
[Webhook] Processing checkout.session.completed
[Webhook] User Email: test@example.com
[Webhook] Creating new user from anonymous checkout
[Webhook] ✅ New user created: test@example.com
[Webhook] ✅ User account activated: test@example.com
[Webhook] ✅ Payment record created: pay_xxx
[Webhook] ✅ New license created and assigned: LIC-xxx
```

**Terminal 2 (Stripe CLI)** should show:

```
2025-10-01 XX:XX:XX   --> checkout.session.completed [evt_xxx]
2025-10-01 XX:XX:XX  <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
```

### Verify in Database:

Open Prisma Studio and check:

- **users** table → New user with email, isActive: true
- **payments** table → New payment with status: "SUCCEEDED", amount: 9700
- **licenses** table → New license with type: "BASIC", maxAssessments: 1
- **user_licenses** table → User linked to license

## 📊 What Changed

### Anonymous Checkout Flow (NEW):

```
1. User completes conversational trial
2. Sees results, clicks "Get Full Assessment"
3. Fills registration form (email, name, password)
4. Redirected to anonymous checkout
5. Checkout session created with:
   - userEmail
   - userName
   - userPasswordHash (bcrypt hashed)
   - userSource: "trial"
   - plan: "BASIC"
6. User enters payment info
7. Stripe processes payment
8. Webhook fires with metadata
9. Backend checks: Does user exist?
   - NO: Create new user with metadata
   - YES: Use existing user
10. Create payment record
11. Create/assign license
12. User can now login!
```

### Registered User Checkout Flow:

```
Same as before - userId is passed in metadata
```

## 🐛 Troubleshooting

### Prisma Studio Still Shows Error

```bash
# Make sure you're in the project directory
cd /Users/jack/Documents/Projects/js/ai-diagnostic

# Make script executable
chmod +x scripts/studio.sh

# Run it
./scripts/studio.sh
```

### Webhook Still Shows userId: undefined

**This is OK!** The webhook now handles this by creating the user from the metadata.

### User Not Created After Payment

Check Terminal 1 logs for:

- `[Webhook] ❌` error messages
- Prisma errors
- Missing metadata fields

### Payment Successful But No License

1. Check Prisma Studio - does user exist?
2. Check `user_licenses` table - is there a record?
3. Check Terminal 1 for license creation logs

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Stripe CLI shows `<-- [200]` (not 500)
2. ✅ Dev logs show all `[Webhook] ✅` messages
3. ✅ Prisma Studio shows new user, payment, license, user_license
4. ✅ User can login with the email/password from registration
5. ✅ Dashboard shows assessments available

## 🎉 Ready!

Everything is now configured correctly:

- ✅ Webhook handles anonymous checkout
- ✅ User created automatically after payment
- ✅ License assigned correctly
- ✅ Prisma Studio can run with environment variables

Test the complete flow and watch it work! 🚀
