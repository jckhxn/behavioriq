/**
 * Payment-related types
 */

import type { Payment } from "@prisma/client";

export type PaymentStatus = "SUCCEEDED" | "FAILED" | "PENDING" | "REFUNDED";

/**
 * Payment creation data
 */
export interface CreatePaymentData {
  userId: string;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  planType: string;
  plan: string;
  childName?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Payment summary
 */
export interface PaymentSummary {
  total: number;
  count: number;
  lastPayment: Date | null;
  averageAmount: number;
}

export type { Payment };
