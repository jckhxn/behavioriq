/**
 * Stripe Connect Express Integration
 * Handles onboarding, KYC, and payouts for affiliate referrers
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID;
const REFRESH_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/affiliate/connect-onboarding`;
const RETURN_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/earn-rewards`;

export class StripeConnectService {
  /**
   * Create a Stripe Connect Express account for a user
   * Returns the account ID for storage
   *
   * For affiliates/referrers who don't have business info, we set sensible defaults
   */
  async createConnectAccount(
    email: string,
    userFullName: string,
    businessInfo?: {
      businessName?: string;
      businessUrl?: string;
      businessDescription?: string;
    }
  ): Promise<string> {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        country: "US", // Default to US; can be made configurable
        business_type: "individual", // Affiliates are individuals, not businesses
        capabilities: {
          transfers: { requested: true },
        },
        // Pre-fill business information if provided, otherwise use defaults
        business_profile: {
          // Use provided business name, or fall back to user name with "Affiliate" label
          name:
            businessInfo?.businessName ||
            `${userFullName} - BehaviorIQ Affiliate`,
          // Optional: use provided URL or empty string
          url: businessInfo?.businessUrl || "",
          // Use provided description or a default affiliate description
          product_description:
            businessInfo?.businessDescription ||
            "Affiliate partner for BehaviorIQ - Behavioral assessment and screening tool for parents and educators",
          // Support email
          support_email: email,
        },
        metadata: {
          user_email: email,
          user_name: userFullName,
          account_type: "affiliate_referrer",
        },
      });

      console.log(
        `[StripeConnect] ✅ Created Express account for affiliate: ${account.id}`
      );

      return account.id;
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error creating account:`, error);
      throw error;
    }
  }

  /**
   * Generate onboarding link for Stripe Connect Express
   * User completes KYC and bank account setup at this link
   */
  async getOnboardingLink(stripeAccountId: string): Promise<string> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        type: "account_onboarding",
        refresh_url: REFRESH_URL,
        return_url: RETURN_URL,
      });

      console.log(
        `[StripeConnect] ✅ Generated onboarding link for ${stripeAccountId}`
      );

      return accountLink.url;
    } catch (error) {
      console.error(
        `[StripeConnect] ❌ Error generating onboarding link:`,
        error
      );
      throw error;
    }
  }

  /**
   * Generate dashboard login link for referrer to view payouts
   */
  async getDashboardLink(stripeAccountId: string): Promise<string> {
    try {
      const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

      console.log(
        `[StripeConnect] ✅ Generated dashboard link for ${stripeAccountId}`
      );

      return loginLink.url;
    } catch (error) {
      console.error(
        `[StripeConnect] ❌ Error generating dashboard link:`,
        error
      );
      throw error;
    }
  }

  /**
   * Check if account has completed KYC and is ready for payouts
   */
  async checkAccountStatus(stripeAccountId: string): Promise<{
    isReady: boolean;
    requirements: string[];
    chargesEnabled: boolean;
    transfersEnabled: boolean;
  }> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      const requirements = account.requirements?.currently_due || [];
      const isReady = requirements.length === 0;

      console.log(
        `[StripeConnect] Account ${stripeAccountId} status: ready=${isReady}, pending=[${requirements.join(", ")}]`
      );

      return {
        isReady,
        requirements,
        chargesEnabled: account.charges_enabled || false,
        transfersEnabled: account.payouts_enabled || false,
      };
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error checking account status:`, error);
      throw error;
    }
  }

  /**
   * Create a transfer from platform account to connected account
   * Transfers funds earned through referrals
   */
  async createPayout(
    stripeAccountId: string,
    amountCents: number,
    description: string = "Referral payout"
  ): Promise<{ transferId: string; success: boolean; error?: string }> {
    try {
      // Transfer from platform to connected account
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: stripeAccountId,
        description,
      });

      console.log(
        `[StripeConnect] ✅ Created transfer: ${transfer.id} (${amountCents} cents) to ${stripeAccountId}`
      );

      return {
        transferId: transfer.id,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[StripeConnect] ❌ Error creating transfer:`, error);

      return {
        transferId: "",
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get transfer status to update AffiliatePayout records
   */
  async getTransferStatus(transferId: string): Promise<{
    status: "pending" | "completed" | "failed";
    error?: string;
  }> {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);

      const status = transfer.amount_reversed > 0 ? "failed" : "completed";

      return { status };
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error getting transfer status:`, error);

      return {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get bank account info for display (masked)
   * Returns last 4 digits, bank name, and status
   */
  async getBankAccountInfo(stripeAccountId: string): Promise<{
    last4?: string;
    bankName?: string;
    status?: string;
    routingNumber?: string;
    accountType?: string;
  } | null> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      // Get external account (bank account)
      if (account.external_accounts && account.external_accounts.data.length > 0) {
        const bankAccount = account.external_accounts.data[0];

        if (bankAccount.object === 'bank_account') {
          return {
            last4: bankAccount.last4,
            bankName: bankAccount.bank_name || 'Bank',
            status: bankAccount.status,
            routingNumber: bankAccount.routing_number?.slice(-4), // Last 4 of routing
            accountType: bankAccount.account_type,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error getting bank account info:`, error);
      return null;
    }
  }

  /**
   * Get tax status and SSN information (masked)
   * Returns whether tax forms are submitted and SSN last 4
   */
  async getTaxStatus(stripeAccountId: string): Promise<{
    taxIdProvided: boolean;
    taxIdLast4?: string;
    taxIdType?: string;
    w9Submitted: boolean;
    requirements: string[];
  }> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      const individual = account.individual;
      const taxIdProvided = !!individual?.ssn_last_4_provided;
      const taxIdLast4 = individual?.ssn_last_4 || undefined;

      // Check if tax requirements are pending
      const taxRequirements = account.requirements?.currently_due?.filter(
        (req) => req.includes('tax') || req.includes('ssn') || req.includes('id_number')
      ) || [];

      return {
        taxIdProvided,
        taxIdLast4,
        taxIdType: taxIdProvided ? 'SSN' : undefined,
        w9Submitted: taxIdProvided && taxRequirements.length === 0,
        requirements: taxRequirements,
      };
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error getting tax status:`, error);
      return {
        taxIdProvided: false,
        w9Submitted: false,
        requirements: [],
      };
    }
  }

  /**
   * Get payout timing information
   * Returns Stripe's payout schedule and typical delay
   */
  async getPayoutTiming(stripeAccountId: string): Promise<{
    delayDays: number;
    schedule: string;
    nextPayoutDate?: Date;
  }> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      // Stripe Connect transfers typically arrive in 2-3 business days
      // This is different from standard Stripe payouts
      const delayDays = 2;
      const schedule = 'instant'; // Transfers are instant to connected account

      return {
        delayDays,
        schedule,
        nextPayoutDate: new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error getting payout timing:`, error);
      return {
        delayDays: 3,
        schedule: 'unknown',
      };
    }
  }

  /**
   * Get account requirements and verification status
   * Returns pending KYC items and what's needed
   */
  async getAccountRequirements(stripeAccountId: string): Promise<{
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason?: string;
  }> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);

      return {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        disabledReason: account.requirements?.disabled_reason || undefined,
      };
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error getting account requirements:`, error);
      return {
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
        pendingVerification: [],
      };
    }
  }
}

export const stripeConnectService = new StripeConnectService();
