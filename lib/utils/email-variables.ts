/**
 * Email Template Variable Utilities
 * Extract, validate, and manage template variables
 */

export interface Variable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'url';
  required: boolean;
  default?: any;
  description?: string;
}

/**
 * Extract all variable placeholders from template text
 * Supports {{variableName}} syntax
 */
export function extractVariablesFromText(text: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = text.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables).sort();
}

/**
 * Extract variables with context (surrounding text)
 */
export function extractVariablesWithContext(
  text: string,
  contextLength: number = 30
): Array<{ variable: string; context: string }> {
  const regex = /{{(\w+)}}/g;
  const results: Array<{ variable: string; context: string }> = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const variable = match[1];
    const start = Math.max(0, match.index - contextLength);
    const end = Math.min(text.length, match.index + match[0].length + contextLength);
    const context = text.substring(start, end);

    results.push({ variable, context });
  }

  return results;
}

/**
 * Validate that all required variables are provided
 */
export function validateRequiredVariables(
  requiredVars: string[],
  providedVars: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing = requiredVars.filter(
    (varName) => providedVars[varName] === undefined || providedVars[varName] === null
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Infer variable type from sample value
 */
export function inferVariableType(value: any): Variable['type'] {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    // Check if it's a URL
    try {
      new URL(value);
      return 'url';
    } catch {
      return 'string';
    }
  }
  return 'string';
}

/**
 * Generate variable definitions from template and sample data
 */
export function generateVariableDefinitions(
  template: string,
  sampleData?: Record<string, any>
): Variable[] {
  const varNames = extractVariablesFromText(template);

  return varNames.map((name) => {
    const sampleValue = sampleData?.[name];

    return {
      name,
      type: sampleValue ? inferVariableType(sampleValue) : 'string',
      required: true,
      description: `Variable: ${name}`,
    };
  });
}

/**
 * Replace variables in text with actual values
 */
export function replaceVariables(
  text: string,
  variables: Record<string, any>,
  escapeHtml: boolean = false
): string {
  let result = text;

  for (const [key, value] of Object.entries(variables)) {
    let replacement = String(value);

    if (escapeHtml) {
      replacement = escapeHtmlEntities(replacement);
    }

    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Escape HTML entities in string
 */
function escapeHtmlEntities(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Validate variable values against their types
 */
export function validateVariableTypes(
  variables: Variable[],
  values: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const variable of variables) {
    const value = values[variable.name];

    if (value === undefined || value === null) {
      if (variable.required && !variable.default) {
        errors.push(`Required variable '${variable.name}' is missing`);
      }
      continue;
    }

    // Type validation
    switch (variable.type) {
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`Variable '${variable.name}' must be a number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Variable '${variable.name}' must be a boolean`);
        }
        break;

      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push(`Variable '${variable.name}' must be a valid date`);
        }
        break;

      case 'url':
        try {
          new URL(String(value));
        } catch {
          errors.push(`Variable '${variable.name}' must be a valid URL`);
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Variable '${variable.name}' must be a string`);
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Apply default values to variables
 */
export function applyDefaultValues(
  variables: Variable[],
  values: Record<string, any>
): Record<string, any> {
  const result = { ...values };

  for (const variable of variables) {
    if (
      (result[variable.name] === undefined || result[variable.name] === null) &&
      variable.default !== undefined
    ) {
      result[variable.name] = variable.default;
    }
  }

  return result;
}

/**
 * Generate sample data for template preview
 */
export function generateSampleData(variables: Variable[]): Record<string, any> {
  const sampleData: Record<string, any> = {};

  for (const variable of variables) {
    if (variable.default !== undefined) {
      sampleData[variable.name] = variable.default;
      continue;
    }

    // Generate sample values based on type
    switch (variable.type) {
      case 'string':
        sampleData[variable.name] = `Sample ${variable.name}`;
        break;

      case 'number':
        sampleData[variable.name] = 42;
        break;

      case 'boolean':
        sampleData[variable.name] = true;
        break;

      case 'date':
        sampleData[variable.name] = new Date();
        break;

      case 'url':
        sampleData[variable.name] = 'https://example.com';
        break;
    }
  }

  return sampleData;
}

/**
 * Check for unused variables in template
 */
export function findUnusedVariables(
  template: string,
  definedVariables: string[]
): string[] {
  const usedVariables = extractVariablesFromText(template);
  return definedVariables.filter((v) => !usedVariables.includes(v));
}

/**
 * Check for undefined variables in template
 */
export function findUndefinedVariables(
  template: string,
  definedVariables: string[]
): string[] {
  const usedVariables = extractVariablesFromText(template);
  return usedVariables.filter((v) => !definedVariables.includes(v));
}
