# Stripe Testing Guide - Complete Setup

## ✅ Setup Complete!

Your webhook handler has been successfully implemented and the dev server is running.

## 🔧 Current Status

### Working:

- ✅ Webhook signature verification
- ✅ Payment record creation
- ✅ License management (BASIC, PROFESSIONAL types)
- ✅ User account activation
- ✅ Stripe CLI connected
- ✅ Webhook events being received (200 responses)

### Needs Attention:

- ⚠️ `NEXTAUTH_SECRET` missing - causing auth errors (doesn't block webhooks)
- Add it to `.env.local` with: `openssl rand -base64 32`

## 🧪 Test the Complete Flow Now

### Terminal Setup (3 terminals):

**Terminal 1** - Dev Server (Already Running ✅):

```bash
npm run dev
```

**Terminal 2** - Stripe Listener (Already Running ✅):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Terminal 3** - Test Commands:

```bash
# Trigger a test checkout completion
stripe trigger checkout.session.completed

# Or manually test a payment
stripe samples create checkout-one-time
```

## 💳 Manual Testing Flow

### 1. Complete Conversational Trial

1. Visit: http://localhost:3000/conversational-trial
2. Answer all questions (type "yes" repeatedly for quick testing)
3. You'll be redirected to `/trial-results`

### 2. Register & Checkout

- If **not logged in**: Click "Get Full Assessment" → Register → Checkout
- If **logged in**: Click "Get Full Assessment" → Direct Checkout

### 3. Use Test Card

```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 4. Watch Webhook Logs

In Terminal 1 (dev server), you should see:

```
[Webhook] ✅ Event received: checkout.session.completed
[Webhook] Processing checkout.session.completed
[Webhook] Session ID: cs_test_...
[Webhook] User ID: cuid_xxx
[Webhook] Assessment Type: basic
[Webhook] Source: trial
[Webhook] ✅ User account activated: user@example.com
[Webhook] ✅ Payment record created: payment_xxx
[Webhook] ✅ New license created and assigned: LIC-xxx
```

### 5. Verify in Database

```bash
npx prisma studio
```

Check these tables:

- **users** → `isActive` should be `true`
- **payments** → New row with `status: "SUCCEEDED"`
- **licenses** → New license with `type: "BASIC"`, `maxAssessments: 1`
- **user_licenses** → User linked to license

## 📊 What Gets Created

### After Single Assessment Purchase:

```typescript
{
  user: {
    isActive: true // Activated
  },
  payment: {
    stripePaymentIntentId: "pi_xxx",
    amount: 9700, // $97.00 in cents
    status: "SUCCEEDED",
    planType: "basic",
    plan: "Basic Assessment"
  },
  license: {
    type: "BASIC",
    status: "ACTIVE",
    maxAssessments: 1,
    validUntil: "2026-10-01" // 1 year
  }
}
```

### After Monthly Subscription:

```typescript
{
  user: {
    isActive: true
  },
  payment: {
    amount: 2900, // $29.00 per month
    status: "SUCCEEDED",
    planType: "monthly"
  },
  license: {
    type: "PROFESSIONAL",
    status: "ACTIVE",
    maxAssessments: null // Unlimited!
  }
}
```

## 🐛 Debugging

### Check Webhook Events:

```bash
stripe events list --limit 10
```

### View Specific Event:

```bash
stripe events retrieve evt_xxx
```

### Resend Failed Webhooks:

```bash
# In Stripe Dashboard: Developers → Webhooks → Click event → Resend
```

### Check Logs:

Watch Terminal 1 for:

- `[Webhook] ✅` = Success
- `[Webhook] ❌` = Error
- `[Webhook] ℹ️` = Info

## 🎯 Testing Checklist

- [ ] Conversational assessment completes successfully
- [ ] Results display at `/trial-results`
- [ ] Registration flow works
- [ ] Checkout page loads
- [ ] Test payment completes (Terminal 2 shows webhook event)
- [ ] User account activated (check `users` table)
- [ ] Payment record created (check `payments` table)
- [ ] License created (check `licenses` table)
- [ ] License assigned to user (check `user_licenses` table)
- [ ] User can login after payment
- [ ] Dashboard shows assessments available

## 📝 Current Webhook Events Handled

| Event                           | Status     | What It Does                                            |
| ------------------------------- | ---------- | ------------------------------------------------------- |
| `checkout.session.completed`    | ✅ Working | Creates payment, activates user, assigns license        |
| `invoice.payment_succeeded`     | ✅ Working | Handles subscription payments, upgrades to PROFESSIONAL |
| `customer.subscription.deleted` | ✅ Working | Cancels PROFESSIONAL licenses                           |
| `customer.subscription.updated` | ✅ Working | Updates license status (ACTIVE/SUSPENDED/CANCELLED)     |
| `charge.succeeded`              | ℹ️ Ignored | Informational only                                      |
| `payment_intent.succeeded`      | ℹ️ Ignored | Informational only                                      |
| `payment_intent.created`        | ℹ️ Ignored | Informational only                                      |
| `product.created`               | ℹ️ Ignored | Informational only                                      |
| `price.created`                 | ℹ️ Ignored | Informational only                                      |

## 🚀 Ready for Production

When you're ready to go live:

1. **Get Live API Keys**:
   - Visit https://dashboard.stripe.com/apikeys
   - Copy live keys (starts with `sk_live_` and `pk_live_`)

2. **Update Environment Variables**:

   ```bash
   STRIPE_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   ```

3. **Set Up Production Webhook**:
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: Select the ones we handle (checkout.session.completed, etc.)
   - Copy the webhook signing secret
   - Add to production: `STRIPE_WEBHOOK_SECRET="whsec_..."`

4. **Test with Small Amount First!**

## 🎉 Success Indicators

You'll know it's working when:

1. Stripe CLI shows `<-- [200]` (not 400 or 500)
2. Dev logs show `[Webhook] ✅` messages
3. Prisma Studio shows new records in all 4 tables
4. User can login and see assessments in dashboard

## 💡 Pro Tips

- **Quick Test**: Use `stripe trigger checkout.session.completed` (but won't have real user data)
- **Real Flow Test**: Complete the actual trial → register → checkout flow
- **Watch Both Terminals**: Terminal 1 for app logs, Terminal 2 for Stripe events
- **Use Prisma Studio**: Best way to verify data was created correctly
- **Check Errors First**: If webhook returns 500, check Terminal 1 for the error

---

**Need Help?** Check:

- Terminal 1 for detailed error messages
- Terminal 2 for Stripe event details
- Prisma Studio for database state
- Stripe Dashboard → Webhooks for event history
