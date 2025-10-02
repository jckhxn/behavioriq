# Conversational Assessment Flow Diagram

## Complete Data Flow with Your Custom Prompts

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER STARTS ASSESSMENT                        │
│                  /conversational-trial page                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          POST /api/assessment/conversational/start              │
│                                                                  │
│  1. Query Database (same as regular trial):                     │
│     prisma.platformSettings.findFirst({                         │
│       include: { globalTrialAssessment: { ... } }               │
│     })                                                           │
│                                                                  │
│  2. Flatten Questions from All Domains:                         │
│     - Antisocial, Violence, Attention, Emotional, Conduct       │
│     - Each with weight, domainSlug, order                       │
│                                                                  │
│  3. Create Session:                                             │
│     {                                                            │
│       id: "session_...",                                        │
│       questions: allQuestions,  // ← Same as regular trial     │
│       responses: {},                                             │
│       messages: [],                                              │
│       isComplete: false                                          │
│     }                                                            │
│                                                                  │
│  4. Generate Initial Message using CONVERSATIONAL_PROMPT:       │
│     ┌──────────────────────────────────────────────────┐       │
│     │  SYSTEM_PROMPTS.CONVERSATIONAL_PROMPT            │       │
│     │  ─────────────────────────────────────           │       │
│     │  "You are a gentle, friendly helper AI..."      │       │
│     │  "Use **markdown formatting** for emphasis"     │       │
│     │  "Use emojis occasionally (😊, 👍, ✨)"         │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│     OpenAI GPT-4o-mini generates:                               │
│     "Hi there! 😊 Let's chat about some feelings..."           │
│                                                                  │
│  5. Store Session in SessionStore                               │
│                                                                  │
│  6. Return: { sessionId, message }                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConversationalAssessment Component                  │
│                                                                  │
│  - Displays initial AI message with MarkdownMessage             │
│  - Shows progress bar                                            │
│  - User types response in input field                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         POST /api/assessment/conversational/message             │
│                                                                  │
│  Input: { sessionId, message: "yes, sometimes" }                │
│                                                                  │
│  1. Get Session from SessionStore                               │
│                                                                  │
│  2. Extract Answer (YES/NO/UNCLEAR):                            │
│     OpenAI analyzes response:                                    │
│     - "yes, sometimes" → YES (true)                             │
│     - "no, never" → NO (false)                                  │
│     - "maybe?" → UNCLEAR (null)                                 │
│                                                                  │
│  3. Store Answer:                                               │
│     session.responses[questionId] = true                         │
│                                                                  │
│  4. Move to Next Question:                                      │
│     session.currentQuestionIndex++                               │
│                                                                  │
│  5. Generate Next Response using CONVERSATIONAL_PROMPT:         │
│     ┌──────────────────────────────────────────────────┐       │
│     │  SYSTEM_PROMPTS.CONVERSATIONAL_PROMPT            │       │
│     │  ─────────────────────────────────────           │       │
│     │  Context: Current question, progress, history    │       │
│     │  Instructions: Acknowledge gently, ask next      │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│     OpenAI generates:                                            │
│     "Thanks for sharing! 👍 Here's another question..."         │
│                                                                  │
│  6. Check Completion:                                           │
│     if (all questions answered) {                                │
│       session.isComplete = true                                  │
│     }                                                            │
│                                                                  │
│  7. Return: { message, progress, isComplete }                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    (Repeat for each question)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│       POST /api/assessment/conversational/complete              │
│                                                                  │
│  Input: { sessionId }                                           │
│                                                                  │
│  1. Get Session from SessionStore                               │
│                                                                  │
│  2. Calculate Scores by Domain:                                 │
│     ┌──────────────────────────────────────────────────┐       │
│     │  For each domain (antisocial, violence, etc.):   │       │
│     │  - Sum weighted responses                         │       │
│     │  - Calculate percentage: (score/total) * 100     │       │
│     │                                                   │       │
│     │  Example:                                         │       │
│     │  {                                                │       │
│     │    "antisocial": 45,  // 45%                     │       │
│     │    "attention": 67,   // 67%                     │       │
│     │    "emotional": 23    // 23%                     │       │
│     │  }                                                │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│  3. Generate Summary using CONVERSATIONAL_ANALYSIS:             │
│     ┌──────────────────────────────────────────────────┐       │
│     │  SYSTEM_PROMPTS.CONVERSATIONAL_ANALYSIS          │       │
│     │  ──────────────────────────────────────          │       │
│     │  "You are a gentle, friendly helper AI..."      │       │
│     │  "Use **markdown formatting** liberally:"       │       │
│     │  "  - Use **bold** for key areas"               │       │
│     │  "  - Use *italics* for gentle emphasis"        │       │
│     │  "  - Use numbered lists for steps"             │       │
│     │  "  - Use emojis (😊, 💪, 🌟, 📚)"             │       │
│     │  "  - Weave resources as [links](url)"          │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│     OpenAI generates kid-friendly summary:                      │
│     ┌──────────────────────────────────────────────────┐       │
│     │  "Hi there! 😊 Great job finishing!              │       │
│     │                                                   │       │
│     │  We talked about these **important areas**:      │       │
│     │                                                   │       │
│     │  1. **Paying Attention** - Focus can be tricky   │       │
│     │  2. **Managing Feelings** - Big emotions happen  │       │
│     │                                                   │       │
│     │  Here are some tips:                              │       │
│     │  - Try [deep breathing](link) ✨                │       │
│     │  - Take *breaks* when needed                     │       │
│     │                                                   │       │
│     │  You're doing **awesome**! 💪🌟"                │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│  4. Return:                                                     │
│     {                                                            │
│       responses: { q1: true, q2: false, ... },                 │
│       scores: { antisocial: 45, attention: 67, ... },          │
│       summary: "Hi there! 😊 Great job finishing!..."          │
│       totalQuestions: 30,                                       │
│       answeredQuestions: 30                                     │
│     }                                                            │
│                                                                  │
│  5. Delete Session from SessionStore (cleanup)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConversationalAssessment Component                  │
│                                                                  │
│  1. Receives summary from API                                    │
│                                                                  │
│  2. Creates final AI message:                                   │
│     {                                                            │
│       id: "summary_...",                                        │
│       role: "ai",                                               │
│       content: summary,  // ← Kid-friendly markdown text       │
│       timestamp: new Date()                                      │
│     }                                                            │
│                                                                  │
│  3. Adds to messages array                                      │
│                                                                  │
│  4. MarkdownMessage renders with:                               │
│     - Bold/italic formatting                                     │
│     - Numbered/bulleted lists                                    │
│     - Emojis                                                     │
│     - Clickable links                                            │
│     - Syntax highlighting (if code)                              │
│                                                                  │
│  5. Shows completion indicator:                                 │
│     ┌──────────────────────────────────────────────────┐       │
│     │  ✅ Assessment Complete!                          │       │
│     │  Check the chat above for your personalized      │       │
│     │  results.                                         │       │
│     └──────────────────────────────────────────────────┘       │
│                                                                  │
│  6. Calls onComplete(responses) callback                        │
└─────────────────────────────────────────────────────────────────┘
```

## Key Points

### 1. Data Source ✅

- **Same as regular trial**: Both fetch from `prisma.platformSettings.findFirst()`
- **Single source of truth**: Update once, affects both modes
- **Consistent questions**: Same domains, questions, weights

### 2. Prompt Usage ✅

#### CONVERSATIONAL_PROMPT (During Conversation)

- **When**: Every user message → AI response
- **Purpose**: Ask questions naturally, acknowledge responses
- **Features**:
  - Kid-friendly language
  - Markdown formatting
  - Emojis for warmth
  - No assessment terminology

#### CONVERSATIONAL_ANALYSIS (At Completion)

- **When**: Assessment complete, generating summary
- **Purpose**: Explain results in encouraging way
- **Features**:
  - Bold for key areas
  - Italics for emphasis
  - Numbered lists for steps
  - Emojis for engagement
  - Clickable resource links
  - No scores/percentages shown

### 3. Scoring ✅

- **Same logic as regular trial**: Weighted sum / total \* 100
- **By domain**: Each domain scored separately
- **Percentage-based**: 0-100% for each area
- **Transparent**: Passed to AI for context, not shown to user

### 4. Results Display ✅

- **Markdown rendering**: Full support via MarkdownMessage
- **In chat**: Summary appears as final AI message
- **Scrollable**: Part of conversation history
- **Formatted**: Bold, lists, emojis, links all work
- **Completion indicator**: Green checkmark banner

## Example Message Flow

```
User visits /conversational-trial
    ↓
