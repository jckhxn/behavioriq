/**
 * Preferences Validator
 * Validates affiliate payout and notification preferences
 */

interface PayoutPreferences {
  minPayoutThresholdCents: number;
  payoutFrequency: string;
  autoPayoutEnabled: boolean;
  payoutDayOfMonth?: number | null;
  payoutDayOfWeek?: number | null;
}

interface NotificationPreferences {
  emailOnPayout: boolean;
  emailOnCommissionEarned: boolean;
  emailOnCommissionPayable: boolean;
  emailWeeklySummary: boolean;
  emailMonthlySummary: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate payout preferences
 */
export function validatePayoutPreferences(preferences: Partial<PayoutPreferences>): ValidationResult {
  const errors: string[] = [];

  // Validate minPayoutThresholdCents
  if (preferences.minPayoutThresholdCents !== undefined) {
    if (preferences.minPayoutThresholdCents < 5000) {
      errors.push('Minimum payout threshold must be at least $50 (5000 cents)');
    }

    if (preferences.minPayoutThresholdCents > 50000) {
      errors.push('Minimum payout threshold cannot exceed $500 (50000 cents)');
    }

    if (preferences.minPayoutThresholdCents % 50 !== 0) {
      errors.push('Minimum payout threshold must be in increments of $0.50');
    }
  }

  // Validate payoutFrequency
  if (preferences.payoutFrequency !== undefined) {
    const validFrequencies = ['auto', 'daily', 'weekly', 'monthly'];

    if (!validFrequencies.includes(preferences.payoutFrequency)) {
      errors.push(`Payout frequency must be one of: ${validFrequencies.join(', ')}`);
    }

    // Validate related fields based on frequency
    if (preferences.payoutFrequency === 'weekly' && preferences.payoutDayOfWeek !== undefined && preferences.payoutDayOfWeek !== null) {
      if (preferences.payoutDayOfWeek < 0 || preferences.payoutDayOfWeek > 6) {
        errors.push('Payout day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    if (preferences.payoutFrequency === 'monthly' && preferences.payoutDayOfMonth !== undefined && preferences.payoutDayOfMonth !== null) {
      if (preferences.payoutDayOfMonth < 1 || preferences.payoutDayOfMonth > 28) {
        errors.push('Payout day of month must be between 1 and 28');
      }
    }

    // Weekly frequency requires payoutDayOfWeek
    if (preferences.payoutFrequency === 'weekly' && preferences.payoutDayOfWeek === undefined) {
      errors.push('Weekly payout frequency requires payoutDayOfWeek to be set');
    }

    // Monthly frequency requires payoutDayOfMonth
    if (preferences.payoutFrequency === 'monthly' && preferences.payoutDayOfMonth === undefined) {
      errors.push('Monthly payout frequency requires payoutDayOfMonth to be set');
    }
  }

  // Validate payoutDayOfMonth
  if (preferences.payoutDayOfMonth !== undefined && preferences.payoutDayOfMonth !== null) {
    if (preferences.payoutDayOfMonth < 1 || preferences.payoutDayOfMonth > 28) {
      errors.push('Payout day of month must be between 1 and 28');
    }
  }

  // Validate payoutDayOfWeek
  if (preferences.payoutDayOfWeek !== undefined && preferences.payoutDayOfWeek !== null) {
    if (preferences.payoutDayOfWeek < 0 || preferences.payoutDayOfWeek > 6) {
      errors.push('Payout day of week must be between 0 (Sunday) and 6 (Saturday)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate notification preferences
 */
export function validateNotificationPreferences(preferences: Partial<NotificationPreferences>): ValidationResult {
  const errors: string[] = [];

  // All fields are boolean and optional, so just check types
  const booleanFields: (keyof NotificationPreferences)[] = [
    'emailOnPayout',
    'emailOnCommissionEarned',
    'emailOnCommissionPayable',
    'emailWeeklySummary',
    'emailMonthlySummary',
  ];

  booleanFields.forEach((field) => {
    if (preferences[field] !== undefined && typeof preferences[field] !== 'boolean') {
      errors.push(`${field} must be a boolean value`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize payout preferences (ensure valid values)
 */
export function sanitizePayoutPreferences(preferences: Partial<PayoutPreferences>): Partial<PayoutPreferences> {
  const sanitized: Partial<PayoutPreferences> = { ...preferences };

  // Clamp minPayoutThresholdCents to valid range
  if (sanitized.minPayoutThresholdCents !== undefined) {
    sanitized.minPayoutThresholdCents = Math.max(
      5000,
      Math.min(50000, Math.round(sanitized.minPayoutThresholdCents / 50) * 50)
    );
  }

  // Ensure payoutFrequency is valid
  if (sanitized.payoutFrequency !== undefined) {
    const validFrequencies = ['auto', 'daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(sanitized.payoutFrequency)) {
      sanitized.payoutFrequency = 'auto';
    }
  }

  // Clamp payoutDayOfMonth
  if (sanitized.payoutDayOfMonth !== undefined && sanitized.payoutDayOfMonth !== null) {
    sanitized.payoutDayOfMonth = Math.max(1, Math.min(28, sanitized.payoutDayOfMonth));
  }

  // Clamp payoutDayOfWeek
  if (sanitized.payoutDayOfWeek !== undefined && sanitized.payoutDayOfWeek !== null) {
    sanitized.payoutDayOfWeek = Math.max(0, Math.min(6, sanitized.payoutDayOfWeek));
  }

  // Clear day fields if not needed for frequency
  if (sanitized.payoutFrequency === 'auto' || sanitized.payoutFrequency === 'daily') {
    sanitized.payoutDayOfMonth = null;
    sanitized.payoutDayOfWeek = null;
  } else if (sanitized.payoutFrequency === 'weekly') {
    sanitized.payoutDayOfMonth = null;
  } else if (sanitized.payoutFrequency === 'monthly') {
    sanitized.payoutDayOfWeek = null;
  }

  return sanitized;
}

/**
 * Get default payout preferences
 */
export function getDefaultPayoutPreferences(): PayoutPreferences {
  return {
    minPayoutThresholdCents: 5000, // $50
    payoutFrequency: 'auto',
    autoPayoutEnabled: true,
    payoutDayOfMonth: null,
    payoutDayOfWeek: null,
  };
}

/**
 * Get default notification preferences
 */
export function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    emailOnPayout: true,
    emailOnCommissionEarned: true,
    emailOnCommissionPayable: true,
    emailWeeklySummary: false,
    emailMonthlySummary: false,
  };
}
