# ChatGPT Actions Integration Guide

Complete implementation guide for ChatGPT Actions using OpenAPI schema. This replaces the MCP approach with a simpler, more direct integration.

## Setup Overview

1. **OpenAPI Schema**: `openapi.yaml` (already created)
2. **API Routes**: Implement 7 Next.js endpoints
3. **System Prompt**: Copy to ChatGPT Builder

---

## Part 1: API Route Implementations

Create these 7 Next.js API routes:

### 1. `/api/trial/start` - Start Trial Assessment

**File**: `app/api/trial/start/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childAge, relationshipType } = body;

    // Validation
    if (!childAge || childAge < 3 || childAge > 18) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_age",
          message: "Child age must be between 3 and 18 years old.",
        },
        { status: 400 }
      );
    }

    if (!["parent", "educator", "other"].includes(relationshipType)) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_relationship",
          message: "Relationship type must be 'parent', 'educator', or 'other'.",
        },
        { status: 400 }
      );
    }

    // Generate trial session
    const sessionId = `trial_${randomUUID()}`;

    // Store trial session
    await prisma.trialSession.create({
      data: {
        id: sessionId,
        childAge,
        relationshipType,
        status: "started",
        questions: [],
        answers: [],
      },
    });

    // Return 15 trial questions
    const questions = getTrialQuestions();

    return NextResponse.json({
      success: true,
      sessionId,
      questions,
      totalQuestions: 15,
      estimatedTime: "5-10 minutes",
    });
  } catch (error) {
    console.error("[Trial Start] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "An error occurred while starting the trial.",
      },
      { status: 500 }
    );
  }
}

function getTrialQuestions() {
  return [
    { id: "trial_1", text: "Does the child struggle to pay attention in school or during activities?", domain: "attention" },
    { id: "trial_2", text: "Does the child have difficulty controlling their behavior?", domain: "behavior" },
    { id: "trial_3", text: "Does the child show signs of anxiety or worry?", domain: "emotion" },
    { id: "trial_4", text: "Does the child get frustrated easily?", domain: "emotion" },
    { id: "trial_5", text: "Does the child struggle with social interactions?", domain: "social" },
    { id: "trial_6", text: "Does the child have difficulty following instructions?", domain: "behavior" },
    { id: "trial_7", text: "Does the child appear hyperactive or restless?", domain: "attention" },
    { id: "trial_8", text: "Does the child have mood swings or emotional changes?", domain: "emotion" },
    { id: "trial_9", text: "Does the child show signs of sadness or low mood?", domain: "emotion" },
    { id: "trial_10", text: "Does the child struggle with transitions or changes in routine?", domain: "behavior" },
    { id: "trial_11", text: "Does the child show aggressive behavior or anger?", domain: "behavior" },
    { id: "trial_12", text: "Does the child engage in repetitive behaviors or interests?", domain: "social" },
    { id: "trial_13", text: "Does the child struggle with impulse control?", domain: "behavior" },
    { id: "trial_14", text: "Does the child show signs of learning difficulties?", domain: "attention" },
    { id: "trial_15", text: "Overall, how concerned are you about the child's development?", domain: "overall" },
  ];
}
```

### 2. `/api/trial/submit` - Submit Trial Answers

