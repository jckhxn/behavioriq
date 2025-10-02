# Missing Stripe Configuration

The Stripe checkout is failing because the required Stripe price IDs are not configured in your environment variables.

## What You Need to Do:

### 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create these products:

#### Product 1: Full AI Report ($97 one-time)

- Name: "Full AI Report"
- Description: "Comprehensive static assessment with AI-generated report"
- Pricing: $97.00 USD (one-time payment)
- Copy the **Price ID** (starts with `price_`)

#### Product 2: Monthly Membership ($29/month)

- Name: "Monthly Membership"
- Description: "Ongoing assessment and tracking"
- Pricing: $29.00 USD (recurring monthly)
- Copy the **Price ID** (starts with `price_`)

#### Product 3: Conversational AI Add-on ($9 one-time)

- Name: "Conversational AI Mode"
- Description: "Interactive session where child interacts directly with AI"
- Pricing: $9.00 USD (one-time payment)
- Copy the **Price ID** (starts with `price_`)

### 2. Add Environment Variables

Add these lines to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your Stripe publishable key
STRIPE_SECRET_KEY="sk_test_..." # Your Stripe secret key

# Stripe Price IDs (get these from Stripe Dashboard after creating products)
STRIPE_BASIC_PRICE_ID="price_..." # Full AI Report ($97)
STRIPE_MONTHLY_PRICE_ID="price_..." # Monthly Membership ($29/month)
STRIPE_CONVERSATIONAL_AI_PRICE_ID="price_..." # Conversational AI ($9)

# Optional - if you want to keep the old premium/unlimited plans
STRIPE_PREMIUM_PRICE_ID="price_..." # Premium Plan (if still needed)
STRIPE_UNLIMITED_PRICE_ID="price_..." # Unlimited Plan (if still needed)
STRIPE_YEARLY_PRICE_ID="price_..." # Yearly Subscription (if still needed)
```

### 3. Restart Your Development Server

After adding the environment variables:

```bash
npm run dev
```

## Current Error Analysis:

The error shows `priceId: undefined` for the BASIC plan, which means `process.env.STRIPE_BASIC_PRICE_ID` is not set.

## Required Price IDs:

- `STRIPE_BASIC_PRICE_ID` - Maps to your $97 Full AI Report
- `STRIPE_MONTHLY_PRICE_ID` - Maps to your $29/month membership
- `STRIPE_CONVERSATIONAL_AI_PRICE_ID` - Maps to your $9 add-on

Once you set these environment variables with the actual Stripe price IDs, the checkout flow will work properly.