START API: Fetches trial questions from database
    ↓
AI (using CONVERSATIONAL_PROMPT): "Hi there! 😊 Let's chat..."
    ↓
User: "Sure!"
    ↓
MESSAGE API: Extract answer, ask next question
    ↓
AI (using CONVERSATIONAL_PROMPT): "Great! Here's a question about focus..."
    ↓
User: "Yes, sometimes I can't concentrate"
    ↓
MESSAGE API: Extract YES, ask next question
    ↓
AI (using CONVERSATIONAL_PROMPT): "Thanks for sharing! 👍 Another question..."
    ↓
[... repeat for all questions ...]
    ↓
MESSAGE API: All questions answered, isComplete = true
    ↓
COMPLETE API: Calculate scores, generate summary
    ↓
AI (using CONVERSATIONAL_ANALYSIS):
    "Hi there! 😊 Great job finishing!

    We talked about these **important areas**:
    1. **Paying Attention** - Focus can be tricky
    2. **Managing Feelings** - Big emotions happen

    Here are some tips:
    - Try [deep breathing](link) ✨
    - Take *breaks* when needed

    You're doing **awesome**! 💪🌟"
    ↓
UI: Displays summary with full markdown rendering
    ↓
User sees: Formatted text with bold, lists, emojis, clickable links
```

## Benefits of This Architecture

1. **Separation of Concerns**
   - Start: Data loading
   - Message: Conversation flow
   - Complete: Scoring & summary

2. **Reusable Components**
   - Same trial assessment data
   - Same scoring logic
   - Shared MarkdownMessage renderer

3. **AI Prompt Flexibility**
   - Easy to update prompts in `ai-config.ts`
   - Different prompts for different phases
   - Consistent tone throughout

4. **Error Handling**
   - Fallback summary if AI fails
   - Session cleanup on completion
   - Graceful degradation

5. **User Experience**
   - Smooth conversation flow
   - Rich formatting in results
   - Progress tracking
   - Clear completion state