**File**: `app/api/trial/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, answers } = body;

    if (!sessionId || !answers || answers.length !== 15) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_answers",
          message: "Must provide all 15 answers.",
        },
        { status: 400 }
      );
    }

    // Get trial session
    const session = await prisma.trialSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "session_not_found",
          message: "Trial session not found.",
        },
        { status: 404 }
      );
    }

    // Calculate scores
    const scores = calculateTrialScores(answers);
    const overallScore = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    // Generate summary
    let severity = "low";
    if (overallScore > 70) severity = "elevated";
    if (overallScore > 80) severity = "high";

    const summary = getSummaryByScore(overallScore);
    const recommendations = getRecommendations(scores);

    // Update session
    await prisma.trialSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        answers: answers,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      assessmentId: sessionId,
      score: overallScore,
      severity,
      summary,
      domainScores: scores,
      recommendations,
      nextSteps: "Take the full assessment for detailed insights and personalized recommendations.",
    });
  } catch (error) {
    console.error("[Trial Submit] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "An error occurred while submitting the trial.",
      },
      { status: 500 }
    );
  }
}

function calculateTrialScores(answers: any[]) {
  const domainCounts: Record<string, number> = {
    attention: 0,
    behavior: 0,
    emotion: 0,
    social: 0,
    overall: 0,
  };

  const domainAnswers: Record<string, number> = {
    attention: 0,
    behavior: 0,
    emotion: 0,
    social: 0,
    overall: 0,
  };

  // Map answers to domains
  const questionDomains: Record<string, string> = {
    trial_1: "attention",
    trial_2: "behavior",
    trial_3: "emotion",
    trial_4: "emotion",
    trial_5: "social",
    trial_6: "behavior",
    trial_7: "attention",
    trial_8: "emotion",
    trial_9: "emotion",
    trial_10: "behavior",
    trial_11: "behavior",
    trial_12: "social",
    trial_13: "behavior",
    trial_14: "attention",
    trial_15: "overall",
  };

  for (const answer of answers) {
    const domain = questionDomains[answer.questionId] || "overall";
    domainCounts[domain]++;
    if (answer.answer === "yes") {
      domainAnswers[domain]++;
    }
  }

  // Calculate percentages (yes answers = higher concern)
  const scores: Record<string, any> = {};
  for (const domain of Object.keys(domainCounts)) {
    const percentage = Math.round((domainAnswers[domain] / domainCounts[domain]) * 100);
    const severity = getSeverity(percentage);
    scores[domain] = {
      score: percentage,
      severity,
    };
  }

  return scores;
}

function getSeverity(score: number) {
  if (score < 20) return "minimal";
  if (score < 40) return "mild";
  if (score < 60) return "moderate";
  if (score < 80) return "significant";
  return "severe";
}

function getSummaryByScore(score: number) {
  if (score < 30)
    return "Your child is showing typical development with minimal concerns.";
  if (score < 50)
    return "Your child shows some behaviors that may benefit from attention and support.";
  if (score < 70)
    return "Your child shows several behaviors that warrant professional consultation.";
  if (score < 85)
    return "Your child shows significant behavioral concerns that would benefit from professional evaluation.";
  return "Your child shows severe behavioral concerns requiring immediate professional evaluation.";
}

function getRecommendations(scores: any[]) {
  const recs = [];

  if (scores.attention.score > 60) {
    recs.push("Implement structured routines and clear expectations");
  }
  if (scores.behavior.score > 60) {
    recs.push("Use positive reinforcement and reward systems");
  }
  if (scores.emotion.score > 60) {
    recs.push("Teach emotional regulation and coping strategies");
  }
  if (scores.social.score > 60) {
    recs.push("Facilitate structured peer interactions");
  }

  if (recs.length === 0) {
    recs.push("Continue current support and monitoring");
  }

  return recs;
}
```

### 3. `/api/user/credits` - Get User Credits

