/**
 * Centralized pricing configuration
 * All amounts in cents for Stripe
 */
export const PRICING = {
  SINGLE_ASSESSMENT: 9700, // $97.00
  MONTHLY_SUBSCRIPTION: 2900, // $29.00
  ENHANCED_REPORT: 900, // $9.00
  ANNUAL_SUBSCRIPTION: 29700, // $297.00 (save $58/year)
} as const;

export const STRIPE_PRICE_IDS = {
  SINGLE_ASSESSMENT: process.env.STRIPE_BASIC_PRICE_ID!,
  MONTHLY_SUBSCRIPTION: process.env.STRIPE_MONTHLY_PRICE_ID!,
  ENHANCED_REPORT: process.env.STRIPE_CONVERSATIONAL_AI_PRICE_ID!,
  ANNUAL_SUBSCRIPTION: process.env.STRIPE_ANNUAL_PRICE_ID!,
} as const;

export type PricingTier = keyof typeof PRICING;

/**
 * Format price in cents to dollars
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get price by tier
 */
export function getPriceByCents(tier: PricingTier): number {
  return PRICING[tier];
}
