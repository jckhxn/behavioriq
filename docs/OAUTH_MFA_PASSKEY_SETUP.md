# OAuth, MFA, and Passkey Authentication Setup Guide

## Overview

This guide covers the setup and implementation of three authentication enhancements:

1. **OAuth Providers** - Google and Apple Sign-In
2. **MFA/2FA** - Time-based One-Time Password (TOTP) authentication
3. **Passkeys** - WebAuthn biometric authentication

## Table of Contents

- [Dependencies](#dependencies)
- [Database Setup](#database-setup)
- [Supabase Configuration](#supabase-configuration)
- [Environment Variables](#environment-variables)
- [Component Overview](#component-overview)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Dependencies

All required packages have been installed:

```bash
npm install qrcode @simplewebauthn/server @simplewebauthn/browser
npm install -D @types/qrcode
```

### Installed Packages:

- `qrcode` - QR code generation for MFA enrollment
- `@simplewebauthn/server` - Server-side WebAuthn verification
- `@simplewebauthn/browser` - Client-side WebAuthn registration
- `@types/qrcode` - TypeScript types for qrcode

## Database Setup

### Prisma Schema Changes

Two new models have been added to `prisma/schema.prisma`:

#### Passkey Model

```prisma
model Passkey {
  id                String   @id @default(cuid())
  userId            String
  name              String   // User-friendly name (e.g., "iPhone 13")
  credentialId      String   @unique // Base64URL encoded credential ID
  publicKey         String   // Base64URL encoded public key
  counter           BigInt   // Signature counter for replay protection
  transports        String[] // Supported transports
  createdAt         DateTime @default(now())
  lastUsed          DateTime @default(now())

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([credentialId])
  @@map("passkeys")
}
```

#### PasskeyChallenge Model

```prisma
model PasskeyChallenge {
  id          String   @id @default(cuid())
  userId      String
  challenge   String   @unique // Base64URL encoded challenge
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([challenge])
  @@index([expiresAt])
  @@map("passkey_challenges")
}
```

### Database Migration

The schema changes have been pushed to the database:

```bash
npx prisma db push
npx prisma generate
```

## Supabase Configuration

### Enable OAuth Providers

1. **Go to Supabase Dashboard**:
   - Navigate to Authentication → Providers
   - Enable the providers you want to use

2. **Google OAuth Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials:
     - Application type: Web application
     - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

3. **Apple OAuth Setup**:
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Register a new Service ID
   - Enable "Sign in with Apple"
   - Configure domains and redirect URLs:
     - Return URLs: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy Service ID and Key ID to Supabase

### Enable MFA/2FA

1. **Go to Supabase Dashboard**:
   - Navigate to Authentication → Settings
   - Scroll to "Multi-factor authentication"
   - Enable MFA
   - Select "TOTP (Time-based One-Time Password)"

### Configure Redirect URLs

1. **Add to Redirect Whitelist**:
   - Navigate to Authentication → URL Configuration
   - Add these URLs to the whitelist:
     - `http://localhost:3000/auth/callback` (development)
     - `http://localhost:3000/mfa-verify` (MFA verification)
     - Your production URLs when deploying

## Environment Variables

Add the following to your `.env.local` file:

```bash
# WebAuthn/Passkey Configuration
NEXT_PUBLIC_SITE_NAME="AI Diagnostic"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_RP_ID="localhost"
```

### Environment Variable Descriptions:

- **NEXT_PUBLIC_SITE_NAME**: Display name for your application in WebAuthn dialogs
- **NEXT_PUBLIC_SITE_URL**: Full URL of your application
- **NEXT_PUBLIC_RP_ID**: Relying Party ID (your domain without protocol)

### Production Environment Variables:

For production, update these values:

```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_RP_ID="yourdomain.com"
```

## Component Overview

### 1. OAuthProviders Component

**Location**: `components/auth/OAuthProviders.tsx`

**Features**:

- Google Sign-In button
- Apple Sign-In button
- Loading states
- Error handling with toast notifications

**Usage**:

```tsx
import { OAuthProviders } from "@/components/auth/OAuthProviders";

<OAuthProviders />;
```

**Integrated Into**:

- Login page (`app/(auth)/login/page.tsx`)

### 2. MFASettings Component

**Location**: `components/settings/MFASettings.tsx`

**Features**:

- Check MFA enrollment status
- Enroll in TOTP MFA with QR code
- Display QR code for authenticator app scanning
- Manual secret key entry
- 6-digit verification code input
- Enable/disable MFA
- Status indicators

**Usage**:

```tsx
import { MFASettings } from "@/components/settings/MFASettings";

<MFASettings />;
```

**Integrated Into**:

- Settings page Security tab (`app/settings/page.tsx`)

**Supported Authenticator Apps**:

- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compliant app

### 3. PasskeySettings Component

**Location**: `components/settings/PasskeySettings.tsx`

**Features**:

- Browser WebAuthn support detection
- List registered passkeys
- Add new passkey with biometric prompt
- Delete passkey
- Device type detection (phone/laptop/fingerprint)
- Last used timestamp

**Usage**:

```tsx
import { PasskeySettings } from "@/components/settings/PasskeySettings";

<PasskeySettings />;
```

**Integrated Into**:

- Settings page Security tab (`app/settings/page.tsx`)

**Supported Devices**:

- Touch ID/Face ID (macOS/iOS)
- Windows Hello
- Android biometrics
- Hardware security keys (YubiKey, etc.)

### 4. MFA Verification Page

**Location**: `app/(auth)/mfa-verify/page.tsx`

**Features**:

- 6-digit code entry
- Challenge-response verification
- Redirect after successful verification
- Error handling

**Flow**:

1. User logs in with email/password or OAuth
2. If MFA is enabled, redirect to `/mfa-verify`
3. User enters 6-digit code from authenticator app
4. System verifies code and grants access
5. Redirect to intended destination

## API Endpoints

### Passkey Endpoints

#### 1. GET `/api/auth/passkeys`

- **Purpose**: List user's registered passkeys
- **Auth**: Required
- **Returns**: Array of passkeys with id, name, createdAt, lastUsed

#### 2. POST `/api/auth/passkeys/register`

- **Purpose**: Generate WebAuthn registration options
- **Auth**: Required
- **Returns**: Registration options and challenge

#### 3. POST `/api/auth/passkeys/verify`

- **Purpose**: Verify and store passkey credential
- **Auth**: Required
- **Body**: `{ credential, name }`
- **Returns**: Success status and stored passkey

#### 4. DELETE `/api/auth/passkeys/[id]`

- **Purpose**: Delete a passkey
- **Auth**: Required (must own passkey)
- **Returns**: Success status

## Testing

### OAuth Testing

1. **Google OAuth**:

   ```
   1. Click "Continue with Google" on login page
   2. Select Google account
   3. Should redirect to /dashboard after successful auth
   ```

2. **Apple OAuth**:
   ```
   1. Click "Continue with Apple" on login page
   2. Enter Apple ID credentials
   3. Should redirect to /dashboard after successful auth
   ```

### MFA Testing

1. **Enroll in MFA**:

   ```
   1. Go to Settings → Security
   2. Click "Enable 2FA" in MFA Settings card
   3. Scan QR code with authenticator app
   4. Enter 6-digit verification code
   5. MFA should now be enabled
   ```

2. **MFA Login Flow**:

   ```
   1. Log out
   2. Log in with email/password
   3. Should redirect to /mfa-verify
   4. Enter code from authenticator app
   5. Should redirect to dashboard
   ```

3. **Disable MFA**:
   ```
   1. Go to Settings → Security
   2. Click "Disable 2FA" button
   3. Confirm action
   4. MFA should be disabled
   ```

### Passkey Testing

1. **Add Passkey**:

   ```
   1. Go to Settings → Security
   2. Click "Add Passkey" in Passkey Settings card
   3. Enter a name (e.g., "MacBook Pro")
   4. Browser prompts for biometric (Touch ID/Face ID/Windows Hello)
   5. Authenticate with biometric
   6. Passkey should appear in list
   ```

2. **Delete Passkey**:
   ```
   1. Find passkey in list
   2. Click trash icon
   3. Confirm deletion
   4. Passkey should be removed
   ```

### Browser Compatibility

**WebAuthn Support Required**:

- Chrome/Edge 67+
- Firefox 60+
- Safari 13+
- Opera 54+

**Not Supported**:

- Internet Explorer
- Older browsers without WebAuthn

## Troubleshooting

### OAuth Issues

**Problem**: "OAuth provider not configured"
**Solution**:

- Verify OAuth provider is enabled in Supabase Dashboard
- Check Client ID and Secret are correct
- Ensure redirect URLs are whitelisted

**Problem**: "Redirect URI mismatch"
**Solution**:

- Add `/auth/callback` to OAuth provider's allowed redirect URIs
- Verify Supabase redirect URL is in provider configuration

### MFA Issues

**Problem**: "MFA not available"
**Solution**:

- Enable MFA in Supabase Dashboard (Authentication → Settings)
- Verify TOTP is selected as MFA method

**Problem**: "Invalid verification code"
**Solution**:

- Check device time is synchronized
- Code expires after 30 seconds, try next code
- Verify authenticator app is configured correctly

**Problem**: "QR code not displaying"
**Solution**:

- Check browser console for errors
- Verify qrcode package is installed
- Ensure user has MFA enrollment initiated

### Passkey Issues

**Problem**: "WebAuthn not supported"
**Solution**:

- Use a modern browser (Chrome 67+, Firefox 60+, Safari 13+)
- Check browser security settings
- Ensure HTTPS is used (required in production)

**Problem**: "Registration failed"
**Solution**:

- Check NEXT_PUBLIC_RP_ID matches your domain
- Verify NEXT_PUBLIC_SITE_URL is correct
- Ensure challenge hasn't expired (5 minute limit)

**Problem**: "Property 'passkey' does not exist on type 'PrismaClient'"
**Solution**:

- Run `npx prisma generate` to regenerate Prisma client
- Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")
- If issue persists, restart dev server

### General Issues

**Problem**: Environment variables not loading
**Solution**:

- Restart dev server after changing .env.local
- Verify variables start with NEXT*PUBLIC* for client-side access
- Check .env.local is in project root

**Problem**: Supabase auth errors
**Solution**:

- Check Supabase project is not paused
- Verify DATABASE_URL is correct
- Ensure Supabase anon key and URL are configured

## Security Best Practices

1. **OAuth**:
   - Use state parameter to prevent CSRF
   - Validate redirect URIs
   - Keep client secrets secure

2. **MFA**:
   - Require MFA for admin accounts
   - Provide backup codes for account recovery
   - Log MFA enrollment/disable events

3. **Passkeys**:
   - Require user verification (biometrics/PIN)
   - Use HTTPS in production
   - Implement counter validation for replay protection
   - Allow users to manage multiple passkeys

4. **General**:
   - Use HTTPS in production
   - Implement rate limiting on auth endpoints
   - Log authentication events
   - Provide account recovery mechanisms

## Next Steps

1. **Configure Supabase OAuth providers** (Google and Apple)
2. **Enable MFA in Supabase Dashboard**
3. **Test OAuth flows** with Google and Apple accounts
4. **Test MFA enrollment** with authenticator app
5. **Test Passkey registration** with biometric device
6. **Update production environment variables** before deployment
7. **Add OAuth provider logos** to login page (optional)
8. **Implement MFA enforcement** for admin accounts (optional)
9. **Add backup codes** for MFA recovery (optional)
10. **Implement passkey authentication** for login flow (optional)

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Apple Sign In Setup](https://developer.apple.com/sign-in-with-apple/get-started/)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Supabase Auth documentation
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Ensure database migrations are applied