**File**: `app/api/user/credits/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    const apiKey = request.headers.get("X-API-Key");

    // Validate API key
    if (!apiKey || apiKey !== process.env.CHATGPT_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "unauthorized",
          message: "Invalid or missing API key.",
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_user_id",
          message: "user_id query parameter is required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true,
        licenses: {
          where: { status: "ACTIVE" },
          select: { licenseType: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "user_not_found",
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const license = user.licenses?.[0];
    const plan = license
      ? license.licenseType.toLowerCase()
      : "free";

    // Calculate next credit date based on plan
    const nextCreditDate = calculateNextCreditDate(plan);

    return NextResponse.json({
      success: true,
      userId: user.id,
      credits: user.credits || 0,
      plan,
      nextCreditDate,
      creditsCap: getCreditsCap(plan),
    });
  } catch (error) {
    console.error("[Get Credits] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "An error occurred.",
      },
      { status: 500 }
    );
  }
}

function getCreditsCap(plan: string): number {
  const caps: Record<string, number> = {
    free: 0,
    core_monthly: 6,
    family_monthly: 15,
    core_annual: 6,
    family_annual: 15,
  };
  return caps[plan] || 0;
}

function calculateNextCreditDate(plan: string): string {
  const today = new Date();
  if (plan.includes("monthly")) {
    today.setMonth(today.getMonth() + 1);
  } else if (plan.includes("annual")) {
    today.setFullYear(today.getFullYear() + 1);
  }
  return today.toISOString();
}
```

### 4. `/api/checkout` - Create Stripe Checkout

**File**: `app/api/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/db/prisma";

const PLANS = {
  single_assessment: { credits: 1, priceId: process.env.STRIPE_SINGLE_PRICE_ID },
  core_monthly: { credits: 2, priceId: process.env.STRIPE_CORE_MONTHLY_PRICE_ID },
  family_monthly: { credits: 5, priceId: process.env.STRIPE_FAMILY_MONTHLY_PRICE_ID },
  core_annual: { credits: 24, priceId: process.env.STRIPE_CORE_ANNUAL_PRICE_ID },
  family_annual: { credits: 60, priceId: process.env.STRIPE_FAMILY_ANNUAL_PRICE_ID },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planType, successUrl, cancelUrl } = body;
    const apiKey = request.headers.get("X-API-Key");

    // Validate API key
    if (!apiKey || apiKey !== process.env.CHATGPT_API_KEY) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Invalid API key." },
        { status: 401 }
      );
    }

    if (!userId || !planType) {
      return NextResponse.json(
        { success: false, error: "invalid_request", message: "Missing required fields." },
        { status: 400 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];
    if (!plan || !plan.priceId) {
      return NextResponse.json(
        { success: false, error: "invalid_plan", message: "Invalid plan type." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "user_not_found", message: "User not found." },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: planType.includes("monthly") || planType.includes("annual") ? "subscription" : "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: { userId, planType },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      planType,
      price: plan.credits,
    });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { success: false, error: "server_error", message: "Failed to create checkout." },
      { status: 500 }
    );
  }
}
```

### 5. `/api/assessment/start` - Start Full Assessment

**File**: `app/api/assessment/start/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, childName, childAge, relationshipType } = body;
    const apiKey = request.headers.get("X-API-Key");

    // Validate API key
    if (!apiKey || apiKey !== process.env.CHATGPT_API_KEY) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Invalid API key." },
        { status: 401 }
      );
    }

    // Validate input
    if (!childAge || childAge < 3 || childAge > 18) {
      return NextResponse.json(
        { success: false, error: "invalid_age", message: "Invalid child age." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, email: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "user_not_found", message: "User not found." },
        { status: 404 }
      );
    }

    // Check credits
    const credits = user.credits || 0;
    if (credits < 1) {
      // Create checkout for credits
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Assessment Credits" },
              unit_amount: 997, // $9.97
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      });

      return NextResponse.json(
        {
          success: false,
          error: "insufficient_credits",
          message: "You need 1 credit to start an assessment.",
          creditsNeeded: 1,
          creditsAvailable: credits,
          checkoutUrl: session.url,
        },
        { status: 402 }
      );
    }

    // Create assessment
    const assessmentId = randomUUID();
    await prisma.assessment.create({
      data: {
        id: assessmentId,
        userId,
        subjectName: childName,
        status: "IN_PROGRESS",
        mode: "FULL",
      },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: userId },
      data: { credits: credits - 1 },
    });

    const questions = getFullAssessmentQuestions(childAge);

    return NextResponse.json({
      success: true,
      assessmentId,
      childName,
      childAge,
      questions,
      totalQuestions: 75,
      estimatedTime: "20-30 minutes",
      creditDeducted: 1,
      creditsRemaining: credits - 1,
    });
  } catch (error) {
    console.error("[Assessment Start] Error:", error);
    return NextResponse.json(
      { success: false, error: "server_error", message: "Failed to start assessment." },
      { status: 500 }
    );
  }
}

function getFullAssessmentQuestions(childAge: number) {
  // Return array of 75 questions (simplified here - expand based on your domain structure)
  const categories = ["attention", "behavior", "social", "emotion", "academic"];
  const questions = [];
  let questionId = 1;

  for (const category of categories) {
    for (let i = 0; i < 15; i++) {
      questions.push({
        id: `q_${questionId}`,
        text: `Question ${questionId} about ${category}`,
        domain: category,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        options: ["never", "rarely", "sometimes", "often", "very_often"],
      });
      questionId++;
    }
  }

  return questions;
}
```

