# Fix: "No Permissions Available" When Generating Meta Token

## Problem
When trying to generate a token for app `799198149568207`, you see "No permissions available" error.

## Root Cause
The System User doesn't have proper role assignments for the app/business setup.

## Solution: Step-by-Step

### Step 1: Verify System User Has Business Access

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Click **Settings** (gear icon, bottom left)
3. Go to **Users** → **System Users**
4. Click on your system user

### Step 2: Check System User Roles

Look for these sections:
- **Business Roles**: Should have at least **Admin** role
- **Ad Account Roles**: Should have access to ad account `2896007643924282` with **Admin** permissions

If NOT assigned, assign them:
1. Click **Add Roles**
2. Select your business
3. Give **Admin** role

### Step 3: Assign App Access (IMPORTANT)

This is likely the missing step:

1. In the System User details, look for **App Access** section
2. Click **Add Apps**
3. Search for your app: `799198149568207`
4. Click **Add**
5. Once added, click the app name to configure permissions
6. Check these permissions:
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `business_management`
   - ✅ `marketing_api` (if available)

### Step 4: Assign Ad Account to System User

1. Go to **Settings** → **Ad Accounts** (still in Business Manager)
2. Find ad account `2896007643924282`
3. Click on it
4. Go to **Users and Roles** (or similar)
5. Add your system user with **Admin** or **Analyst** role

### Step 5: Now Try Generating Token

1. Go back to **Users** → **System Users**
2. Click your system user
3. Scroll to **Generate Tokens**
4. Click **Generate Token**
5. Select app: `799198149568207`
6. Now the permissions should be available!
7. Check:
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `business_management`
8. Click **Generate Token**

## If Still "No Permissions Available"

Try this alternative approach:

### Option A: Use Your Personal Account Token

Instead of System User, use your own account:

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Go to your app: `799198149568207`
3. **Settings** → **Basic**
4. Scroll down to see your **App ID** and **App Secret**
5. Go to **Tools** → **Access Token Tool**
6. Select your app
7. You should see a token - copy it

### Option B: Create New System User from Scratch

1. Go to Business Manager → **Settings** → **Users** → **System Users**
2. Click **Create System User**
3. Name: "Analytics Bot" or similar
4. Role: **Admin**
5. Click **Create**
6. Immediately after creation:
   - Click **Add Apps**
   - Select app `799198149568207`
   - Assign all permissions (ads_management, ads_read, business_management)
   - Click **Generate Token**

## Troubleshooting Checklist

- [ ] System User has **Admin** role on the business
- [ ] System User is assigned to ad account `2896007643924282`
- [ ] App `799198149568207` is added to System User's apps
- [ ] Permissions are checked: ads_management, ads_read, business_management
- [ ] Token is long-lived (not short-lived)
- [ ] Token hasn't expired

## What to Do Once You Have Token

1. Copy the new token
2. Update your `.env` file:
   ```
   META_ACCESS_TOKEN="<NEW_TOKEN_HERE>"
   ```
3. Restart dev server:
   ```bash
   pkill -f "npm run dev"
   npm run dev
   ```
4. Test Meta Analytics in admin dashboard

## Need More Help?

If "No Permissions Available" still appears, try:

1. **Check if Business has an App**
   - Settings → Apps and Websites → Your Apps
   - Make sure app `799198149568207` is listed

2. **Verify Business Manager Setup**
   - Settings → Business Information
   - Confirm business name and account

3. **Check App Status**
   - Go to [Meta Developers](https://developers.facebook.com/)
   - App Dashboard
   - Make sure app is active and not in development mode with restrictions

## Important Notes

- System User tokens last ~60 days, then expire
- You need to regenerate them when they expire
- The ad account and app must be linked in the same business
- Some permissions require business verification

## Current Credentials

```
APP_ID: 799198149568207 ✅
APP_SECRET: REDACTED_META_APP_SECRET ✅
BUSINESS_ACCOUNT_ID: act_2896007643924282 ✅
AD_ACCOUNT_ID: 1867993237463425 ✅
ACCESS_TOKEN: <NEEDS REGENERATION> ❌
```

All IDs are correct - just need the token with proper permissions!
