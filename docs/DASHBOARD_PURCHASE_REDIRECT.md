# Dashboard Purchase Redirect Implementation

## Overview

Implemented redirect logic so that authenticated users purchasing assessments from the dashboard are redirected back to the dashboard after payment (instead of the payment-success page which is designed for trial users).

## Changes Made

### 1. API Route Update (`app/api/stripe/checkout/route.ts`)

- Added `fromDashboard` parameter to request body
- Updated `success_url` logic:
  - If `isSubscriptionCheckout`: redirect to `/dashboard?upgraded=true`
  - If `fromDashboard`: redirect to `/dashboard?purchase=success`
  - Otherwise (trial users): redirect to `/payment-success` (existing behavior)
- Updated `cancel_url` logic:
  - If `fromDashboard`: redirect to `/dashboard?purchase=cancelled`
  - Otherwise: redirect to `/payment?cancelled=true`

### 2. Checkout Page Update (`app/checkout-direct/page.tsx`)

- Added `fromDashboard: true` to the checkout request body
- This flags that the user is authenticated and purchasing from the dashboard

### 3. Home Page Update (`app/page.tsx`)

- Added toast notifications for purchase status:
  - `purchase=success`: Shows "🎉 Purchase Successful!" with credit confirmation
  - `purchase=cancelled`: Shows "Purchase Cancelled" message
- Cleans up URL parameters after showing notifications

### 4. Credits Display Update (`components/dashboard/CreditsDisplay.tsx`)

- Added `useSearchParams` to detect purchase status
- Automatically refreshes credits when `purchase=success` is detected
- 1-second delay to allow webhook processing time

## User Flow

### Dashboard Purchase Flow (New)

1. User clicks "Purchase Assessment - $97" from AssessmentLimitDialog
2. Redirected to `/checkout-direct` page
3. Auto-redirected to Stripe checkout with `fromDashboard: true`
4. After payment:
   - **Success**: Redirected to `/dashboard?purchase=success`
     - Toast shows: "🎉 Purchase Successful!"
     - Credits display automatically refreshes
     - User stays in dashboard context
   - **Cancel**: Redirected to `/dashboard?purchase=cancelled`
     - Toast shows: "Purchase Cancelled"

### Trial Purchase Flow (Existing - Unchanged)

1. User takes trial assessment
2. Clicks "Get Full Report" from trial results
3. Redirected to `/trial-checkout` page
4. Creates account and completes payment
5. Redirected to `/payment-success` with auto-login
6. Shows detailed success page with assessment link

## Benefits

- **Better UX**: Dashboard users stay in their context
- **Clear Feedback**: Immediate toast notification of purchase status
- **Automatic Refresh**: Credits update without manual page refresh
- **Maintains Trial Flow**: Trial users still get the comprehensive onboarding experience

## Testing Instructions

### Test Dashboard Purchase Flow

1. Log in as a BASIC user with 0 credits
2. Navigate to "Create Assessment" (should show AssessmentLimitDialog)
3. Click "Purchase Assessment - $97"
4. Complete Stripe test payment (use card: `4242 4242 4242 4242`)
5. Verify:
   - ✅ Redirected to dashboard (not payment-success page)
   - ✅ Toast shows "Purchase Successful"
   - ✅ Credits display updates to show 1 credit
   - ✅ Can now create assessment

### Test Cancel Flow

1. Log in as a BASIC user with 0 credits
2. Start purchase flow from dashboard
3. Click "Back" in Stripe checkout
4. Verify:
   - ✅ Redirected to dashboard
   - ✅ Toast shows "Purchase Cancelled"
   - ✅ No charge made

### Test Trial Flow (Ensure Unchanged)

1. Take trial assessment
2. Complete payment from trial-checkout
3. Verify:
   - ✅ Still redirected to payment-success page
   - ✅ Auto-login works
   - ✅ Full onboarding experience shown

## Related Files

- `app/api/stripe/checkout/route.ts` - Checkout session creation
- `app/checkout-direct/page.tsx` - Direct checkout page
- `app/page.tsx` - Main dashboard with toast notifications
- `components/dashboard/CreditsDisplay.tsx` - Credits display with auto-refresh
- `components/assessment/AssessmentLimitDialog.tsx` - Dialog that initiates purchase

## Future Enhancements

- Add loading state while webhook processes
- Add analytics tracking for dashboard purchases
- Consider showing updated credit count in toast message
