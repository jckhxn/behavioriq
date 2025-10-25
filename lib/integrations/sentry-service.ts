/**
 * Sentry Error Tracking Service
 * Integrates Sentry for error monitoring and tracking
 */

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
    import("@sentry/react").then((Sentry) => {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: environment === "production" ? 0.1 : 1.0,
        debug: environment !== "production",
        // Only send errors in production, but all traces
        beforeSend(event) {
          if (environment !== "production") {
            return event;
          }
          // In production, filter out certain errors if needed
          return event;
        },
      });

      console.log("Sentry initialized");
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
  try {
    import("@sentry/react").then((Sentry) => {
      Sentry.captureException(error, {
        contexts: {
          application: context,
        },
      });
    });
  } catch (e) {
    console.error("Failed to report to Sentry:", e);
  }
}

/**
 * Capture a message for tracking
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  try {
    import("@sentry/react").then((Sentry) => {
      Sentry.captureMessage(message, level);
    });
  } catch (e) {
    console.error("Failed to send message to Sentry:", e);
  }
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  try {
    import("@sentry/react").then((Sentry) => {
      Sentry.setUser({
        id: userId,
        email,
        username: name,
      });
    });
  } catch (e) {
    console.error("Failed to set Sentry user:", e);
  }
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  try {
    import("@sentry/react").then((Sentry) => {
      Sentry.setUser(null);
    });
  } catch (e) {
    console.error("Failed to clear Sentry user:", e);
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
  try {
    import("@sentry/react").then((Sentry) => {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
      });
    });
  } catch (e) {
    console.error("Failed to add Sentry breadcrumb:", e);
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
  try {
    import("@sentry/react").then((Sentry) => {
      const transaction = Sentry.startTransaction({
        name,
        op,
      });
      return transaction;
    });
  } catch (e) {
    console.error("Failed to start Sentry transaction:", e);
  }
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
