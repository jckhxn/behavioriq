"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  // For user messages, just display plain text
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  // For AI messages, render markdown with syntax highlighting
  return (
    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Style headings
          h1: ({ ...props }) => (
            <h1 className="text-lg font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-base font-bold mt-3 mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-sm font-bold mt-2 mb-1" {...props} />
          ),

          // Style paragraphs
          p: ({ ...props }) => (
            <p className="mb-2 leading-relaxed" {...props} />
          ),

          // Style lists
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside mb-2 space-y-1"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="ml-2" {...props} />,

          // Style links
          a: ({ ...props }) => (
            <a
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Style code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-muted px-1 py-0.5 rounded text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          // Style code blocks container
          pre: ({ ...props }) => (
            <pre
              className="bg-muted rounded-md p-3 overflow-x-auto mb-2 text-xs"
              {...props}
            />
          ),

          // Style blockquotes
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic my-2"
              {...props}
            />
          ),

          // Style tables
          table: ({ ...props }) => (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full divide-y divide-border" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="bg-muted" {...props} />,
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-border" {...props} />
          ),
          tr: ({ ...props }) => <tr {...props} />,
          th: ({ ...props }) => (
            <th
              className="px-3 py-2 text-left text-xs font-medium"
              {...props}
            />
          ),
          td: ({ ...props }) => <td className="px-3 py-2 text-xs" {...props} />,

          // Style horizontal rules
          hr: ({ ...props }) => (
            <hr className="my-4 border-border" {...props} />
          ),

          // Style strong/bold
          strong: ({ ...props }) => <strong className="font-bold" {...props} />,

          // Style emphasis/italic
          em: ({ ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
