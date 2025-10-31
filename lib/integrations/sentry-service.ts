/**
 * Sentry Error Tracking Service
 * Integrates Sentry for error monitoring and tracking
 *
 * NOTE: Sentry package (@sentry/react) is optional.
 * This service gracefully handles missing Sentry installation.
 */

type AnySentry = any;
let sentryModule: AnySentry | null = null;

// Try to load Sentry if available (using dynamic require to avoid TypeScript resolution)
if (typeof window !== "undefined") {
  try {
    const sentryPath = "@sentry/react";
    const mod = (globalThis as any).require?.(sentryPath) || null;
    if (mod) sentryModule = mod;
  } catch {
    // Sentry not installed, skip
  }
}

/**
 * Initialize Sentry
 * Call this from the main layout on client-side
 */
export function initializeSentry() {
  if (typeof window === "undefined") {
    return; // Server-side, skip
  }

  try {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const environment = process.env.NODE_ENV;

    if (!dsn) {
      console.warn("Sentry DSN not configured");
      return;
    }

    // Dynamic import to avoid bundling Sentry if not configured
    (eval('import("@sentry/react")') as Promise<AnySentry>)
      .then((Sentry) => {
        sentryModule = Sentry;
        Sentry.init({
          dsn,
          environment,
          tracesSampleRate: environment === "production" ? 0.1 : 1.0,
          debug: environment !== "production",
          // Only send errors in production, but all traces
          beforeSend(event: any) {
            if (environment !== "production") {
              return event;
            }
            // In production, filter out certain errors if needed
            return event;
          },
        });

        console.log("Sentry initialized");
      })
      .catch((error) => {
        console.warn("Sentry module not installed, skipping initialization:", error);
      });
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
}

/**
 * Capture and report an exception
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>
) {
  if (!sentryModule && typeof window !== "undefined") {
    // Try dynamic import
    (eval('import("@sentry/react")') as Promise<AnySentry>)
      .then((Sentry) => {
        sentryModule = Sentry;
        Sentry.captureException(error, {
          contexts: {
            application: context,
          },
        });
      })
      .catch(() => {
        // Sentry not available
      });
  } else if (sentryModule) {
    sentryModule.captureException(error, {
      contexts: {
        application: context,
      },
    });
  }
}

/**
 * Capture a message for tracking
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  if (!sentryModule && typeof window !== "undefined") {
    // Try dynamic import
    (eval('import("@sentry/react")') as Promise<AnySentry>)
      .then((Sentry) => {
        sentryModule = Sentry;
        Sentry.captureMessage(message, level);
      })
      .catch(() => {
        // Sentry not available
      });
  } else if (sentryModule) {
    sentryModule.captureMessage(message, level);
  }
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  if (!sentryModule && typeof window !== "undefined") {
    // Try dynamic import
    (eval('import("@sentry/react")') as Promise<AnySentry>)
      .then((Sentry) => {
        sentryModule = Sentry;
        Sentry.setUser({
          id: userId,
          email,
          username: name,
        });
      })
      .catch(() => {
        // Sentry not available
      });
  } else if (sentryModule) {
    sentryModule.setUser({
      id: userId,
      email,
      username: name,
    });
  }
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  if (sentryModule) {
    sentryModule.setUser(null);
  }
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addSentryBreadcrumb(
  message: string,
  category: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  if (sentryModule) {
    sentryModule.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * Track API error with context
 */
export function trackAPIError(
  endpoint: string,
  statusCode: number,
  errorMessage: string,
  additionalContext?: Record<string, any>
) {
  captureException(
    new Error(`API Error: ${endpoint} (${statusCode}) - ${errorMessage}`),
    {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
      ...additionalContext,
    }
  );

  addSentryBreadcrumb(
    `API call failed: ${endpoint}`,
    "api",
    "error"
  );
}

/**
 * Track payment processing error
 */
export function trackPaymentError(
  stripeEventId: string,
  errorMessage: string,
  additionalContext?: Record<string, any>
) {
  captureException(
    new Error(`Payment Error: ${stripeEventId} - ${errorMessage}`),
    {
      stripe_event_id: stripeEventId,
      error_message: errorMessage,
      ...additionalContext,
    }
  );

  addSentryBreadcrumb(
    `Payment error: ${errorMessage}`,
    "payment",
    "error"
  );
}

/**
 * Track assessment processing error
 */
export function trackAssessmentError(
  assessmentId: string,
  errorMessage: string,
  additionalContext?: Record<string, any>
) {
  captureException(
    new Error(`Assessment Error: ${assessmentId} - ${errorMessage}`),
    {
      assessment_id: assessmentId,
      error_message: errorMessage,
      ...additionalContext,
    }
  );

  addSentryBreadcrumb(
    `Assessment error: ${errorMessage}`,
    "assessment",
    "error"
  );
}

/**
 * Start a performance transaction
 */
export function startSentryTransaction(
  name: string,
  op: string = "transaction"
) {
  if (sentryModule) {
    const transaction = sentryModule.startTransaction({
      name,
      op,
    });
    return transaction;
  }
  return null;
}

export default {
  initializeSentry,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
  addSentryBreadcrumb,
  trackAPIError,
  trackPaymentError,
  trackAssessmentError,
  startSentryTransaction,
};
