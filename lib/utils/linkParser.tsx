import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";

export interface ParsedLink {
  text: string;
  url: string;
  title: string;
}

export interface ParsedContent {
  text: string;
  links: ParsedLink[];
}

/**
 * Parse text content to extract markdown-style links [Title](URL)
 */
export function parseLinksFromText(text: string): ParsedContent {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: ParsedLink[] = [];
  let plainText = text;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      text: match[0], // Full match [Title](URL)
      title: match[1], // Title part
      url: match[2], // URL part
    });
  }

  // Replace markdown links with placeholders for rendering
  plainText = text.replace(linkRegex, "{{LINK:$1}}");

  return { text: plainText, links };
}

/**
 * Component to render text with interactive links
 */
interface InteractiveTextProps {
  content: string;
  onSaveLink?: (link: ParsedLink, assessmentId: string) => Promise<void>;
  assessmentId?: string;
  savedLinks?: string[]; // URLs that are already saved
}

export function InteractiveText({
  content,
  onSaveLink,
  assessmentId,
  savedLinks = [],
}: InteractiveTextProps) {
  const { text, links } = parseLinksFromText(content);

  const renderTextWithLinks = () => {
    let processedText = text;

    links.forEach((link, index) => {
      const placeholder = `{{LINK:${link.title}}}`;
      const isSaved = savedLinks.includes(link.url);

      const linkComponent = (
        <span key={index} className="inline-flex items-center gap-1 mx-1">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-blue-600 hover:text-blue-800 underline"
            onClick={() =>
              window.open(link.url, "_blank", "noopener,noreferrer")
            }
          >
            {link.title}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          {onSaveLink && assessmentId && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-auto p-1"
              onClick={() => onSaveLink(link, assessmentId)}
              title={isSaved ? "Already saved" : "Save resource"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-3 w-3 text-green-600" />
              ) : (
                <Bookmark className="h-3 w-3 text-muted-foreground hover:text-blue-600" />
              )}
            </Button>
          )}
        </span>
      );

      const parts = processedText.split(placeholder);
      processedText = parts.join(`__LINK_${index}__`);
    });

    // Split by line breaks and render
    return processedText.split("\n").map((line, lineIndex) => {
      let processedLine: React.ReactNode[] = [line];

      // Replace link placeholders with actual components
      links.forEach((link, linkIndex) => {
        const placeholder = `__LINK_${linkIndex}__`;
        processedLine = processedLine.flatMap((part, partIndex) => {
          if (typeof part === "string" && part.includes(placeholder)) {
            const lineParts = part.split(placeholder);
            const result: React.ReactNode[] = [];

            lineParts.forEach((textPart, textIndex) => {
              if (textIndex > 0) {
                const isSaved = savedLinks.includes(link.url);
                result.push(
                  <span
                    key={`${linkIndex}-${textIndex}`}
                    className="inline-flex items-center gap-1 mx-1"
                  >
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-blue-600 hover:text-blue-800 underline"
                      onClick={() =>
                        window.open(link.url, "_blank", "noopener,noreferrer")
                      }
                    >
                      {link.title}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                    {onSaveLink && assessmentId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-1"
                        onClick={() => onSaveLink(link, assessmentId)}
                        title={isSaved ? "Already saved" : "Save resource"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-3 w-3 text-green-600" />
                        ) : (
                          <Bookmark className="h-3 w-3 text-muted-foreground hover:text-blue-600" />
                        )}
                      </Button>
                    )}
                  </span>
                );
              }
              if (textPart) {
                result.push(textPart);
              }
            });

            return result;
          }
          return [part];
        });
      });

      return (
        <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
          {processedLine}
        </div>
      );
    });
  };

  return <div className="leading-relaxed">{renderTextWithLinks()}</div>;
}
