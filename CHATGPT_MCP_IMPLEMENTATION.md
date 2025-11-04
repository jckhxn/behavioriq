# ChatGPT Apps SDK + MCP Integration Implementation

## Overview

This document describes the complete implementation of the ChatGPT Apps SDK integration using the Model Context Protocol (MCP). The implementation provides a production-ready integration allowing ChatGPT users to:

1. Take a 15-question trial assessment (anonymous)
2. Start a full 75-question assessment (authenticated, credit-gated)
3. View assessment results with personalized insights

## Architecture

### Core Components

#### 1. MCP Server (`lib/chatgpt/mcp/server.ts`)
- Central MCP server initialization
- Handles three tool definitions: `start_trial`, `start_full_assessment`, `view_results`
- Implements JSON-RPC 2.0 request handlers
- Manages resource delivery (widget HTML)

**Key Features:**
- Tool registration with input schema validation
- Resource reading for widget HTML delivery
- Error handling with detailed error messages
- Extensible design for future tools

#### 2. MCP Route Handler (`app/api/chatgpt/mcp/route.ts`)
- Next.js API route for ChatGPT MCP communication
- JSON-RPC 2.0 endpoint
- GET endpoint returns server info and capabilities
- POST endpoint processes tool calls

### Tools Implementation

#### Tool 1: start_trial
**File:** `lib/chatgpt/mcp/tools/start-trial.ts`

**Purpose:** Create anonymous trial assessment sessions

**Input Parameters:**
- `childAge` (number, 3-18): Age of child
- `relationshipType` (string): 'parent' | 'educator' | 'other'

**Output:**
- Trial assessment widget
- 15 randomized questions
- Session tracking ID

**Database:** Stores in `TrialSession` model (anonymous)

**Features:**
- No authentication required
- Immediately available
- Questions organized by category (attention, behavior, emotion, social, academic)

#### Tool 2: start_full_assessment
**File:** `lib/chatgpt/mcp/tools/start-full-assessment.ts`

**Purpose:** Create authenticated full assessments with credit gating

**Input Parameters:**
- `childAge` (number, 3-18): Age of child
- `relationshipType` (string): 'parent' | 'educator' | 'other'
- `childName` (string): Name of child

**Authentication Flow:**
1. Checks if user is authenticated via `getCurrentUserWithRole()`
2. If not authenticated → returns auth prompt widget
3. If authenticated → checks credit balance

**Credit System:**
- Each full assessment costs 1 credit
- Shows Stripe checkout widget if insufficient credits
- Available plans:
  - Single: $9.97 (1 credit)
  - Core Monthly: $5.99 (2 credits/month)
  - Family Monthly: $9.99 (5 credits/month)
  - Core Annual: $65.99 (24 credits/year)
  - Family Annual: $109.99 (60 credits/year)

**Output:**
- Full assessment widget with 75 questions
- Credit deduction
- Credit transaction logged

**Database:**
- Uses existing `Assessment` model
- Creates `CreditTransaction` record for auditing

#### Tool 3: view_results
**File:** `lib/chatgpt/mcp/tools/view-results.ts`

**Purpose:** Display completed assessment results

**Input Parameters:**
- `resultId` (string): UUID of assessment result

**Authorization:**
- Users can view their own results
- Super admin can view any result

**Output:**
- Formatted results with:
  - Overall score (0-100)
  - Percentile rank
  - Category-specific scores
  - Severity levels (minimal, mild, moderate, significant, severe)
  - Personalized recommendations
  - Next steps based on risk level

**Database:** Reads from `ChatGPTAssessmentResult` model

### Widget Components

#### 1. Trial Assessment Widget
**File:** `lib/chatgpt/mcp/widgets/trial-assessment.html`

**Features:**
- 15-question interface
- Progress bar and question counter
- Single-select answer format (Never, Rarely, Sometimes, Often, Very Often)
- Previous/Next navigation
- Completion screen with summary
- Account creation CTA

