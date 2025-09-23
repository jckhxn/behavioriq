/**
 * AI Call Rate Limiting and Cost Control
 * Prevents excessive AI API usage to manage costs
 */

interface RateLimitData {
  count: number;
  resetTime: number;
  cost: number;
}

interface AIUsageTracker {
  daily: RateLimitData;
  monthly: RateLimitData;
  user: Map<string, RateLimitData>;
}

// In-memory storage (in production, use Redis or database)
const usageTracker: AIUsageTracker = {
  daily: { count: 0, resetTime: getNextDayReset(), cost: 0 },
  monthly: { count: 0, resetTime: getNextMonthReset(), cost: 0 },
  user: new Map(),
};

// Rate limits configuration
const RATE_LIMITS = {
  AI_CALLS_PER_USER_PER_HOUR: 10,
  AI_CALLS_PER_DAY: 1000,
  AI_CALLS_PER_MONTH: 30000,
  MAX_DAILY_COST: 50.0, // $50 per day
  MAX_MONTHLY_COST: 1000.0, // $1000 per month
  COST_PER_AI_CALL: 0.05, // Estimated $0.05 per AI call
};

function getNextDayReset(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function getNextMonthReset(): number {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth.getTime();
}

function getNextHourReset(): number {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1);
  nextHour.setMinutes(0, 0, 0);
  return nextHour.getTime();
}

function getUserKey(userId: string): string {
  const now = new Date();
  return `${userId}_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}`;
}

function resetIfExpired(data: RateLimitData, getNextReset: () => number): void {
  const now = Date.now();
  if (now >= data.resetTime) {
    data.count = 0;
    data.cost = 0;
    data.resetTime = getNextReset();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remainingCalls?: number;
  resetTime?: number;
  currentCost?: number;
  maxCost?: number;
}

export function checkAIRateLimit(userId: string): RateLimitResult {
  const now = Date.now();

  // Reset counters if expired
  resetIfExpired(usageTracker.daily, getNextDayReset);
  resetIfExpired(usageTracker.monthly, getNextMonthReset);

  const userKey = getUserKey(userId);
  const userData = usageTracker.user.get(userKey) || {
    count: 0,
    resetTime: getNextHourReset(),
    cost: 0,
  };

  resetIfExpired(userData, getNextHourReset);
  usageTracker.user.set(userKey, userData);

  // Check user hourly limit
  if (userData.count >= RATE_LIMITS.AI_CALLS_PER_USER_PER_HOUR) {
    return {
      allowed: false,
      reason: "User hourly limit exceeded",
      remainingCalls: 0,
      resetTime: userData.resetTime,
    };
  }

  // Check daily limits
  if (usageTracker.daily.count >= RATE_LIMITS.AI_CALLS_PER_DAY) {
    return {
      allowed: false,
      reason: "Daily API call limit exceeded",
      remainingCalls: 0,
      resetTime: usageTracker.daily.resetTime,
    };
  }

  if (usageTracker.daily.cost >= RATE_LIMITS.MAX_DAILY_COST) {
    return {
      allowed: false,
      reason: "Daily cost limit exceeded",
      currentCost: usageTracker.daily.cost,
      maxCost: RATE_LIMITS.MAX_DAILY_COST,
      resetTime: usageTracker.daily.resetTime,
    };
  }

  // Check monthly limits
  if (usageTracker.monthly.count >= RATE_LIMITS.AI_CALLS_PER_MONTH) {
    return {
      allowed: false,
      reason: "Monthly API call limit exceeded",
      remainingCalls: 0,
      resetTime: usageTracker.monthly.resetTime,
    };
  }

  if (usageTracker.monthly.cost >= RATE_LIMITS.MAX_MONTHLY_COST) {
    return {
      allowed: false,
      reason: "Monthly cost limit exceeded",
      currentCost: usageTracker.monthly.cost,
      maxCost: RATE_LIMITS.MAX_MONTHLY_COST,
      resetTime: usageTracker.monthly.resetTime,
    };
  }

  return {
    allowed: true,
    remainingCalls: RATE_LIMITS.AI_CALLS_PER_USER_PER_HOUR - userData.count,
    currentCost: usageTracker.daily.cost,
    maxCost: RATE_LIMITS.MAX_DAILY_COST,
  };
}

export function recordAICall(
  userId: string,
  cost: number = RATE_LIMITS.COST_PER_AI_CALL
): void {
  // Reset counters if expired
  resetIfExpired(usageTracker.daily, getNextDayReset);
  resetIfExpired(usageTracker.monthly, getNextMonthReset);

  const userKey = getUserKey(userId);
  const userData = usageTracker.user.get(userKey) || {
    count: 0,
    resetTime: getNextHourReset(),
    cost: 0,
  };

  resetIfExpired(userData, getNextHourReset);

  // Increment counters
  userData.count++;
  userData.cost += cost;
  usageTracker.user.set(userKey, userData);

  usageTracker.daily.count++;
  usageTracker.daily.cost += cost;

  usageTracker.monthly.count++;
  usageTracker.monthly.cost += cost;
}

export function getUsageStats(userId?: string) {
  const now = Date.now();

  // Reset counters if expired
  resetIfExpired(usageTracker.daily, getNextDayReset);
  resetIfExpired(usageTracker.monthly, getNextMonthReset);

  const stats = {
    daily: {
      calls: usageTracker.daily.count,
      cost: usageTracker.daily.cost,
      limit: RATE_LIMITS.AI_CALLS_PER_DAY,
      costLimit: RATE_LIMITS.MAX_DAILY_COST,
      resetTime: usageTracker.daily.resetTime,
    },
    monthly: {
      calls: usageTracker.monthly.count,
      cost: usageTracker.monthly.cost,
      limit: RATE_LIMITS.AI_CALLS_PER_MONTH,
      costLimit: RATE_LIMITS.MAX_MONTHLY_COST,
      resetTime: usageTracker.monthly.resetTime,
    },
  };

  if (userId) {
    const userKey = getUserKey(userId);
    const userData = usageTracker.user.get(userKey) || {
      count: 0,
      resetTime: getNextHourReset(),
      cost: 0,
    };

    resetIfExpired(userData, getNextHourReset);

    return {
      ...stats,
      user: {
        calls: userData.count,
        cost: userData.cost,
        limit: RATE_LIMITS.AI_CALLS_PER_USER_PER_HOUR,
        resetTime: userData.resetTime,
      },
    };
  }

  return stats;
}

export function updateRateLimits(newLimits: Partial<typeof RATE_LIMITS>) {
  Object.assign(RATE_LIMITS, newLimits);
}

export { RATE_LIMITS };