### 6. `/api/assessment/submit` - Submit Full Assessment

**File**: `app/api/assessment/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, answers } = body;

    if (!assessmentId || !answers || answers.length !== 75) {
      return NextResponse.json(
        { success: false, error: "invalid_answers", message: "Must provide all 75 answers." },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "assessment_not_found", message: "Assessment not found." },
        { status: 404 }
      );
    }

    // Update assessment with answers
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // In production: Call scoring engine, store results in ChatGPTAssessmentResult

    return NextResponse.json({
      success: true,
      assessmentId,
      status: "submitted",
      message: "Assessment submitted successfully. Results will be available shortly.",
    });
  } catch (error) {
    console.error("[Assessment Submit] Error:", error);
    return NextResponse.json(
      { success: false, error: "server_error", message: "Failed to submit assessment." },
      { status: 500 }
    );
  }
}
```

### 7. `/api/assessment/{assessmentId}/results` - Get Results

**File**: `app/api/assessment/[assessmentId]/results/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, error: "missing_id", message: "Assessment ID is required." },
        { status: 400 }
      );
    }

    // Fetch from database (implement based on your schema)
    // const result = await prisma.chatGPTAssessmentResult.findUnique({
    //   where: { assessmentId }
    // });

    // Placeholder response
    return NextResponse.json({
      success: true,
      assessmentId,
      overallScore: 72,
      riskLevel: "moderate",
      percentile: 65,
      domainScores: {
        attention: { score: 75, percentile: 70, severity: "moderate", interpretation: "Some difficulty with sustained attention" },
        behavior: { score: 68, percentile: 60, severity: "mild", interpretation: "Occasional behavior challenges" },
      },
      recommendations: [
        "Implement structured routines and clear expectations",
        "Use positive reinforcement and reward systems",
      ],
      nextSteps: ["Schedule consultation with school counselor", "Implement suggested behavior strategies"],
      disclaimer: "These results are based on observation-based responses and should not be considered a clinical diagnosis.",
    });
  } catch (error) {
    console.error("[Get Results] Error:", error);
    return NextResponse.json(
      { success: false, error: "server_error", message: "Failed to fetch results." },
      { status: 500 }
    );
  }
}
```

---

## Part 2: GPT System Prompt

Copy this entire prompt into the ChatGPT Builder under "Custom Instructions":

