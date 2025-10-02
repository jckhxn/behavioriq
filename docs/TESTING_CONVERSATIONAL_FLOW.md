# Testing the Complete Conversational Assessment Flow

## Quick Start - Easiest Method ✅

### Using the Debug Button (Recommended)

1. **Login** to your account at `http://localhost:3000`

2. **Go to Dashboard** - You should see the "✨ Try Conversational Mode" widget

3. **Click "Start Free Trial"** - A chat dialog will open

4. **Click the green "🐛 Create Real Mock" button** in the top-right
   - This creates a REAL assessment in the database
   - Sets `isConversational: true`
   - Sets `status: COMPLETED`
   - Adds mock child responses
   - Returns a real assessment ID

5. **Upsell Screen Appears** - You'll see:
   - "Assessment Complete! 🎉"
   - Sample response preview
   - 5 benefits of the $9 upgrade
   - "Unlock Enhanced Report – $9" button

6. **Click "Unlock Enhanced Report – $9"**
   - Takes you to Stripe checkout
   - Uses real assessment ID from database

7. **Complete Stripe Payment**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any billing ZIP

8. **Webhook Processes**
   - Stripe sends event to `/api/stripe/webhook`
   - Webhook updates `hasEnhancedReport: true`
   - Records $9 payment

9. **Return to Dashboard**
   - Widget now shows "Enhanced Report Active ✅"
   - Green card with checkmark badge
   - "View Enhanced Report" and "Download PDF" buttons

10. **View Enhanced Report**
    - Click "View Enhanced Report"
    - See 4-tab interface:
      - Comparison (parent vs child responses)
      - Key Differences
      - Insights & Recommendations
      - Notable Quotes

---

## Manual Testing Method (If Debug Doesn't Work)

### Step 1: Create Assessment via API

```bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"subjectName": "Test Child"}'
```

### Step 2: Update in Database

Get the assessment ID from the response, then run in PostgreSQL:

```sql
UPDATE "Assessment"
SET "isConversational" = true,
    "status" = 'COMPLETED',
    "completedAt" = NOW(),
    "childResponses" = '{
      "responses": [
        {
          "questionId": "q1",
          "question": "How do you feel about school?",
          "parentAnswer": "They seem anxious about going to school",
          "childAnswer": "I dont like it because the work is too hard",
          "timestamp": "2025-10-01T12:00:00Z"
        }
      ]
    }'::jsonb
WHERE "id" = 'YOUR_ASSESSMENT_ID';
```

### Step 3: Test on Dashboard

1. Refresh dashboard - widget should show "Preview of Your Child's Responses"
2. Click "Unlock Enhanced Report – $9"
3. Complete checkout
4. Verify webhook processed correctly
5. Check dashboard for "Enhanced Report Active"

---

## Verification Checklist

### Before Purchase:

- [ ] Dashboard shows "Try Conversational Mode" widget
- [ ] Clicking "Start Free Trial" opens chat dialog
- [ ] "Create Real Mock" button creates assessment in database
- [ ] Upsell shows after mock creation
- [ ] "Unlock Enhanced Report" button links to correct checkout URL

### During Purchase:

- [ ] Checkout page loads with assessment ID in URL
- [ ] Stripe checkout session created successfully
- [ ] Payment completes with test card
- [ ] Redirects to success URL

### After Purchase:

- [ ] Webhook receives `checkout.session.completed` event
- [ ] Webhook updates `hasEnhancedReport: true`
- [ ] Webhook creates payment record for $9
- [ ] Dashboard refreshes and shows "Enhanced Report Active ✅"
- [ ] Green card with checkmark badge
- [ ] "View Enhanced Report" button appears

### Enhanced Report View:

- [ ] Report page loads with assessment data
- [ ] All 4 tabs render correctly
- [ ] Comparison tab shows side-by-side responses
- [ ] Key Differences tab shows AI analysis
- [ ] Insights tab shows recommendations
- [ ] Notable Quotes tab shows highlighted responses
- [ ] Download PDF button present (functionality pending)

---

