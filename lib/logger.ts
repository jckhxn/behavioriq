/**
 * Structured logging utility for production-safe logging
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   logger.info('User signed up', { userId: '123', email: 'user@example.com' });
 *   logger.error('Database connection failed', { error: err.message });
 *   logger.warn('High memory usage', { percentage: 85 });
 *
 * In development: Colorful console output
 * In production: Structured JSON output suitable for log aggregation (Datadog, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = this.getLogLevel(process.env.LOG_LEVEL || 'info');

  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private getLogLevel(level: string): LogLevel {
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return validLevels.includes(level as LogLevel) ? (level as LogLevel) : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();

    if (this.isDevelopment) {
      // Development: pretty, colorful output
      const colors = {
        debug: '\x1b[36m',    // Cyan
        info: '\x1b[32m',     // Green
        warn: '\x1b[33m',     // Yellow
        error: '\x1b[31m',    // Red
      };
      const reset = '\x1b[0m';
      const color = colors[level];

      let output = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`;

      if (context && Object.keys(context).length > 0) {
        output += `\n${JSON.stringify(context, null, 2)}`;
      }

      return output;
    } else {
      // Production: JSON structured logging
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  /**
   * Log API request/response for debugging
   */
  logRequest(method: string, url: string, status?: number, duration?: number): void {
    if (this.shouldLog('debug')) {
      this.debug(`${method} ${url}`, {
        status,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration?: number): void {
    if (this.shouldLog('debug')) {
      this.debug(`Database: ${operation} on ${table}`, {
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }

  /**
   * Log Stripe webhook event
   */
  logStripeEvent(eventType: string, eventId: string): void {
    this.info(`Stripe webhook: ${eventType}`, { eventId });
  }

  /**
   * Log user action (auth, payments, etc.)
   */
  logUserAction(action: string, userId: string, metadata?: LogContext): void {
    this.info(`User action: ${action}`, {
      userId,
      ...metadata,
    });
  }

  /**
   * Log email sent
   */
  logEmailSent(
    to: string,
    subject: string,
    type: string,
    metadata?: LogContext
  ): void {
    this.info(`Email sent: ${type}`, {
      to,
      subject,
      ...metadata,
    });
  }

  /**
   * Log error with stack trace
   */
  logErrorWithStack(message: string, error: Error, context?: LogContext): void {
    this.error(message, {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }
}

export const logger = new Logger();