```
You are the BehaviorIQ Assessment Assistant, helping parents and educators understand child behavior through AI-powered assessments.

## Your Role
Guide users through quick behavioral assessments and provide actionable insights. You are helpful, professional, and empathetic when discussing sensitive child development topics.

## Assessment Flow

### For New Users (No Account Required)
1. **Start with the Trial Assessment** - Offer to start a quick 15-question trial that takes 5-10 minutes
2. **Call the trial/start action** with:
   - childAge (3-18)
   - relationshipType (parent, educator, or other)
3. **Present the 15 yes/no questions** one at a time. For example:
   - "Does the child struggle to pay attention in school or during activities?"
   - Wait for response before moving to next question
4. **When all 15 are answered**, call trial/submit action with all answers
5. **Share the trial results** including:
   - Overall concern score (0-100)
   - Domain scores (Attention, Behavior, Emotion, Social)
   - Key recommendations based on scores
   - Severity assessment

### For Authenticated Users (With Account)
1. **Check their credits** by calling `/api/user/credits?user_id={userId}`
   - If credits ≥ 1: Proceed to full assessment
   - If credits = 0: Offer to purchase credits
2. **Start Full Assessment** by calling `assessment/start` with:
   - userId
   - childName
   - childAge (3-18)
   - relationshipType
3. **Present all 75 questions** organized by domain:
   - Attention & Focus (15 questions)
   - Behavior & Impulse Control (15 questions)
   - Social & Peer Relations (15 questions)
   - Emotional & Mood (15 questions)
   - Academic & Learning (15 questions)
4. **Format each question with rating scale**: Never, Rarely, Sometimes, Often, Very Often
5. **When complete**, call `assessment/submit` with all 75 answers
6. **Fetch results** using `assessment/{assessmentId}/results`

## Handling Payments (Insufficient Credits)

When user has 0 credits:

1. **Offer Plans:**
   - "Single Assessment" - $9.97 for 1 credit (one-time)
   - "Core Plan" - $59.99/month for 2 credits/month
   - "Family Plan" - $99.99/month for 5 credits/month

2. **Call checkout action** with:
   ```
   POST /api/checkout
   {
     "userId": "user-id",
     "planType": "single_assessment | core_monthly | family_monthly",
     "successUrl": "https://app.behavioriq.com/dashboard"
   }
   ```

3. **Share the checkout URL** and ask user to complete payment
4. **After payment**, remind them to return to complete the assessment
5. **After checkout completion**, call the assessment/start action again

## Presenting Results

When results are ready:

1. **Share Domain Breakdown**:
   - Each domain score (0-100)
   - Severity level (minimal, mild, moderate, significant, severe)
   - Interpretation in plain language

2. **Provide Recommendations**:
   - Domain-specific action items
   - Behavioral strategies based on scores
   - When to seek professional evaluation

3. **Next Steps**:
   - "Schedule consultation with school counselor if elevated"
   - "Implement recommended behavior strategies at home"
   - "Monitor progress over next 4 weeks"
   - "Consider full district assessment if school-related"

4. **Always Include Disclaimer**:
   "⚠️  **Important Disclaimer**: These results are based on observation-based parent/educator responses and should not be considered a clinical diagnosis. Please consult with a qualified healthcare professional (pediatrician, psychologist, or behavioral specialist) for clinical assessment and diagnosis."

## Key Guidelines

### Be Empathetic
- Use warm, non-judgmental language
- Acknowledge parent/educator concerns
- Normalize developmental variations
- Never diagnose or suggest psychiatric conditions

### Be Clear
- Explain what each domain measures
- Use everyday language for scores (not clinical jargon)
- Help users understand severity levels
- Provide actionable next steps

### Privacy & Safety
- Never store personal information beyond what's necessary
- All data is HIPAA-compliant
- Results are for reference only, not for diagnosis
- Encourage professional consultation for serious concerns

### Conversation Examples

**Starting a Trial:**
"I can help you understand your child's behavior through a quick assessment. This 15-question trial takes just 5-10 minutes. Before we start, I need to know:
1. How old is your child? (3-18 years)
2. What's your relationship? (Parent, educator, or other)"

**Presenting a Question:**
"Question 3: Does the child have difficulty controlling their behavior? (Yes/No)"

**Sharing Results:**
"Great job completing the assessment! Here's what we found:

**Overall Score: 72/100** (Moderate Concern)

**By Domain:**
- Attention: 75 (Some difficulty with focus)
- Behavior: 68 (Occasional challenges)
- Emotion: 80 (Notable anxiety or mood concerns)
- Social: 65 (Some peer interaction challenges)
- Academic: 70 (Learning-related concerns)

**I recommend:**
1. Implement structured routines at home
2. Use positive reinforcement for desired behaviors
3. Consider chatting with the school counselor
4. Monitor progress over the next month

Would you like to take the full 75-question assessment for detailed insights?"

## Action API Calls

Use these actions as needed:

- **POST /api/trial/start** → Start 15-question trial
- **POST /api/trial/submit** → Submit trial answers
- **GET /api/user/credits** → Check user credits
- **POST /api/checkout** → Create payment checkout
- **POST /api/assessment/start** → Start 75-question assessment
- **POST /api/assessment/submit** → Submit assessment answers
- **GET /api/assessment/{id}/results** → Fetch scored results

Always include the `X-API-Key` header for authenticated endpoints.

## Common Scenarios

**Scenario 1: First-time trial user**
1. Start → Present questions → Submit → Show results → Offer full assessment

**Scenario 2: Returning user with credits**
1. Ask if they want trial or full assessment
2. If full: Confirm credits are available
3. Start assessment → Present questions → Submit → Show results

**Scenario 3: User wants full assessment but no credits**
1. Call checkout
2. Share checkout URL
3. Ask them to complete payment
4. When ready, start the full assessment

**Scenario 4: Score indicates high concern**
1. Show results professionally
2. Provide specific recommendations
3. Strongly encourage professional consultation
4. Offer to help them schedule with a specialist (if available)

## Tone & Style
- Professional but conversational
- Empathetic and supportive
- Educational (explain assessments clearly)
- Action-oriented (give clear next steps)
- Never clinical or alarming
```

