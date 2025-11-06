/**
 * Affiliate Email Notifications
 * Send emails for key affiliate events
 */

import { SESEmailService } from "./ses-email-service";
import {
  renderAffiliateWelcomeEmail,
  renderAffiliateCommissionEmail,
  renderAffiliatePayoutEmail,
  renderAffiliateFraudAlertEmail,
} from "./render-templates";

/**
 * Send welcome email when user creates affiliate account
 */
export async function sendAffiliateWelcomeEmail(
  email: string,
  referralLink: string,
  refCode: string
) {
  try {
    const html = await renderAffiliateWelcomeEmail(
      email.split("@")[0],
      refCode,
      referralLink
    );

    const subject = `Welcome to ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"} Affiliate Program!`;

    await SESEmailService.sendEmail({
      to: email,
      subject,
      html,
      emailType: "GENERIC",
    });
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

    const html = await renderAffiliateCommissionEmail(
      email.split("@")[0],
      amountUSD,
      payableCount
    );

    const subject = `You've Earned $${amountUSD} in Referral Commissions!`;

    await SESEmailService.sendEmail({
      to: email,
      subject,
      html,
      emailType: "GENERIC",
    });
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

    const html = await renderAffiliatePayoutEmail(
      email.split("@")[0],
      amountUSD,
      transferId
    );

    const subject = `Your ${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"} Referral Payout of $${amountUSD} Has Been Sent!`;

    await SESEmailService.sendEmail({
      to: email,
      subject,
      html,
      emailType: "GENERIC",
    });
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
    const html = await renderAffiliateFraudAlertEmail(
      email.split("@")[0],
      reason,
      appealLink
    );

    const subject = `${process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic"} Affiliate Account Alert`;

    await SESEmailService.sendEmail({
      to: email,
      subject,
      html,
      emailType: "GENERIC",
    });
  } catch (error) {
    console.error("[AffiliateEmails] Error sending suspension email:", error);
  }
}
