# Conversational AI Markdown Rendering

This document demonstrates the enhanced markdown rendering capabilities added to the conversational AI assessment system.

## Overview

The conversational AI now uses **rich markdown rendering** with:

- ✅ **Bold** and _italic_ text formatting
- ✅ Lists (numbered and bulleted)
- ✅ Code blocks with syntax highlighting
- ✅ Links (clickable and styled)
- ✅ Blockquotes
- ✅ Tables
- ✅ Emojis for warmth

## Implementation

### Packages Installed

```bash
npm install react-markdown rehype-highlight remark-gfm highlight.js
```

### Key Components

1. **MarkdownMessage Component** (`components/assessment/MarkdownMessage.tsx`)
   - Wraps `react-markdown` with custom styling
   - Provides syntax highlighting for code blocks
   - Handles user vs AI message rendering

2. **Updated Prompts** (`lib/config/ai-config.ts`)
   - `CONVERSATIONAL_PROMPT`: Encourages markdown and emojis during Q&A
   - `CONVERSATIONAL_ANALYSIS`: Instructs AI to use markdown formatting in results

3. **ConversationalAssessment Component** (`components/assessment/ConversationalAssessment.tsx`)
   - Integrated MarkdownMessage for all message rendering
   - Preserves existing chat UI and functionality

## Example AI Responses

### Simple Question (with markdown)

**AI:** Hi there! 😊 Let's chat about some feelings and behaviors.

**Question:** Do you ever find it _really hard_ to focus when doing homework?

---

### Response with Formatting

**AI:** Thanks for sharing that! 👍

Here are some **areas we talked about**:

1. **Paying attention** - We noticed you sometimes have trouble focusing
2. **Staying calm** - Managing big feelings can be tricky
3. **Getting along with others** - Social situations might feel challenging

Let me share some helpful tips:

- Try the [Pomodoro Technique](https://todoist.com/productivity-methods/pomodoro-technique) for better focus ✨
- Practice _deep breathing_ when feeling overwhelmed
- Talk to a trusted adult about what's on your mind

Remember, everyone has strengths and challenges. You're doing great by talking about this! 💪

---

### Code Example (if showing tips)

```javascript
// Example: Focus timer reminder
function focusSession(minutes = 25) {
  console.log(`Starting ${minutes} minute focus session...`);
  // Set timer logic here
}
```

---

### Table Example (if comparing strategies)

| Strategy       | When to Use     | How it Helps        |
| -------------- | --------------- | ------------------- |
| Deep breathing | Feeling anxious | Calms your body     |
| Break time     | Can't focus     | Refreshes your mind |
| Talk it out    | Feeling upset   | Shares the load     |

---

### Blockquote Example

> "Remember, it's okay to ask for help. That's how we all learn and grow!" 🌱

## Benefits

1. **Better Readability**: Formatted text is easier to scan and understand
2. **Visual Hierarchy**: Important points stand out with bold/italic
3. **Engagement**: Emojis and formatting make the chat feel friendlier
4. **Professionalism**: Syntax highlighting for any code/technical content
5. **Accessibility**: Proper semantic HTML from markdown

## Technical Details

### MarkdownMessage Props

```typescript
interface MarkdownMessageProps {
  content: string;
  isUser?: boolean; // If true, renders as plain text
}
```

### Markdown Plugins

- **remark-gfm**: GitHub Flavored Markdown (tables, strikethrough, etc.)
- **rehype-highlight**: Syntax highlighting for code blocks
- **highlight.js**: Actual syntax highlighting engine (with github-dark theme)

### Styling

All markdown elements are styled to match your design system:

- Uses Tailwind CSS classes
- Respects dark mode (`dark:prose-invert`)
- Matches existing UI colors and spacing
- Mobile responsive

## Usage in Prompts

The AI is instructed in both prompts to use markdown:

### During Conversation (CONVERSATIONAL_PROMPT)

```
• Use **markdown formatting** for emphasis (bold, italic, lists)
• You can use emojis occasionally to make the conversation feel warm
```

### In Results (CONVERSATIONAL_ANALYSIS)

```
• Use **markdown formatting** liberally:
  - Use **bold** for key areas or important points
  - Use *italics* for gentle emphasis
  - Use numbered lists for steps or tips
  - Use bullet points for related ideas
  - Use emojis to make it warm and engaging
```

## Future Enhancements

Possible additions:

- [ ] Streaming text animation (as AI types)
- [ ] Custom components for specific UI elements (progress bars in markdown)
- [ ] Copy code button for code blocks
- [ ] Image embedding support
- [ ] Math equation rendering (KaTeX/MathJax)

## Testing

To test the markdown rendering:

1. Start the dev server: `npm run dev`
2. Navigate to `/conversational-trial`
3. Start a conversation
4. The AI should use markdown formatting in responses

## Notes

- User messages are rendered as plain text (no markdown processing needed)
- AI messages go through full markdown rendering pipeline
- Syntax highlighting uses the `github-dark` theme
- All external links open in new tabs with proper security attributes
