"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownMessage } from "@/components/assessment/MarkdownMessage";

/**
 * Demo component showing markdown rendering capabilities
 * Useful for testing and showcasing the MarkdownMessage component
 */
export function MarkdownDemo() {
  const exampleMarkdown = `
# Hey there! 😊

Welcome to our friendly chat. Let me show you what I can do!

## What We'll Talk About

We're going to explore **three important areas**:

1. **Paying Attention** - Staying focused on tasks
2. **Managing Feelings** - Understanding your emotions
3. **Getting Along** - Making friends and being kind

---

## Quick Tips for Success 💪

Here are some *helpful strategies*:

- Take **deep breaths** when you feel worried
- Ask for help when you need it
- Practice being patient with yourself

### Need More Help?

Check out these trusted resources:

- [CDC Guide for Kids](https://www.cdc.gov/childrensmentalhealth/index.html)
- [MindUp Activities](https://mindup.org/)
- [GoZen Anxiety Resources](https://gozen.com/)

---

## Remember This! ✨

> "Every big journey starts with small steps. You're doing great!" 🌟

### Let's Try Something

If you were teaching a friend to stay calm, you might say:

\`\`\`javascript
function stayCalm() {
  breathe();
  count("to 10");
  talk("to someone you trust");
}
\`\`\`

---

## Comparison Table

| Strategy | When to Use | How Long |
|----------|-------------|----------|
| Deep Breathing | Feeling anxious | 2-3 minutes |
| Break Time | Can't focus | 5-10 minutes |
| Talk It Out | Feeling upset | As long as needed |

---

## What's Next?

Let's start with a simple question. *Ready when you are!* 👍
`;

  const userMessage = "Sure, I'm ready to start!";

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Markdown Rendering Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* AI Message with Markdown */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1 bg-muted rounded-lg px-4 py-3">
                <MarkdownMessage content={exampleMarkdown} isUser={false} />
              </div>
            </div>

            {/* User Message (Plain Text) */}
            <div className="flex gap-3 justify-end">
              <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-3">
                <MarkdownMessage content={userMessage} isUser={true} />
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-primary-foreground">👤</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold">Text Formatting</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>**Bold** and *italic* text</li>
                <li>~~Strikethrough~~</li>
                <li>`Inline code`</li>
                <li>Emojis 😊</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Structure</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Headings (H1-H6)</li>
                <li>Bulleted & numbered lists</li>
                <li>Blockquotes</li>
                <li>Horizontal rules</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Links & Code</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Clickable links</li>
                <li>Code blocks with syntax highlighting</li>
                <li>Inline code snippets</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tables</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Markdown tables</li>
                <li>Responsive design</li>
                <li>Styled headers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
