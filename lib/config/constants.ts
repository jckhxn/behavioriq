/**
 * Application-wide constants
 */

export const APP_NAME = "AI Diagnostic";
export const APP_DESCRIPTION = "AI-powered behavioral assessments";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ["pdf", "docx", "xlsx", "csv", "txt"];

export const DEFAULT_CURRENCY = "usd";

export const ITEMS_PER_PAGE = 10;

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * API response messages
 */
export const API_MESSAGES = {
  SUCCESS: "Operation completed successfully",
  ERROR: "An error occurred",
  UNAUTHORIZED: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation failed",
} as const;
