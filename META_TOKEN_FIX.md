# Meta Access Token Permission Issue - How to Fix

## Current Status

✅ Account ID correctly identified and normalized
❌ Access token missing required permissions

**Error:** "Ad account owner has NOT grant ads_management or ads_read permission"

The account `act_2896007643924282` exists and is accessible, but the current token doesn't have permission to read ad data.

## Root Cause

The access token was likely generated without the correct scopes, or the token expired and needs to be regenerated with proper permissions.

## How to Fix

### Step 1: Go to Meta Business Manager

1. Navigate to [Meta Business Manager](https://business.facebook.com/)
2. Click the **Settings** gear icon (bottom left)
3. Go to **Users** → **System Users**

### Step 2: Select or Create System User

1. Find the system user that was used to generate the token
2. If none exists, click **Create System User**
   - Name: something like "Analytics Bot"
   - Role: **Admin**

### Step 3: Grant Ad Account Access

1. Click on the system user
2. Go to the **Ad accounts** section
3. Make sure the ad account `2896007643924282` is assigned to this system user
4. The system user needs **Full Control** or at least read permissions

### Step 4: Regenerate Access Token with Correct Scopes

1. Click on the system user to view details
2. Scroll to **Generate Tokens** section
3. Click **Generate Token**
4. In the dropdown, select your app: `799198149568207`
5. **IMPORTANT**: Check these scopes:
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `business_management`
6. Click **Generate Token**
7. Copy the entire token (starts with `EAAL...`)

### Step 5: Update Environment Variable

Update your `.env` file (or wherever you store credentials):

```
META_ACCESS_TOKEN="<NEW_TOKEN_FROM_STEP_4>"
```

### Step 6: Restart Application

```bash
# Kill dev server
pkill -f "npm run dev"

# Restart dev server
npm run dev
```

### Step 7: Test

Visit the Super Admin Analytics page and check the Meta Ads tab. It should now load data without the 403 error.

## Troubleshooting

### Still Getting 403 Error?

1. **Check System User Has Ad Account Access**
   - Go to Business Manager > Settings > Ad Accounts
   - Verify the system user has access to `2896007643924282`

2. **Token May Have Expired**
   - Regenerate a fresh token
   - Long-lived tokens expire after ~60 days

3. **Wrong Scopes**
   - When generating token, make sure you checked:
     - `ads_management` (to read insights)
     - `ads_read` (to read ad data)
     - `business_management` (for account access)

4. **Check Token Format**
   - Token should start with `EAAL`
   - Should be very long (100+ characters)
   - No extra spaces or characters

### 400 Bad Request with "Object does not exist"?

The account ID normalization is working. This means:
- The token has permission issues (403) OR
- The account ID is still malformed

**Solution:** Make sure `META_BUSINESS_ACCOUNT_ID` in `.env` is formatted as:
- With prefix: `act_2896007643924282` ✅
- Without prefix: `2896007643924282` ✅
- Both work now (code normalizes automatically)

## Current Configuration

```
META_BUSINESS_ACCOUNT_ID=act_2896007643924282
META_ACCESS_TOKEN=<NEEDS REGENERATION WITH CORRECT SCOPES>
META_APP_ID=799198149568207
META_APP_SECRET=REDACTED_META_APP_SECRET
META_AD_ID=1867993237463425
```

## What Data Will Display Once Fixed

Once the token has proper permissions, the Meta Ads Analytics tab will show:

- **Impressions**: Total ad impressions
- **Clicks**: Total clicks on ads
- **Spend**: Total money spent on campaigns
- **CTR**: Click-through rate percentage
- **CPC**: Cost per click
- **CPM**: Cost per 1000 impressions
- **ROAS**: Return on ad spend
- **Campaigns**: Top performing campaigns with breakdown
- **Device Breakdown**: Performance by device type
- **Daily Trends**: Performance over time

## Questions?

If the token still doesn't work after following these steps:

1. Verify the app ID and business account ID match your Meta setup
2. Check that the system user is actually assigned to the ad account (not just the business)
3. Try generating a new system user from scratch
4. Ensure the access token is long-lived (not a short-lived developer token)
