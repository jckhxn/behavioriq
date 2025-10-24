/**
 * Affiliate Email Notifications
 * Send emails for key affiliate events
 */

import { SESEmailService } from "./ses-email-service";

/**
 * Send welcome email when user creates affiliate account
 */
export async function sendAffiliateWelcomeEmail(
  email: string,
  referralLink: string,
  refCode: string
) {
  try {
    const subject = "Welcome to BehaviorIQ Affiliate Program!";
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Welcome to BehaviorIQ's Referral Program!</h2>
          <p>You can now start earning rewards by referring friends and colleagues.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Referral Link:</strong></p>
            <p style="word-break: break-all; font-family: monospace;">${referralLink}</p>
            <p style="font-size: 12px; color: #666;">Share this link to earn $20 per qualified referral!</p>
          </div>

          <h3>How It Works:</h3>
          <ul>
            <li>Share your unique referral link</li>
            <li>Your friends get $20 off their first purchase</li>
            <li>You earn $20 for each qualified referral</li>
            <li>Earn bonuses when they upgrade to premium plans</li>
          </ul>

          <h3>Payout Terms:</h3>
          <ul>
            <li>Earnings are held for 14 days (refund protection)</li>
            <li>Minimum payout threshold: $50</li>
            <li>Fast payouts via Stripe Connect</li>
            <li>1099-NEC tax forms for earnings ≥ $600/year</li>
          </ul>

          <p style="color: #666; font-size: 12px;">
            Need help? Contact our support team at support@behavioriq.com
          </p>
        </body>
      </html>
    `;

    // Use SES email service
    // Note: You'll need to integrate this with your actual email sending
    console.log(
      `[AffiliateEmails] Would send welcome email to ${email} for ref ${refCode}`
    );

    // Example: await sesEmailService.sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error("[AffiliateEmails] Error sending welcome email:", error);
  }
}

/**
 * Send email when commission becomes payable
 */
export async function sendCommissionPayableEmail(
  email: string,
  amountCents: number,
  payableCount: number
) {
  try {
    const amountUSD = (amountCents / 100).toFixed(2);
    const subject = `You've Earned $${amountUSD} in Referral Commissions!`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Congratulations! 🎉</h2>
          <p>Your referral earnings are now ready for payout.</p>

          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #2e7d32;">Payable Balance: $${amountUSD}</h3>
            <p style="font-size: 14px; color: #555;">${payableCount} commission(s) ready for payout</p>
          </div>

          <p>You can request your payout anytime. Visit your <a href="https://app.behavioriq.com/dashboard/earn-rewards">Earn Rewards dashboard</a> to request payment.</p>

          <p style="color: #666; font-size: 12px;">
            Questions? Contact support@behavioriq.com
          </p>
        </body>
      </html>
    `;

    console.log(
      `[AffiliateEmails] Would send commission email to ${email} for $${amountUSD}`
    );

    // await sesEmailService.sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error("[AffiliateEmails] Error sending commission email:", error);
  }
}

/**
 * Send email when payout is sent
 */
export async function sendPayoutSentEmail(
  email: string,
  amountCents: number,
  transferId: string,
  eta: string = "1-3 business days"
) {
  try {
    const amountUSD = (amountCents / 100).toFixed(2);
    const subject = `Your BehaviorIQ Referral Payout of $${amountUSD} Has Been Sent!`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Payout Sent! 💰</h2>
          <p>Your referral earnings have been transferred to your connected account.</p>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="margin-top: 0; color: #1565c0;">Amount: $${amountUSD}</h3>
            <p style="font-size: 12px; color: #555;">Transfer ID: ${transferId}</p>
            <p style="font-size: 14px; color: #555;">Expected arrival: ${eta}</p>
          </div>

          <p>Your funds will be deposited to your bank account via Stripe Connect. You can track your transfer in your Stripe dashboard.</p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            Thank you for being part of BehaviorIQ's affiliate program! Keep sharing and earning. 🚀
          </p>
        </body>
      </html>
    `;

    console.log(
      `[AffiliateEmails] Would send payout email to ${email} for $${amountUSD}`
    );

    // await sesEmailService.sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error("[AffiliateEmails] Error sending payout email:", error);
  }
}

/**
 * Send email when account is suspended
 */
export async function sendAccountSuspendedEmail(
  email: string,
  reason: string,
  appealLink: string
) {
  try {
    const subject = "BehaviorIQ Affiliate Account Suspended";
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d32f2f;">Account Suspended</h2>
          <p>Your BehaviorIQ affiliate account has been suspended due to a violation of our program policies.</p>

          <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>

          <h3>What Now?</h3>
          <p>If you believe this suspension was made in error, you can submit an appeal:</p>
          <p><a href="${appealLink}" style="display: inline-block; background: #2196f3; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">Submit Appeal</a></p>

          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            For questions, contact our support team at support@behavioriq.com
          </p>
        </body>
      </html>
    `;

    console.log(
      `[AffiliateEmails] Would send suspension email to ${email} for reason: ${reason}`
    );

    // await sesEmailService.sendEmail(email, subject, htmlContent);
  } catch (error) {
    console.error("[AffiliateEmails] Error sending suspension email:", error);
  }
}