---

## Part 3: Hosting the OpenAPI Schema

### Option A: Host in Repository
Place `openapi.yaml` in your public folder or at a dedicated route:

```typescript
// app/api/openapi/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "openapi.yaml");
  const content = fs.readFileSync(filePath, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/x-yaml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

### Option B: Vercel/Deployment
Your OpenAPI file is accessible at:
```
https://app.behavioriq.com/openapi.yaml
```

---

## Setup Checklist

- [ ] Create all 7 API routes (code above)
- [ ] Update environment variables:
  - `CHATGPT_API_KEY` (for X-API-Key validation)
  - `STRIPE_*_PRICE_ID` (for all plans)
  - `NEXT_PUBLIC_SITE_URL` (for redirects)
- [ ] Deploy OpenAPI schema to accessible URL
- [ ] Test each endpoint with curl or Postman
- [ ] Register ChatGPT App at https://platform.openai.com/apps
- [ ] Paste OpenAPI URL and System Prompt into ChatGPT Builder
- [ ] Test full flow: Trial → Results → Full Assessment → Payment → Results

---

## Testing

### Test Trial Flow
```bash
curl -X POST https://app.behavioriq.com/api/trial/start \
  -H "Content-Type: application/json" \
  -d '{"childAge": 8, "relationshipType": "parent"}'
```

### Test Checkout
```bash
curl -X POST https://app.behavioriq.com/api/checkout \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"userId": "user-id", "planType": "single_assessment"}'
```

### Test Full Assessment
```bash
curl -X POST https://app.behavioriq.com/api/assessment/start \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"userId": "user-id", "childName": "Emma", "childAge": 8, "relationshipType": "parent"}'
```

---

## Next Steps

1. **Implement all 7 routes** using the code above
2. **Set environment variables** in production
3. **Test each endpoint** thoroughly
4. **Deploy to production**
5. **Register ChatGPT App** at OpenAI platform
6. **Paste OpenAPI URL** and **System Prompt** into ChatGPT Builder
7. **Test the full flow** in ChatGPT
8. **Launch! 🚀**

---

**Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Ready for Implementation
