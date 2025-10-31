# GA4 Analytics Setup Guide

## Problem
The GA4 endpoint is working but returning a **403 Forbidden** error. This means the service account is authenticated but doesn't have permission to access the GA4 property.

## Solution

### Step 1: Verify Your Service Account Email
The system is using this email for authentication:
```
behavioriq-164@brightpath-1761879772871.iam.gserviceaccount.com
```

This email needs to be added to your GA4 property with **Analyst** role.

### Step 2: Add Service Account to GA4 Property

1. Go to **Google Analytics 4**
2. Select your **Property** (not Account)
3. Click **Admin** (bottom left)
4. Under "Property", click **Property Access Management**
5. Click **+ Invite user**
6. Enter the service account email: `behavioriq-164@brightpath-1761879772871.iam.gserviceaccount.com`
7. Give it the **Analyst** role
8. Click **Invite**

### Step 3: Verify GA4 Property ID

1. In GA4, go to **Admin > Property Settings**
2. Find the **Property ID** (looks like: `123456789`)
3. Confirm it matches your `GA4_PROPERTY_ID` in `.env`

Current Property ID in environment: Not showing (check your .env file)

### Testing After Setup

Once the permission is fixed, the analytics dashboard will automatically load:
- **Views** - Total page views
- **Sessions** - User sessions
- **Users** - Unique users
- **Avg Session Duration** - Average session length
- **Bounce Rate** - Percentage of bounces
- **Device Breakdown** - Mobile vs Desktop vs Tablet traffic

The endpoint will also show:
- Daily traffic trends
- Device-specific metrics
- Top pages (ready for implementation)

## Troubleshooting

### Still getting 403 error?
1. Wait 5-10 minutes after adding the service account (permissions can be slow to propagate)
2. Clear your browser cache and refresh the admin dashboard
3. Check that you added the email to the **Property**, not the **Account**

### Getting different error?
Check the admin dashboard console (F12 > Console tab) for the exact error message. The GA4 endpoint logs detailed errors that will help debug.

## Current Status

✅ Service account authentication works
❌ Permission to access GA4 property missing
⏳ Awaiting permission configuration

Once you add the service account to your GA4 property with Analyst role, the analytics dashboard will populate automatically.
