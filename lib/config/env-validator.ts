/**
 * Environment Variable Validator
 *
 * This module validates that all required environment variables are set
 * on application startup. It runs automatically when imported.
 *
 * Usage: Import at the top of your entry point (e.g., middleware.ts, app/layout.tsx)
 */

interface EnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    example?: string;
  };
}

const requiredEnvVars: EnvVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL connection URL (pooled)',
    example: 'postgresql://user:password@host:5432/db?schema=public',
  },
  DIRECT_URL: {
    required: false,
    description: 'PostgreSQL direct connection (bypass pooler)',
    example: 'postgresql://user:password@host:5432/db?schema=public',
  },

  // Authentication
  AUTH_SECRET: {
    required: false,
    description: 'Primary authentication secret (use this)',
    example: 'openssl rand -base64 32',
  },
  NEXTAUTH_SECRET: {
    required: false,
    description: 'NextAuth secret (fallback if AUTH_SECRET not set)',
    example: 'openssl rand -base64 32',
  },

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    example: 'https://yourproject.supabase.co',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: false,
    description: 'Supabase service role key (for server-side)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },

  // OpenAI
  OPENAI_API_KEY: {
    required: true,
    description: 'OpenAI API key for AI-powered features',
    example: 'sk-...',
  },

  // Stripe
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe secret API key',
    example: 'sk_test_...',
  },
  STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: 'Stripe publishable key',
    example: 'pk_test_...',
  },
  STRIPE_WEBHOOK_SECRET: {
    required: false,
    description: 'Stripe webhook signing secret',
    example: 'whsec_...',
  },

  // Stripe Price IDs
  STRIPE_SINGLE_ASSESSMENT_PRICE_ID: {
    required: false,
    description: 'Stripe price ID for single assessment',
    example: 'price_...',
  },
  STRIPE_MONTHLY_CORE_PRICE_ID: {
    required: false,
    description: 'Stripe price ID for monthly core subscription',
    example: 'price_...',
  },
  STRIPE_ANNUAL_CORE_PRICE_ID: {
    required: false,
    description: 'Stripe price ID for annual core subscription',
    example: 'price_...',
  },

  // Stripe Connect
  STRIPE_CONNECT_CLIENT_ID: {
    required: false,
    description: 'Stripe Connect client ID for affiliate payouts',
    example: 'ca_...',
  },

  // AWS SES (Email)
  AWS_REGION: {
    required: false,
    description: 'AWS region for SES',
    example: 'us-east-1',
  },
  AWS_ACCESS_KEY_ID: {
    required: false,
    description: 'AWS IAM access key',
    example: 'AKIA...',
  },
  AWS_SECRET_ACCESS_KEY: {
    required: false,
    description: 'AWS IAM secret access key',
    example: '...',
  },
  SES_FROM_EMAIL: {
    required: false,
    description: 'Email address to send from (must be verified in SES)',
    example: 'noreply@yourdomain.com',
  },

  // Affiliate Program
  AFFILIATE_BASE_URL: {
    required: false,
    description: 'Base URL for affiliate tracking',
    example: 'https://app.yourdomain.com',
  },
  CRON_SECRET: {
    required: false,
    description: 'Secret for cron job authentication',
    example: 'secure-random-string',
  },

  // Application
  NEXT_PUBLIC_SITE_URL: {
    required: false,
    description: 'Public site URL for email links',
    example: 'http://localhost:3000',
  },
  NEXT_PUBLIC_BASE_URL: {
    required: false,
    description: 'Base URL for open graph tags and sitemap',
    example: 'https://yourdomain.com',
  },

  // Development
  NODE_ENV: {
    required: false,
    description: 'Environment mode',
    example: 'development|production',
  },
};

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (config.required && !value) {
      missing.push(key);
    }

    // Warn about obviously invalid values
    if (value === 'your-' || value === 'generate-a-' || value === 'set-your-') {
      warnings.push(`${key} appears to be a placeholder value`);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get all environment configuration for documentation
 */
export function getEnvDocumentation(): EnvVars {
  return requiredEnvVars;
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get a required environment variable with a helpful error message
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    const config = requiredEnvVars[key];
    const message = config
      ? `Missing required environment variable: ${key}\nDescription: ${config.description}${config.example ? `\nExample: ${config.example}` : ''}`
      : `Missing environment variable: ${key}`;

    throw new Error(message);
  }

  return value;
}

/**
 * Get an optional environment variable with a default
 */
export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * Validate and log results (call on startup)
 */
export function validateAndLogEnv(): void {
  const result = validateEnv();

  if (!result.isValid) {
    const missingList = result.missing.map((key) => {
      const config = requiredEnvVars[key];
      return `  • ${key} - ${config?.description || 'No description'}`;
    });

    const error = [
      'Missing required environment variables:',
      ...missingList,
      '',
      'Please check .env.example for configuration instructions.',
    ].join('\n');

    throw new Error(error);
  }

  if (result.warnings.length > 0 && isDevelopment()) {
    console.warn('Environment configuration warnings:');
    result.warnings.forEach((warning) => {
      console.warn(`  ⚠ ${warning}`);
    });
  }

  if (isDevelopment()) {
    console.info('✓ Environment variables validated successfully');
  }
}

// Export as default for easy importing
export default {
  validate: validateEnv,
  validateAndLog: validateAndLogEnv,
  getRequired: getRequiredEnv,
  getOptional: getOptionalEnv,
  isDevelopment,
  isProduction,
};
