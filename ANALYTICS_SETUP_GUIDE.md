# Analytics Integration Setup Guide

The analytics endpoints are working correctly but need proper API credentials configuration. Here's how to set up each service.

## Current Status

### GA4 Analytics
- ✅ **Service account authentication working**
- ❌ **Permission error**: Service account needs to be added to GA4 property
- Error: `403 Forbidden` when accessing property `GA4_PROPERTY_ID`

### Meta Analytics
- ❌ **Access token invalid**: Token format is incorrect or expired
- Error: `Invalid OAuth access token - Cannot parse access token`

---

## GA4 Setup Instructions

### 1. Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **Credentials** → **Create Credentials** → **Service Account**
4. Fill in details and click **Create and Continue**
5. Grant the service account these roles:
   - `Editor` (or more restrictive: `Analytics Viewer`)
6. Click **Continue** and **Done**

### 2. Create and Download JSON Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key** → **JSON**
4. A JSON file downloads automatically

### 3. Extract Credentials from JSON Key

Open the downloaded JSON file and copy these values to your `.env`:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  ...
}
```

From this file, extract:
- **`private_key`**: Copy the entire value between `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` (including the newlines)
- **`client_email`**: Copy the email address

Your `.env` should have:
```
GOOGLE_ANALYTICS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA....\n-----END PRIVATE KEY-----\n"
GOOGLE_ANALYTICS_EMAIL="service-account@project.iam.gserviceaccount.com"
```

**Important**: The private key needs the literal `\n` characters preserved in the environment variable.

### 4. Get GA4 Property ID

1. Go to [Google Analytics 4](https://analytics.google.com/)
2. Select your **Property**
3. Go to **Admin** → **Property Settings**
4. Copy the **Property ID** (e.g., `123456789`)
5. Add to `.env`:
```
GA4_PROPERTY_ID="123456789"
```

### 5. Grant Service Account Access to GA4

This is the crucial step that fixes the 403 error:

1. In Google Analytics, select your **Property**
2. Go to **Admin** → **Property Access Management**
3. Click **Invite users**
4. Paste the service account email: `service-account@project.iam.gserviceaccount.com`
5. Select role: **Analyst** (minimum required)
6. Click **Invite**
7. **Wait 5-10 minutes** for permissions to propagate

### Verification

After completing setup, test with:
```bash
curl -X POST http://localhost:3000/api/analytics/ga4 \
  -H "Content-Type: application/json" \
  -d '{"days":30}'
```

Should return actual metrics instead of `error: "Failed to fetch GA4 data"`

---

## Meta Ads Setup Instructions

### 1. Create Meta Business App

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Click **Create App** → **Business**
3. Fill in app details
4. In **Products**, add **Marketing API**

### 2. Get Business Account ID

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Click **Settings** (bottom left gear icon)
3. In left sidebar, click **Business Settings** → **Business Portfolio**
4. Find your **Business Account ID** or **Ad Account ID** (format: `act_123456789`)
5. Add to `.env`:
```
META_BUSINESS_ACCOUNT_ID="act_123456789"
```

### 3. Create System User & Generate Access Token

1. In **Business Settings**, go to **Users** → **System Users**
2. Click **Create System User**
3. Give it a name and select role: **Admin**
4. Click **Create System User**
5. On the system user, click **Generate Token**
6. Select your app from the dropdown
7. Check these permissions:
   - ✓ `ads_management`
   - ✓ `ads_read`
   - ✓ `business_management`
8. Click **Generate Token**
9. Copy the token and add to `.env`:
```
META_ACCESS_TOKEN="EAAB..."
```

### 4. Get Business Account Access

Ensure your system user has access to:
1. Your business account
2. Your ad accounts

To check/grant access:
1. Go to **Business Settings** → **Accounts** → **Ad Accounts**
2. Assign your system user to the ad accounts

### Verification

After completing setup, test with:
```bash
curl -X POST http://localhost:3000/api/analytics/meta \
  -H "Content-Type: application/json" \
  -d '{"days":30}'
```

Should return actual metrics instead of `error: "Failed to fetch Meta analytics"`

---

## Troubleshooting

### GA4: Still Getting 403 Forbidden?
- Wait 10 minutes after adding the service account (permissions propagate slowly)
- Check you added the service account to the **Property**, not the Account
- Verify the service account email is exactly correct
- Try refreshing your browser after waiting

### Meta: Still Getting "Invalid OAuth access token"?
- Check the token hasn't expired (regenerate a new one)
- Verify the token has the right scopes: `ads_management`, `ads_read`, `business_management`
- Confirm the token is for the correct business account
- Make sure there are no extra spaces in the `.env` value

### How to Check Current Configuration

In browser developer console (F12), when admin dashboard loads:
```javascript
// Check if GA4 is configured
fetch('/api/analytics/ga4', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({days: 30})
})
.then(r => r.json())
.then(d => console.log('GA4:', d))

// Check if Meta is configured
fetch('/api/analytics/meta', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({days: 30})
})
.then(r => r.json())
.then(d => console.log('Meta:', d))
```

If you see `"error"` fields, the credentials are misconfigured.
If you see actual numbers, the integration is working!

---

## Environment Variables Summary

```bash
# GA4 Analytics (Optional - but recommended for traffic insights)
GA4_PROPERTY_ID="123456789"
GOOGLE_ANALYTICS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_ANALYTICS_EMAIL="service-account@project.iam.gserviceaccount.com"

# Meta Ads Analytics (Optional - for ad performance tracking)
META_BUSINESS_ACCOUNT_ID="act_123456789"
META_ACCESS_TOKEN="EAAB..."
```

**Note**: If these environment variables are not set, the analytics dashboard will show "not configured" messages, but the app will continue to work normally.

---

## What Gets Tracked

Once properly configured, you'll see in the admin analytics dashboard:

### GA4 Tab
- Total page views and sessions
- Unique users
- Average session duration
- Bounce rate
- Traffic by device (desktop/mobile/tablet)
- Traffic trends over time

### Meta Ads Tab
- Total impressions and clicks
- Click-through rate (CTR)
- Total ad spend
- Cost per click (CPC)
- Cost per mille/thousand impressions (CPM)
- Return on ad spend (ROAS)
- Campaign performance breakdown
- Performance metrics (conversions, conversion rate)

---

## Support

For more information:
- [Google Analytics 4 API Docs](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Meta Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)
