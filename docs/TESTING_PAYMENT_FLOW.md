# Testing $97 Assessment Payment Flow

## Quick Test Guide - October 4, 2025

### Prerequisites

✅ Stripe test keys are configured in `.env.local`
✅ Development server is running (`npm run dev`)
✅ Database is up and migrations are applied

---

## Test Scenario 1: New User Taking Trial → Purchasing Full Assessment

### Step 1: Take a Trial Assessment

1. Navigate to: http://localhost:3000/trial-assessment
2. Complete the trial assessment (answer questions)
3. Submit the assessment
4. You'll be redirected to: http://localhost:3000/trial-results

### Step 2: Click "Get Your Full AI Report - $97"

- This should redirect you to: http://localhost:3000/trial-checkout
- You should see:
  - Order summary ($97 one-time payment)
  - Account creation form (Name, Email, Password)
  - Security badges

### Step 3: Fill in Account Information

Use these test values:

- **Name:** Test User
- **Email:** test@example.com (or any test email)
- **Password:** testpass123
- **Confirm Password:** testpass123

### Step 4: Click "Continue to Payment"

- You'll be redirected to Stripe Checkout
- URL should start with: https://checkout.stripe.com/...

### Step 5: Complete Payment with Test Card

Use Stripe's test card numbers:

#### ✅ Successful Payment

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### 🚫 Declined Payment (for testing errors)

```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

#### 🔐 Requires Authentication (3D Secure)

```
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Step 6: After Successful Payment

You should be redirected to: http://localhost:3000/payment-success?session_id=...

**What should happen:**

1. ✅ Account created automatically with provided credentials
2. ✅ User logged in automatically
3. ✅ Account upgraded to BASIC tier
4. ✅ Success message displayed
5. ✅ Can access full assessment report

---

## Test Scenario 2: Existing User Purchasing Assessment

### Step 1: Log in First

1. Navigate to: http://localhost:3000/login
2. Log in with existing credentials

### Step 2: Take Trial Assessment

1. Navigate to: http://localhost:3000/trial-assessment
2. Complete the assessment
3. View results at: http://localhost:3000/trial-results

### Step 3: Click "Get Your Full AI Report - $97"

- Since you're logged in, you'll be redirected to: http://localhost:3000/checkout-direct
- You should be auto-redirected to Stripe Checkout

### Step 4: Complete Payment

- Use the same test card: `4242 4242 4242 4242`
- Complete the payment

### Step 5: Verify Success

- Redirected to payment-success page
- Account remains at current tier or upgraded if needed

---

## Test Scenario 3: Conversational Trial → Purchase

### Step 1: Take Conversational Trial

1. Navigate to: http://localhost:3000/conversational-trial
2. Complete the conversational assessment
3. View results

### Step 2: Purchase Full Report

Follow same steps as Scenario 1 or 2

---

## Verifying Payment in Stripe Dashboard

### View in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment listed
3. Click on it to see:
   - Payment amount: $97.00 USD
   - Status: Succeeded
   - Customer email
   - Metadata with assessment details

### Check Customer Created

1. Go to: https://dashboard.stripe.com/test/customers
2. Find the customer by email
3. Verify metadata includes:
   - `planType: oneTime`
   - `plan: BASIC`
   - `childName: [name from assessment]`

---

## Verifying in Database

Check that the user and payment were created:

```sql
-- Check user was created
SELECT id, email, name, accountType, createdAt
FROM "User"
WHERE email = 'test@example.com';

-- Check user assessment exists
SELECT * FROM "UserAssessment"
WHERE "userId" = '[user_id_from_above]'
ORDER BY "createdAt" DESC;
```

Or use Prisma Studio:

```bash
npx prisma studio
```

---

## Testing Edge Cases

### Test 1: Email Already Exists

1. Try to purchase with an email that's already registered
2. Should show error: "An account with this email already exists"

### Test 2: Password Mismatch

1. Enter different passwords in Password and Confirm Password
2. Should show error: "Passwords do not match"

### Test 3: Cancel Payment

1. Get to Stripe Checkout
2. Click the back arrow or close the window
3. Should return to: http://localhost:3000/trial-checkout

### Test 4: Payment Declined

1. Use declined test card: `4000 0000 0000 0002`
2. Should show Stripe error message
3. Can retry with valid card

---

## Testing Webhooks (Advanced)

If you want to test webhook handling:

### Install Stripe CLI

```bash
# On macOS
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login
```

### Listen for Webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret. Update your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_[your_webhook_secret]"
```

### Trigger Test Events

```bash
# Test successful payment
stripe trigger checkout.session.completed

# Test failed payment
stripe trigger payment_intent.payment_failed
```

---

## Common Issues & Solutions

### Issue: "Price ID not configured"

**Solution:** Verify `STRIPE_BASIC_PRICE_ID` in `.env.local` exists in Stripe Dashboard

### Issue: "Failed to create checkout session"

**Solution:** Check Stripe secret key is correct and has write permissions

### Issue: Account not created after payment

**Solution:** Check webhook is properly configured and receiving events

### Issue: Redirected back to trial assessment after purchase

**Solution:** This was the bug we just fixed! Make sure you're using the updated code.

---

## Test Checklist

- [ ] New user completes trial
- [ ] New user sees checkout page with account form
- [ ] Form validation works (password match, email format)
- [ ] Stripe checkout opens with correct amount ($97)
- [ ] Payment with test card succeeds
- [ ] User redirected to success page
- [ ] Account created in database
- [ ] User logged in automatically
- [ ] Can access full assessment report
- [ ] Payment appears in Stripe Dashboard
- [ ] Existing user can purchase without creating new account
- [ ] Cancel payment returns to checkout page
- [ ] Declined payment shows error message

---

## Quick Start Command

```bash
# 1. Start dev server
npm run dev

# 2. Open trial assessment
open http://localhost:3000/trial-assessment

# 3. Use test card: 4242 4242 4242 4242
```

---

## Test Cards Reference

| Scenario              | Card Number         | Description             |
| --------------------- | ------------------- | ----------------------- |
| ✅ Success            | 4242 4242 4242 4242 | Payment succeeds        |
| 🚫 Declined           | 4000 0000 0000 0002 | Payment declined        |
| 🚫 Insufficient Funds | 4000 0000 0000 9995 | Insufficient funds      |
| 🔐 3D Secure          | 4000 0027 6000 3184 | Requires authentication |
| 💳 Visa               | 4242 4242 4242 4242 | Visa                    |
| 💳 Mastercard         | 5555 5555 5555 4444 | Mastercard              |
| 💳 Amex               | 3782 822463 10005   | American Express        |

More test cards: https://stripe.com/docs/testing

---

## Notes

- All test payments use Stripe test mode (keys start with `pk_test_` and `sk_test_`)
- No real money is charged
- Test data is separate from production
- You can reset test data in Stripe Dashboard anytime
