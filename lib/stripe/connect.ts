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
   */
  async createConnectAccount(email: string, userFullName: string): Promise<string> {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        country: "US", // Default to US; can be made configurable
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          user_email: email,
          user_name: userFullName,
        },
      });

      console.log(`[StripeConnect] ✅ Created Express account: ${account.id}`);

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

      console.log(`[StripeConnect] ✅ Generated onboarding link for ${stripeAccountId}`);

      return accountLink.url;
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error generating onboarding link:`, error);
      throw error;
    }
  }

  /**
   * Generate dashboard login link for referrer to view payouts
   */
  async getDashboardLink(stripeAccountId: string): Promise<string> {
    try {
      const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

      console.log(`[StripeConnect] ✅ Generated dashboard link for ${stripeAccountId}`);

      return loginLink.url;
    } catch (error) {
      console.error(`[StripeConnect] ❌ Error generating dashboard link:`, error);
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
}

export const stripeConnectService = new StripeConnectService();
