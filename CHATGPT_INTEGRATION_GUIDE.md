# ChatGPT App Integration Guide

This guide explains how to register and publish the AI Diagnostic Assessments ChatGPT app.

## Current Status

✅ **MCP Server**: Fully implemented at `/api/mcp`
✅ **App Manifest**: Created at `/.well-known/ai-plugin.json`
✅ **Widget Pages**: Trial, Assessment, and Results pages ready
✅ **Session Management**: API routes for session handling
✅ **Authentication**: Magic link implementation ready

## Step 1: Register as OpenAI Developer

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Click "Apps" in the left sidebar
4. Select "Create new app"
5. Fill in basic information:
   - **Name**: AI Diagnostic Assessments
   - **Description**: Take behavioral health assessments through conversational AI
   - **Category**: Health & Wellness / Education

## Step 2: Configure App Manifest

The app manifest is located at `/.well-known/ai-plugin.json` and includes:

### Key Configuration Points:

**MCP Server URL:**
```json
{
  "runtime": {
    "type": "mcp",
    "url": "https://behavioriq.app/api/mcp"
  }
}
```

**Tools Defined:**
1. `start_trial` - Begin free trial assessment (anonymous)
2. `start_full_assessment` - Begin comprehensive assessment (authenticated)
3. `view_results` - Display assessment results

**Widget Resources:**
- `widget://trial` - Trial assessment interface
- `widget://assessment` - Full assessment interface
- `widget://results` - Results display

## Step 3: Set Up Icons

Add these image files to `/public/`:
- `icon-light.png` (150x150px) - Light mode icon
- `icon-dark.png` (150x150px) - Dark mode icon

## Step 4: Configure Environment Variables

Add to `.env.local` or production environment:

```env
NEXT_PUBLIC_APP_URL=https://behavioriq.app
OPENAI_APP_ID=your_app_id_from_openai_portal
OPENAI_APP_SECRET=your_app_secret_from_openai_portal
```

## Step 5: Test Local Development

For local testing with ChatGPT, use ngrok to expose your local server:

```bash
# Install ngrok if needed
brew install ngrok

# Start ngrok on port 3000
ngrok http 3000

# You'll get a URL like: https://xxxx-xxx-xxx.ngrok.io
# Use this as your NEXT_PUBLIC_APP_URL in .env.local
```

## Step 6: MCP Server Verification

The MCP server expects requests in this format:

### Tool Discovery Request:
```json
{
  "method": "tools/list",
  "params": {}
}
```

**Response:**
```json
{
  "tools": [
    {
      "name": "start_trial",
      "description": "...",
      "inputSchema": {...}
    },
    ...
  ]
}
```

### Tool Invocation Request:
```json
{
  "method": "tools/call",
  "params": {
    "name": "start_trial",
    "arguments": {
      "anonymous": true,
      "region": "US"
    }
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "resource",
      "resource": {
        "uri": "widget://trial?sessionId=xxx",
        "text": "Trial assessment started!"
      }
    }
  ],
  "metadata": {
    "openai/outputTemplate": "widget://trial",
    "openai/resultCanProduceWidget": true
  }
}
```

## Step 7: Widget Pages

Three widget pages handle the ChatGPT integration:

### Trial Widget (`/app/chatgpt/trial/page.tsx`)
- Renders trial assessment questions
- Collects answers (Likert scale 0-4)
- Shows progress indicator
- Displays results on completion

### Assessment Widget (`/app/chatgpt/assessment/[id]/page.tsx`)
- Handles authenticated full assessments
- Shows conversational interface
- Integrates with existing ConversationalAIFactory
- Handles pause/resume

### Results Widget (`/app/chatgpt/results/[id]/page.tsx`)
- Displays domain scores
- Shows risk level indicators
- Provides top 3 recommendations
- Links to upgrade options

## Step 8: Authentication Flow

For full assessments, the system uses magic links:

1. User requests full assessment without authentication
2. System prompts for email address
3. Magic link sent to email
4. User clicks link and is redirected back to widget
5. Widget resumes with authenticated session