## Database Queries for Testing

### Check Assessment Status:

```sql
SELECT
  id,
  "subjectName",
  status,
  "isConversational",
  "hasEnhancedReport",
  "enhancedReportPurchasedAt",
  "completedAt"
FROM "Assessment"
WHERE "userId" = 'YOUR_USER_ID'
ORDER BY "startedAt" DESC
LIMIT 5;
```

### Check Payment Record:

```sql
SELECT
  id,
  "userId",
  amount,
  status,
  "planType",
  plan,
  "createdAt"
FROM "Payment"
WHERE "planType" = 'enhanced_report'
ORDER BY "createdAt" DESC;
```

### Manually Mark Assessment as Purchased (Testing Only):

```sql
UPDATE "Assessment"
SET "hasEnhancedReport" = true,
    "enhancedReportPurchasedAt" = NOW()
WHERE "id" = 'YOUR_ASSESSMENT_ID';
```

---

## Troubleshooting

### Error: "Assessment not found or not eligible"

**Cause:** Assessment doesn't exist, isn't conversational, or doesn't belong to user

**Fix:**

1. Verify assessment exists in database
2. Check `isConversational = true`
3. Check `userId` matches logged-in user
4. Check assessment not already purchased (`hasEnhancedReport = false`)

### Error: "Already purchased"

**Cause:** `hasEnhancedReport` is already `true`

**Fix:**

```sql
UPDATE "Assessment"
SET "hasEnhancedReport" = false,
    "enhancedReportPurchasedAt" = NULL
WHERE "id" = 'YOUR_ASSESSMENT_ID';
```

### Widget Not Showing

**Cause:** No assessments in database OR all assessments have `isConversational = false`

**Fix:**

1. Create assessment using "Create Real Mock" button
2. OR manually update existing assessment to `isConversational = true`

### Webhook Not Processing

**Cause:** Webhook secret mismatch or Stripe not configured

**Fix:**

1. Check `STRIPE_WEBHOOK_SECRET` in `.env.local`
2. Verify Stripe webhook endpoint configured in dashboard
3. Check webhook logs in Stripe dashboard
4. Check Next.js server logs for webhook errors

---

## Test Page

Visit `http://localhost:3000/test-conversational-flow` for a guided testing interface with:

- Step-by-step instructions
- One-click assessment creation
- SQL queries to copy/paste
- Expected flow checklist
- Error troubleshooting

---

## Expected Behavior Summary

| State                              | Dashboard Widget                    | Actions                            |
| ---------------------------------- | ----------------------------------- | ---------------------------------- |
| **No conversational assessment**   | "✨ Try Conversational Mode" teaser | "Start Free Trial" button          |
| **Trial completed, not purchased** | "Preview of Your Child's Responses" | "$9 Unlock" button + benefits list |
| **Enhanced report purchased**      | "Enhanced Report Active ✅"         | "View Report" + "Download PDF"     |

## Payment Flow

1. User clicks "Unlock Enhanced Report – $9"
2. POST to `/api/stripe/checkout-enhanced/{assessmentId}`
3. Stripe checkout session created with:
   - `amount: 900` ($9.00)
   - `metadata: { productType: "enhanced_report", assessmentId, userId }`
4. User completes payment in Stripe
5. Stripe webhook → `/api/stripe/webhook`
6. Webhook checks `productType === "enhanced_report"`
7. Updates assessment: `hasEnhancedReport = true`, `enhancedReportPurchasedAt = NOW()`
8. Creates payment record
9. Returns success
10. User sees updated dashboard widget

---

## Quick Reset for Re-Testing

```sql
-- Reset assessment to unpurchased state
UPDATE "Assessment"
SET "hasEnhancedReport" = false,
    "enhancedReportPurchasedAt" = NULL
WHERE "id" = 'YOUR_ASSESSMENT_ID';

-- Delete payment record (optional)
DELETE FROM "Payment"
WHERE "planType" = 'enhanced_report'
AND "userId" = 'YOUR_USER_ID';
```

Then refresh dashboard and try the flow again!
