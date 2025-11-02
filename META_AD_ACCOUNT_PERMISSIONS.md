# Fix: "Ad Account Owner Has NOT Grant ads_management or ads_read Permission"

## Problem
Error: `(#200) Ad account owner has NOT grant ads_management or ads_read permission`

This means the **ad account itself** hasn't granted the system user access to read ads data.

## Root Cause
The permissions exist in the app/system user, but the **ad account owner** (the person who owns the ad account) needs to explicitly grant access to the system user at the ad account level.

## Solution: Grant Ad Account Access to System User

### Step 1: Access Ad Account Settings

1. Go to [Meta Ads Manager](https://business.facebook.com/adsmanager/)
2. Click the **Settings** icon (top right, looks like a gear)
3. In the left sidebar, click **Ad Account Settings** or **Business Settings**

### Step 2: Navigate to Users and Roles

1. In Business Settings, go to **Users and Roles** (or **Account Users** depending on interface)
2. Look for the system user you created
3. If not listed, you need to add them

### Step 3: Add System User to Ad Account

If system user is not listed:

1. Click **Add User** or **Invite User**
2. Search for your system user by name or email
3. Select **Admin** role (or **Analyst** if you want read-only)
4. Make sure **ads_management** and **ads_read** are checked
5. Click **Confirm** or **Invite**

### Step 4: Verify Permissions at Ad Account Level

Once the system user is added to the ad account:

1. Look for the system user in the users list
2. Click on it
3. Verify the following permissions are **enabled**:
   - ✅ **ads_management** - Can view and edit ads
   - ✅ **ads_read** - Can read ad data (minimum required)
   - ✅ **business_management** - Can access business tools

### Step 5: Check Specific Ad Account Access

Important: Make sure the system user has access to **ad account `2896007643924282`** specifically:

1. Still in Users and Roles
2. Find the system user
3. Look for **Ad Account Access** section
4. Confirm ad account `2896007643924282` is listed with **Admin** or **Analyst** role

## Alternative: Use Personal Account Token

If the above doesn't work, use your personal account instead of system user:

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Navigate to your app: `799198149568207`
3. Go to **Tools** → **Access Token Tool**
4. Select your app from dropdown
5. You should see a user token generated for you
6. Copy this token

This token automatically has access to ad accounts you own.

## Step-by-Step from Meta Docs

According to Meta's official documentation, here's the flow:

1. **Business Manager Level**: System user must have business role (already done)
2. **App Level**: System user must have app assigned (already done if you followed previous steps)
3. **Ad Account Level**: Ad account owner must grant access to system user (THIS IS THE MISSING PIECE)

The error is specifically about step 3 - the ad account hasn't granted permission.

## Quick Checklist

- [ ] System user exists in Business Manager
- [ ] System user has **Admin** role on the business
- [ ] System user is assigned to app `799198149568207`
- [ ] System user has **ads_management** scope in app permissions
- [ ] **Ad account `2896007643924282` has added system user** ← THIS IS THE KEY STEP
- [ ] Ad account grants system user **Admin** or **Analyst** role
- [ ] Ad account grants **ads_management** and **ads_read** permissions to system user

## If It Still Doesn't Work

Try one of these approaches:

### Approach 1: Generate Token from Your Personal Account
```
Steps:
1. Go to Meta Developers
2. Tools → Access Token Tool
3. Select your app
4. Copy the user token (not app token)
5. Update META_ACCESS_TOKEN with this token
```

### Approach 2: Remove and Re-Add System User to Ad Account
```
Steps:
1. Go to Ad Account Settings → Users and Roles
2. Find the system user
3. Click remove/delete
4. Wait 5 minutes
5. Add the system user back with all permissions
6. Generate new token
```

### Approach 3: Check if You're the Ad Account Owner
```
If you're NOT the ad account owner:
- Contact the ad account owner
- Ask them to grant system user access
- Ask them to check "ads_management" and "ads_read" permissions
```

## Current Setup

```
Business: ✅ System user assigned as Admin
App: ✅ System user assigned with permissions (799198149568207)
Ad Account: ❌ System user NOT granted access at ad account level
```

The fix is at the **Ad Account** level, not the app level.

## Visual Flow

```
Meta Business Manager
├── System User: ✅ Exists with Admin role
├── App 799198149568207: ✅ Assigned to system user
├── Ad Account 2896007643924282: ❌ NEEDS system user added
│   └── System User: NOT listed or missing ads_management permission
└── SOLUTION: Add system user with ads_management + ads_read here
```

## Once Fixed

Once the ad account grants access to the system user:

1. Generate a new token from the system user (should now work)
2. Update `.env`:
   ```
   META_ACCESS_TOKEN="<NEW_TOKEN>"
   ```
3. Restart dev server
4. Test Meta Ads analytics

The Meta Ads tab should then show real campaign data!
