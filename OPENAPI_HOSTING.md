# How to Host & Use Your OpenAPI Schema

## 🎯 Two Options: Copy-Paste vs. Hosted URL

---

## Option 1: Paste Directly into ChatGPT Builder (Easiest)

### Steps:
1. Open `openapi.yaml` in your editor
2. Select all content (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Go to https://platform.openai.com/apps
5. Create new app → "OpenAPI Schema" section
6. Click "Import Schema" or paste directly in text box
7. Click "Save" or "Update"

### Pros:
✅ Simplest approach
✅ No hosting required
✅ Schema updates immediately in ChatGPT

### Cons:
❌ Must re-paste when schema changes
❌ Can't reference URL in documentation

---

## Option 2: Host OpenAPI Schema (Recommended)

You can host `openapi.yaml` in several ways:

### A. Next.js Route Handler (Easiest)

Create: `app/api/openapi/route.ts`

```typescript
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "openapi.yaml");
    const content = fs.readFileSync(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/x-yaml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    return new NextResponse(
      "OpenAPI schema not found",
      { status: 404 }
    );
  }
}
```

**Then access at:**
```
https://app.behavioriq.com/api/openapi
```

**Add to ChatGPT:**
```
Schema URL: https://app.behavioriq.com/api/openapi
```

---

### B. Public Folder (Vercel/Static)

**Step 1:** Create `public/openapi.yaml`
```bash
mkdir -p public
cp openapi.yaml public/openapi.yaml
```

**Step 2:** Access at:
```
https://app.behavioriq.com/openapi.yaml
```

**Step 3:** Add to ChatGPT:
```
Schema URL: https://app.behavioriq.com/openapi.yaml
```

---

### C. GitHub Raw Content

If your repo is public:

```
https://raw.githubusercontent.com/your-username/repo-name/main/openapi.yaml
```

**Pros:**
✅ Free hosting
✅ Version controlled
✅ Easy updates

**Cons:**
❌ Requires public repo
❌ Slightly slower

---

### D. Cloud Storage (AWS S3, CloudFlare, etc.)

Upload `openapi.yaml` to S3:
```bash
aws s3 cp openapi.yaml s3://your-bucket/openapi.yaml --acl public-read
```

Access at:
```
https://your-bucket.s3.amazonaws.com/openapi.yaml
```

---

## ✅ Recommended: Next.js Route Handler

Why it's best:
- ✅ No extra dependencies
- ✅ Built-in caching
- ✅ Easy updates (just redeploy code)
- ✅ Can validate schema before serving
- ✅ Can add authentication if needed

### Implementation

**File:** `app/api/openapi/route.ts`

```typescript
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // Read the YAML file
    const filePath = path.join(process.cwd(), "openapi.yaml");

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse(
        JSON.stringify({ error: "OpenAPI schema not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");

    // Return with proper headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "application/x-yaml",
        "Content-Disposition": "inline; filename=openapi.yaml",
        "Cache-Control": "public, max-age=3600", // Cache 1 hour
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[OpenAPI] Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to load OpenAPI schema" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Optional: Also serve as JSON
export async function GET_JSON(request: Request) {
  // If you want to serve as JSON for tooling that expects JSON
  // Convert YAML to JSON here
  // This is optional - most tools accept YAML
}
```

**Test it:**
```bash
curl https://app.behavioriq.com/api/openapi
```

---

## Registering in ChatGPT Builder

### Step-by-Step

1. **Go to**: https://platform.openai.com/apps

2. **Click**: "Create new app"

3. **Fill in Basic Info**:
   - Name: "BehaviorIQ Assessment"
   - Description: "AI-powered behavioral assessments for children"
   - Icon: (upload your logo)
   - Instructions: Paste from `GPT_SYSTEM_PROMPT.txt`

4. **Add Schema**:
   - Click "Import OpenAPI Schema"
   - Choose one:
     - **Paste**: Copy entire `openapi.yaml` content
     - **URL**: Enter `https://app.behavioriq.com/api/openapi`

5. **Configure Authentication**:
   - Type: API Key
   - Auth scheme: Header
   - Header name: `X-API-Key`
   - Description: "Your ChatGPT API key from dashboard"

6. **Test Endpoints**:
   - ChatGPT will test each endpoint
   - Verify they all work with your API

7. **Save App**:
   - Click "Save" or "Update"
   - Copy app ID for your records

---

## Updating Your Schema

### When You Change openapi.yaml

**Option 1: Auto-Update (URL-based)**
1. Edit `openapi.yaml`
2. Deploy to production
3. ChatGPT automatically fetches latest version (within 1 hour)

**Option 2: Manual Update (Paste)**
1. Edit `openapi.yaml`
2. Copy new content
3. Go to app settings in ChatGPT Builder
4. Paste updated schema
5. Save

**Option 3: Force Refresh**
1. Increment version in `openapi.yaml`:
   ```yaml
   info:
     version: 1.0.1  # Changed from 1.0.0
   ```
2. Redeploy
3. ChatGPT will fetch new version immediately

---

## Validating Your OpenAPI Schema

Before uploading, validate your YAML:

### Online Validator
Go to: https://editor.swagger.io

1. Paste your `openapi.yaml` content
2. If it shows red errors, fix them
3. Check "Servers" and "Paths" sections

### Command Line

```bash
# If you have Node.js
npx openapi-validator openapi.yaml

# Or with Docker
docker run -v $PWD:/app swaggerapi/swagger-validator /app/openapi.yaml
```

### Common Issues

| Error | Fix |
|-------|-----|
| `Failed to parse YAML` | Check indentation (use 2 spaces) |
| `Unknown operation: post` | Verify method is lowercase |
| `Missing required field` | Add missing `parameters` or `requestBody` |
| `Invalid reference` | Check schema names match exactly |

---

## Testing Your Endpoints

Before registering in ChatGPT, test locally:

### Test All 7 Endpoints

```bash
# 1. Trial Start
curl -X POST http://localhost:3000/api/trial/start \
  -H "Content-Type: application/json" \
  -d '{"childAge": 8, "relationshipType": "parent"}' \
  | jq

# 2. Trial Submit (use sessionId from above)
curl -X POST http://localhost:3000/api/trial/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "trial_xxxxx",
    "answers": [
      {"questionId": "trial_1", "answer": "yes"},
      {"questionId": "trial_2", "answer": "no"},
      ... (15 total)
    ]
  }' | jq

# 3. Get Credits
curl -X GET "http://localhost:3000/api/user/credits?user_id=user123" \
  -H "X-API-Key: your-test-key" \
  | jq

# 4. Checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-test-key" \
  -d '{"userId": "user123", "planType": "single_assessment"}' \
  | jq

# 5. Assessment Start
curl -X POST http://localhost:3000/api/assessment/start \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-test-key" \
  -d '{
    "userId": "user123",
    "childName": "Emma",
    "childAge": 8,
    "relationshipType": "parent"
  }' | jq

# 6. Assessment Submit
curl -X POST http://localhost:3000/api/assessment/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-test-key" \
  -d '{
    "assessmentId": "assess_xxxxx",
    "answers": [... 75 answers ...]
  }' | jq

# 7. Get Results
curl -X GET "http://localhost:3000/api/assessment/assess_xxxxx/results" \
  | jq
```

---

## Production Checklist

Before launching:

- [ ] `openapi.yaml` validated (no errors)
- [ ] All 7 endpoints tested and working
- [ ] API key set in environment variables
- [ ] Stripe price IDs configured
- [ ] CORS configured for ChatGPT domain
- [ ] HTTPS enabled (required for production)
- [ ] Rate limiting configured (optional but recommended)
- [ ] Error messages informative
- [ ] Database indexes created
- [ ] Logging enabled for troubleshooting

---

## URL Reference

### Development
```
http://localhost:3000/api/openapi (if using Route Handler)
http://localhost:3000/openapi.yaml (if using public folder)
```

### Production
```
https://app.behavioriq.com/api/openapi (if using Route Handler)
https://app.behavioriq.com/openapi.yaml (if using public folder)
https://raw.githubusercontent.com/you/repo/main/openapi.yaml (if using GitHub)
```

---

## Troubleshooting

### "Schema URL returns 404"
- Verify file is in correct location
- Check route is deployed to production
- Verify URL in ChatGPT matches deployment

### "Invalid OpenAPI schema"
- Validate at https://editor.swagger.io
- Check YAML indentation
- Verify all paths start with `/api/`

### "ChatGPT can't call endpoints"
- Verify endpoint URLs are correct
- Check API key is configured in ChatGPT
- Test endpoint with curl first
- Check CORS headers if needed

### "Changes not reflecting in ChatGPT"
- If using URL: Wait up to 1 hour or increment version number
- If using paste: Must re-paste and save
- Clear ChatGPT cache (try new conversation)

---

## Recommended Setup

✅ **Best for most projects:**

1. Create `app/api/openapi/route.ts` (Route Handler)
2. Read `openapi.yaml` from file system
3. Return with proper headers and caching
4. Register URL in ChatGPT Builder
5. Updates deploy automatically with code

This gives you:
- ✅ One source of truth
- ✅ Automatic updates
- ✅ No manual pasting needed
- ✅ Easy versioning
- ✅ Built-in caching

---

## Quick Start

```bash
# 1. Create route handler
touch app/api/openapi/route.ts
# (Copy code from above)

# 2. Test locally
curl http://localhost:3000/api/openapi

# 3. Deploy to production
git add . && git commit -m "Add OpenAPI endpoint"
git push

# 4. Test production
curl https://app.behavioriq.com/api/openapi

# 5. Register in ChatGPT Builder
# Go to: https://platform.openai.com/apps
# Schema URL: https://app.behavioriq.com/api/openapi

# Done! ✅
```

---

**Status**: Ready to implement
**Hosting Method**: Next.js Route Handler (recommended)
**Implementation Time**: 15 minutes