API Routes:
- `POST /api/chatgpt/auth/magic-link` - Request magic link
- `GET /api/chatgpt/auth/callback` - Handle magic link redirect

## Step 9: Stripe Integration (Optional)

For payment handling within ChatGPT:

1. Create Stripe Checkout session
2. Return Stripe payment form to widget
3. Handle success/cancel redirects
4. Update user license on successful payment

Routes:
- `POST /api/stripe/checkout` - Create checkout session

## Step 10: Publish to App Store

1. In OpenAI Developer Portal, click "Publish"
2. Review all information:
   - App name, description, category
   - Icons and branding
   - MCP endpoint URL
   - Privacy policy and terms
3. Submit for review (typically 24-48 hours)
4. Once approved, app appears in ChatGPT's App Store

## Testing Checklist

- [ ] MCP server responds to `/api/mcp` POST requests
- [ ] `tools/list` returns all 3 tools
- [ ] `start_trial` creates session and returns widget URI
- [ ] Trial widget renders and accepts answers
- [ ] Results widget displays scores and recommendations
- [ ] `start_full_assessment` requires authentication
- [ ] Magic link flow works end-to-end
- [ ] `view_results` retrieves and displays results
- [ ] All widgets are responsive and mobile-friendly
- [ ] Error states are handled gracefully
- [ ] Session data persists across widget reloads

## Monitoring

After launch, monitor:

1. **Error Logs**: Check `/api/mcp` for failures
2. **Session Creation**: Monitor `/api/chatgpt/session` endpoints
3. **Completion Rates**: Track assessment completion via existing analytics
4. **User Feedback**: Monitor support emails for ChatGPT-specific issues

## Troubleshooting

### MCP Server Not Responding

Check that:
- `NEXT_PUBLIC_APP_URL` is set correctly in environment
- Server is running and accessible at `/api/mcp`
- Endpoint returns valid JSON responses
- No CORS issues (if testing cross-origin)

### Widgets Not Rendering

Verify:
- Widget pages exist at `/app/chatgpt/**/page.tsx`
- Pages handle query parameters correctly
- OpenAI SDK is properly initialized
- No hydration errors in browser console

### Magic Link Not Working

Ensure:
- Email service is configured
- Magic link route returns valid auth token
- Callback page properly handles token validation
- Session can be resumed with auth token

### Sessions Not Persisting

Check:
- `ConversationalSession` table has records
- Session update endpoints work correctly
- Browser allows sessionStorage/localStorage
- Proper error handling for session lookups

## API Route Reference

### MCP Endpoint
- `POST /api/mcp` - Handle ChatGPT requests

### ChatGPT Session Routes
- `POST /api/chatgpt/session` - Create session
- `GET /api/chatgpt/session/[sessionId]` - Get session state
- `POST /api/chatgpt/session/[sessionId]/answer` - Submit answer
- `GET /api/chatgpt/session/[sessionId]/results` - Get results

### Authentication Routes
- `POST /api/chatgpt/auth/magic-link` - Send magic link
- `GET /api/chatgpt/auth/callback` - Handle redirect

### Existing Routes (Via Adapter)
- `POST /api/trial/start` - Create trial session
- `POST /api/assessment/start` - Create full assessment
- `GET /api/assessment/[id]/results` - Fetch results

## Security Considerations

1. **Rate Limiting**: Implement on auth and session creation endpoints
2. **CORS**: Ensure proper CORS headers for iframe communication
3. **Session Validation**: Verify session ownership before returning data
4. **Input Validation**: Sanitize all user inputs
5. **PII Protection**: Never send personal data to ChatGPT logs

## Future Enhancements

- [ ] Support for multiple assessment languages
- [ ] Adaptive questioning based on responses
- [ ] Sharing results directly from ChatGPT
- [ ] Historical assessment tracking within ChatGPT
- [ ] Scheduled assessments/reminders
- [ ] Integration with other health platforms

## Support

For issues:
1. Check server logs: `npm run dev` output
2. Test MCP endpoint directly: `curl -X POST http://localhost:3000/api/mcp`
3. Check ChatGPT app settings in OpenAI portal
4. Contact support@behavioriq.app for help