**Styling:**
- Purple gradient theme (#667eea to #764ba2)
- Responsive design
- Smooth animations
- Mobile-optimized

#### 2. Full Assessment Widget
**File:** `lib/chatgpt/mcp/widgets/full-assessment.html`

**Features:**
- 75-question structured interface
- Category labels for question context
- Child name and age display
- Progress tracking
- Answer validation before proceeding
- Completion screen with next steps

**Design:**
- Same purple gradient theme
- Category-based question organization
- Large fonts for readability
- Accessibility-focused

#### 3. Results Widget
**File:** `lib/chatgpt/mcp/widgets/results.html`

**Features:**
- Beautiful results visualization
- Overall score with percentile
- Risk level badge (low, moderate, elevated, high)
- Category breakdown with:
  - Raw scores
  - Percentiles
  - Severity levels
  - Interpretations
- Personalized recommendations
- Next steps checklist
- Share/download options

**Visualization:**
- Circular score display
- Color-coded severity badges
- Progress bars for category scores
- Actionable recommendations

#### 4. Checkout Widget
**File:** `lib/chatgpt/mcp/widgets/checkout.html`

**Features:**
- Plan selection with radio buttons
- Stripe integration
- Real-time payment processing
- 3D Secure support
- Success/failure handling

**Plans Displayed:**
- Single Assessment ($9.97)
- Core Plan ($5.99/month)
- Family Plan ($9.99/month - marked as "Most Popular")

#### 5. Auth Prompt Widget
**File:** `lib/chatgpt/mcp/widgets/auth-prompt.html`

**Features:**
- Email input for magic link authentication
- Magic link delivery workflow
- "Check email" screen
- Resend link functionality
- Account creation alternative

### Authentication & Authorization

#### Magic Link Authentication
**File:** `app/api/auth/chatgpt-magic-link/route.ts`

**Flow:**
1. User enters email (POST /api/auth/chatgpt-magic-link)
2. System creates MagicLinkToken
3. Email sent with 24-hour expiring link
4. User clicks link (GET /api/auth/chatgpt-magic-link/verify?token=X&email=Y)
5. Token validated
6. Email marked as verified
7. Session created with auth cookie

**Token Storage:**
- `MagicLinkToken` model with:
  - Email (primary key)
  - Unique token
  - User ID reference
  - 24-hour expiration
  - Created timestamp

**Security:**
- 32-byte random tokens
- One-time use (deleted after verification)
- Time-limited (24 hours)
- Email validation
- User creation on first login

#### OAuth 2.1 Server with PKCE

**OAuth Discovery Document**
- **File:** `app/api/.well-known/oauth-authorization-server/route.ts`
- **Endpoint:** `/.well-known/oauth-authorization-server`
- **Purpose:** Provides OAuth server metadata for ChatGPT
- **Caching:** 24-hour cache-control
- **Supported:** PKCE (S256, plain), multiple grant types

**Authorization Endpoint**
- **File:** `app/api/oauth/authorize/route.ts`
- **Endpoint:** `/api/oauth/authorize`
- **Method:** GET/POST
- **Features:**
  - PKCE support (code challenge verification)
  - State parameter validation
  - Nonce support for ID tokens
  - Authorization code generation (10-minute expiry)
  - Automatic redirect to ChatGPT callback

**Token Endpoint**
- **File:** `app/api/oauth/token/route.ts`
- **Endpoint:** `/api/oauth/token`
- **Grant Types:**
  - `authorization_code`: Exchange code for tokens
  - `refresh_token`: Renew expired access token
  - `client_credentials`: Service-to-service auth
- **Features:**
  - PKCE code challenge verification
  - JWT ID token generation
  - Token expiration (1 hour for access tokens)
  - Refresh token support

**Userinfo Endpoint**
- **File:** `app/api/oauth/userinfo/route.ts`
- **Endpoint:** `/api/oauth/userinfo`
- **Purpose:** Return authenticated user information
- **Security:** Bearer token validation
- **Return Fields:** sub, aud, iss, iat, scope

**JWT Utilities**
- **File:** `lib/oauth/jwt-utils.ts`
- **Functions:**
  - `jwtSign()`: Create HS256 signed tokens
  - `jwtVerify()`: Validate and decode tokens
  - `jwtDecode()`: Unverified decoding
  - `generatePKCEChallenge()`: Create code challenge
  - `verifyPKCEChallenge()`: Validate PKCE

### Stripe Integration

#### Checkout Session Creation
**File:** `app/api/stripe/chatgpt-checkout/route.ts`

**Features:**
- Creates Stripe checkout sessions
- Supports both one-time payments and subscriptions
- Automatic customer creation
- Metadata tracking for audit
- Handles anonymous checkouts

**Plan Mapping:**
```
single -> 1 credit, $9.97
monthly_core -> 2 credits, $5.99/month
monthly_family -> 5 credits, $9.99/month
annual_core -> 24 credits, $65.99/year
annual_family -> 60 credits, $109.99/year
```

#### Webhook Handler
**File:** `app/api/stripe/webhooks/chatgpt/route.ts`

**Events Handled:**
- `checkout.session.completed`: Verify signature → add credits
- `invoice.payment_succeeded`: Recurring payment → renew credits
- `customer.subscription.created/updated/deleted`: Subscription lifecycle
- `payment_intent.succeeded/failed`: Payment status

**Credit Logic:**
- One-time purchases add credits immediately
- Subscription renewals add credits on payment
- Credit transactions logged for auditing
- Balance tracked in User model

**Security:**
- Stripe webhook signature verification
- Rate limiting built into Stripe
- Transaction idempotency

### Database Schema

#### New Models

**MagicLinkToken**
```prisma
model MagicLinkToken {
  email       String      @id
  token       String      @unique
  userId      String
  expiresAt   DateTime
  createdAt   DateTime
  user        User
}
```

**TrialSession**
```prisma
model TrialSession {
  id              String
  childAge        Int
  relationshipType String
  status          String
  questions       Json
  answers         Json
  startedAt       DateTime
  completedAt     DateTime?
  createdAt       DateTime
}
```

**ChatGPTAssessmentResult**
```prisma
model ChatGPTAssessmentResult {
  id              String
  assessmentId    String  // References Assessment.id
  overallScore    Int
  percentile      Int
  scores          Json
  categoryScores  Json
  recommendations Json
  createdAt       DateTime
}
```

**CreditTransaction**
```prisma
model CreditTransaction {
  id          String
  userId      String
  amount      Int       // Positive (add), Negative (use)
  type        String    // PURCHASE, RENEWAL, ASSESSMENT_STARTED, REFUND, ADJUSTMENT
  reference   String?
  balanceAfter Int
  createdAt   DateTime
  user        User
}
```

**AuthorizationCode**
```prisma
model AuthorizationCode {
  code                String  @id
  clientId            String
  redirectUri         String
  scope               String
  nonce               String?
  state               String
  codeChallenge       String?
  codeChallengeMethod String?
  expiresAt           DateTime
  createdAt           DateTime
}
```

**OAuthToken**
```prisma
model OAuthToken {
  id          String
  clientId    String
  accessToken String @unique
  refreshToken String @unique
  expiresAt   DateTime
  createdAt   DateTime
}
```

#### User Model Enhancements
```prisma
credits                 Int                  // Available credits for assessments
magicLinkTokens         MagicLinkToken[]
creditTransactions      CreditTransaction[]
```

### File Structure

```
/app
  /api
    /auth
      /chatgpt-magic-link/
        route.ts                    # Magic link endpoints
    /chatgpt
      /mcp
        route.ts                    # Main MCP endpoint
    /oauth
      /authorize/
        route.ts                    # OAuth authorization
      /token/
        route.ts                    # OAuth token exchange
      /userinfo/
        route.ts                    # User info endpoint
    /.well-known
      /oauth-authorization-server/
        route.ts                    # OAuth discovery
    /stripe
      /chatgpt-checkout/
        route.ts                    # Checkout sessions
      /webhooks
        /chatgpt/
          route.ts                  # Webhook handler

/lib
  /chatgpt
    /mcp
      server.ts                     # MCP server init
      /tools
        start-trial.ts              # Trial tool
        start-full-assessment.ts    # Full assessment tool
        view-results.ts             # Results tool
      /widgets
        trial-assessment.html       # Trial widget
        full-assessment.html        # Full assessment widget
        results.html                # Results widget
        checkout.html               # Checkout widget
        auth-prompt.html            # Auth widget
  /oauth
    jwt-utils.ts                    # JWT signing/verification

/prisma
  schema.prisma                     # Updated with new models
```

## Deployment Configuration

### Environment Variables Required

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET_CHATGPT=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_...

# OAuth/JWT
JWT_SIGNING_KEY=your-secret-key-min-32-bytes

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://app.behavioriq.com

# Email (Resend)
RESEND_API_KEY=re_...
```

### Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Update Database**
   ```bash
   npm run db:migrate
   npx prisma generate
   ```

3. **Create Stripe Webhook Endpoint**
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhooks/chatgpt`
   - Events: checkout.session.completed, invoice.payment_succeeded, etc.
   - Save the signing secret to `STRIPE_WEBHOOK_SECRET_CHATGPT`

4. **Register ChatGPT App**
   - Go to https://platform.openai.com/apps
   - New App Configuration:
     - **MCP Server URL:** `https://yourdomain.com/api/chatgpt/mcp`
     - **OAuth Discovery:** `https://yourdomain.com/.well-known/oauth-authorization-server`
     - **OAuth Client ID:** (generated during registration)
     - **OAuth Redirect URI:** Will be provided by ChatGPT

5. **Verify OAuth Discovery**
   ```bash
   curl https://yourdomain.com/.well-known/oauth-authorization-server
   ```

6. **Test MCP Endpoint**
   ```bash
   curl https://yourdomain.com/api/chatgpt/mcp?tools/list
   ```

## Testing

### Manual Testing Checklist

- [ ] **Trial Assessment**
  - [ ] Access without login
  - [ ] Complete 15 questions
  - [ ] See completion screen
  - [ ] Create account option

- [ ] **Full Assessment (No Auth)**
  - [ ] Redirect to magic link prompt
  - [ ] Enter email
  - [ ] Receive magic link email
  - [ ] Click link and login
  - [ ] Assessment ready

- [ ] **Full Assessment (With Auth)**
  - [ ] No credits: Show checkout
  - [ ] Select plan
  - [ ] Complete Stripe payment
  - [ ] Credits added
  - [ ] Assessment starts
  - [ ] Complete 75 questions

- [ ] **Results**
  - [ ] View completed assessment
  - [ ] See scores and percentiles
  - [ ] Read recommendations
  - [ ] View next steps

- [ ] **OAuth Flow**
  - [ ] Authorization endpoint returns code
  - [ ] Token endpoint exchanges for tokens
  - [ ] Refresh token renews access
  - [ ] Userinfo returns correct data

### Integration Testing

```bash
# Test MCP discovery
curl -X GET https://localhost:3000/api/chatgpt/mcp

# Test tools/list
curl -X POST https://localhost:3000/api/chatgpt/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list"
  }'

# Test OAuth discovery
curl -X GET https://localhost:3000/.well-known/oauth-authorization-server
```

## Security Considerations

1. **PKCE Support**: Code challenge verification prevents authorization code interception
2. **Magic Link Tokens**: One-time use, 24-hour expiration, random generation
3. **Webhook Verification**: Stripe signature validation on all webhooks
4. **Rate Limiting**: Implement on auth endpoints to prevent brute force
5. **CORS**: Configure appropriately for ChatGPT domain
6. **HTTPS Required**: All OAuth flows must use HTTPS in production
7. **JWT Signing**: Secret key must be strong (min 32 bytes)
8. **Database Indexes**: Optimized for performance on commonly filtered fields

## Monitoring & Logging

### Key Metrics to Track

1. **Assessment Completion Rate**
   ```sql
   SELECT COUNT(*) FROM Assessment WHERE status = 'COMPLETED'
   ```

2. **Credit Transactions**
   ```sql
   SELECT type, COUNT(*), SUM(amount) FROM CreditTransaction GROUP BY type
   ```

3. **OAuth Token Usage**
   ```sql
   SELECT COUNT(*) FROM OAuthToken WHERE expiresAt > NOW()
   ```

4. **Failed Payments**
   - Monitor Stripe webhook failures
   - Alert on multiple failures from same customer

### Logging

- MCP tool executions: DEBUG level
- Authentication failures: WARNING level
- Payment processing: INFO level
- System errors: ERROR level

## Future Enhancements

1. **Advanced Analytics**
   - Track assessment trends per user
   - Comparative analysis across demographics
   - Intervention effectiveness metrics

2. **Expanded Tool Set**
   - Batch assessments (multiple children)
   - Historical comparison tool
   - Recommended intervention tool

3. **Enhanced UI**
   - Dark mode support
   - Mobile app integration
   - PDF export with branding

4. **Integration Extensions**
   - School/district reporting
   - Provider integration (EHR systems)
   - Telehealth platform integration

5. **AI Enhancements**
   - AI-powered recommendations
   - Natural language insights
   - Personalized intervention suggestions

## Support & Troubleshooting

### Common Issues

**Issue: "Magic link not received"**
- Check RESEND_API_KEY is valid
- Verify email isn't being filtered
- Check email logs in application

**Issue: "Credits not added after payment"**
- Verify webhook secret is correct
- Check webhook delivery logs in Stripe
- Ensure stripe.com IP whitelist is correct

**Issue: "OAuth authorization code expired"**
- Check system time synchronization
- Verify expiresAt calculation
- Review authorization code TTL (10 minutes)

**Issue: "MCP tools not appearing in ChatGPT"**
- Verify OAuth discovery endpoint returns valid JSON
- Check MCP server URL is accessible
- Validate tool input schemas

## Documentation References

- [Model Context Protocol](https://modelcontextprotocol.io)
- [ChatGPT Apps SDK](https://platform.openai.com/docs/apps)
- [OAuth 2.1 Specification](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-09)
- [Stripe Payment Integration](https://stripe.com/docs)
- [Prisma ORM](https://www.prisma.io/docs)

---

**Implementation Date:** 2025-11-03
**Status:** Production Ready
**Maintenance:** Ongoing monitoring and updates as per ChatGPT SDK changes
