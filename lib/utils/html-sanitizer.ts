/**
 * HTML Sanitizer
 * Cleans and sanitizes HTML imports (e.g., from Canva) for email templates
 */

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  allowedStyles?: string[];
  stripScripts?: boolean;
  stripJavaScript?: boolean;
}

const DEFAULT_ALLOWED_TAGS = [
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'blockquote', 'br', 'caption',
  'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hr', 'i', 'img', 'ins', 'li', 'main', 'mark', 'nav', 'ol', 'p',
  'pre', 'q', 'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul'
];

const DEFAULT_ALLOWED_ATTRIBUTES: { [key: string]: string[] } = {
  '*': ['class', 'id', 'style', 'title', 'aria-*', 'role'],
  'a': ['href', 'target', 'rel', 'name'],
  'img': ['src', 'alt', 'width', 'height', 'loading'],
  'table': ['width', 'border', 'cellpadding', 'cellspacing', 'align'],
  'td': ['width', 'height', 'align', 'valign', 'colspan', 'rowspan'],
  'th': ['width', 'height', 'align', 'valign', 'colspan', 'rowspan'],
};

const DEFAULT_ALLOWED_STYLES = [
  'background', 'background-color', 'border', 'border-radius', 'color',
  'display', 'font', 'font-family', 'font-size', 'font-weight', 'height',
  'line-height', 'margin', 'padding', 'text-align', 'text-decoration',
  'vertical-align', 'width', 'max-width', 'min-width'
];

/**
 * Sanitize HTML for email templates
 */
export function sanitizeEmailHTML(
  html: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    allowedStyles = DEFAULT_ALLOWED_STYLES,
    stripScripts = true,
    stripJavaScript = true,
  } = options;

  // Configure DOMPurify
  const config: any = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.values(allowedAttributes).flat(),
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    FORCE_BODY: true,
  };

  if (stripScripts) {
    config.FORBID_TAGS = ['script', 'noscript'];
  }

  if (stripJavaScript) {
    config.FORBID_ATTR = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
  }

  // Sanitize HTML
  let sanitized = DOMPurify.sanitize(html, config);

  // Additional cleaning for email compatibility
  sanitized = cleanForEmail(sanitized, allowedStyles);

  return sanitized;
}

/**
 * Clean HTML for email client compatibility
 */
function cleanForEmail(html: string, allowedStyles: string[]): string {
  let cleaned = html;

  // Remove unsupported CSS properties from inline styles
  cleaned = cleaned.replace(/style="([^"]*)"/g, (match, styles) => {
    const filteredStyles = styles
      .split(';')
      .filter((style: string) => {
        const property = style.split(':')[0]?.trim().toLowerCase();
        return allowedStyles.includes(property);
      })
      .join(';');
    return `style="${filteredStyles}"`;
  });

  // Remove data URIs (except small inline images if needed)
  cleaned = cleaned.replace(/data:[^"']+/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Extract inline CSS and convert to <style> tag
 */
export function extractInlineStyles(html: string): {
  html: string;
  css: string;
} {
  const styles = new Set<string>();
  let processedHtml = html;

  // Extract all inline styles
  const styleMatches = html.matchAll(/style="([^"]*)"/g);
  for (const match of styleMatches) {
    styles.add(match[1]);
  }

  const css = Array.from(styles).join('\n');
  return { html: processedHtml, css };
}

/**
 * Validate HTML structure for email
 */
export function validateEmailHTML(html: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for script tags
  if (/<script/i.test(html)) {
    errors.push('HTML contains script tags');
  }

  // Check for event handlers
  if (/on\w+\s*=/i.test(html)) {
    errors.push('HTML contains event handlers');
  }

  // Check for forms
  if (/<form/i.test(html)) {
    warnings.push('HTML contains form elements (may not work in all email clients)');
  }

  // Check for videos
  if (/<video/i.test(html)) {
    warnings.push('HTML contains video elements (not supported in most email clients)');
  }

  // Check for CSS animations
  if (/@keyframes|animation:/i.test(html)) {
    warnings.push('HTML contains CSS animations (limited support in email clients)');
  }

  // Check for external stylesheets
  if (/<link[^>]*rel=["']stylesheet["']/i.test(html)) {
    warnings.push('HTML contains external stylesheets (will be ignored by most email clients)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Minify HTML for email
 */
export function minifyEmailHTML(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim();
}

/**
 * Convert CSS classes to inline styles (simple version)
 */
export function inlineStyles(html: string, css: string): string {
  // This is a simplified version - for production, consider using juice or similar
  let result = html;

  // Extract class-based rules from CSS
  const classRules = css.match(/\.[\w-]+\s*{[^}]*}/g) || [];

  for (const rule of classRules) {
    const match = rule.match(/\.([\w-]+)\s*{([^}]*)}/);
    if (match) {
      const className = match[1];
      const styles = match[2].trim();

      // Find elements with this class and add inline styles
      const regex = new RegExp(`class=["']([^"']*\\b${className}\\b[^"']*)["']`, 'g');
      result = result.replace(regex, (m, classes) => {
        // Check if element already has inline styles
        const existingStyleMatch = m.match(/style=["']([^"']*)["']/);
        if (existingStyleMatch) {
          return m.replace(
            /style=["']([^"']*)["']/,
            `style="${existingStyleMatch[1]};${styles}"`
          );
        } else {
          return `${m} style="${styles}"`;
        }
      });
    }
  }

  return result;
}
